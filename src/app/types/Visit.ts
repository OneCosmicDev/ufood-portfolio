export default interface Visit {
    restaurant: string;
    count: number;
    image: string;
    cuisine: string[];
    priceRange: string;
    restaurantId: number;
}

export interface VisitModalData {
    date: string;
    rating: number;
    comment: string;
}

export interface CreateVisitRequest {
    restaurantId: string;
    date: string;
    rating: number;
    comment: string;
    userId: string;
}

export interface VisitReadOnlyData {
    date: string;
    rating: number;
    comment: string;
    restaurantId: string;
}