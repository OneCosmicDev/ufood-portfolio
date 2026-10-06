import React from "react";
import { APP_NAME } from "../constants/Global";
import { useTranslation } from "react-i18next";
import { Page } from "../components/Page";
import FavoriteListsSection from "../components/favorites/FavoriteListsSection";
import {useAuth} from "../components/auth/AuthProvider";

const FavoritesPage: React.FC = () => {
    const { t } = useTranslation();
    const {userId} = useAuth();

    React.useEffect(() => {
        document.title = `${t("favorites.pageTitle")} - ${APP_NAME}`;
    }, [t]);


    return (
        <Page>
            <div className="mt-5 pt-4">
                <div className="text-center mb-5">
                    <h2 className="mb-3 text-body">{t("favorites.pageTitle")}</h2>
                    <p className="lead text-body-secondary mb-0">
                        {t("favorites.pageDescription")}
                    </p>
                </div>

                <FavoriteListsSection userId={userId!} />
            </div>
        </Page>
    );
};

export default FavoritesPage;
