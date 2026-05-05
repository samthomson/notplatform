import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { Plus } from 'lucide-react';
import { generateSecretKey } from 'nostr-tools';
import { NSecSigner } from '@nostrify/nostrify';
import { useQueryClient } from '@tanstack/react-query';

export function CreateDeviceDialog() {
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a device identifier',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.signer) {
      toast({
        title: 'Error',
        description: 'User signer not available',
        variant: 'destructive',
      });
      return;
    }

    setIsPending(true);

    try {
      // Generate new keypair for this device
      const deviceSecretKey = generateSecretKey();
      const deviceSigner = new NSecSigner(deviceSecretKey);
      const devicePubkey = await deviceSigner.getPublicKey();

      // Convert secret key to hex string
      const deviceSecretKeyHex = Array.from(deviceSecretKey)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      console.log('Generated device keypair:', { devicePubkey, secretKeyHex: deviceSecretKeyHex });

      // Encrypt the hex secret key to the logged-in user's pubkey
      if (!user.signer.nip44) {
        toast({
          title: 'Error',
          description: 'Please upgrade your signer extension to support NIP-44 encryption',
          variant: 'destructive',
        });
        setIsPending(false);
        return;
      }

      const encryptedSecretKey = await user.signer.nip44.encrypt(user.pubkey, deviceSecretKeyHex);
      console.log('Encrypted secret key:', encryptedSecretKey);

      // Slugify the identifier for d-tag
      const slug = identifier.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create the device event signed by the DEVICE's keypair
      const unsignedEvent = {
        kind: 34419,
        content: encryptedSecretKey, // Encrypted hex secret key
        tags: [
          ['d', slug], // Slugified identifier
          ['name', identifier.trim()], // Original name for display
          ['p', user.pubkey], // Owner's pubkey
          ['client', window.location.hostname],
          ['alt', `IoT device configuration: ${identifier.trim()}`],
        ],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: devicePubkey, // Event is authored by the device itself
      };

      // Sign with device's signer
      const signedEvent = await deviceSigner.signEvent(unsignedEvent);
      console.log('Signed device event:', signedEvent);

      // Publish to only the custom relay
      const relay = nostr.relay('wss://relay.samt.st');
      await relay.event(signedEvent);

      // Invalidate query to refetch immediately
      queryClient.invalidateQueries({ queryKey: ['plant-pots', user.pubkey] });

      toast({
        title: 'Success',
        description: 'Device created successfully!',
      });
      setOpen(false);
      setIdentifier('');
    } catch (error) {
      console.error('Failed to create device:', error);
      toast({
        title: 'Error',
        description: `Failed to create device: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#007AFF] hover:bg-[#007AFF]/90 dark:bg-[#0A84FF] dark:hover:bg-[#0A84FF]/90 text-white font-medium">
          <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
          New Device
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[21px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Create Device</DialogTitle>
            <DialogDescription className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">
              Add a new IoT device. Give it a unique identifier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="identifier" className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Identifier</Label>
            <Input
              id="identifier"
              placeholder="e.g., sensor-01, esp32-living-room"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isPending}
              className="mt-2 border-[#d2d2d7] dark:border-[#424245] focus:border-[#007AFF] dark:focus:border-[#0A84FF]"
            />
            <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-2">
              Use a unique identifier to distinguish this device from others.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              disabled={isPending}
              className="border-[#d2d2d7] dark:border-[#424245]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-[#007AFF] hover:bg-[#007AFF]/90 dark:bg-[#0A84FF] dark:hover:bg-[#0A84FF]/90"
            >
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
