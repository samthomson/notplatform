import { Link } from 'react-router-dom';
import { usePlantPots } from '@/hooks/usePlantPots';
import { usePlantLogs } from '@/hooks/usePlantLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/plantUtils';
import { Cpu, Trash2, Activity } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

function DeviceCard({ device, onDelete, deletingId }: { device: NostrEvent; onDelete: (e: React.MouseEvent, device: NostrEvent) => void; deletingId: string | null }) {
  const identifier = device.tags.find(([name]: string[]) => name === 'd')?.[1] || 'unknown';
  const name = device.tags.find(([name]: string[]) => name === 'name')?.[1] || identifier;
  const { data: logs } = usePlantLogs(device.pubkey, identifier);
  const recentLogs = logs?.slice(0, 3) || [];

  return (
    <div className="relative">
      <Link to={`/device/${identifier}`}>
        <Card className="border border-[#d2d2d7] dark:border-[#424245] bg-white dark:bg-[#1d1d1f] hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/10 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
                </div>
                <CardTitle className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{name}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onDelete(e, device)}
                disabled={deletingId === device.id}
                className="h-8 w-8 p-0 text-[#86868b] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-[#ff3b30]/10 dark:hover:bg-[#ff453a]/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
              {recentLogs.length > 0 ? `${recentLogs.length} recent event${recentLogs.length !== 1 ? 's' : ''}` : 'No activity yet'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Recent activity logs */}
            {recentLogs.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-2">Recent Activity</p>
                {recentLogs.map((log) => {
                  return (
                    <div key={log.id} className="flex items-start gap-2">
                      <Activity className="h-3.5 w-3.5 text-[#34c759] dark:text-[#30d158] flex-shrink-0 mt-0.5" />
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] line-clamp-1">
                          Event received
                        </div>
                        <div className="text-[12px] text-[#86868b] dark:text-[#a1a1a6] ml-2">
                          {formatRelativeTime(log.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] text-center py-6">
                No activity yet
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export function DeviceList() {
  const { data: devices, isLoading } = usePlantPots();
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, device: NostrEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.signer) return;

    setDeletingId(device.id);
    try {
      const dTag = device.tags.find(([t]: string[]) => t === 'd')?.[1];

      // Create deletion event (kind 5) signed by the OWNER
      const deletionEvent = {
        kind: 5,
        content: 'Deleting device',
        tags: [
          ['e', device.id],
          ['a', `34419:${device.pubkey}:${dTag}`],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      // Sign with user's key
      const signedDeletion = await user.signer.signEvent(deletionEvent);

      // Publish deletion
      const relay = nostr.relay('wss://relay.samt.st');
      await relay.event(signedDeletion);

      // Immediately remove from UI
      queryClient.invalidateQueries({ queryKey: ['plant-pots', user.pubkey] });

      toast({
        title: 'Deleted',
        description: 'Device deleted successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete device',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/10 flex items-center justify-center mx-auto">
            <Cpu className="h-8 w-8 text-[#007AFF] dark:text-[#0A84FF] animate-pulse" strokeWidth={2} />
          </div>
          <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">Loading devices...</p>
        </div>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <Card className="border-2 border-dashed border-[#d2d2d7] dark:border-[#424245] bg-white/50 dark:bg-[#1d1d1f]/50">
        <CardContent className="py-16 px-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-20 w-20 rounded-2xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/10 flex items-center justify-center mx-auto">
              <Cpu className="h-10 w-10 text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
            </div>
            <p className="text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
              No devices yet
            </p>
            <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">
              Create your first device to get started with NotPlatform
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => <DeviceCard key={device.id} device={device} onDelete={handleDelete} deletingId={deletingId} />)}
    </div>
  );
}
