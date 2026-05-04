import { Link } from 'react-router-dom';
import { usePlantPots } from '@/hooks/usePlantPots';
import { usePlantLogs } from '@/hooks/usePlantLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { extractTasks, formatDuration, formatRelativeTime } from '@/lib/plantUtils';
import { useWeatherReadings, getTemperature, getHumidity } from '@/hooks/useWeatherStations';
import { Sprout, Trash2, CheckCheck, Thermometer, Droplets } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

function PlantPotCard({ pot, onDelete, deletingId }: { pot: any; onDelete: (e: React.MouseEvent, pot: any) => void; deletingId: string | null }) {
  const identifier = pot.tags.find(([name]: string[]) => name === 'd')?.[1] || 'unknown';
  const name = pot.tags.find(([name]: string[]) => name === 'name')?.[1] || identifier;
  const tasks = extractTasks(pot);
  const { data: logs } = usePlantLogs(pot.pubkey, identifier);
  const recentLogs = logs?.slice(0, 2) || [];
  
  const weatherStationPubkey = pot.tags.find(([t]: string[]) => t === 'weather_station')?.[1];
  const { data: weatherReading } = useWeatherReadings(weatherStationPubkey);

  return (
    <div className="relative">
      <Link to={`/pot/${identifier}`}>
        <Card className="border border-[#d2d2d7] dark:border-[#424245] bg-white dark:bg-[#1d1d1f] hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/10 flex items-center justify-center">
                  <Sprout className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
                </div>
                <CardTitle className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{name}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onDelete(e, pot)}
                disabled={deletingId === pot.id}
                className="h-8 w-8 p-0 text-[#86868b] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-[#ff3b30]/10 dark:hover:bg-[#ff453a]/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
              {tasks.length > 0 ? `${tasks.length} pending task${tasks.length !== 1 ? 's' : ''}` : 'No pending tasks'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Pending tasks */}
            {tasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f5f5f7] dark:bg-[#2c2c2e]">
                    <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] capitalize">
                      {task.type}
                    </span>
                    <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">
                      {formatDuration(parseInt(task.seconds))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent activity logs */}
            {recentLogs.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-2">Recent Activity</p>
                {recentLogs.map((log) => {
                  const logTasks = extractTasks(log);
                  return (
                    <div key={log.id} className="flex items-center gap-2">
                      <CheckCheck className="h-3.5 w-3.5 text-[#34c759] dark:text-[#30d158] flex-shrink-0" />
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {logTasks.map((task, idx) => (
                            <span key={idx}>
                              <span className="capitalize">{task.type}</span> {formatDuration(parseInt(task.seconds))}
                            </span>
                          ))}
                        </div>
                        <div className="text-[12px] text-[#86868b] dark:text-[#a1a1a6]">
                          {formatRelativeTime(log.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tasks.length === 0 && recentLogs.length === 0 && !weatherReading && (
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] text-center py-6">
                No activity yet
              </p>
            )}

            {/* Environment conditions */}
            {weatherReading && (
              <div className={recentLogs.length > 0 ? 'pt-3 mt-3 border-t border-[#d2d2d7] dark:border-[#424245]' : 'pt-3'}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-2">Environment</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-[#ff9500] dark:text-[#ff9f0a]" />
                    <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{getTemperature(weatherReading)}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-[#007AFF] dark:text-[#0A84FF]" />
                    <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{getHumidity(weatherReading)}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export function PlantPotList() {
  const { data: plantPots, isLoading } = usePlantPots();
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, pot: any) => {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation();

    if (!user?.signer) return;

    setDeletingId(pot.id);
    try {
      const dTag = pot.tags.find(([t]: string[]) => t === 'd')?.[1];
      
      // Create deletion event (kind 5)
      const deletionEvent = {
        kind: 5,
        content: 'Deleting plant pot',
        tags: [
          ['e', pot.id],
          ['a', `34419:${pot.pubkey}:${dTag}`],
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
        description: 'Plant pot deleted successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete plant pot',
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
            <Sprout className="h-8 w-8 text-[#007AFF] dark:text-[#0A84FF] animate-pulse" strokeWidth={2} />
          </div>
          <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">Loading devices...</p>
        </div>
      </div>
    );
  }

  if (!plantPots || plantPots.length === 0) {
    return (
      <Card className="border-2 border-dashed border-[#d2d2d7] dark:border-[#424245] bg-white/50 dark:bg-[#1d1d1f]/50">
        <CardContent className="py-16 px-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-20 w-20 rounded-2xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/10 flex items-center justify-center mx-auto">
              <Sprout className="h-10 w-10 text-[#007AFF] dark:text-[#0A84FF]" strokeWidth={2} />
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
      {plantPots.map((pot) => <PlantPotCard key={pot.id} pot={pot} onDelete={handleDelete} deletingId={deletingId} />)}
    </div>
  );
}
