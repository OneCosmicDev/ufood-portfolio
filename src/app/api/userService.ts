import { ROUTES } from './routes';
import { fetchData, postData, deleteData } from './queryClient';
import User from '../types/User';

export interface UserSearchResult {
    items: User[];
    total: number;
}

export interface FollowResponse {
    id: string;
    email: string;
    name: string;
    rating: number;
    followers: Array<{ id: string; email: string; name: string }>;
    following: Array<{ id: string; email: string; name: string }>;
}

export const searchUsers = async (query: string, token: string): Promise<User[]> => {
    if (!query.trim()) {
        return [];
    }
    
    const url = `${ROUTES.USERS}?q=${encodeURIComponent(query)}`;
    return await fetchData<User[]>(url, token);
};

export const getUserById = async (userId: string, token: string): Promise<User> => {
    return await fetchData<User>(ROUTES.USER_BY_ID, token, { id: userId });
};

export const followUser = async (targetUserId: string, token: string): Promise<FollowResponse> => {
    return await postData<FollowResponse>(ROUTES.FOLLOW, { id: targetUserId }, token);
};

export const unfollowUser = async (targetUserId: string, token: string): Promise<FollowResponse> => {
    return await deleteData<FollowResponse>(ROUTES.UNFOLLOW, token, { id: targetUserId });
};

export const checkFollowing = async (targetUserId: string, token: string): Promise<boolean> => {
    try {
        const result = await fetchData<boolean>(ROUTES.CHECK_FOLLOWING, token, { id: targetUserId });
        return !!result;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return false;
        }
        throw error;
    }
};

export const getAllUsers = async (
    token: string,
    limit: number = 50,
    page: number = 0
): Promise<User[]> => {
    const url = `${ROUTES.USERS}?limit=${limit}&page=${page}`;
    return await fetchData<User[]>(url, token);
};

export const userService = {
    searchUsers,
    getUserById,
    followUser,
    unfollowUser,
    checkFollowing,
    getAllUsers,
};

export default userService;
