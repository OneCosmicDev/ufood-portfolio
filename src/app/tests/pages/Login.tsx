import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../../pages/Login";
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
jest.mock('@tsparticles/react', () => {
    return {
        __esModule: true,
        default: () => null,
    };
});

describe("Login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        renderWithProviders(<Login/>);
    });

    test("shows validation errors when submitting empty form", () => {
        fireEvent.click(screen.getByRole("button", { name: /connection|connection/i }));

        expect(screen.getByText("login.error.invalidEmail")).toBeInTheDocument();
        expect(screen.getByText("login.error.invalidPassword")).toBeInTheDocument();
    });

    test("submits valid credentials and stores token and user id", async () => {
        mockedAxios.post.mockResolvedValueOnce({ token: "tok-123", id: "user-1" });

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "passw0rd" } });
        fireEvent.click(screen.getByRole("button", { name: /connection|connection/i }));

        await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
        await waitFor(() => expect(localStorage.getItem("token")).toBe("tok-123"));
        await waitFor(() => expect(localStorage.getItem("user")).toBe("user-1"));
    });

    test("shows generic error alert when login mutation fails", async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error("fail"));

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "passw0rd" } });
        fireEvent.click(screen.getByRole("button", { name: /connection|connection/i }));

        await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
        await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
        expect(screen.getByText("login.error.generic")).toBeInTheDocument();
    });
});