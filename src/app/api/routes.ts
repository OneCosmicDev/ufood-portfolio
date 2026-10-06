export const ROUTES = {
    LOGIN: '/login',
    SIGNUP: '/signup',
    LOGOUT: '/logout',
    USERS: '/users',
    USER_BY_ID: '/users/{id}',
    USER_FAVORITES: '/users/{id}/favorites',
    USER_RESTAURANTS_VISITS: '/users/{userId}/restaurants/visits',
    USER_RESTAURANT_VISITS: '/users/{userId}/restaurants/{restaurantId}/visits',
    VISIT_BY_ID: '/users/{userId}/restaurants/visits/{id}',

    RESTAURANTS: '/restaurants',
    RESTAURANT_BY_ID: '/restaurants/{id}',
    RESTAURANT_VISITS: '/restaurants/{id}/visits',

    FAVORITES: '/favorites',
    FAVORITE_BY_ID: '/favorites/{id}',
    ADD_RESTAURANT_TO_FAVORITE: '/favorites/{favoriteId}/restaurants',
    REMOVE_RESTAURANT_FROM_FAVORITE: '/favorites/{favoriteId}/restaurants/{restaurantId}',

    FOLLOW: '/follow',
    UNFOLLOW: '/follow/{id}',
    CHECK_FOLLOWING: '/follow/{id}/status',
};
