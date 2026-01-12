// Centralized React Query cache configuration for optimal performance
import { getNetworkStatus } from "@/hooks/useNetworkStatus";

// Network-aware mutation wrapper for offline queuing
export const withOfflineQueue = async <T>(
  mutationFn: () => Promise<T>,
  options?: { skipQueue?: boolean }
): Promise<T> => {
  const networkStatus = getNetworkStatus();
  
  if (!navigator.onLine && networkStatus && !options?.skipQueue) {
    // Queue the request for later
    networkStatus.queueRequest(mutationFn);
    throw new Error("You're offline. This request has been queued and will be processed when you're back online.");
  }
  
  try {
    return await mutationFn();
  } catch (error) {
    // If it's a network error and we have network status, queue it
    if (
      error instanceof Error &&
      (error.message.includes("Failed to fetch") || 
       error.message.includes("NetworkError") ||
       error.message.includes("network")) &&
      networkStatus &&
      !options?.skipQueue
    ) {
      networkStatus.queueRequest(mutationFn);
      throw new Error("Network error. This request has been queued and will be processed when connection is restored.");
    }
    throw error;
  }
};

export const queryConfigs = {
  // Static content - rarely changes
  courses: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  },
  
  // Lesson content - mostly static
  lessons: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Quiz questions - static once created
  quizzes: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // User-specific data - needs fresher data
  enrollments: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Progress data - important to keep fresh
  progress: {
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Analytics - aggregate data, can be slightly stale
  analytics: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // User profile - rarely changes
  profile: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Notifications - need to be fresh
  notifications: {
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // Discussions - semi-realtime
  discussions: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Resources - static files
  resources: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Gamification - XP, streaks
  gamification: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Performance logs - admin only
  performance: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
};

// Helper to apply config to useQuery options
export const withQueryConfig = <T extends keyof typeof queryConfigs>(
  configKey: T,
  additionalOptions?: Record<string, unknown>
) => ({
  ...queryConfigs[configKey],
  ...additionalOptions,
});
