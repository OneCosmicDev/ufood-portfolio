import React, {Component} from "react";
import { useParams, Link } from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next';
import RestaurantDetail from '../components/RestaurantDetail';
import Restaurant from '../types/Restaurant';
import { Page } from '../components/Page';
import Map from "../components/Map";
import { LatLngExpression } from "leaflet";
import 'leaflet/dist/leaflet.css';
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import "../deps/css/map.css";
import { getRestaurantById } from '../api/restaurantService';
import { LoadingScreen } from '../components/LoadingScreen';
import SelectFavoriteListModal from '../components/favorites/SelectFavoriteListModal';
import { favoriteService } from '../api/favoriteService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {useAuth} from "../components/auth/AuthProvider";
import SimilarRestaurants from '../components/SimilarRestaurants';
import { getFavoriteListErrorMessage } from '../utils/favoriteListUtils';
import { useTranslation } from 'react-i18next';

interface Props extends WithTranslation {
    id?: string;
    addToFavoritesMutation?: {
        mutate: (params: { listId: string; restaurantId: string; listName: string }) => void;
        isPending: boolean;
    };
    isAuthenticated: boolean;
    token: string;
}

interface State {
    userPosition?: LatLngExpression;
    showRoute: boolean;
    restaurant?: Restaurant;
    loading: boolean;
    error?: string;
    showSelectListModal: boolean;
    feedback: {
        variant: "success" | "danger";
        message: string;
    } | null;
}

class RestaurantDetailPageClass extends Component<Props, State> {
    private feedbackTimeout?: number;

    state: State = {
        showRoute: false,
        loading: true,
        showSelectListModal: false,
        feedback: null,
    };

    componentWillUnmount(): void {
        this.clearFeedbackTimeout();
        window.removeEventListener('favorite-added', this.handleFavoriteAdded);
        window.removeEventListener('favorite-error', this.handleFavoriteError);
    }

    async componentDidMount(): Promise<void> {
        window.addEventListener('favorite-added', this.handleFavoriteAdded);
        window.addEventListener('favorite-error', this.handleFavoriteError);
        await this.loadRestaurant();
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        if (prevProps.id !== this.props.id) {
            this.setState({ loading: true, error: undefined }, async () => {
                await this.loadRestaurant();
            });
        }
    }

    handleFavoriteAdded = (event: Event) => {
        const customEvent = event as CustomEvent;
        const { t } = this.props;
        this.showFeedback("success", t('restaurant_details.addedToFavorites', { listName: customEvent.detail.listName }));
    };

    handleFavoriteError = (event: Event) => {
        const { t } = this.props;
        const customEvent = event as CustomEvent;
        const errorMessage = customEvent.detail?.message || t('favorites.errorAddingRestaurant');
        this.showFeedback("danger", errorMessage);
    };

