import React, { ReactNode } from "react";
import { Modal as BootstrapModal, ModalProps as BootstrapModalProps } from "react-bootstrap";

interface ModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: BootstrapModalProps['size'];
}

const Modal: React.FC<ModalProps> = ({ show, onHide, title, children, footer, size = "lg" }) => {
  return (
    <BootstrapModal show={show} onHide={onHide} size={size} data-bs-theme={undefined}>
      <BootstrapModal.Header closeButton className="bg-body text-body">
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body className="bg-body text-body">
        {children}
      </BootstrapModal.Body>
      {footer && (
        <BootstrapModal.Footer className="bg-body">
          {footer}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};

export default Modal;
