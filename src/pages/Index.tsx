import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePlantPotSubscription } from '@/hooks/usePlantPotSubscription';
import { PlantPotList } from '@/components/PlantPotList';
import { CreatePlantPotDialog } from '@/components/CreatePlantPotDialog';
import { LoginArea } from '@/components/auth/LoginArea';
import { Cpu } from 'lucide-react';

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
      <div className="min-h-screen bg-white dark:bg-[#000000] flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="h-20 w-20 rounded-[22px] bg-[#007AFF] dark:bg-[#0A84FF] flex items-center justify-center shadow-lg">
              <Cpu className="h-11 w-11 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[56px] leading-[1.07] font-semibold tracking-tight text-center mb-3 text-[#1d1d1f] dark:text-[#f5f5f7]">
            NotPlatform
          </h1>

          {/* Subtitle */}
          <p className="text-[21px] leading-[1.381] font-normal text-center mb-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
            Decentralized IoT device management
          </p>

          {/* Description */}
          <p className="text-[17px] leading-[1.47] font-normal text-center mb-10 text-[#86868b] dark:text-[#a1a1a6] max-w-lg mx-auto">
            Built on Nostr protocol. Give your devices their own identities, manage relays, and query events in real-time.
          </p>

          {/* Login Area */}
          <div className="flex justify-center">
            <LoginArea className="w-full max-w-xs" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000]">
      {/* Header Bar */}
      <div className="bg-white/80 dark:bg-[#1d1d1f]/80 backdrop-blur-xl border-b border-[#d2d2d7] dark:border-[#424245] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[52px]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#007AFF] dark:bg-[#0A84FF] flex items-center justify-center">
                <Cpu className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                NotPlatform
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <CreatePlantPotDialog />
              <LoginArea className="max-w-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-[32px] leading-[1.125] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
            My Devices
          </h2>
          <p className="text-[17px] leading-[1.47] text-[#86868b] dark:text-[#a1a1a6]">
            Manage your IoT devices and monitor their activity
          </p>
        </div>

        <PlantPotList />
      </div>
    </div>
  );
};

export default Index;
