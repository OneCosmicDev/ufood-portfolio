import React from "react";
import { APP_NAME } from "../constants/Global";
import { useTranslation } from "react-i18next";
import { Page } from "../components/Page";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {useQuery, useQueries, UseQueryResult} from "@tanstack/react-query";
import User from "../types/User";
import { ROUTES } from "../api/routes";
import { fetchData } from "../api/queryClient";
import { getUserById } from "../api/userService";
import ErrorPage from "./ErrorPage";
import { LoadingScreen } from "../components/LoadingScreen";
import UserList from "../components/UserList";
import { Button } from "react-bootstrap";
import { useAuth } from "../components/auth/AuthProvider";
import { RoutesPath } from "../RoutesPath";
import {AxiosError} from "axios";

const FollowingPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();
    const userId = id || '';

    const userQuery = useQuery<User, AxiosError>({
        queryKey: ["users", userId],
        queryFn: async () => await fetchData(ROUTES.USER_BY_ID, token || null, { id: userId }),
        enabled: !!userId
    });

    const followingIds = userQuery.data?.following || [];
    
    const followingQueries : UseQueryResult<User, AxiosError>[] = useQueries({
        queries: followingIds.map((followerData: any) => {
            const followingId = typeof followerData === 'string' ? followerData : followerData.id;
            return {
                queryKey: ['users', followingId],
                queryFn: async () => getUserById(followingId, token!),
                enabled: !!token && !!followingId,
                staleTime: 1000 * 60 * 5, 
            };
        }),
    });

    const followingIsLoading = followingQueries.some((q) => q.isLoading);
    const followingHasError = followingQueries.some((q) => q.isError);
    const followingUsers = followingQueries
        .filter((q) => q.data)
        .map((q) => q.data as User);

    React.useEffect(() => {
        if (userQuery.data) {
            document.title = `${userQuery.data.name} - ${t("userProfile.following")} - ${APP_NAME}`;
        }
    }, [userQuery.data, t]);

    const handleUserClick = (clickedUserId: string) => {
        navigate(RoutesPath.USER_PROFILE.replace(':id', clickedUserId));
    };

    const handleGoBack = () => {
        navigate(RoutesPath.USER_PROFILE.replace(':id', userId));
    };

    if (userQuery.isLoading || followingIsLoading) {
        return <LoadingScreen />;
    }

    if (userQuery.isError) {
        return <ErrorPage
            error={userQuery.error}
            onRetry={() => userQuery.refetch()}
        />;
    }

    if (followingHasError) {
        const errorQuery = followingQueries.find((q) => q.isError);
        return <ErrorPage
            error={errorQuery?.error || new AxiosError(t("error.generic"))}
            onRetry={() => {
                followingQueries.forEach((q) => q.refetch());
            }}
        />;
    }

    const user = userQuery.data;

    if (!user) {
        return <ErrorPage error={t("error.no_data")} />;
    }

    return (
        <Page>
            <div className="mt-5 pt-4">
                <Button
                    variant="link"
                    className="text-decoration-none mb-3 p-0 text-body"
                    onClick={handleGoBack}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    {t("userProfile.title")}
                </Button>

                <h2 className="text-center mb-4">{t("userProfile.following")}</h2>

                <UserList
                    users={followingUsers}
                    onUserClick={handleUserClick}
                    emptyMessage={t("userProfile.noFollowing")}
                />
            </div>
        </Page>
    );
};

export default FollowingPage;
