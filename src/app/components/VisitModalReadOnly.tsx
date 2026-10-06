import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import "../deps/css/VisitModalReadOnly.css"

export interface VisitReadOnlyData {
    date: string;
    rating: number;
    comment: string;
    restaurantId: string;
}

interface VisitModalReadOnlyProps {
    show: boolean;
    onHide: () => void;
    visitData: VisitReadOnlyData | null;
    restaurantName?: string;
}

const VisitModalReadOnly: React.FC<VisitModalReadOnlyProps> = ({
    show,
    onHide,
    visitData,
    restaurantName
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleViewRestaurant = () => {
        if (visitData) {
            onHide();
            navigate(`/restaurant/${visitData.restaurantId}`);
        }
    };

    const renderStarRating = (rating: number) => {
        return (
            <div className="d-flex gap-1 align-items-center flex-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`visit-modal-star ${rating >= star ? "visit-modal-star-selected" : "visit-modal-star-unselected"}`}
                    >
                        <span className={rating >= star ? "text-dark" : "text-warning"}>
                            ★
                        </span>
                    </span>
                ))}
                <span className="visit-modal-rating-text">
                    {t(`visitModal.ratingLabels.${rating}`)}
                </span>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            title={`${t("visitModal.readOnlyTitle")}${restaurantName ? ` - ${restaurantName}` : ""}`}
            footer={
                <div className="d-flex gap-2 justify-content-end w-100 flex-column flex-sm-row">
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        size="sm"
                        className="flex-fill flex-sm-grow-0"
                    >
                        {t("close")}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleViewRestaurant}
                        disabled={!visitData}
                        size="sm"
                        className="flex-fill flex-sm-grow-0"
                    >
                        {t("visitModal.viewRestaurant")}
                    </Button>
                </div>
            }
        >
            <Form>
                <Row className="g-3">
                    <Col xs={12} md={6}>
                        <Form.Group>
                            <Form.Label>{t("visitModal.date")}</Form.Label>
                            <Form.Control
                                type="text"
                                value={formatDate(visitData?.date || "")}
                                readOnly
                                plaintext
                                className="px-2"
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group>
                            <Form.Label>{t("visitModal.rating")}</Form.Label>
                            {visitData && renderStarRating(visitData.rating)}
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mt-3">
                    <Form.Label>{t("visitModal.comment")}</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={visitData?.comment || t("visitModal.noComment")}
                        readOnly
                        plaintext
                        className="px-2 visit-modal-textarea"
                    />
                </Form.Group>
            </Form>
        </Modal>
    );
};

export default VisitModalReadOnly;