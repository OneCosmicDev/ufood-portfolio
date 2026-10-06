import React from "react";
import { Row, Col } from "react-bootstrap";
import Restaurant from "../types/Restaurant";
import { motion } from "framer-motion";
import RestaurantCard from "./RestaurantCard";
import { WithTranslation, withTranslation } from "react-i18next";
import '../deps/css/UserRestaurantList.css'

interface UserRestaurantListProps extends WithTranslation  {
    restaurants: Restaurant[];
    onRestaurantClick: (restaurantId: string) => void;
}

class UserRestaurantList extends React.Component<UserRestaurantListProps> {

    handleRestaurantClick = (restaurantId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.onRestaurantClick(restaurantId);
    }

    render() {
        const { restaurants, t } = this.props;

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
                        <div
                            onClick={(e) => this.handleRestaurantClick(restaurant.id, e)}
                            className="text-decoration-none text-reset cursor"
                        >
                            <RestaurantCard
                                restaurant={restaurant}
                                title={restaurant.name}
                            />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    }
}

export default withTranslation()(UserRestaurantList);