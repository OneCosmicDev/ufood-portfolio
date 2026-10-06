import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import ModalFooter from "./ModalFooter";

interface ConfirmDialogProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  onHide,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  const footer = (
    <ModalFooter
      onCancel={onHide}
      onConfirm={handleConfirm}
      confirmText={confirmText || t("confirm")}
      cancelText={cancelText || t("cancel")}
      confirmVariant={variant}
      cancelVariant="secondary"
    />
  );

  return (
    <Modal show={show} onHide={onHide} title={title} footer={footer}>
      <p className="mb-0 py-2 px-3">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
