import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFollowMutations } from '../../hooks/useFollowMutations';
import * as userService from '../../api/userService';

jest.mock('../../api/userService', () => ({
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
}));

jest.mock('../../components/auth/AuthProvider', () => ({
    useAuth: jest.fn(() => ({
        token: 'test-token',
        userId: 'current-user-id',
        isAuthenticated: true,
    })),
}));

jest.mock('../../utils/notificationService', () => ({
    notificationService: {
        logError: jest.fn(),
    },
}));

const mockFollowUser = userService.followUser as jest.MockedFunction<typeof userService.followUser>;
const mockUnfollowUser = userService.unfollowUser as jest.MockedFunction<typeof userService.unfollowUser>;

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    
    return ({ children }: { children: React.ReactNode }) => (
        React.createElement(QueryClientProvider, { client: queryClient }, children)
    );
};

describe('useFollowMutations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('initializes with correct state', () => {
        const { result } = renderHook(() => useFollowMutations(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFollowing).toBe(false);
        expect(result.current.isUnfollowing).toBe(false);
        expect(typeof result.current.follow).toBe('function');
        expect(typeof result.current.unfollow).toBe('function');
    });

    test('follow calls followUser service', async () => {
        const mockResponse = {
            id: 'current-user-id',
            name: 'Current User',
            email: 'current@example.com',
            rating: 100,
            followers: [],
            following: [{ id: 'target-user-id', name: 'Target User', email: 'target@example.com' }],
        };
        mockFollowUser.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useFollowMutations(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.follow('target-user-id');
        });

        await waitFor(() => {
            expect(mockFollowUser).toHaveBeenCalledWith('target-user-id', 'test-token');
        });
    });

    test('unfollow calls unfollowUser service', async () => {
        const mockResponse = {
            id: 'current-user-id',
            name: 'Current User',
            email: 'current@example.com',
            rating: 100,
            followers: [],
            following: [],
        };
        mockUnfollowUser.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useFollowMutations(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.unfollow('target-user-id');
        });

        await waitFor(() => {
            expect(mockUnfollowUser).toHaveBeenCalledWith('target-user-id', 'test-token');
        });
    });
});
