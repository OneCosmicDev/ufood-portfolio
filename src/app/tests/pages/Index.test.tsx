import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "../../components/auth/AuthProvider";
import { useVisitMutation } from "../../hooks/useVisitMutation";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type Restaurant from "../../types/Restaurant";
import IndexPage from "../../pages/Index";

jest.mock("../../core/Application", () => ({
    Application: {
        isDarkMode: jest.fn().mockReturnValue(false),
    },
}));

jest.mock("../../components/auth/AuthProvider", () => ({
    useAuth: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn(),
}));

jest.mock("../../hooks/useVisitMutation", () => ({
    useVisitMutation: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useSearchParams: () => [
        { get: jest.fn().mockReturnValue(null) },
        jest.fn(),
    ],
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue ?? key,
        i18n: {},
        ready: true,
    }),
    withTranslation: () =>
        (Component: React.ComponentType<Record<string, unknown>>) =>
            (props: Record<string, unknown>) => (
                <Component
                    {...props}
                    t={(key: string, options?: { defaultValue?: string }) =>
                        options?.defaultValue ?? key
                    }
                />
            ),
}));

jest.mock("../../components/Page", () => ({
    Page: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="page">{children}</div>
    ),
}));

jest.mock("../../components/RestaurantList", () => ({
    __esModule: true,
    default: ({ restaurants }: { restaurants: Restaurant[] }) => (
        <div data-testid="restaurant-list">
            {restaurants.length === 0 ? (
                <div>restaurant_not_found</div>
            ) : (
                restaurants.map((restaurant) => (
                    <div key={restaurant.id}>{restaurant.name}</div>
                ))
            )}
        </div>
    ),
}));

jest.mock("../../components/HomeMap", () => ({
    __esModule: true,
    default: () => <div data-testid="home-map" />,
}));

jest.mock("../../components/VisitModal", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("../../components/LoadingScreen", () => ({
    LoadingScreen: () => <div role="status">loading...</div>,
}));

jest.mock("../../pages/ErrorPage", () => ({
    __esModule: true,
    default: ({ error, onRetry }: { error?: Error | string; onRetry?: () => void }) => (
        <div>
            <div>{typeof error === "string" ? error : error?.message}</div>
            {onRetry && <button onClick={onRetry}>error.retry</button>}
        </div>
    ),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseVisitMutation = jest.mocked(useVisitMutation);
const mockedUseQuery = jest.mocked(useQuery);

const createQueryResult = (
    overrides: Partial<UseQueryResult<Restaurant[], Error>>
): UseQueryResult<Restaurant[], Error> =>
    ({
        data: undefined,
        error: null,
        status: "success",
        fetchStatus: "idle",
        isPending: false,
        isLoading: false,
        isSuccess: true,
        isError: false,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoadingError: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        errorUpdateCount: 0,
        failureCount: 0,
        failureReason: null,
        refetch: jest.fn(),
        ...overrides,
    } as UseQueryResult<Restaurant[], Error>);

const mockRestaurants: Restaurant[] = [
    {
        id: "resto-1",
        name: "Sushi Place",
        genres: ["japanese"],
        address: "1 sushi street",
        location: { type: "Point", coordinates: [0, 0] },
        price_range: 2,
    },
    {
        id: "resto-2",
        name: "Burger Spot",
        genres: ["burger"],
        address: "2 burger avenue",
        location: { type: "Point", coordinates: [1, 1] },
        price_range: 1,
    },
];

const renderHome = () => render(<IndexPage onRestaurantClick={jest.fn()} />);

describe("Home page (Index)", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            userId: "user-1",
            token: "token-123",
            storeUserId: jest.fn(),
            storeToken: jest.fn(),
            logout: {
                mutate: jest.fn(),
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useAuth>["logout"],
        });

        mockedUseVisitMutation.mockReturnValue({
            createVisitMutation: {
                mutate: jest.fn(),
                isPending: false,
            } as unknown as ReturnType<typeof useVisitMutation>["createVisitMutation"],
        });

        mockedUseQuery.mockReturnValue(
            createQueryResult({
                data: mockRestaurants,
                isLoading: false,
                isSuccess: true,
                status: "success",
            })
        );
    });

    it("renders hero and search controls when restaurants are loaded", () => {
        renderHome();

        expect(screen.getByText("index_title")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("restaurant_search_placeholder")
        ).toBeInTheDocument();
    });

    it("shows loading indicator while restaurant query is loading", () => {
        mockedUseQuery.mockReturnValue(
            createQueryResult({
                data: undefined,
                isLoading: true,
                isPending: true,
                isSuccess: false,
                status: "pending",
                fetchStatus: "fetching",
                isFetching: true,
            })
        );

        renderHome();

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("shows error message when restaurant query fails", () => {
        mockedUseQuery.mockReturnValue(
            createQueryResult({
                data: undefined,
                isLoading: false,
                isError: true,
                isSuccess: false,
                status: "error",
                error: new Error("Failed to load"),
            })
        );

        renderHome();

        expect(screen.getByText("Failed to load")).toBeInTheDocument();
        expect(screen.getByText("error.retry")).toBeInTheDocument();
    });

    it("renders restaurant names when data is available", () => {
        renderHome();

        expect(screen.getByText("Sushi Place")).toBeInTheDocument();
        expect(screen.getByText("Burger Spot")).toBeInTheDocument();
    });

    it("renders empty state when no restaurants are returned", () => {
        mockedUseQuery.mockReturnValue(
            createQueryResult({
                data: [],
                isLoading: false,
                isSuccess: true,
                status: "success",
            })
        );

        renderHome();

        expect(screen.getByText("restaurant_not_found")).toBeInTheDocument();
    });

    it("updates the search field value when the user types", async () => {
        const user = userEvent.setup();

        renderHome();

        const searchInput = screen.getByPlaceholderText(
            "restaurant_search_placeholder"
        );
        await user.type(searchInput, "sushi");

        expect(screen.getByDisplayValue("sushi")).toBeInTheDocument();
    });
});
