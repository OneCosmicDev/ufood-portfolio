import React from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "../../components/auth/AuthProvider";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

export const renderWithProviders = (ui: React.ReactElement) => {
    const qc = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: ui,
            },
        ],
        {
            initialEntries: ["/"],
            future: { v7_relativeSplatPath: true },
        }
    );

    return render(
        <QueryClientProvider client={qc}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    );
};
