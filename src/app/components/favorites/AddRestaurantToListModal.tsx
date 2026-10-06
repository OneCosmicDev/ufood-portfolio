import React, { useState, useEffect } from "react";
import { Form, Alert, ListGroup, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faStar } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Restaurant from "../../types/Restaurant";
import { fetchData } from "../../api/queryClient";
import { ROUTES } from "../../api/routes";
import Modal from "../Modal";
import ModalFooter from "../ModalFooter";
import {useAuth} from "../auth/AuthProvider";

interface AddRestaurantToListModalProps {
  show: boolean;
  onHide: () => void;
  onAdd: (restaurantId: string) => void;
  listName: string;
  existingRestaurantIds?: string[];
}

const AddRestaurantToListModal: React.FC<AddRestaurantToListModalProps> = ({
  show,
  onHide,
  onAdd,
  listName,
  existingRestaurantIds = [],
}) => {
  const { t } = useTranslation();
  const {token} = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setSelectedRestaurantId(null);
      setSearchTerm("");
    }
  }, [show]);

  const restaurantsQuery = useQuery<Restaurant[], Error>({
    queryKey: ["restaurants"],
    queryFn: async () => await fetchData(ROUTES.RESTAURANTS, token),
    enabled: show,
  });

  const filteredRestaurants = restaurantsQuery.data?.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
    const notInList = !existingRestaurantIds.includes(restaurant.id);
    return matchesSearch && notInList;
  }) || [];

  const handleAdd = () => {
    if (selectedRestaurantId) {
      onAdd(selectedRestaurantId);
      onHide();
    }
  };

  const footer = (
    <ModalFooter
      onCancel={onHide}
      onConfirm={handleAdd}
      confirmText={t("favorites.addSelected")}
      cancelText={t("favorites.cancel")}
      confirmVariant="success"
      cancelVariant="secondary"
      isConfirmDisabled={!selectedRestaurantId}
    />
  );

  const modalContent = (
    <>
        <Form.Group className="mb-3">
          <div className="position-relative">
            <Form.Control
              type="text"
              placeholder={t("favorites.searchRestaurant")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
            />
          </div>
        </Form.Group>

        {restaurantsQuery.isLoading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t("loading")}</span>
            </div>
            <p className="mt-2 text-body-secondary">{t("loading")}</p>
          </div>
        )}

        {restaurantsQuery.isError && (
          <Alert variant="danger">
            {t("favorites.errorLoadingRestaurants")}
          </Alert>
        )}

        {restaurantsQuery.data && (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {filteredRestaurants.length > 0 ? (
              <ListGroup>
                {filteredRestaurants.map((restaurant) => (
                  <ListGroup.Item
                    key={restaurant.id}
                    active={selectedRestaurantId === restaurant.id}
                    onClick={() => setSelectedRestaurantId(restaurant.id)}
                    style={{ cursor: "pointer" }}
                    className="d-flex justify-content-between align-items-start"
                  >
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{restaurant.name}</h6>
                      <p className="mb-1 small text-body-secondary">{restaurant.address}</p>
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        {restaurant.genres && restaurant.genres.length > 0 && (
                          <div>
                            {restaurant.genres.slice(0, 3).map((genre, idx) => (
                              <Badge 
                                key={idx} 
                                bg={selectedRestaurantId === restaurant.id ? "light" : "secondary"} 
                                className="me-1"
                              >
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {restaurant.priceRange && (
                          <span className="small">
                            {restaurant.priceRange}
                          </span>
                        )}
                        {restaurant.rating && (
                          <span className="small">
                            <FontAwesomeIcon icon={faStar} /> {restaurant.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="info" className="mb-0">
                {searchTerm 
                  ? t("favorites.noRestaurantsFound") 
                  : t("favorites.allRestaurantsAdded")}
              </Alert>
            )}
          </div>
        )}
    </>
  );

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      title={t("favorites.addRestaurantTo", { name: listName })}
      footer={footer}
      size="lg"
    >
      {modalContent}
    </Modal>
  );
};

export default AddRestaurantToListModal;
