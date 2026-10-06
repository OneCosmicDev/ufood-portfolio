import React, { useState, useEffect } from "react";
import { Form, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Modal from "../Modal";
import ModalFooter from "../ModalFooter";

interface CreateListModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (name: string) => void;
  isLoading?: boolean;
  error?: string | null;
  existingNames?: string[];
}

const CreateListModal: React.FC<CreateListModalProps> = ({ 
  show, 
  onHide, 
  onSubmit, 
  isLoading, 
  error,
  existingNames = [] 
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (show) {
      setName("");
      setValidationError("");
    }
  }, [show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setValidationError(t("favorites.form.nameRequired"));
      return;
    }

    if (name.trim().length < 3) {
      setValidationError(t("favorites.form.nameTooShort"));
      return;
    }

    if (existingNames.includes(name.trim().toLowerCase())) {
      setValidationError(t("favorites.form.nameAlreadyExists"));
      return;
    }

    setValidationError("");
    onSubmit(name.trim());
  };

  const handleConfirmClick = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const footer = (
    <ModalFooter
      onCancel={onHide}
      onConfirm={handleConfirmClick}
      confirmText={isLoading ? t("favorites.form.creating") : t("favorites.form.create")}
      cancelText={t("favorites.cancel")}
      confirmVariant="success"
      cancelVariant="secondary"
      isLoading={isLoading}
    />
  );

  return (
    <Modal show={show} onHide={onHide} title={t("favorites.createListTitle")} footer={footer}>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>{t("favorites.form.nameLabel")}</Form.Label>
          <Form.Control
            type="text"
            placeholder={t("favorites.form.placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            isInvalid={!!validationError}
            disabled={isLoading}
            autoFocus
          />
          <Form.Control.Feedback type="invalid">
            {validationError}
          </Form.Control.Feedback>
        </Form.Group>
        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}
      </Form>
    </Modal>
  );
};

export default CreateListModal;
