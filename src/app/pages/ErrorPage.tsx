import React, {useEffect} from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faRefresh, faHome } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../deps/css/errorDisplay.css";
import {AxiosError} from "axios";
import {RoutesPath} from "../RoutesPath";
import {useAuth} from "../components/auth/AuthProvider";
import {notificationService} from "../utils/notificationService";

interface ErrorPageProps {
    error?: AxiosError | string;
    onRetry?: () => void;
    title?: string;
    showRetryButton?: boolean;
    showHomeButton?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
    error,
    onRetry,
    title,
    showRetryButton = true,
    showHomeButton = true
}) => {
    const { t } = useTranslation();
    const {isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();

    const errorMessage = typeof error === 'string' ? error : error?.message || t("error.generic");
    const errorTitle = title || t("error.title");

    useEffect(() => {
        if(typeof error !== 'string' && error!.response!.status === 401) {
            if(isAuthenticated) {
                logout.mutate();
                notificationService.warning(t("error.sessionExpired"), t("error.warning"));
            } else {
                navigate(RoutesPath.LOGIN);
            }
        }
    }, []);



    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.history.back();
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
            <div className="container text-center">
                <div className="mb-4">
                    <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-danger error-icon-large"
                    />
                </div>

                <h1 className="text-danger mb-4 display-4">{errorTitle}</h1>

                <p className="text-muted mb-5 fs-4 error-message-container">
                    {errorMessage}
                </p>

                <div className="d-flex gap-3 justify-content-center flex-wrap">
                    {showRetryButton && (
                        <Button
                            variant="outline-primary"
                            size="lg"
                            onClick={handleRetry}
                            className="d-flex align-items-center gap-2 px-4 py-2"
                        >
                            <FontAwesomeIcon icon={faRefresh} />
                            {t("error.retry")}
                        </Button>
                    )}

                    {showHomeButton && (
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/')}
                            className="d-flex align-items-center gap-2 px-4 py-2"
                        >
                            <FontAwesomeIcon icon={faHome} />
                            {t("navigation.home")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
