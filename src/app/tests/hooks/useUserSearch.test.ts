import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUserSearch } from '../../hooks/useUserSearch';

jest.mock('../../api/userService', () => ({
    searchUsers: jest.fn(),
}));

jest.mock('../../components/auth/AuthProvider', () => ({
    useAuth: jest.fn(() => ({
        token: 'test-token',
        isAuthenticated: true,
    })),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    
    return ({ children }: { children: React.ReactNode }) => (
        React.createElement(QueryClientProvider, { client: queryClient }, children)
    );
};

describe('useUserSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('initializes with empty state', () => {
        const { result } = renderHook(() => useUserSearch(), {
            wrapper: createWrapper(),
        });

        expect(result.current.users).toEqual([]);
        expect(result.current.searchQuery).toBe('');
        expect(result.current.isLoading).toBe(false);
    });

    test('updates searchQuery when setSearchQuery is called', () => {
        const { result } = renderHook(() => useUserSearch(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.setSearchQuery('test');
        });

        expect(result.current.searchQuery).toBe('test');
    });
});
