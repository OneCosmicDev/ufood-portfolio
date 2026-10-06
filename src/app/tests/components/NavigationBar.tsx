import React from "react";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavigationBar from "../../components/NavigationBar";
import { renderWithProviders } from "../utils/testUtils";

const mockNavigate = jest.fn();

let authMock: {
    isAuthenticated: boolean;
    userId: string | null;
    token: string | null;
    logout: { mutateAsync: jest.Mock };
} = {
    isAuthenticated: false,
    userId: null,
    token: null,
    logout: { mutateAsync: jest.fn() },
};

jest.mock("../../components/auth/AuthProvider", () => {
    return {
        useAuth: () => authMock,
        __esModule: true,
        default: ({ children }: any) => children,
    };
});

let userData: { name: string; email: string } | undefined = undefined;
jest.mock("../../api/useUser", () => {
    return {
        useUser: (id?: string | null) => {
            return { data: id ? userData : undefined };
        },
    };
});

const mockSearchUsers = jest.fn();
jest.mock("../../api/userService", () => ({
    searchUsers: (...args: any[]) => mockSearchUsers(...args),
}));

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("NavigationBar", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockReset();
        authMock = {
            isAuthenticated: false,
            userId: null,
            token: null,
            logout: { mutateAsync: jest.fn() },
        };
        userData = undefined;
        mockSearchUsers.mockResolvedValue([]);
    });

    it("renders logo and auth links when not authenticated", async () => {
        renderWithProviders(<NavigationBar toggleDarkMode={() => {}} />);

        const logos = await screen.findAllByAltText("Logo");
        expect(logos.length).toBeGreaterThan(0);
        expect(logos.some(img => !!img.getAttribute('src'))).toBeTruthy();

        expect(screen.getByText("connection")).toBeInTheDocument();
        expect(screen.getByText("register")).toBeInTheDocument();
    });

    it("renders user controls when authenticated", async () => {
        authMock.isAuthenticated = true;
        authMock.userId = "1";
        authMock.token = "token";
        userData = { name: "Test User", email: "test@example.com" };

        renderWithProviders(<NavigationBar toggleDarkMode={() => {}} />);

        expect(await screen.findByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("disconnection")).toBeInTheDocument();
    });

    it("submits restaurant search and navigates with encoded query", async () => {
        authMock.isAuthenticated = false;
        renderWithProviders(<NavigationBar toggleDarkMode={() => {}} />);

        const input = await screen.findByPlaceholderText("search_placeholder");

        await userEvent.type(input, "pizza & more");

        expect(screen.getByDisplayValue("pizza & more")).toBeInTheDocument();

        await userEvent.keyboard("{Enter}");

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
            const calledWith = mockNavigate.mock.calls[0][0] as string;
            expect(calledWith).toContain("?search=pizza%20%26%20more");
        });
    });
});
