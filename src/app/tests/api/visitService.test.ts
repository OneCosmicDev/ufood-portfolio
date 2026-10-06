import { ROUTES } from "../../api/routes";
import { postData } from "../../api/queryClient";
import { visitService } from "../../api/visitService";
import { CreateVisitRequest } from "../../types/Visit";

jest.mock("../../api/routes", () => ({
    ROUTES: {
        USER_RESTAURANTS_VISITS: "/api/user/:userId/restaurants/:restaurantId/visits"
    }
}));

jest.mock("../../api/queryClient", () => ({
    postData: jest.fn()
}));

describe("visitService", () => {
    const mockToken = "test-token-123";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createVisit", () => {
        it("should call postData with the correct parameters", async () => {
            const mockVisitData: CreateVisitRequest = {
                userId: "user-123",
                restaurantId: "restaurant-456",
                date: "2024-01-15",
                rating: 4,
                comment: "Très bon restaurant"
            };

            const expectedTransformedData = {
                restaurant_id: "restaurant-456",
                date: "2024-01-15",
                rating: 4,
                comment: "Très bon restaurant"
            };

            const mockResponse = {
                id: "visit-789",
                ...expectedTransformedData,
                restaurant: "Nom du restaurant",
                count: 1,
                image: "image.jpg",
                cuisine: ["Française"],
                priceRange: "$$",
                restaurantId: 456
            };

            (postData as jest.Mock).mockResolvedValue(mockResponse);

            const result = await visitService.createVisit(mockVisitData, mockToken);

            expect(postData).toHaveBeenCalledTimes(1);
            expect(postData).toHaveBeenCalledWith(
                ROUTES.USER_RESTAURANTS_VISITS,
                expectedTransformedData,
                mockToken,
                { userId: "user-123" }
            );
            expect(result).toEqual(mockResponse);
        });

        it("should transform restaurantId into restaurant_id", async () => {
            const mockVisitData: CreateVisitRequest = {
                userId: "user-123",
                restaurantId: "restaurant-456",
                date: "2024-01-15",
                rating: 5,
                comment: "Excellent"
            };

            (postData as jest.Mock).mockResolvedValue({});

            await visitService.createVisit(mockVisitData, mockToken);

            expect(postData).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    restaurant_id: "restaurant-456"
                }),
                mockToken,
                expect.any(Object)
            );
        });

        it("should include the comment even if it is empty", async () => {
            const mockVisitData: CreateVisitRequest = {
                userId: "user-123",
                restaurantId: "restaurant-456",
                date: "2024-01-15",
                rating: 3,
                comment: ""
            };

            (postData as jest.Mock).mockResolvedValue({});

            await visitService.createVisit(mockVisitData, mockToken);

            expect(postData).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    comment: ""
                }),
                mockToken,
                expect.any(Object)
            );
        });

        it("should handle API errors", async () => {
            const mockVisitData: CreateVisitRequest = {
                userId: "user-123",
                restaurantId: "restaurant-456",
                date: "2024-01-15",
                rating: 4,
                comment: "Test"
            };

            const errorResponse = {
                response: {
                    status: 400,
                    data: { message: "Date invalide" }
                }
            };

            (postData as jest.Mock).mockRejectedValue(errorResponse);

            await expect(visitService.createVisit(mockVisitData, mockToken))
                .rejects
                .toEqual(errorResponse);

            expect(postData).toHaveBeenCalledTimes(1);
        });

        it("should format the date correctly", async () => {
            const mockVisitData: CreateVisitRequest = {
                userId: "user-123",
                restaurantId: "restaurant-456",
                date: "2024-01-15T12:00:00.000Z",
                rating: 4,
                comment: "Test"
            };

            (postData as jest.Mock).mockResolvedValue({});

            await visitService.createVisit(mockVisitData, mockToken);

            expect(postData).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    date: "2024-01-15T12:00:00.000Z"
                }),
                mockToken,
                expect.any(Object)
            );
        });

        it("should send the rating as a number", async () => {
            const mockVisitData: CreateVisitRequest = {
                userId: "user-123",
                restaurantId: "restaurant-456",
                date: "2024-01-15",
                rating: 5,
                comment: "Test"
            };

            (postData as jest.Mock).mockResolvedValue({});

            await visitService.createVisit(mockVisitData, mockToken);

            const callData = (postData as jest.Mock).mock.calls[0][1];
            expect(typeof callData.rating).toBe("number");
            expect(callData.rating).toBe(5);
        });

        it("should pass userId in the URL parameters", async () => {
            const mockVisitData: CreateVisitRequest = {
                userId: "user-123",
                restaurantId: "restaurant-456",
                date: "2024-01-15",
                rating: 4,
                comment: "Test"
            };

            (postData as jest.Mock).mockResolvedValue({});

            await visitService.createVisit(mockVisitData, mockToken);

            expect(postData).toHaveBeenCalledWith(
                ROUTES.USER_RESTAURANTS_VISITS,
                expect.any(Object),
                mockToken,
                { userId: "user-123" }
            );
        });

        it("should return the complete API response", async () => {
            const mockVisitData: CreateVisitRequest = {
                userId: "user-123",
                restaurantId: "restaurant-456",
                date: "2024-01-15",
                rating: 4,
                comment: "Test"
            };

            const fullApiResponse = {
                id: "visit-789",
                restaurant_id: "restaurant-456",
                date: "2024-01-15",
                rating: 4,
                comment: "Test",
                created_at: "2024-01-15T10:30:00Z",
                updated_at: "2024-01-15T10:30:00Z"
            };

            (postData as jest.Mock).mockResolvedValue(fullApiResponse);

            const result = await visitService.createVisit(mockVisitData, mockToken);

            expect(result).toEqual(fullApiResponse);
        });
    });
});