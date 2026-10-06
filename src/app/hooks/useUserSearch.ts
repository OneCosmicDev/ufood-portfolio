import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { searchUsers } from '../api/userService';
import { useAuth } from '../components/auth/AuthProvider';
import User from '../types/User';

interface UseUserSearchOptions {
    debounceMs?: number;
    enabled?: boolean;
    minQueryLength?: number;
}

interface UseUserSearchResult {
    users: User[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    debouncedQuery: string;
    refetch: () => void;
}


export function useUserSearch(options: UseUserSearchOptions = {}): UseUserSearchResult {
    const { debounceMs = 300, enabled = true, minQueryLength = 1 } = options;
    const { token, isAuthenticated } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs]);

    const shouldFetch = useMemo(() => {
        return enabled && 
               isAuthenticated && 
               !!token && 
               debouncedQuery.trim().length >= minQueryLength;
    }, [enabled, isAuthenticated, token, debouncedQuery, minQueryLength]);

    const query = useQuery<User[], Error>({
        queryKey: ['users', 'search', debouncedQuery],
        queryFn: async () => {
            return searchUsers(debouncedQuery, token!);
        },
        enabled: shouldFetch,
        staleTime: 1000 * 30,
        gcTime: 1000 * 60 * 5,
    });

    return {
        users: query.data ?? [],
        isLoading: query.isLoading && shouldFetch,
        isError: query.isError,
        error: query.error,
        searchQuery,
        setSearchQuery,
        debouncedQuery,
        refetch: query.refetch,
    };
}

export function useUserSearchQuery(
    query: string,
    options: Omit<UseUserSearchOptions, 'debounceMs'> = {}
) {
    const { enabled = true, minQueryLength = 1 } = options;
    const { token, isAuthenticated } = useAuth();

    const shouldFetch = useMemo(() => {
        return enabled && 
               isAuthenticated && 
               !!token && 
               query.trim().length >= minQueryLength;
    }, [enabled, isAuthenticated, token, query, minQueryLength]);

    return useQuery<User[], Error>({
        queryKey: ['users', 'search', query],
        queryFn: async () => {
            return searchUsers(query, token!);
        },
        enabled: shouldFetch,
        staleTime: 1000 * 30,
        gcTime: 1000 * 60 * 5,
    });
}

export default useUserSearch;
