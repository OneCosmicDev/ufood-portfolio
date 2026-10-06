import {useQuery} from "@tanstack/react-query";
import {fetchData} from "./queryClient";
import {ROUTES} from "./routes";
import User from "../types/User";
import {useAuth} from "../components/auth/AuthProvider";

export function useUser(userId: string) {
    const {token} = useAuth();
    return useQuery<User, Error>({
        queryKey: ["user", userId],
        enabled: !!userId,
        queryFn: async () => await fetchData<User>(ROUTES.USER_BY_ID, token, {id: userId}),
    });
}

