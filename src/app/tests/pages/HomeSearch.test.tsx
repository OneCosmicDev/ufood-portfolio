import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IndexPage from "../../pages/Index";
import { useAuth } from "../../components/auth/AuthProvider";
import { useVisitMutation } from "../../hooks/useVisitMutation";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type Restaurant from "../../types/Restaurant";

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
            {restaurants.map((restaurant) => (
                <div key={restaurant.id}>{restaurant.name}</div>
            ))}
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
        id: "resto-central",
        name: "Central Sweets & Food-Hub",
        genres: ["Asian"],
        address: "123 Sweet St",
        price_range: 4,
        location: { type: "Point", coordinates: [0, 0] },
    },
    {
        id: "resto-ilot",
        name: "L'Îlot - Galerie Art'chipel",
        genres: ["Ambiance/Café"],
        address: "456 Art Ave",
        price_range: 2,
        location: { type: "Point", coordinates: [1, 1] },
    },
    {
        id: "resto-quesada",
        name: "Quesada Burritos & Tacos",
        genres: ["Mexican"],
        address: "789 Taco Rd",
        price_range: 1,
        location: { type: "Point", coordinates: [2, 2] },
    },
];

const renderHome = () => render(<IndexPage onRestaurantClick={jest.fn()} />);

describe("Home search & filters", () => {
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
            } as unknown as ReturnType<
                typeof useVisitMutation
            >["createVisitMutation"],
        });

        mockedUseQuery.mockReturnValue(
            createQueryResult({
                data: mockRestaurants,
                isSuccess: true,
                status: "success",
            })
        );
    });

    it("renders search inputs, dropdowns and reset button", () => {
        renderHome();

        expect(
            screen.getByPlaceholderText("restaurant_search_placeholder")
        ).toBeInTheDocument();

        const selects = screen.getAllByRole("combobox");
        expect(selects).toHaveLength(2);

        expect(screen.getByRole("option", { name: "index_all_cuisines" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "all_prices" })).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "reset_filters" })
        ).toBeInTheDocument();
    });

    it("filters by name and restores when cleared", async () => {
        const user = userEvent.setup();
        renderHome();

        expect(screen.getByText("Central Sweets & Food-Hub")).toBeInTheDocument();
        expect(screen.getByText("L'Îlot - Galerie Art'chipel")).toBeInTheDocument();
        expect(screen.getByText("Quesada Burritos & Tacos")).toBeInTheDocument();

        const searchInput = screen.getByPlaceholderText(
            "restaurant_search_placeholder"
        );
        await user.type(searchInput, "quesada");

        expect(screen.getByText("Quesada Burritos & Tacos")).toBeInTheDocument();
        expect(
            screen.queryByText("Central Sweets & Food-Hub")
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText("L'Îlot - Galerie Art'chipel")
        ).not.toBeInTheDocument();

        await user.clear(searchInput);

        expect(screen.getByText("Central Sweets & Food-Hub")).toBeInTheDocument();
        expect(screen.getByText("L'Îlot - Galerie Art'chipel")).toBeInTheDocument();
        expect(screen.getByText("Quesada Burritos & Tacos")).toBeInTheDocument();
    });

    it("filters by cuisine dropdown", async () => {
        const user = userEvent.setup();
        renderHome();

        const [cuisineSelect] = screen.getAllByRole("combobox");
        await user.selectOptions(cuisineSelect, "Mexican");

        expect(screen.getByText("Quesada Burritos & Tacos")).toBeInTheDocument();
        expect(
            screen.queryByText("Central Sweets & Food-Hub")
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText("L'Îlot - Galerie Art'chipel")
        ).not.toBeInTheDocument();
    });

    it("filters by price dropdown", async () => {
        const user = userEvent.setup();
        renderHome();

        const [, priceSelect] = screen.getAllByRole("combobox");
        await user.selectOptions(priceSelect, "$$$$");

        expect(screen.getByText("Central Sweets & Food-Hub")).toBeInTheDocument();
        expect(
            screen.queryByText("L'Îlot - Galerie Art'chipel")
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText("Quesada Burritos & Tacos")
        ).not.toBeInTheDocument();
    });

    it("reset clears all filters and restores full list", async () => {
        const user = userEvent.setup();
        renderHome();

        const searchInput = screen.getByPlaceholderText(
            "restaurant_search_placeholder"
        );
        const [cuisineSelect, priceSelect] = screen.getAllByRole("combobox");

        await user.type(searchInput, "quesada");
        await user.selectOptions(cuisineSelect, "Mexican");
        await user.selectOptions(priceSelect, "$$$$");

        await user.click(screen.getByRole("button", { name: "reset_filters" }));

        expect(searchInput).toHaveValue("");
        expect(cuisineSelect).toHaveValue("");
        expect(priceSelect).toHaveValue("");

        expect(screen.getByText("Central Sweets & Food-Hub")).toBeInTheDocument();
        expect(screen.getByText("L'Îlot - Galerie Art'chipel")).toBeInTheDocument();
        expect(screen.getByText("Quesada Burritos & Tacos")).toBeInTheDocument();
    });

    it("keeps filtered results after toggling map/list view", async () => {
        const user = userEvent.setup();
        renderHome();

        const searchInput = screen.getByPlaceholderText(
            "restaurant_search_placeholder"
        );
        await user.type(searchInput, "quesada");

        await user.click(screen.getByRole("button", { name: "map_view" }));
        await user.click(screen.getByRole("button", { name: "list_view" }));

        expect(screen.getByText("Quesada Burritos & Tacos")).toBeInTheDocument();
        expect(
            screen.queryByText("Central Sweets & Food-Hub")
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText("L'Îlot - Galerie Art'chipel")
        ).not.toBeInTheDocument();
    });
});
