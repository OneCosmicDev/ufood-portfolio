import React, { useState } from "react";
import { Alert, Button, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFilter } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { InfiniteData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FavoriteList } from "../../types/FavoriteList";
import { favoriteService } from "../../api/favoriteService";
import FavoriteListCard from "./FavoriteListCard";
import AddRestaurantToListModal from "./AddRestaurantToListModal";
import CreateListModal from "./CreateListModal";
import { useFavoriteMutations } from "./useFavoriteMutations";
import { useUser } from "../../api/useUser";
import {useAuth} from "../auth/AuthProvider";
import { isListOwner } from "../../utils/favoriteListUtils";

type FilterType = "all" | "mine" | "others";

interface FavoriteListsSectionProps {
  userId: string;
}

const MY_LISTS_PAGE_SIZE = 1000;
const GLOBAL_LISTS_PAGE_SIZE = 20;

const FavoriteListsSection: React.FC<FavoriteListsSectionProps> = ({ userId }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const { data: user } = useUser(userId);
  const {token} = useAuth();
  const userEmail = user?.email || "";

  const myListsQuery = useQuery<FavoriteList[], Error>({
    queryKey: ["favoriteLists", userId, MY_LISTS_PAGE_SIZE],
    queryFn: () => favoriteService.getAllLists(userId, token!),
    enabled: !!userId && !!token,
  });

  type FavoritePage = { items: FavoriteList[]; total?: number };

  const globalListsQuery = useInfiniteQuery<
    FavoritePage,
    Error,
    InfiniteData<FavoritePage, number>,
    [string, string | null, number],
    number
  >({
    queryKey: ["favoriteListsGlobal", token ?? "", GLOBAL_LISTS_PAGE_SIZE],
    queryFn: ({ pageParam = 0 }) =>
      favoriteService.getGlobalLists(pageParam, GLOBAL_LISTS_PAGE_SIZE, token!),
    enabled: !!token,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.items) return undefined;
      if (lastPage.items.length < GLOBAL_LISTS_PAGE_SIZE) return undefined;
      return allPages.length;
    }
  });

  const {
    createListMutation,
    updateListMutation,
    deleteListMutation,
    addRestaurantMutation,
    removeRestaurantMutation,
  } = useFavoriteMutations({
    userId,
    userEmail,
    onError: (message) => setError(message),
    token
  });

  const handleCreateList = (name: string) => {
    if (!userEmail) {
      setError(t("favorites.errorCreating") + ": " + t("favorites.unauthorized"));
      return;
    }
    createListMutation.mutate(name, {
      onSuccess: () => {
        setShowCreateListModal(false);
        setError(null);
      },
      onError: () => undefined
    });
  };

  const handleUpdateList = (listId: string, newName: string) => {
    updateListMutation.mutate({ listId, name: newName });
  };

  const handleDeleteList = (listId: string) => {
    deleteListMutation.mutate(listId);
  };

  const flattenedAllLists = globalListsQuery.data?.pages.flatMap(page => page.items) || [];
  const selectedList = flattenedAllLists.find(list => list.id === selectedListId) || myListsQuery.data?.find(list => list.id === selectedListId);
  const existingRestaurantIds = selectedList?.restaurants.map(r => r.id) || [];

  const handleOpenAddRestaurant = (listId: string) => {
    const list = flattenedAllLists.find(l => l.id === listId) || myListsQuery.data?.find(l => l.id === listId);
    if (list && !isListOwner(list, userEmail)) {
      setError(t("favorites.unauthorized"));
      return;
    }
    setSelectedListId(listId);
    setShowAddRestaurantModal(true);
  };

  const handleAddRestaurant = (restaurantId: string) => {
    if (selectedListId) {
      addRestaurantMutation.mutate({ favoriteId: selectedListId, restaurantId });
    }
  };

  const handleRemoveRestaurant = (listId: string, restaurantId: string) => {
    removeRestaurantMutation.mutate({ favoriteId: listId, restaurantId });
  };

  const isLoadingCurrentFilter = (() => {
    if (filter === "mine") return myListsQuery.isLoading;
    return globalListsQuery.isLoading && flattenedAllLists.length === 0;
  })();

  if (isLoadingCurrentFilter) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("loading")}</span>
        </div>
        <p className="mt-2 text-body-secondary">{t("loading")}</p>
      </div>
    );
  }

  if ((filter === "mine" && myListsQuery.isError) || (filter !== "mine" && globalListsQuery.isError)) {
    return (
      <Alert variant="danger">
        {t("favorites.errorLoading")}: {filter === "mine" ? myListsQuery.error?.message : globalListsQuery.error?.message}
      </Alert>
    );
  }


  const existingListNames = myListsQuery.data?.map(list => {
      if(list.name == null) return "";
      return list.name.toLowerCase()
  }) || [];

  const myLists = myListsQuery.data?.filter(list => {
    return isListOwner(list, userEmail);
  }) || [];
  const otherLists = flattenedAllLists.filter(list => !isListOwner(list, userEmail));

  const filteredLists = (() => {
    switch (filter) {
      case "mine":
        return myLists;
      case "others":
        return otherLists;
      case "all":
      default:
        return flattenedAllLists;
    }
  })();

  const hasListsToDisplay = filter === "all"
    ? (myLists.length > 0 || otherLists.length > 0)
    : filteredLists.length > 0;

  const getFilterLabel = () => {
    switch (filter) {
      case "mine":
        return t("favorites.filterMine");
      case "others":
        return t("favorites.filterOthers");
      case "all":
      default:
        return t("favorites.filterAll");
    }
  };

  const renderLoadMore = () => {
    if (!globalListsQuery.hasNextPage) return null;
    return (
      <div className="d-flex justify-content-center mt-3">
        <Button
          variant="outline-secondary"
          onClick={() => globalListsQuery.fetchNextPage()}
          disabled={globalListsQuery.isFetchingNextPage}
        >
          {globalListsQuery.isFetchingNextPage ? t("favorites.loadingMore") : t("favorites.loadMore")}
        </Button>
      </div>
    );
  };

  return (
    <div className="favorites-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            {getFilterLabel()}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item active={filter === "all"} onClick={() => setFilter("all")}>
              {t("favorites.filterAll")}
            </Dropdown.Item>
            <Dropdown.Item active={filter === "mine"} onClick={() => setFilter("mine")}>
              {t("favorites.filterMine")}
            </Dropdown.Item>
            <Dropdown.Item active={filter === "others"} onClick={() => setFilter("others")}>
              {t("favorites.filterOthers")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Button
          variant="success"
          onClick={() => setShowCreateListModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          {t("favorites.createNewList")}
        </Button>
      </div>

      {hasListsToDisplay ? (
        <div>
          {filter === "all" && (
            <>
              {myLists.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-3">{t("favorites.myLists")}</h4>
                  {myLists.map((list) => {
                    const isOwner = isListOwner(list, userEmail);
                    return (
                      <FavoriteListCard
                        key={list.id}
                        list={list}
                        isOwner={isOwner}
                        onUpdate={handleUpdateList}
                        onDelete={handleDeleteList}
                        onRemoveRestaurant={handleRemoveRestaurant}
                        onAddRestaurant={handleOpenAddRestaurant}
                        existingNames={existingListNames.filter(name => list.name && name !== list.name.toLowerCase())}
                      />
                    );
                  })}
                </div>
              )}

              {otherLists.length > 0 && (
                <div>
                  <h4 className="mb-3">{t("favorites.otherLists")}</h4>
                  {otherLists.map((list) => {
                    const isOwner = isListOwner(list, userEmail);
                    return (
                      <FavoriteListCard
                        key={list.id}
                        list={list}
                        isOwner={isOwner}
                        onUpdate={handleUpdateList}
                        onDelete={handleDeleteList}
                        onRemoveRestaurant={handleRemoveRestaurant}
                        onAddRestaurant={handleOpenAddRestaurant}
                        existingNames={existingListNames.filter(name => list.name && name !== list.name.toLowerCase())}
                      />
                    );
                  })}
                </div>
              )}
              {renderLoadMore()}
            </>
          )}
          {filter !== "all" && (
            <div>
              {filteredLists.map((list) => {
                const isOwner = isListOwner(list, userEmail);
                return (
                  <FavoriteListCard
                    key={list.id}
                    list={list}
                    isOwner={isOwner}
                    onUpdate={handleUpdateList}
                    onDelete={handleDeleteList}
                    onRemoveRestaurant={handleRemoveRestaurant}
                    onAddRestaurant={handleOpenAddRestaurant}
                    existingNames={existingListNames.filter(name => list.name && name !== list.name.toLowerCase())}
                  />
                );
              })}
              {filter !== "mine" && renderLoadMore()}
            </div>
          )}
        </div>
      ) : (
        <Alert variant="info">
          {filter === "mine" && t("favorites.noMyLists")}
          {filter === "others" && t("favorites.noOtherLists")}
          {filter === "all" && t("favorites.noLists")}
        </Alert>
      )}

      <CreateListModal
        show={showCreateListModal}
        onHide={() => {
          setShowCreateListModal(false);
          setError(null);
        }}
        onSubmit={handleCreateList}
        isLoading={createListMutation.isPending || !userEmail}
        error={error}
        existingNames={existingListNames}
      />

      <AddRestaurantToListModal
        show={showAddRestaurantModal}
        onHide={() => setShowAddRestaurantModal(false)}
        onAdd={handleAddRestaurant}
        listName={selectedList?.name || t("favorites.untitled")}
        existingRestaurantIds={existingRestaurantIds}
      />
    </div>
  );
};

export default FavoriteListsSection;
