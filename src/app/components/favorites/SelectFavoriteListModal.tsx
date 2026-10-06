import React, { useState, useEffect } from "react";
import { Alert, ListGroup, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { favoriteService } from "../../api/favoriteService";
import { FavoriteList } from "../../types/FavoriteList";
import Modal from "../Modal";
import ModalFooter from "../ModalFooter";
import {useAuth} from "../auth/AuthProvider";
import { useUser } from "../../api/useUser";
import { isListOwner } from "../../utils/favoriteListUtils";

interface SelectFavoriteListModalProps {
  show: boolean;
  onHide: () => void;
  onSelectList: (listId: string, listName: string) => void;
  restaurantId: string;
}

const SelectFavoriteListModal: React.FC<SelectFavoriteListModalProps> = ({
  show,
  onHide,
  onSelectList,
  restaurantId,
}) => {
  const { t } = useTranslation();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedListName, setSelectedListName] = useState<string>("");
  const {userId, token} = useAuth();
  const { data: currentUser } = useUser(userId!);

  useEffect(() => {
    if (show) {
      setSelectedListId(null);
      setSelectedListName("");
    }
  }, [show]);

  const favoritesQuery = useQuery<FavoriteList[], Error>({
    queryKey: ["favoriteLists", userId],
    queryFn: () => favoriteService.getAllLists(userId!, token!),
    enabled: show,
  });

  const availableLists = favoritesQuery.data?.filter((list) => {
    if (!isListOwner(list, currentUser?.email)) {
      return false;
    }
    const restaurantIds = list.restaurants?.map((r) => r.id) || [];
    return !restaurantIds.includes(restaurantId);
  }) || [];

  const handleSelect = () => {
    if (selectedListId && selectedListName) {
      onSelectList(selectedListId, selectedListName);
      onHide();
    }
  };

  const handleClose = () => {
    onHide();
  };

  const handleListClick = (listId: string, listName: string) => {
    setSelectedListId(listId);
    setSelectedListName(listName);
  };

  const footer = (
    <ModalFooter
      onCancel={handleClose}
      onConfirm={handleSelect}
      cancelText={t("favorites.cancel")}
      confirmText={t("favorites.addToSelectedList")}
      confirmVariant="success"
      isConfirmDisabled={!selectedListId}
    />
  );

  const modalContent = (
    <>
      {favoritesQuery.isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
          <p className="mt-2 text-body-secondary">{t("loading")}</p>
        </div>
      )}

      {favoritesQuery.isError && (
        <Alert variant="danger">
          {t("favorites.errorLoading")}
        </Alert>
      )}

      {favoritesQuery.data && (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {availableLists.length > 0 ? (
            <ListGroup>
              {availableLists.map((list) => (
                <ListGroup.Item
                  key={list.id}
                  active={selectedListId === list.id}
                  onClick={() => handleListClick(list.id, list.name ?? "")}
                  style={{ cursor: "pointer" }}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={faHeart} />
                      <h6 className="mb-0">{list.name}</h6>
                    </div>
                    {list.restaurants && list.restaurants.length > 0 ? (
                      <p className="mb-0 mt-2 small text-body-secondary">
                        <FontAwesomeIcon icon={faUtensils} className="me-1" />
                        {t("favorites.restaurantCount", { count: list.restaurants.length })}
                      </p>
                    ) : (
                      <p className="mb-0 mt-2 small text-body-secondary fst-italic">
                        {t("favorites.emptyList")}
                      </p>
                    )}
                  </div>
                  {list.restaurants && list.restaurants.length > 0 && (
                    <Badge 
                      bg={selectedListId === list.id ? "light" : "primary"}
                      text={selectedListId === list.id ? "dark" : "light"}
                      pill
                    >
                      {list.restaurants.length}
                    </Badge>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="info" className="mb-0">
              {favoritesQuery.data && favoritesQuery.data.length === 0
                ? t("favorites.noLists")
                : t("favorites.restaurantAlreadyInAllLists")}
            </Alert>
          )}
        </div>
      )}
    </>
  );

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      title={t("favorites.selectListTitle")}
      footer={footer}
      size="lg"
    >
      {modalContent}
    </Modal>
  );
};

export default SelectFavoriteListModal;
