import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface FavoriteListFormProps {
  onSubmit: (name: string) => void;
  isLoading?: boolean;
  error?: string | null;
  existingNames?: string[];
}

const FavoriteListForm: React.FC<FavoriteListFormProps> = ({ onSubmit, isLoading, error, existingNames = [] }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");

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
    setName("");
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <div className="d-flex gap-2 flex-wrap">
        <Form.Group className="flex-grow-1">
          <Form.Control
            type="text"
            placeholder={t("favorites.form.placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            isInvalid={!!validationError}
            disabled={isLoading}
          />
          <Form.Control.Feedback type="invalid">
            {validationError}
          </Form.Control.Feedback>
        </Form.Group>
        <Button 
          type="submit" 
          variant="success" 
          disabled={isLoading}
          className="px-4"
        >
          {isLoading ? t("favorites.form.creating") : t("favorites.form.create")}
        </Button>
      </div>
      {error && (
        <Alert variant="danger" className="mt-2 mb-0">
          {error}
        </Alert>
      )}
    </Form>
  );
};

export default FavoriteListForm;
