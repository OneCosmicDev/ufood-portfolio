import React, { useState } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { FavoriteList } from "../../types/FavoriteList";
import Restaurant from "../../types/Restaurant";
import { Link } from "react-router-dom";
import RestaurantCard from "../RestaurantCard";
import ConfirmDialog from "../ConfirmDialog";
import ModalFooter from "../ModalFooter";
import ListActions from "./ListActions";
import "../../deps/css/favorites.css";

interface FavoriteListCardProps {
  list: FavoriteList;
  isOwner: boolean;
  onUpdate: (listId: string, newName: string) => void;
  onDelete: (listId: string) => void;
  onRemoveRestaurant: (listId: string, restaurantId: string) => void;
  onAddRestaurant: (listId: string) => void;
  existingNames?: string[];
}

const FavoriteListCard: React.FC<FavoriteListCardProps> = ({
  list,
  isOwner,
  onUpdate,
  onDelete,
  onRemoveRestaurant,
  onAddRestaurant,
  existingNames = [],
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(list.name || "");
  const [validationError, setValidationError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveRestaurantConfirm, setShowRemoveRestaurantConfirm] = useState(false);
  const [restaurantToRemove, setRestaurantToRemove] = useState<{ id: string; name: string } | null>(null);
  const displayName = list.name || t("favorites.untitled");

  const handleSave = () => {
    if (!isOwner) {
      setValidationError(t("favorites.unauthorized"));
      return;
    }

    if (!newName || !newName.trim()) {
      setValidationError(t("favorites.form.nameRequired"));
      return;
    }

    if (newName.trim().length < 3) {
      setValidationError(t("favorites.form.nameTooShort"));
      return;
    }

    if (existingNames.includes(newName.trim().toLowerCase())) {
      setValidationError(t("favorites.form.nameAlreadyExists"));
      return;
    }

    setValidationError("");
    onUpdate(list.id, newName.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewName(list.name || "");
    setValidationError("");
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!isOwner) {
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(list.id);
  };

  const handleRemoveRestaurant = (restaurantId: string, restaurantName: string) => {
    if (!isOwner) {
      return;
    }
    setRestaurantToRemove({ id: restaurantId, name: restaurantName });
    setShowRemoveRestaurantConfirm(true);
  };

  const confirmRemoveRestaurant = () => {
    if (restaurantToRemove) {
      onRemoveRestaurant(list.id, restaurantToRemove.id);
      setRestaurantToRemove(null);
    }
  };

  return (
    <Card className="mb-3 shadow-sm" bg="body-secondary" text="body">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="flex-grow-1">
            {isEditing ? (
              <Form.Group className="mb-0">
                <Form.Control
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  isInvalid={!!validationError}
                  autoFocus
                  disabled={!isOwner}
                />
                <Form.Control.Feedback type="invalid">
                  {validationError}
                </Form.Control.Feedback>
              </Form.Group>
            ) : (
              <div>
                <h5 className="mb-0">{displayName}</h5>
                {!isOwner && (
                  <small className="text-muted d-block mt-1">
                    {t("favorites.readOnly")}
                  </small>
                )}
              </div>
            )}
          </div>
          {isOwner && (
            <div className="d-flex gap-2">
              {isEditing ? (
                <ModalFooter 
                  onCancel={handleCancel}
                  onConfirm={handleSave}
                  confirmText={t("favorites.save")}
                  cancelText={t("favorites.cancel")}
                  confirmVariant="success"
                  cancelVariant="secondary"
                  size="sm"
                />
              ) : (
                <ListActions 
                  onEdit={() => setIsEditing(true)}
                  onAddRestaurant={() => onAddRestaurant(list.id)}
                  onDelete={handleDelete}
                />
              )}
            </div>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {list.restaurants && list.restaurants.length > 0 ? (
          <Row xs={1} md={2} lg={3} className="g-3">
            {list.restaurants.map((restaurant: Restaurant) => (
              <Col key={restaurant.id}>
                <div className="position-relative h-100">
                  <Link 
                    to={`/restaurant/${restaurant.id}`} 
                    className="text-decoration-none text-reset d-block h-100"
                  >
                    <RestaurantCard restaurant={restaurant} title={restaurant.name} />
                  </Link>
                  {isOwner && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveRestaurant(restaurant.id, restaurant.name);
                      }}
                      className="position-absolute top-0 end-0 m-2 delete-button-overlay"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4">
            <p className="mb-0 text-body-secondary">{t("favorites.noRestaurants")}</p>
            {isOwner && (
              <Button 
                variant="outline-success" 
                size="sm" 
                className="mt-2"
                onClick={() => onAddRestaurant(list.id)}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                {t("favorites.addFirstRestaurant")}
              </Button>
            )}
          </div>
        )}
      </Card.Body>

      <ConfirmDialog
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title={t("favorites.deleteListTitle")}
        message={t("favorites.confirmDelete", { name: displayName })}
      />

      <ConfirmDialog
        show={showRemoveRestaurantConfirm}
        onHide={() => setShowRemoveRestaurantConfirm(false)}
        onConfirm={confirmRemoveRestaurant}
        title={t("favorites.removeRestaurantTitle")}
        message={t("favorites.confirmRemoveRestaurant", { name: restaurantToRemove?.name || "" })}
      />
    </Card>
  );
};

export default FavoriteListCard;
