import {ROUTES} from "./routes";
import {deleteData, fetchData, postData, putData} from "./queryClient";
import axiosClient from "./axios";
import {
    CreateFavoriteListRequest,
    FavoriteList,
    UpdateFavoriteListRequest
} from "../types/FavoriteList";
import Restaurant from "../types/Restaurant";
import { notificationService } from "../utils/notificationService";

async function normalizeFavoriteList(list: any, token: string): Promise<FavoriteList> {
    let normalizedOwner = list.owner;
    if (list.owner && typeof list.owner === 'object' && 'email' in list.owner && list.owner.email) {
        normalizedOwner = list.owner.email;
    }

    const normalizedList: FavoriteList = {
        ...list,
        owner: normalizedOwner
    };

    if (normalizedList.restaurants && normalizedList.restaurants.length > 0) {
        const restaurantsWithDetails = await Promise.all(
            normalizedList.restaurants.map(async (restaurant: any) => {
                if (restaurant.id && !restaurant.name) {
                    try {
                        return await fetchData<Restaurant>(ROUTES.RESTAURANT_BY_ID, token, {id: restaurant.id});
                    } catch (error) {
                        notificationService.error(`Failed to fetch restaurant ${restaurant.id}`);
                        notificationService.logError("favoriteService.normalizeFavoriteList", error, { restaurantId: restaurant.id });
                        return restaurant;
                    }
                }
                return restaurant;
            })
        );
        return {...normalizedList, restaurants: restaurantsWithDetails};
    }

    return normalizedList;
}

async function normalizeFavoriteLists(lists: any[], token: string): Promise<FavoriteList[]> {
    return Promise.all(lists.map(list => normalizeFavoriteList(list, token)));
}

export const favoriteService = {
    async getUserFavorites(userId: string, token: string): Promise<FavoriteList[]> {
        return await fetchData<FavoriteList[]>(
            `${ROUTES.USER_FAVORITES}?limit=1000`,
            token,
            {id: userId}
        );
    },

    async getAllLists(userId: string, token: string): Promise<FavoriteList[]> {
        const allLists: FavoriteList[] = await this.getUserFavorites(userId, token);

        const normalizedLists = await normalizeFavoriteLists(allLists, token);
        return normalizedLists;
    },

    async getGlobalLists(page: number, limit: number, token: string): Promise<{ items: FavoriteList[]; total?: number }> {
        const url = `${ROUTES.FAVORITES}?limit=${limit}&page=${page}`;
        const response = await axiosClient.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        const rawItems = Array.isArray(data) ? data : (data?.items || []);
        const total = Array.isArray(data) ? data.length : data?.total;
        const normalizedItems = await normalizeFavoriteLists(rawItems, token);

        return {
            items: normalizedItems,
            total
        };
    },

    async createList(data: CreateFavoriteListRequest, token : string): Promise<FavoriteList> {
        return await postData<FavoriteList>(ROUTES.FAVORITES, { ...data }, token);
    },

    async updateList(listId: string, data: UpdateFavoriteListRequest, token : string): Promise<FavoriteList> {
        return await putData<FavoriteList>(ROUTES.FAVORITE_BY_ID, { ...data }, token, {id: listId});
    },

    async deleteList(listId: string, token : string): Promise<FavoriteList> {
        return await deleteData<FavoriteList>(ROUTES.FAVORITE_BY_ID, token, {id: listId});
    },

    async addRestaurantToList(favoriteId: string, restaurantId: string, token : string): Promise<FavoriteList> {
        return await postData<FavoriteList>(ROUTES.ADD_RESTAURANT_TO_FAVORITE, {id: restaurantId}, token, {favoriteId: favoriteId});
    },

    async removeRestaurantFromList(favoriteId: string, restaurantId: string, token : string): Promise<FavoriteList> {
        return await deleteData<FavoriteList>(ROUTES.REMOVE_RESTAURANT_FROM_FAVORITE, token, {favoriteId: favoriteId, restaurantId: restaurantId});
    }
};
