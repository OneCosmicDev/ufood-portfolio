import "../deps/css/card.css";

import React, { ReactElement } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import Card from "react-bootstrap/Card";
import { Badge } from "react-bootstrap";
import Restaurant from "../types/Restaurant";

interface RestaurantCardProps extends WithTranslation {
    restaurant: Restaurant;
    title?: string;
}

class RestaurantCard extends React.Component<RestaurantCardProps> {
    capitalizeGenre = (genre: string): string => {
        return genre
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    render(): ReactElement {
        const { restaurant, title, t } = this.props;

        let displayPriceRange = t("restaurant_details.not_available");
        if (restaurant.price_range && typeof restaurant.price_range === 'number') {
            displayPriceRange = '$'.repeat(restaurant.price_range);
        } else if (restaurant.priceRange) {
            displayPriceRange = restaurant.priceRange;
        }

        return (
                <Card
                    className="h-100 shadow-sm restaurant-list-card glow-on-hover"
                >
                    <Card.Body>
                        <Card.Title className="h5 mb-3">{title || restaurant.name}</Card.Title>

                        <div className="mb-3">
                            <div className="mb-2">
                                <span className="text-muted">{t("price")}: </span>
                                <Badge bg="secondary">{displayPriceRange}</Badge>
                            </div>
                        </div>

                        {restaurant.visits &&
                            <div className="mb-3">
                                <div className="mb-2">
                                    <span className="text-muted">{t("userProfile.visits")}: </span>
                                    {restaurant.visits <= 1 ?
                                        t("userProfile.visit_text_one", { visits: 1 }) :
                                        t("userProfile.visit_text_multiple", { visits: restaurant.visits })}
                                </div>
                            </div>}

                        <div>
                            <span className="text-muted">{t("cuisine")}: </span>
                            <div className="mt-1">
                                {restaurant.genres.map((genre, index) => {
                                    const capitalizedGenre = this.capitalizeGenre(genre);
                                    const translationKey = `cuisine_types.${capitalizedGenre}`;
                                    const displayGenre = t(translationKey, { defaultValue: capitalizedGenre });
                                    return (
                                        <Badge key={index} bg="primary" className="me-1 mb-1">
                                            {displayGenre}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    </Card.Body>
                </Card>
        );
    }
}

export default withTranslation()(RestaurantCard);
