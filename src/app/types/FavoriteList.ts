import Restaurant from "./Restaurant";

export interface FavoriteList {
  id: string;
  name?: string;
  owner: string;
  restaurants: Restaurant[];
}

export interface CreateFavoriteListRequest {
  name: string;
  owner: string;
}

export interface UpdateFavoriteListRequest {
  name: string;
}

export interface AddRestaurantToListRequest {
  id: string;
}
