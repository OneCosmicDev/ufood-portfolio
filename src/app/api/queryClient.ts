import { QueryClient } from '@tanstack/react-query';
import ApiResponse from "../types/ApiResponse";
import axiosClient from "./axios";
import {AxiosResponse} from "axios";
import Visit from "../types/Visit";
import {ROUTES} from "./routes";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            retry: process.env.NODE_ENV === "test" ? false : 1,
        },
        mutations: {
            retry: 0,
        },
    },
});

export function buildRoute(template: string, params?: Record<string, string | number>): string {
    if (!params) return template;
    return Object.entries(params).reduce((acc, [k, v]) => {
        const placeholder = `{${k}}`;
        return acc.split(placeholder).join(String(v));
    }, template);
}

function unwrapResponse<T>(res: AxiosResponse<ApiResponse<T> | T>): T {
    const data = res.data as any;
    if (data && typeof data === "object") {
        if ("items" in data) return data.items as T;
        if ("data" in data) return data.data as T;
    }
    return data as T;
}

export async function fetchData<T>(
    route: string,
    token?: string | null,
    params?: Record<string, string | number>
): Promise<T> {
    const url = buildRoute(route, params);
    const res = await axiosClient.get<ApiResponse<T>>(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return unwrapResponse<T>(res);
}

export async function postData<T>(
    route: string,
    data: Record<string, unknown>,
    token?: string | null,
    params?: Record<string, string | number>,
): Promise<T> {
    const url = buildRoute(route, params);
    const res = await axiosClient.post<ApiResponse<T> | T>(url, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return unwrapResponse<T>(res);
}

export async function putData<T>(
    route: string,
    data: Record<string, unknown>,
    token?: string | null,
    params?: Record<string, string | number>
): Promise<T> {
    const url = buildRoute(route, params);
    const res = await axiosClient.put<ApiResponse<T> | T>(url, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return unwrapResponse<T>(res);
}

export async function deleteData<T>(
    route: string,
    token?: string | null,
    params?: Record<string, string | number>
): Promise<T> {
    const url = buildRoute(route, params);
    const res = await axiosClient.delete<ApiResponse<T> | T>(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return unwrapResponse<T>(res);
}

export async function fetchAllVisits(
    userId: string,
    token: string
): Promise<any[]> {
    const allVisits: any[] = [];
    let page = 0;
    let hasMore = true;
    const limit = 50;

    while (hasMore) {
        try {
            const visits = await fetchData<Visit[]>(ROUTES.USER_RESTAURANTS_VISITS, token, {userId: userId, limit: limit, page: page });
            if (Array.isArray(visits) && visits.length > 0) {
                allVisits.push(...visits);
                
                if (visits.length < limit) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error(`Error fetching visits page ${page}:`, error);
            hasMore = false;
        }
    }

    return allVisits;
}