    async loadRestaurant() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => this.setState({ userPosition: [pos.coords.latitude, pos.coords.longitude] }),
                () => {}
            );
        }

        if (this.props.id) {
            try {
                const restaurant = await getRestaurantById(this.props.id, this.props.token);
                this.setState({ restaurant, loading: false });
            } catch {
                this.setState({ 
                    error: this.props.t('restaurant_not_found'), 
                    loading: false 
                });
            }
        } else {
            this.setState({ 
                error: this.props.t('restaurant_not_found'), 
                loading: false 
            });
        }
    }

    private showFeedback = (variant: "success" | "danger", message: string): void => {
        this.clearFeedbackTimeout();
        this.setState({ feedback: { variant, message } });
        this.feedbackTimeout = window.setTimeout(() => {
            this.setState({ feedback: null });
            this.feedbackTimeout = undefined;
        }, 3000);
    };

    private clearFeedbackTimeout = (): void => {
        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
            this.feedbackTimeout = undefined;
        }
    };

    private dismissFeedback = (): void => {
        this.clearFeedbackTimeout();
        this.setState({ feedback: null });
    };

    toggleRoute = () => {
        this.setState(prevState => ({ showRoute: !prevState.showRoute }));
    }

    handleAddToFavorites = () => {
        const { t } = this.props;
        if (!this.props.isAuthenticated) {
            this.showFeedback("danger", t('restaurant_details.loginRequired'));
            return;
        }
        this.setState({ showSelectListModal: true });
    }

    handleCloseSelectListModal = () => {
        this.setState({ showSelectListModal: false });
    }

    handleSelectList = (listId: string, listName: string) => {
        const { restaurant } = this.state;
        if (!restaurant || !this.props.addToFavoritesMutation) return;

        this.setState({ showSelectListModal: false });
        this.props.addToFavoritesMutation.mutate({
            listId,
            restaurantId: restaurant.id,
            listName
        });
    }

    render() {
    const { t } = this.props;
    const { restaurant, loading, error, feedback } = this.state;

        if (loading) {
            return <LoadingScreen />;
        }

        if (error || !restaurant) {
            return (
                <Page title={t('restaurant_not_found')}>
                    <div className="d-flex flex-column align-items-center justify-content-center pt-1 mt-1">
                        <div className="text-center">
                            <p className="text-muted mb-4"></p>
                            <div>
                                <Link to="/" className="btn btn-primary me-2">{t('back_home')}</Link>
                            </div>
                        </div>
                    </div>
                </Page>
            );
        }

        return (
            <Page>
                <RestaurantDetail 
                    {...restaurant} 
                    onAddToFavorites={this.handleAddToFavorites}
                    isUserLoggedIn={this.props.isAuthenticated}
                />

                {feedback && (
                    <Container className="mt-3">
                        <Alert
                            variant={feedback.variant}
                            dismissible
                            onClose={this.dismissFeedback}
                            className="mb-0"
                        >
                            {feedback.message}
                        </Alert>
                    </Container>
                )}

                <Container className="my-3 text-center">
                    <Row>
                        <Col>
                            <Button
                                variant={this.state.showRoute ? "danger" : "primary"}
                                onClick={this.toggleRoute}
                            >
                                {this.state.showRoute ? t('restaurant_details.hide_route') : t('restaurant_details.show_route')}
                            </Button>
                        </Col>
                    </Row>
                </Container>

                <Container className="mt-4">
                    <Row>
                        <Col>
                            <div className="map-container">
                                <Map
                                    restaurant={restaurant}
                                    showRoute={this.state.showRoute}
                                    userPosition={this.state.userPosition}
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>

                <SimilarRestaurants restaurantId={restaurant.id} limit={4} />

                {this.props.isAuthenticated && (
                    <SelectFavoriteListModal
                        show={this.state.showSelectListModal}
                        onHide={this.handleCloseSelectListModal}
                        onSelectList={this.handleSelectList}
                        restaurantId={restaurant.id}
                    />
                )}
            </Page>
        );
    }
}

const TranslatedRestaurantDetailPageClass = withTranslation()(RestaurantDetailPageClass);

const RestaurantDetailPageWrapper: React.FC = () => {
    const params = useParams<{ id?: string }>();
    const queryClient = useQueryClient();
    const { isAuthenticated, token } = useAuth();
    const { t } = useTranslation();

    const addToFavoritesMutation = useMutation({
        mutationFn: async ({ listId, restaurantId }: { listId: string; restaurantId: string; listName: string }) => {
            return favoriteService.addRestaurantToList(listId, restaurantId, token!);
        },
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["favoriteLists"] });
            const event = new CustomEvent('favorite-added', { detail: { listName: variables.listName } });
            window.dispatchEvent(event);
        },
        onError: (error: unknown) => {
            const errorKey = getFavoriteListErrorMessage(error, t("favorites.errorAddingRestaurant"));
            const errorMessage = errorKey.startsWith("favorites.") ? t(errorKey) : errorKey;
            const event = new CustomEvent('favorite-error', { detail: { message: errorMessage } });
            window.dispatchEvent(event);
        }
    });

    return (
        <TranslatedRestaurantDetailPageClass 
            id={params.id} 
            addToFavoritesMutation={addToFavoritesMutation}
            isAuthenticated={isAuthenticated}
            token={token!}
        />
    );
};

export default RestaurantDetailPageWrapper;