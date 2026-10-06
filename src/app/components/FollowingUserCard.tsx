import React from "react";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faStar } from "@fortawesome/free-solid-svg-icons";
import User from "../types/User";
import { useTranslation } from "react-i18next";

interface FollowingUserCardProps {
    user: User;
    onClick: (userId: string) => void;
}

const FollowingUserCard: React.FC<FollowingUserCardProps> = ({ user, onClick }) => {
    const { t } = useTranslation();

    return (
        <Card
            className="h-100 shadow-sm hover-shadow transition-all cursor-pointer"
            onClick={() => onClick(user.id)}
        >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <div className="mb-3">
                    <FontAwesomeIcon
                        icon={faUser}
                        className="text-success fs-1"
                    />
                </div>
                <Card.Title className="text-center mb-2 fw-bold">
                    {user.name}
                </Card.Title>
                <div className="d-flex align-items-center gap-2 text-muted">
                    <FontAwesomeIcon icon={faStar} className="text-warning" />
                    <span>
                        {user.rating <= 0
                            ? t("userProfile.score_text_one", { score: user.rating })
                            : t("userProfile.score_text_multiple", { score: user.rating })}
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default FollowingUserCard;
