import { useMutation, useQueryClient } from "@tanstack/react-query";
import { favoriteService } from "../../api/favoriteService";
import { getFavoriteListErrorMessage } from "../../utils/favoriteListUtils";
import { useTranslation } from "react-i18next";
import { FavoriteList } from "../../types/FavoriteList";
import { fetchData } from "../../api/queryClient";
import { ROUTES } from "../../api/routes";
import Restaurant from "../../types/Restaurant";
import { notificationService } from "../../utils/notificationService";

const getEmail = (value: unknown): string | undefined => {
  if (!value || typeof value !== "object") return undefined;
  if ("email" in value) {
    const email = (value as { email?: unknown }).email;
    if (typeof email === "string") {
      return email;
    }
  }
  return undefined;
};

interface UseFavoriteMutationsProps {
  userId: string;
  userEmail: string;
  onError: (message: string) => void;
  token: string | null;
}

export const useFavoriteMutations = ({ userId, userEmail, onError, token }: UseFavoriteMutationsProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const userListsQueryKey = ["favoriteLists", userId, 1000];

  const handleError = (error: unknown, defaultMessage: string) => {
    const errorKey = getFavoriteListErrorMessage(error, defaultMessage);
    const errorMessage = errorKey.startsWith("favorites.") ? t(errorKey) : errorKey;
    onError(errorMessage);
  };

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const createdList = await favoriteService.createList({ name, owner: userEmail }, token!);
      const normalizedList: FavoriteList = {
        id: createdList.id,
        name: createdList.name || name,
        owner: typeof createdList.owner === "string"
          ? createdList.owner
          : getEmail(createdList.owner) || userEmail,
        restaurants: createdList.restaurants || []
      };
      return normalizedList;
    },
    onSuccess: (newList) => {
      queryClient.setQueryData<FavoriteList[]>(userListsQueryKey, (oldData = []) => {
        const exists = oldData.some(list => list.id === newList.id);
        if (exists) return oldData;
        return [...oldData, newList];
      });

      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: userListsQueryKey });
      }, 1500);
    },
    onError: (err: unknown) => {
      handleError(err, t("favorites.errorCreating"));
    },
  });

  const updateListMutation = useMutation({
    mutationFn: async ({ listId, name }: { listId: string; name: string }) => {
      const updatedList = await favoriteService.updateList(listId, { name }, token!);
      const normalizedOwner = typeof updatedList.owner === "string"
        ? updatedList.owner
        : getEmail(updatedList.owner) || userEmail;

      return {
        id: updatedList.id,
        name: updatedList.name || name,
        owner: normalizedOwner,
      };
    },
    onSuccess: (updatedList) => {
      queryClient.setQueryData<FavoriteList[]>(userListsQueryKey, (oldData = []) => {
        return oldData.map(list => {
          if (list.id === updatedList.id) {
            return {
              ...list,
              ...updatedList,
              name: updatedList.name || list.name,
              restaurants: list.restaurants || []
            };
          }
          return list;
        });
      });
    },
    onError: (err: unknown) => {
      handleError(err, t("favorites.errorUpdating"));
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (listId: string) => favoriteService.deleteList(listId, token!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userListsQueryKey });
    },
    onError: (err: unknown) => {
      handleError(err, t("favorites.errorDeleting"));
    },
  });

  const addRestaurantMutation = useMutation({
    mutationFn: async ({ favoriteId, restaurantId }: { favoriteId: string; restaurantId: string }) => {
      const updatedList = await favoriteService.addRestaurantToList(favoriteId, restaurantId, token!);

      const normalizedOwner = typeof updatedList.owner === "string"
        ? updatedList.owner
        : getEmail(updatedList.owner) || userEmail;

      const enrichedRestaurants = await Promise.all(
        (updatedList.restaurants || []).map(async (restaurant: any) => {
          if (restaurant.id && (!restaurant.name || !restaurant.genres)) {
            try {
              const fullRestaurant = await fetchData<Restaurant>(ROUTES.RESTAURANT_BY_ID, token ?? '', { id: restaurant.id });
              return fullRestaurant;
            } catch (error) {
              notificationService.error(`Failed to fetch restaurant ${restaurant.id}`);
              notificationService.logError("useFavoriteMutations.addRestaurant", error, { restaurantId: restaurant.id });
              return restaurant;
            }
          }
          return restaurant;
        })
      );

      return {
        id: updatedList.id,
        name: updatedList.name,
        owner: normalizedOwner,
        restaurants: enrichedRestaurants
      };
    },
    onSuccess: (updatedList) => {
      queryClient.setQueryData<FavoriteList[]>(userListsQueryKey, (oldData = []) => {
        return oldData.map(list => {
          if (list.id === updatedList.id) {
            const existingRestaurants = list.restaurants || [];
            const newRestaurants = updatedList.restaurants || [];

            const restaurantMap = new Map<string, Restaurant>();
            existingRestaurants.forEach(r => {
              if (r.id && r.genres) {
                restaurantMap.set(r.id, r);
              }
            });

            newRestaurants.forEach(r => {
              if (r.id && r.genres) {
                restaurantMap.set(r.id, r);
              }
            });

            return {
              ...list,
              ...updatedList,
              name: updatedList.name || list.name,
              restaurants: Array.from(restaurantMap.values())
            };
          }
          return list;
        });
      });
    },
    onError: (err: unknown) => {
      handleError(err, t("favorites.errorAddingRestaurant"));
    },
  });

  const removeRestaurantMutation = useMutation({
    mutationFn: async ({ favoriteId, restaurantId }: { favoriteId: string; restaurantId: string }) => {
      const updatedList = await favoriteService.removeRestaurantFromList(favoriteId, restaurantId, token!);
      const normalizedOwner = typeof updatedList.owner === "string"
        ? updatedList.owner
        : getEmail(updatedList.owner) || userEmail;

      return {
        id: updatedList.id,
        name: updatedList.name,
        owner: normalizedOwner,
        restaurantIdToRemove: restaurantId,
      };
    },
    onSuccess: (updatedList) => {
      queryClient.setQueryData<FavoriteList[]>(userListsQueryKey, (oldData = []) => {
        return oldData.map(list => {
          if (list.id === updatedList.id) {
            const existingRestaurants = list.restaurants || [];
            const filteredRestaurants = existingRestaurants.filter(
              r => r.id !== updatedList.restaurantIdToRemove
            );

            return {
              ...list,
              ...updatedList,
              name: updatedList.name || list.name,
              restaurants: filteredRestaurants
            };
          }
          return list;
        });
      });
    },
    onError: (err: unknown) => {
      handleError(err, t("favorites.errorRemovingRestaurant"));
    },
  });

  return {
    createListMutation,
    updateListMutation,
    deleteListMutation,
    addRestaurantMutation,
    removeRestaurantMutation,
  };
};
