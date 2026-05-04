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

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-16">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 w-fit mb-3">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Device Sovereignty</CardTitle>
                <CardDescription>
                  Each device gets its own Nostr keypair. Your devices, your keys, your control.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 w-fit mb-3">
                  <Radio className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Relay Configuration</CardTitle>
                <CardDescription>
                  Set custom relay connections for each device. Route data where you want it.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 w-fit mb-3">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Real-time Events</CardTitle>
                <CardDescription>
                  Subscribe to device events in real-time via WebSocket connections.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900 w-fit mb-3">
                  <Server className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>No Central Server</CardTitle>
                <CardDescription>
                  Fully decentralized. Devices communicate directly through Nostr relays.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900 w-fit mb-3">
                  <Zap className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle>Open Protocol</CardTitle>
                <CardDescription>
                  Built on Nostr. Compatible with any Nostr client or service.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-900 w-fit mb-3">
                  <Cpu className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle>Secure Keys</CardTitle>
                <CardDescription>
                  Device keys encrypted with NIP-44. Share with hardware without risk.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Why NotPlatform */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Why NotPlatform?</CardTitle>
                <CardDescription className="text-base">
                  Traditional IoT platforms lock you into centralized services with proprietary protocols.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400">✓</span>
                      Protocol Freedom
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Use standard Nostr relays and clients
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400">✓</span>
                      Interoperability
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Devices work with any Nostr-compatible service
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400">✓</span>
                      Privacy First
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Encrypted credentials you control
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400">✓</span>
                      No Lock-in
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your devices, your keys, your relays
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Use Cases</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">🌡️ Sensor Networks</h3>
                <p className="text-sm text-muted-foreground">
                  Temperature, humidity, motion sensors with real-time data streaming
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">🏠 Smart Home</h3>
                <p className="text-sm text-muted-foreground">
                  Lights, switches, controllers without proprietary hubs
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">🏭 Industrial IoT</h3>
                <p className="text-sm text-muted-foreground">
                  Equipment monitoring and automation on open protocols
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">🌍 Environmental Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Weather stations, air quality sensors with public data sharing
                </p>
              </div>
            </div>
          </div>

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
