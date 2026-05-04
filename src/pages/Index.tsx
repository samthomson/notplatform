import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePlantPotSubscription } from '@/hooks/usePlantPotSubscription';
import { PlantPotList } from '@/components/PlantPotList';
import { CreatePlantPotDialog } from '@/components/CreatePlantPotDialog';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Shield, Radio, Activity, Server, Zap } from 'lucide-react';

const Index = () => {
  const { user } = useCurrentUser();

  // Subscribe to real-time updates
  usePlantPotSubscription();

  useSeoMeta({
    title: 'NotPlatform - Nostr IoT Device Management',
    description: 'Decentralized IoT device management platform built on Nostr protocol. Give your devices their own identities, manage relays, and query events in real-time.',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-purple-100 dark:bg-purple-900 mb-6">
              <Cpu className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              NotPlatform
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Decentralized IoT device management built on Nostr
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Give your IoT devices their own Nostr identities. No central servers, no vendor lock-in, 
              no proprietary protocols. Just open standards and complete control.
            </p>
            <div className="flex justify-center">
              <LoginArea className="max-w-60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold">My Devices</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your IoT devices and monitor their activity
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CreatePlantPotDialog />
            <LoginArea className="max-w-60" />
          </div>
        </div>

        {/* Device List */}
        <PlantPotList />

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Vibed with{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Shakespeare
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
