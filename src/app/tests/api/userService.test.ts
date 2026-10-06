import { searchUsers, checkFollowing } from '../../api/userService';
import { fetchData } from '../../api/queryClient';

jest.mock('../../api/queryClient', () => ({
    fetchData: jest.fn(),
    postData: jest.fn(),
    deleteData: jest.fn(),
    buildRoute: jest.fn((template: string, params?: Record<string, string | number>) => {
        if (!params) return template;
        return Object.entries(params).reduce((acc, [k, v]) => {
            return acc.replace(`{${k}}`, String(v));
        }, template);
    }),
}));

const mockFetchData = fetchData as jest.MockedFunction<typeof fetchData>;

describe('userService', () => {
    const mockToken = 'test-token-123';
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('searchUsers', () => {
        const mockUsers = [
            { id: '1', name: 'John Doe', email: 'john@example.com', rating: 100 },
            { id: '2', name: 'Jane Doe', email: 'jane@example.com', rating: 50 },
        ];

        test('returns users matching the search query', async () => {
            mockFetchData.mockResolvedValueOnce(mockUsers);

            const result = await searchUsers('Doe', mockToken);

            expect(mockFetchData).toHaveBeenCalledWith(
                '/users?q=Doe',
                mockToken
            );
            expect(result).toEqual(mockUsers);
        });

        test('returns empty array for empty query', async () => {
            const result = await searchUsers('', mockToken);

            expect(mockFetchData).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        test('returns empty array for whitespace-only query', async () => {
            const result = await searchUsers('   ', mockToken);

            expect(mockFetchData).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        test('handles array response without items wrapper', async () => {
            mockFetchData.mockResolvedValueOnce(mockUsers);

            const result = await searchUsers('test', mockToken);

            expect(result).toEqual(mockUsers);
        });
    });

    describe('checkFollowing', () => {
        test('returns true when following the user', async () => {
            mockFetchData.mockResolvedValueOnce(true);

            const result = await checkFollowing('target-user-id', mockToken);

            expect(mockFetchData).toHaveBeenCalledWith(
                '/follow/{id}/status',
                mockToken,
                { id: 'target-user-id' }
            );
            expect(result).toBe(true);
        });

        test('returns false when 404 error (not following)', async () => {
            const error: any = { response: { status: 404 } };
            mockFetchData.mockRejectedValueOnce(error);

            const result = await checkFollowing('target-user-id', mockToken);

            expect(result).toBe(false);
        });

        test('throws error for non-404 errors', async () => {
            const error: any = { response: { status: 500 } };
            mockFetchData.mockRejectedValueOnce(error);

            await expect(checkFollowing('target-user-id', mockToken)).rejects.toEqual(error);
        });
    });
});
