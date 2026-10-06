import React from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface ModalFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "success" | "danger" | "warning" | "info" | "secondary";
  cancelVariant?: "primary" | "success" | "danger" | "warning" | "info" | "secondary";
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  size?: "sm" | "lg";
}

const ModalFooter: React.FC<ModalFooterProps> = ({ 
  onCancel, 
  onConfirm, 
  confirmText,
  cancelText,
  confirmVariant = "success",
  cancelVariant = "secondary",
  isLoading = false,
  isConfirmDisabled = false,
  size = "sm"
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Button 
        variant={cancelVariant} 
        size={size}
        onClick={onCancel} 
        disabled={isLoading}
      >
        {cancelText || t("cancel")}
      </Button>
      <Button 
        variant={confirmVariant} 
        size={size}
        onClick={onConfirm} 
        disabled={isLoading || isConfirmDisabled}
      >
        {isLoading ? t("loading") : (confirmText || t("confirm"))}
      </Button>
    </>
  );
};

export default ModalFooter;

