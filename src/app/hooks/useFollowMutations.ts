import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUser, unfollowUser, FollowResponse } from '../api/userService';
import { useAuth } from '../components/auth/AuthProvider';
import { notificationService } from '../utils/notificationService';

interface UseFollowMutationsOptions {
    onFollowSuccess?: (data: FollowResponse, targetUserId: string) => void;
    onUnfollowSuccess?: (data: FollowResponse, targetUserId: string) => void;
    onError?: (error: Error) => void;
}

export function useFollowMutations(options: UseFollowMutationsOptions = {}) {
    const { token, userId } = useAuth();
    const queryClient = useQueryClient();

    const followMutation = useMutation<FollowResponse, Error, string>({
        mutationFn: async (targetUserId: string) => {
            if (!token) throw new Error('No authentication token');
            return followUser(targetUserId, token);
        },
        onSuccess: (data, targetUserId) => {
            void queryClient.invalidateQueries({ queryKey: ['users', userId] });
            void queryClient.invalidateQueries({ queryKey: ['users', targetUserId] });
            void queryClient.invalidateQueries({ queryKey: ['following', targetUserId] });
            
            options.onFollowSuccess?.(data, targetUserId);
        },
        onError: (error) => {
            notificationService.logError('useFollowMutations.follow', error);
            options.onError?.(error);
        },
    });

    const unfollowMutation = useMutation<FollowResponse, Error, string>({
        mutationFn: async (targetUserId: string) => {
            if (!token) throw new Error('No authentication token');
            return unfollowUser(targetUserId, token);
        },
        onSuccess: (data, targetUserId) => {
            void queryClient.invalidateQueries({ queryKey: ['users', userId] });
            void queryClient.invalidateQueries({ queryKey: ['users', targetUserId] });
            void queryClient.invalidateQueries({ queryKey: ['following', targetUserId] });
            
            options.onUnfollowSuccess?.(data, targetUserId);
        },
        onError: (error) => {
            notificationService.logError('useFollowMutations.unfollow', error);
            options.onError?.(error);
        },
    });

    const follow = (targetUserId: string) => {
        followMutation.mutate(targetUserId);
    };

    const unfollow = (targetUserId: string) => {
        unfollowMutation.mutate(targetUserId);
    };

    return {
        follow,
        unfollow,
        followMutation,
        unfollowMutation,
        isFollowing: followMutation.isPending,
        isUnfollowing: unfollowMutation.isPending,
        isLoading: followMutation.isPending || unfollowMutation.isPending,
    };
}

export default useFollowMutations;
