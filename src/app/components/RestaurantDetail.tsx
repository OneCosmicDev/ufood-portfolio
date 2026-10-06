import React, {Component} from 'react';
import Stack from 'react-bootstrap/Stack';
import {Button} from 'react-bootstrap';
import {Page} from './Page';
import Restaurant from '../types/Restaurant';
import {withTranslation, WithTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import VisitModal from './VisitModal';
import {VisitModalData} from '../types/Visit';
import {useVisitMutation} from '../hooks/useVisitMutation';
import '../deps/css/RestaurantDetail.css';
import {useAuth} from "./auth/AuthProvider";

interface VisitMutationProps {
    createVisit: (data: VisitModalData) => void;
    isSubmittingVisit: boolean;
}

interface RestaurantDetailProps extends Restaurant, WithTranslation, VisitMutationProps {
    onAddToFavorites?: () => void;
    isAuthentificated: boolean;
}

interface RestaurantDetailState {
    showVisitModal: boolean;
    visitError: string | null;
}

class RestaurantDetail extends Component<RestaurantDetailProps, RestaurantDetailState> {
    constructor(props: RestaurantDetailProps) {
        super(props);
        this.state = {
            showVisitModal: false,
            visitError: null,
        };
    }
    capitalizeGenre = (genre: string): string => {
        return genre
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    formatRating = (rating: number | string | undefined): string => {
        if (typeof rating === 'number') {
            return rating.toFixed(1);
        }
        return String(rating);
    };

    formatOpeningHours = (hours: string | undefined, t: WithTranslation['t']) => {
        if (!hours) return t("restaurant_details.not_available");

        try {
            const dayHours = JSON.parse(hours) as Array<{ day: string; hours: string }>;

            return (
                <div className="d-flex flex-column gap-2">
                    {dayHours.map(({day, hours}, idx) => {
                        const timeParts = hours.split('-');
                        const timeDisplay = timeParts.length === 2
                            ? `${timeParts[0]} - ${timeParts[1]}`
                            : hours;

                        return (
                            <div key={idx} className="d-flex gap-2">
                                <span className="fw-semibold">{t(`days.${day}`)}:</span>
                                <span className="text-muted">{timeDisplay}</span>
                            </div>
                        );
                    })}
                </div>
            );
        } catch {
            return hours;
        }
    };

    handleVisitModalShow = () => {
        this.setState({showVisitModal: true, visitError: null});
    };

    handleVisitModalHide = () => {
        this.setState({showVisitModal: false, visitError: null});
    };

    handleVisitSubmit = (visitData: VisitModalData) => {
        if (!this.props.isAuthentificated) {
            this.setState({
                visitError: this.props.t("visitModal.mustBeConnected") || "Vous devez être connecté pour déclarer une visite"
            });
            return;
        }

        this.setState({showVisitModal: false, visitError: null});
        this.props.createVisit(visitData);
    };

    render() {
        const {
            name,
            address,
            tel,
            phone,
            hours,
            opening_hours,
            picture,
            pictures,
            photos,
            genres,
            price_range,
            priceRange,
            rating,
            t,
            onAddToFavorites,
            isSubmittingVisit
        } = this.props;
        const {showVisitModal, visitError} = this.state;

        const displayPhone = tel || phone || t("restaurant_details.not_available");
        const displayHours = this.formatOpeningHours(hours || opening_hours?.text, t);
        const displayPhotos = pictures || photos || (picture ? [picture] : []);

        let displayPriceRange = t("restaurant_details.not_available");
        if (price_range && typeof price_range === 'number') {
            displayPriceRange = '$'.repeat(price_range);
        } else if (priceRange) {
            displayPriceRange = priceRange;
        }

        const displayRating = rating !== undefined ? this.formatRating(rating) : t("restaurant_details.not_available");

        const displayGenres = genres.map(genre => {
            const capitalizedGenre = this.capitalizeGenre(genre);
            const translationKey = `cuisine_types.${capitalizedGenre}`;
            return t(translationKey, {defaultValue: capitalizedGenre});
        }).join(', ');

        return (
            <Page title={name}>
                <div className="p-2 p-md-3">
                    <div className="row g-3 g-md-4 align-items-start justify-content-center">
                        {displayPhotos.length > 0 && (
                            <div className="col-12 col-md-5 col-lg-4">
                                <div className="row g-2 g-md-3">
                                    {displayPhotos.map((photo, idx) => (
                                        <div key={idx} className="col-6">
                                            <img
                                                src={photo}
                                                alt={`Photo ${idx + 1}`}
                                                className="img-fluid rounded border border-2 restaurant-photo"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div
                            className={`col-12 ${displayPhotos.length > 0 ? 'col-md-7 col-lg-7' : 'col-md-10 col-lg-8'}`}>
                            <div className="w-100 p-3 p-md-4 bg-body-secondary bg-opacity-10 rounded">
                                <Stack gap={3}>
                                    <div className="d-flex flex-column gap-1 py-2">
                                        <span
                                            className="fw-bold text-uppercase text-muted small">{t("restaurant_details.address")}:</span>
                                        <span>{address}</span>
                                    </div>
                                    <div className="d-flex flex-column gap-1 py-2">
                                        <span
                                            className="fw-bold text-uppercase text-muted small">{t("restaurant_details.phone")}:</span>
                                        <span>{displayPhone}</span>
                                    </div>
                                    <div className="d-flex flex-column gap-1 py-2">
                                        <span
                                            className="fw-bold text-uppercase text-muted small">{t("restaurant_details.hours")}:</span>
                                        <div>{displayHours}</div>
                                    </div>
                                    <div className="d-flex flex-column gap-1 py-2">
                                        <span
                                            className="fw-bold text-uppercase text-muted small">{t("restaurant_details.genres")}:</span>
                                        <span>{displayGenres}</span>
                                    </div>
                                    <div className="d-flex flex-column gap-1 py-2">
                                        <span
                                            className="fw-bold text-uppercase text-muted small">{t("restaurant_details.price_range")}:</span>
                                        <span>{displayPriceRange}</span>
                                    </div>
                                    <div className="d-flex flex-column gap-1 py-2">
                                        <span
                                            className="fw-bold text-uppercase text-muted small">{t("restaurant_details.rating")}:</span>
                                        <span>{displayRating} / 5</span>
                                    </div>
                                    {this.props.isAuthentificated && onAddToFavorites && (
                                        <div className="d-flex justify-content-center pt-3">
                                            <Button
                                                variant="success"
                                                onClick={onAddToFavorites}
                                                className="w-100"
                                            >
                                                <FontAwesomeIcon icon={faHeart} className="me-2"/>
                                                {t("restaurant_details.addToFavorites")}
                                            </Button>
                                        </div>
                                    )}
                                </Stack>
                            </div>
                        </div>
                    </div>

                    {this.props.isAuthentificated && (
                        <div className="text-center mt-4">
                            <Button
                                variant="success"
                                size="lg"
                                onClick={this.handleVisitModalShow}
                                className="px-4"
                            >
                                {t("visitModal.title")}
                            </Button>
                        </div>
                    )}
                </div>

                <VisitModal
                    show={showVisitModal}
                    onHide={this.handleVisitModalHide}
                    onSubmit={this.handleVisitSubmit}
                    isLoading={isSubmittingVisit}
                    error={visitError}
                    restaurantName={name}
                />
            </Page>
        );
    }
}

interface RestaurantDetailWrapperProps extends Restaurant, WithTranslation {
    onAddToFavorites?: () => void;
    isUserLoggedIn?: boolean;
}

const RestaurantDetailWithMutation: React.FC<RestaurantDetailWrapperProps> = (props) => {
    const {isAuthenticated, userId, token} = useAuth();

    const {createVisitMutation} = useVisitMutation({
        userId: userId!,
        token: token!,
        onError: (message) => {
            console.error('[ERROR] RestaurantDetail.createVisit:', message);
        },
    });

    const handleCreateVisit = (visitData: VisitModalData) => {
        const now = new Date();
        const selectedDate = new Date(visitData.date);

        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        const visitPayload = {
            restaurantId: props.id,
            date: selectedDate.toISOString(),
            rating: visitData.rating,
            comment: visitData.comment,
            userId: userId!
        };
        createVisitMutation.mutate(visitPayload);
    };

    return (
        <RestaurantDetail
            {...props}
            createVisit={handleCreateVisit}
            isSubmittingVisit={createVisitMutation.isPending}
            onAddToFavorites={props.onAddToFavorites}
            isAuthentificated={isAuthenticated}
        />
    );
};

export default withTranslation()(RestaurantDetailWithMutation);
