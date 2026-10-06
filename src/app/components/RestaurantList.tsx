import React from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Restaurant from "../types/Restaurant";
import { motion } from "framer-motion";
import RestaurantCard from "./RestaurantCard";
import { WithTranslation, withTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import '../deps/css/RestaurantList.css'

interface RestaurantListProps extends WithTranslation  {
    restaurants: Restaurant[];
    onRestaurantClick?: (restaurant: string) => void;
    showVisitButton?: boolean;
    onVisitClick?: (restaurant: Restaurant) => void;
}

class RestaurantList extends React.Component<RestaurantListProps> {

    handleRestaurantClick = (restaurantName: string) => {
        if (this.props.onRestaurantClick) {
            this.props.onRestaurantClick(restaurantName);
        }
    }

    handleVisitClick = (restaurant: Restaurant, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.props.onVisitClick) {
            this.props.onVisitClick(restaurant);
        }
    }

    render() {
        const { restaurants, t, showVisitButton } = this.props;

        if (restaurants.length === 0) {
            return (
                <Row>
                    <Col className="text-center pt-5">
                        <h4>{t("restaurant_not_found")}</h4>
                        <p>{t("change_criteria")}</p>
                    </Col>
                </Row>
            );
        }

        return (
            <motion.div
                className="row gy-4 restaurant-cards"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                {restaurants.length > 0 && restaurants.map((restaurant) => (
                    <motion.div
                        key={restaurant.id}
                        variants={{
                            hidden: { opacity: 0, y: 20, scale: 0.9 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
                        }}
                        className="col-12 col-sm-12 col-md-6 col-lg-4"
                    >
                        <div className="restaurant-card-wrapper position-relative">
                            <Link
                                onClick={() => this.handleRestaurantClick(restaurant.name)}
                                to={`/restaurant/${restaurant.id}`}
                                className="text-decoration-none text-reset"
                            >
                                <RestaurantCard
                                    restaurant={restaurant}
                                    title={restaurant.name}
                                />
                            </Link>

                            {showVisitButton && (
                                <div className="mt-2 text-center">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={(e) => this.handleVisitClick(restaurant, e)}
                                        className="w-100 visit-button-custom"
                                    >
                                        <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                                        {t("visitModal.title")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    }
}

export default withTranslation()(RestaurantList);