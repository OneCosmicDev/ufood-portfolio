import { ROUTES } from './routes';
import Restaurant from '../types/Restaurant';
import {fetchData} from "./queryClient";

const normalizeRestaurant = (restaurant: Restaurant): Restaurant => {
  if (!restaurant.coordinates && restaurant.location?.coordinates) {
    restaurant.coordinates = {
      lat: restaurant.location.coordinates[1],
      lng: restaurant.location.coordinates[0],
    };
  }
  
  if (restaurant.price_range && !restaurant.priceRange) {
    restaurant.priceRange = '$'.repeat(restaurant.price_range);
  }
  
  if (restaurant.opening_hours && !restaurant.hours) {
    const openingHours = restaurant.opening_hours as Record<string, unknown>;

    if (typeof restaurant.opening_hours === 'string') {
      restaurant.hours = restaurant.opening_hours as unknown as string;
    } else if (openingHours.text) {
      restaurant.hours = openingHours.text as string;
    } else if (openingHours.weekday_text) {
      const weekdayText = openingHours.weekday_text;
      if (Array.isArray(weekdayText)) {
        restaurant.hours = weekdayText.join(', ');
      }
    } else {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayHours: Array<{ day: string; hours: string }> = [];

      for (const day of days) {
        if (openingHours[day] && typeof openingHours[day] === 'string') {
          dayHours.push({ day, hours: openingHours[day] });
        }
      }

      if (dayHours.length > 0) {
        restaurant.hours = JSON.stringify(dayHours);
      }
    }
  }
  
  return restaurant;
};

export const getRestaurantById = async (id: string, token: string): Promise<Restaurant> => {
  const response = await fetchData<Restaurant>(ROUTES.RESTAURANT_BY_ID, token, {id});
  return normalizeRestaurant(response);
};

export const getSimilarRestaurants = async (
  restaurantId: string,
  token: string,
  limit: number = 4
): Promise<Restaurant[]> => {
  try {
    const allRestaurants = await fetchData<Restaurant[]>(ROUTES.RESTAURANTS, token);
    let referenceRestaurant = allRestaurants.find(r => r.id === restaurantId);

    if (!referenceRestaurant) {
      referenceRestaurant = await getRestaurantById(restaurantId, token);
    }

    if (!referenceRestaurant) return [];

    const scoredRestaurants = allRestaurants
      .filter(restaurant => restaurant.id !== restaurantId)
      .map(restaurant => {
        let score = 0;

        const refGenres = new Set([
          ...(referenceRestaurant.genres || []),
          ...(referenceRestaurant.cuisine || [])
        ]);
        const restaurantGenres = new Set([
          ...(restaurant.genres || []),
          ...(restaurant.cuisine || [])
        ]);

        let genreMatches = 0;
        refGenres.forEach(genre => {
          if (restaurantGenres.has(genre)) {
            genreMatches++;
            score += 5;
          }
        });

        const refPrice = referenceRestaurant.priceRange || '$'.repeat(referenceRestaurant.price_range || 1);
        const restaurantPrice = restaurant.priceRange || '$'.repeat(restaurant.price_range || 1);

        if (refPrice === restaurantPrice) {
          score += 3;
        } else if (Math.abs(refPrice.length - restaurantPrice.length) === 1) {
          score += 1;
        }

        if (referenceRestaurant.rating && restaurant.rating) {
          const ratingDiff = Math.abs(referenceRestaurant.rating - restaurant.rating);
          if (ratingDiff < 0.5) {
            score += 2;
          } else if (ratingDiff < 1.0) {
            score += 1;
          }
        }

        return {
          restaurant: normalizeRestaurant(restaurant),
          score,
          genreMatches
        };
      })
      .filter(item => item.genreMatches > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.genreMatches - a.genreMatches;
      })
      .slice(0, limit)
      .map(item => item.restaurant);

    return scoredRestaurants;
  } catch {
    return [];
  }
};
