import React from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

interface ListActionsProps {
  onEdit: () => void;
  onAddRestaurant: () => void;
  onDelete: () => void;
}

const ListActions: React.FC<ListActionsProps> = ({ onEdit, onAddRestaurant, onDelete }) => {
  const { t } = useTranslation();

  return (
    <>
      <Button variant="primary" size="sm" onClick={onEdit}>
        <FontAwesomeIcon icon={faEdit} className="me-1" />
        {t("favorites.rename")}
      </Button>
      <Button variant="success" size="sm" onClick={onAddRestaurant}>
        <FontAwesomeIcon icon={faPlus} className="me-1" />
        {t("favorites.addRestaurant")}
      </Button>
      <Button variant="danger" size="sm" onClick={onDelete}>
        <FontAwesomeIcon icon={faTrash} className="me-1" />
        {t("favorites.delete")}
      </Button>
    </>
  );
};

export default ListActions;
