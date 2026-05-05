import { useParams, Link } from 'react-router-dom';
import { usePlantPot } from '@/hooks/usePlantPots';
import { usePlantLogs } from '@/hooks/usePlantLogs';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSeoMeta } from '@unhead/react';
import { LoginArea } from '@/components/auth/LoginArea';
import {
  ArrowLeft,
  Cpu,
  Copy,
  CheckCheck,
  Eye,
  Lock,
  RefreshCw,
  Pencil,
  Check,
  X,
  Activity
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatRelativeTime, generatePlantPotNaddr } from '@/lib/plantUtils';
import { useState } from 'react';

export function DeviceDetail() {
  const { identifier } = useParams<{ identifier: string }>();
  const { data: device, isLoading: isDeviceLoading, refetch: refetchDevice } = usePlantPot(identifier);
  const { data: logs, isLoading: isLogsLoading, refetch: refetchLogs } = usePlantLogs(device?.pubkey, identifier);
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [decryptedHex, setDecryptedHex] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useSeoMeta({
    title: `Device: ${identifier || 'Loading...'}`,
    description: 'Manage your IoT device and view activity logs',
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchDevice(), refetchLogs()]);
      toast({
        title: 'Refreshed',
        description: 'Device data updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyNaddr = async () => {
    if (!device) {
      console.error('No device data available');
      return;
    }

    try {
      const naddr = generatePlantPotNaddr(device, ['wss://relay.samt.st']);
      await navigator.clipboard.writeText(naddr);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Device identifier copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to copy identifier',
        variant: 'destructive',
      });
    }
  };

  const handleDecryptKey = async () => {
    if (!device || !user?.signer || !user.signer.nip44) return;

    setIsDecrypting(true);
    try {
      const decrypted = await user.signer.nip44.decrypt(user.pubkey, device.content);
      
      if (!/^[0-9a-fA-F]{64}$/.test(decrypted)) {
        toast({
          title: 'Error',
          description: `Invalid private key format. Expected 64 hex characters, got ${decrypted.length}.`,
          variant: 'destructive',
        });
        return;
      }
      
      setDecryptedHex(decrypted.toLowerCase());
    } catch (error) {
      console.error('Decryption error:', error);
      toast({
        title: 'Error',
        description: 'Failed to decrypt private key',
        variant: 'destructive',
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopyHex = async () => {
    if (!decryptedHex) return;
    try {
      await navigator.clipboard.writeText(decryptedHex);
      toast({
        title: 'Copied!',
        description: 'Private key copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy',
        variant: 'destructive',
      });
    }
  };

  const handleSaveName = async () => {
    if (!device || !user?.signer || !user.signer.nip44 || !editedName.trim()) return;

    try {
      const decryptedKey = await user.signer.nip44.decrypt(user.pubkey, device.content);
      const hexKey = /^[0-9a-fA-F]{64}$/.test(decryptedKey) ? decryptedKey : '';
      
      if (!hexKey) {
        toast({
          title: 'Error',
          description: 'Cannot update name - device has no valid private key',
          variant: 'destructive',
        });
        return;
      }

      const secretKey = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const { NSecSigner } = await import('@nostrify/nostrify');
      const signer = new NSecSigner(secretKey);

      const updatedTags = device.tags.filter(([t]) => t !== 'name');
      updatedTags.splice(1, 0, ['name', editedName.trim()]);

      const unsignedEvent = {
        kind: 34419,
        content: device.content,
        tags: updatedTags,
        created_at: Math.floor(Date.now() / 1000),
        pubkey: device.pubkey,
      };

      const signedEvent = await signer.signEvent(unsignedEvent);
      const relay = nostr.relay('wss://relay.samt.st');
      await relay.event(signedEvent);

      queryClient.invalidateQueries({ queryKey: ['plant-pot', user.pubkey, identifier] });
      queryClient.invalidateQueries({ queryKey: ['plant-pots', user.pubkey] });

      setIsEditingName(false);
      toast({
        title: 'Updated',
        description: 'Device name updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update name',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000]">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="border border-[#d2d2d7] dark:border-[#424245]">
              <CardHeader className="text-center">
                <Cpu className="h-12 w-12 mx-auto text-[#007AFF] dark:text-[#0A84FF] mb-4" />
                <CardTitle className="text-[21px] font-semibold">Login Required</CardTitle>
                <CardDescription className="text-[15px]">
                  Please login to view and manage your devices
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LoginArea className="max-w-60" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isDeviceLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000]">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000]">
        <div className="container mx-auto px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Devices
            </Button>
          </Link>
          <Card className="border-dashed border-2">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-4">
                <Cpu className="h-12 w-12 mx-auto text-[#86868b]" />
                <p className="text-[#86868b] dark:text-[#a1a1a6]">
                  Device not found. It may have been deleted or does not exist.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const name = device.tags.find(([name]) => name === 'name')?.[1] || identifier;

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Devices
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Device Config */}
          <Card className="border-2 border-[#007AFF]/20 dark:border-[#0A84FF]/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/10 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-xl font-semibold h-10"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') setIsEditingName(false);
                        }}
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveName}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">{name}</CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditedName(name || '');
                          setIsEditingName(true);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <CardDescription>Device • {identifier}</CardDescription>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Event ID (naddr)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyNaddr}
                      className="gap-2 h-8"
                    >
                      {copied ? (
                        <>
                          <CheckCheck className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="p-3 rounded-lg bg-muted border">
                    <code className="text-xs break-all">
                      {generatePlantPotNaddr(device, ['wss://relay.samt.st'])}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Device Pubkey</Label>
                  <Input
                    value={device.pubkey}
                    readOnly
                    disabled
                    className="font-mono text-xs h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Identifier (d-tag)</Label>
                  <Input
                    value={identifier}
                    readOnly
                    disabled
                    className="font-mono text-xs h-9"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Device Private Key
                    </Label>
                    {!decryptedHex && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDecryptKey}
                        disabled={isDecrypting}
                        className="gap-2 h-7 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        {isDecrypting ? 'Decrypting...' : 'Decrypt'}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={!decryptedHex ? '••••••••••••••••••••••••' : decryptedHex}
                      readOnly
                      disabled={!decryptedHex}
                      className="font-mono text-xs h-9"
                    />
                    {decryptedHex && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyHex}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Activity Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Recent device events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLogsLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : !logs || logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activity yet
                </p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => {
                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-[#34c759] dark:text-[#30d158]" />
                            <span className="text-sm font-medium">Event Received</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(log.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
