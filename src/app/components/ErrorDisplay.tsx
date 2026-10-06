import React from "react";
import { useTranslation, WithTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import "../deps/css/errorDisplay.css";

interface ErrorDisplayProps {
    error?: Error | string;
    onRetry?: () => void;
    title?: string;
    showRetryButton?: boolean;
}

interface ErrorDisplayWithTranslationProps extends ErrorDisplayProps, WithTranslation {}

const ErrorDisplayInner: React.FC<ErrorDisplayWithTranslationProps> = ({ error, onRetry, title, showRetryButton = true, t }) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || t("error.generic");
    const errorTitle = title || t("error.title");

    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 px-4 text-center">
            <div className="mb-4">
                <FontAwesomeIcon 
                    icon={faExclamationTriangle} 
                    className="text-danger error-icon-medium"
                />
            </div>
            
            <h3 className="text-danger mb-3">{errorTitle}</h3>
            
            <p className="text-muted mb-4 fs-5 error-message-container-small mx-auto">
                {errorMessage}
            </p>
            
            {showRetryButton && onRetry && (
                <Button 
                    variant="outline-primary" 
                    onClick={onRetry}
                    className="d-flex align-items-center gap-2"
                >
                    <FontAwesomeIcon icon={faRefresh} />
                    {t("error.retry")}
                </Button>
            )}
        </div>
    );
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = (props) => {
    const { t, i18n, ready } = useTranslation();
    return <ErrorDisplayInner {...props} t={t} i18n={i18n} tReady={ready} />;
};

export default ErrorDisplay;
