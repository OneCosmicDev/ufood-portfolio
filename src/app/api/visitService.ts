import {ROUTES} from "./routes";
import {postData} from "./queryClient";
import Visit, {CreateVisitRequest} from "../types/Visit";

export const visitService = {
    async createVisit(data: CreateVisitRequest, token: string): Promise<any> {
        const visitData = {
            restaurant_id: data.restaurantId,
            date: data.date,
            rating: data.rating,
            comment: data.comment
        };

        return postData<Visit>(ROUTES.USER_RESTAURANTS_VISITS, visitData, token, {userId: data.userId});
    }
};
