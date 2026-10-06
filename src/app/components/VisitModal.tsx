import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import ModalFooter from "./ModalFooter";
import { VisitModalData } from "../types/Visit";

interface VisitModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: VisitModalData) => void;
  isLoading?: boolean;
  error?: string | null;
  restaurantName?: string;
}

const VisitModal: React.FC<VisitModalProps> = ({ 
  show, 
  onHide, 
  onSubmit, 
  isLoading, 
  error,
  restaurantName
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<VisitModalData>({
    date: "",
    rating: 5,
    comment: ""
  });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (show) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        date: today,
        rating: 5,
        comment: ""
      });
      setValidationError("");
    }
  }, [show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      setValidationError(t("visitModal.date") + " " + t("favorites.form.required"));
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setValidationError(t("visitModal.rating") + " " + t("favorites.form.required"));
      return;
    }

    setValidationError("");
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof VisitModalData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationError("");
  };

  const renderStarRating = () => {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant={formData.rating >= star ? "warning" : "outline-warning"}
            size="sm"
            className="p-1"
            onClick={() => handleInputChange("rating", star)}
            disabled={isLoading}
            style={{ width: "2rem", height: "2rem" }}
          >
            ★
          </Button>
        ))}
        <span className="ms-2 text-muted small">
          {t(`visitModal.ratingLabels.${formData.rating}`)}
        </span>
      </div>
    );
  };

  const handleConfirmClick = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const footer = (
    <ModalFooter
      onCancel={onHide}
      onConfirm={handleConfirmClick}
      confirmText={t("visitModal.submit")}
      cancelText={t("cancel")}
      confirmVariant="success"
      cancelVariant="secondary"
      isLoading={isLoading}
      isConfirmDisabled={!formData.date || formData.rating < 1}
    />
  );

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      title={`${t("visitModal.title")}${restaurantName ? ` - ${restaurantName}` : ""}`} 
      footer={footer}
    >
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("visitModal.date")} *</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                isInvalid={!!validationError && !formData.date}
                disabled={isLoading}
                max={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("visitModal.rating")} *</Form.Label>
              {renderStarRating()}
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mt-3">
          <Form.Label>{t("visitModal.comment")}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={t("visitModal.commentPlaceholder")}
            value={formData.comment}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            disabled={isLoading}
          />
        </Form.Group>

        {validationError && (
          <Alert variant="danger" className="mt-3 mb-0">
            {validationError}
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}
      </Form>
    </Modal>
  );
};

export default VisitModal;
