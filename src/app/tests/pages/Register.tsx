import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../../pages/Register";
import { notificationService } from "../../utils/notificationService";
import { renderWithProviders } from "../utils/testUtils";
import {mockedAxios} from "../utils/setupTests";

jest.mock("../../api/queryClient", () => {
    const { mockedAxios: ma } = jest.requireActual("../utils/setupTests");
    return {
        __esModule: true,
        postData: jest.fn(async (route: string, data: any) => {
            const res = await ma.post(route, data);
            return (res && (res.data ?? res));
        }),
    };
});
jest.mock("../../utils/notificationService", () => ({ notificationService: { success: jest.fn() } }));
jest.mock('@tsparticles/react', () => {
    return {
        __esModule: true,
        default: () => null,
    };
});
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});
const mockedNotify = (notificationService as unknown as { success: jest.Mock }).success;

describe('Register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        renderWithProviders(<Register/>);
    });

    test("shows validation errors for invalid inputs", () => {
        fireEvent.click(screen.getByRole("button", {name: /register|register/i}));

        expect(screen.getByText("signup.error.invalidName")).toBeInTheDocument();
        expect(screen.getByText("signup.error.invalidEmail")).toBeInTheDocument();
        expect(screen.getByText("signup.error.invalidPassword")).toBeInTheDocument();
    });

    test("successful registration calls api, notifies and navigates to login", async () => {
        mockedAxios.post.mockResolvedValueOnce({name: "u", email: "a@b.com", password: "passw0rd"});

        fireEvent.change(screen.getByLabelText(/name/i), {target: {value: "User"}});
        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "user@example.com"}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "secret1"}});
        fireEvent.click(screen.getByRole("button", {name: /register|register/i}));

        await waitFor(() => expect(mockedNotify).toHaveBeenCalledWith("signup.success"));
        await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
        await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    });
});