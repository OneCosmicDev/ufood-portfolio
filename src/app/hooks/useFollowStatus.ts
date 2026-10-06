import { useQuery } from '@tanstack/react-query';
import { checkFollowing } from '../api/userService';
import { useAuth } from '../components/auth/AuthProvider';
import Follower from '../types/Follower';

interface UseFollowStatusOptions {
    enabled?: boolean;
}

interface UseFollowStatusResult {
    isFollowing: boolean;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useFollowStatus(
    targetUserId: string,
    options: UseFollowStatusOptions = {}
): UseFollowStatusResult {
    const { enabled = true } = options;
    const { token, userId, isAuthenticated } = useAuth();

    const shouldFetch = enabled && 
                       isAuthenticated && 
                       !!token && 
                       !!targetUserId && 
                       targetUserId !== userId;

    const query = useQuery<boolean, Error>({
        queryKey: ['following', targetUserId],
        queryFn: async () => {
            return checkFollowing(targetUserId, token!);
        },
        enabled: shouldFetch,
        staleTime: 1000 * 30,
        gcTime: 1000 * 60 * 5,
    });

    return {
        isFollowing: query.data ?? false,
        isLoading: query.isLoading && shouldFetch,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useIsFollowingFromUser(
    targetUserId: string,
    currentUserFollowing: Follower[] | undefined
): boolean {
    if (!currentUserFollowing || !targetUserId) {
        return false;
    }
    return currentUserFollowing.some(follower => follower.id === targetUserId);
}

export default useFollowStatus;
