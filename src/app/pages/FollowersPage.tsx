import React from "react";
import { APP_NAME } from "../constants/Global";
import { useTranslation } from "react-i18next";
import { Page } from "../components/Page";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import User from "../types/User";
import { ROUTES } from "../api/routes";
import { fetchData } from "../api/queryClient";
import ErrorPage from "./ErrorPage";
import { LoadingScreen } from "../components/LoadingScreen";
import UserList from "../components/UserList";
import { Button } from "react-bootstrap";
import Follower from "../types/Follower";
import { useAuth } from "../components/auth/AuthProvider";
import { RoutesPath } from "../RoutesPath";
import {AxiosError} from "axios";

const FollowersPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();
    const userId = id || '';

    const userQuery = useQuery<User, AxiosError>({
        queryKey: ["users", userId],
        queryFn: () => fetchData(ROUTES.USER_BY_ID, token || null, { id: userId }),
        enabled: !!userId
    });

    const followersQuery = useQuery<User[], AxiosError>({
        queryKey: ["followers", userId],
        queryFn: async () => {
            const user = await fetchData<User>(ROUTES.USER_BY_ID, token || null, { id: userId });
            if (!user.followers || user.followers.length === 0) {
                return [];
            }

            const followersUsersPromises = user.followers.map((follower: Follower) =>
                fetchData<User>(ROUTES.USER_BY_ID, token || null, { id: follower.id }).catch(() => {
                    return null;
                })
            );

            const followersUsers = await Promise.all(followersUsersPromises);
            return followersUsers.filter((u): u is User => u !== null);
        },
        enabled: !!userQuery.data
    });

    React.useEffect(() => {
        if (userQuery.data) {
            document.title = `${userQuery.data.name} - ${t("userProfile.followers")} - ${APP_NAME}`;
        }
    }, [userQuery.data, t]);

    const handleUserClick = (clickedUserId: string) => {
        navigate(RoutesPath.USER_PROFILE.replace(':id', clickedUserId));
    };

    const handleGoBack = () => {
        navigate(RoutesPath.USER_PROFILE.replace(':id', userId));
    };

    if (userQuery.isLoading || followersQuery.isLoading) {
        return <LoadingScreen />;
    }

    if (userQuery.isError) {
        return <ErrorPage
            error={userQuery.error}
            onRetry={() => userQuery.refetch()}
        />;
    }

    if (followersQuery.isError) {
        return <ErrorPage
            error={followersQuery.error}
            onRetry={() => followersQuery.refetch()}
        />;
    }

    const user = userQuery.data;
    const followersUsers = followersQuery.data || [];

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

                <h2 className="text-center mb-4">{t("userProfile.followers")}</h2>

                <UserList
                    users={followersUsers}
                    onUserClick={handleUserClick}
                    emptyMessage={t("userProfile.noFollowers")}
                />
            </div>
        </Page>
    );
};

export default FollowersPage;
