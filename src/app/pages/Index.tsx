import "../deps/css/animations.css";

import React, {Component, ReactElement, useState} from "react";
import {APP_NAME} from "../constants/Global";
import {useTranslation, WithTranslation} from "react-i18next";
import {Page} from "../components/Page";
import Logo from "../deps/images/logo.png";
import LogoDark from "../deps/images/logoDark.png";
import {Application} from "../core/Application";
import {Col, Container, Form, Row, Button} from "react-bootstrap";
import RestaurantList from "../components/RestaurantList";
import Restaurant from "../types/Restaurant";
import {useSearchParams} from "react-router-dom";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {fetchData} from "../api/queryClient";
import {ROUTES} from "../api/routes";
import ErrorPage from "./ErrorPage";
import {LoadingScreen} from "../components/LoadingScreen";
import VisitModal from "../components/VisitModal";
import {VisitModalData} from "../types/Visit";
import {useVisitMutation} from "../hooks/useVisitMutation";
import {useAuth} from "../components/auth/AuthProvider";
import HomeMap from "../components/HomeMap";
import { notificationService } from "../utils/notificationService";
import {AxiosError} from "axios";

interface IndexProps extends WithTranslation {
    query: UseQueryResult<Restaurant[], AxiosError>;
    searchValue?: string;
    onRestaurantClick?: (restaurant: string) => void;
    onMarkAsVisited?: (restaurant: Restaurant) => void;
    isAuthentificated: boolean;
}

interface IndexState {
    searchValue: string;
    selectedCuisine: string;
    selectedPriceRange: string;
    restaurants?: Restaurant[];
    allRestaurants?: Restaurant[];
    viewMode: 'list' | 'map';
    userPosition: [number, number] | null;
}

class IndexInner extends Component<IndexProps, IndexState> {
    constructor(props: IndexProps) {
        super(props);
        const normalizedRestaurants = this.normalizeRestaurants(props.query.data || []);
        this.state = {
            searchValue: "",
            selectedCuisine: "",
            selectedPriceRange: "",
            restaurants: normalizedRestaurants,
            allRestaurants: normalizedRestaurants,
            viewMode: 'list',
            userPosition: null,
        };
    }

    normalizeRestaurants = (restaurants: Restaurant[]): Restaurant[] => {
        return restaurants.map((restaurant, _) => {
            let normalized = { ...restaurant };

            if (restaurant.price_range && !restaurant.priceRange) {
                normalized.priceRange = '$'.repeat(restaurant.price_range);
            }

            if (!normalized.coordinates && normalized.location && normalized.location.coordinates) {
                const [lng, lat] = normalized.location.coordinates;
                normalized.coordinates = { lat, lng };
            }

            return normalized;
        });
    };

    componentDidMount(): void {
        const {t} = this.props;
        document.title = `${t("index")} - ${APP_NAME}`;

        if (this.props.query.data) {
            const initialRestaurants = this.props.query.data.map(restaurant => {
                if (restaurant.price_range && !restaurant.priceRange) {
                    return {
                        ...restaurant,
                        priceRange: '$'.repeat(restaurant.price_range)
                    };
                }
                return restaurant;
            });

            this.setState({
                restaurants: initialRestaurants,
                allRestaurants: initialRestaurants
            }, () => {
                if (this.props.searchValue) {
                    this.setState({searchValue: this.props.searchValue}, this.filterRestaurants);
                }
            });
        }

        this.getUserLocation();
    }

    componentDidUpdate(prevProps: Readonly<IndexProps>, prevState: Readonly<IndexState>) {
        if (prevState.userPosition !== this.state.userPosition && this.props.query.data) {
            const normalizedRestaurants = this.normalizeRestaurants(this.props.query.data);
            this.setState({
                restaurants: normalizedRestaurants,
                allRestaurants: normalizedRestaurants
            }, this.filterRestaurants);
        }

        if (prevProps.query.data !== this.props.query.data && this.props.query.data) {
            const normalizedRestaurants = this.normalizeRestaurants(this.props.query.data);
            this.setState({
                restaurants: normalizedRestaurants,
                allRestaurants: normalizedRestaurants
            }, this.filterRestaurants);
        }
    }

    getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.setState({
                        userPosition: [position.coords.latitude, position.coords.longitude],
                    });
                },
                () => {
                    const { t } = this.props;
                    notificationService.warning(
                        t("geolocation_not_available"),
                        t("location_warning")
                    );
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        }
    };


    handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        this.setState({searchValue}, this.filterRestaurants);
    };

    handleCuisineFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCuisine = event.target.value;
        this.setState({selectedCuisine}, this.filterRestaurants);
    };

    handlePriceFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPriceRange = event.target.value;
        this.setState({selectedPriceRange}, this.filterRestaurants);
    };

    handleViewModeChange = (mode: 'list' | 'map') => {
        this.setState({ viewMode: mode });
    };

    filterRestaurants = () => {
        const {allRestaurants, searchValue, selectedCuisine, selectedPriceRange} = this.state;

        if (!allRestaurants || allRestaurants.length <= 0) return;

        const filtered = allRestaurants.filter(restaurant => {
            const matchesSearch =
                restaurant.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                (restaurant.genres && restaurant.genres.some(g => g.toLowerCase().includes(searchValue.toLowerCase()))) ||
                (restaurant.priceRange && restaurant.priceRange.includes(searchValue));
            const matchesCuisine = !selectedCuisine || (restaurant.genres && restaurant.genres.includes(selectedCuisine));
            const matchesPrice = !selectedPriceRange || restaurant.priceRange === selectedPriceRange;
            return matchesSearch && matchesCuisine && matchesPrice;
        });

        this.setState({restaurants: filtered});
    };

    handleSearchByCurrentLocation = () => {
        const { allRestaurants, userPosition } = this.state;

        if (!userPosition || !allRestaurants) {
            const { t } = this.props;
            notificationService.warning(
                t("geolocation_not_available"),
                t("location_warning")
            );
            return;
        }

        const nearbyRestaurants = allRestaurants.filter(restaurant => {
            if (!restaurant.coordinates) return false;

            const latDiff = restaurant.coordinates.lat - userPosition[0];
            const lngDiff = restaurant.coordinates.lng - userPosition[1];
            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

            return distance < 1.00;
        });

        if (nearbyRestaurants.length === 0) {
            const { t } = this.props;
            notificationService.info(
                t("no_restaurant_near"),
                t("search_results")
            );
            return;
        }

        this.setState({ restaurants: nearbyRestaurants });
    };

    handleResetFilters = () => {
        this.setState({
            searchValue: '',
            selectedCuisine: '',
            selectedPriceRange: '',
        }, this.filterRestaurants);
    };

    render(): ReactElement | null {
        const {t, query, onMarkAsVisited} = this.props;
        const {searchValue, selectedCuisine, selectedPriceRange, restaurants, allRestaurants, viewMode, userPosition} = this.state;
        const allCuisines = allRestaurants && allRestaurants.length > 0 ? Array.from(new Set(allRestaurants.flatMap(r => r.genres || []))).sort() : [];

        if (query.isLoading) {
            return <LoadingScreen/>;
        }
        if (query.isError) {
            return <ErrorPage
                error={query.error}
                onRetry={() => query.refetch()}
            />;
        }

        return (
            <Page>
                <Container>
                    <div className="text-center mb-4 index-hero">
                        <img
                            className="index-hero-logo"
                            src={Application.isDarkMode() ? LogoDark : Logo}
                            alt={"Logo " + APP_NAME}
                            width={380}
                            height={320}
                        />
                        <h1>{t("index_title")}</h1>
                        <div className="my-5">{t("index_subtitle")}</div>
                    </div>

                    <Row className="mb-4 g-3 restaurant-filters">
                        <Col lg={6} className="mb-3">
                            <Form.Control
                                placeholder={t("restaurant_search_placeholder")}
                                value={searchValue}
                                onChange={this.handleSearchChange}
                            />
                        </Col>
                        <Col lg={3} className="mb-3">
                            <Form.Select value={selectedCuisine} onChange={this.handleCuisineFilter}>
                                <option value="">{t("index_all_cuisines")}</option>
                                {allCuisines.map(cuisine => {
                                    const capitalizedCuisine = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
                                    return (
                                        <option key={cuisine} value={cuisine}>
                                            {t(`cuisine_types.${capitalizedCuisine}`, {defaultValue: capitalizedCuisine})}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </Col>
                        <Col lg={3} className="mb-3">
                            <Form.Select value={selectedPriceRange} onChange={this.handlePriceFilter}>
                                <option value="">{t("all_prices") || "Tous les prix"}</option>
                                <option value="$">$ ({t("price_ranges.$")})</option>
                                <option value="$$">$$ ({t("price_ranges.$$")})</option>
                                <option value="$$$">$$$ ({t("price_ranges.$$$")})</option>
                                <option value="$$$$">$$$$ ({t("price_ranges.$$$$")})</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col>
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={viewMode === "list" ? "primary" : "outline-secondary"}
                                        onClick={() => this.handleViewModeChange('list')}
                                        size="sm"
                                    >
                                        {t("list_view")}
                                    </Button>
                                    <Button
                                        variant={viewMode === "map" ? "primary" : "outline-secondary"}
                                        onClick={() => this.handleViewModeChange('map')}
                                        size="sm"
                                    >
                                        {t("map_view")}
                                    </Button>
                                </div>

                                <div className="d-flex gap-2">
                                    {userPosition && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={this.handleSearchByCurrentLocation}
                                            size="sm"
                                        >
                                            {t("search_near_me")}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline-secondary"
                                        onClick={this.handleResetFilters}
                                        size="sm"
                                    >
                                        {t("reset_filters")}
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {viewMode === 'list' ? (
                        <RestaurantList
                            restaurants={restaurants || []}
                            onRestaurantClick={this.props.onRestaurantClick}
                            showVisitButton={this.props.isAuthentificated}
                            onVisitClick={onMarkAsVisited}
                        />
                    ) : (
                        <div className="mb-4">
                            <HomeMap
                                restaurants={restaurants || []}
                                userPosition={userPosition || undefined}
                            />
                        </div>
                    )}
                </Container>
            </Page>
        );
    }
}

const IndexWithMutation: React.FC<{ onRestaurantClick: (restaurantName: string) => void }> = (props) => {
    const [searchParam] = useSearchParams();
    const {i18n, t, ready} = useTranslation();
    const {token, userId, isAuthenticated} = useAuth();

    const [showVisitModal, setShowVisitModal] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [visitError, setVisitError] = useState<string | null>(null);

    const {createVisitMutation} = useVisitMutation({
        userId: userId!,
        token: token!,
        onSuccess: () => {
            setShowVisitModal(false);
            setSelectedRestaurant(null);
            setVisitError(null);
        }
    });

    const handleCreateVisit = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setShowVisitModal(true);
        setVisitError(null);
    };

    const handleSubmitVisit = (visitData: VisitModalData) => {
        if (!selectedRestaurant || !userId) return;

        const now = new Date();
        const selectedDate = new Date(visitData.date);

        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        const visitPayload = {
            restaurantId: selectedRestaurant.id,
            date: selectedDate.toISOString(),
            rating: visitData.rating,
            comment: visitData.comment,
            userId: userId
        };

        createVisitMutation.mutate(visitPayload);
    };

    const handleCloseVisitModal = () => {
        setShowVisitModal(false);
        setSelectedRestaurant(null);
        setVisitError(null);
    };

    const restaurantsQuery = useQuery<Restaurant[], AxiosError>({
        queryKey: ['restaurants'],
        queryFn: async () => await fetchData(ROUTES.RESTAURANTS, token)
    });

    return (
        <>
            <IndexInner
                query={restaurantsQuery}
                onRestaurantClick={props.onRestaurantClick}
                onMarkAsVisited={handleCreateVisit}
                searchValue={searchParam.get("search") ?? undefined}
                isAuthentificated={isAuthenticated}
                t={t}
                i18n={i18n}
                tReady={ready}
            />

            <VisitModal
                show={showVisitModal}
                onHide={handleCloseVisitModal}
                onSubmit={handleSubmitVisit}
                isLoading={createVisitMutation.isPending}
                error={visitError}
                restaurantName={selectedRestaurant?.name}
            />
        </>
    );
}

export default IndexWithMutation;