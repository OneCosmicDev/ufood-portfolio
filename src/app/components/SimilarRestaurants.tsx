import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import Restaurant from "../types/Restaurant";
import { getSimilarRestaurants } from "../api/restaurantService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./auth/AuthProvider";

interface SimilarRestaurantsProps {
  restaurantId: string;
  limit?: number;
}

const SimilarRestaurants: React.FC<SimilarRestaurantsProps> = ({ 
  restaurantId, 
  limit = 4 
}) => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const similarQuery = useQuery<Restaurant[], Error>({
    queryKey: ["similarRestaurants", restaurantId],
    queryFn: () => getSimilarRestaurants(restaurantId, token!, limit),
    enabled: !!restaurantId && !!token,
  });

  if (similarQuery.isLoading) {
    return (
      <Container className="my-5">
        <h3 className="mb-4 text-center text-body">{t("restaurant_details.similarRestaurants")}</h3>
        <div className="d-flex justify-content-center align-items-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
        </div>
      </Container>
    );
  }

  if (similarQuery.isError || !similarQuery.data || similarQuery.data.length === 0) {
    return null;
  }

  const restaurants = similarQuery.data;

  return (
    <Container className="my-5">
      <h3 className="mb-4 text-center text-body">{t("restaurant_details.similarRestaurants")}</h3>
      <Row className="g-4">
        {restaurants.map((restaurant) => {
          const displayPhoto = restaurant.pictures?.[0] || restaurant.photos?.[0] || restaurant.picture;
          const displayPrice = restaurant.priceRange || '$'.repeat(restaurant.price_range || 1);
          
          return (
            <Col key={restaurant.id} xs={12} sm={6} md={4} lg={3}>
              <Link 
                to={`/restaurant/${restaurant.id}`} 
                className="text-decoration-none"
                onClick={() => window.scrollTo(0, 0)}
              >
                <Card className="h-100 shadow-sm hover-card">
                  {displayPhoto && (
                    <div style={{ height: "200px", overflow: "hidden" }}>
                      <Card.Img
                        variant="top"
                        src={displayPhoto}
                        alt={restaurant.name}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                  )}
                  <Card.Body>
                    <Card.Title className="text-body">{restaurant.name}</Card.Title>
                    <div className="mb-2 d-flex flex-wrap gap-1">
                      {restaurant.genres.slice(0, 2).map((genre, idx) => (
                        <Badge key={idx} bg="primary">
                          {t(`cuisine_types.${genre}`, { defaultValue: genre })}
                        </Badge>
                      ))}
                    </div>
                    <Card.Text className="d-flex justify-content-between align-items-center text-muted small mb-0">
                      <span className="fw-semibold">{displayPrice}</span>
                      {restaurant.rating && (
                        <span className="d-flex align-items-center gap-1">
                          <FontAwesomeIcon icon={faStar} className="text-warning" />
                          <span className="fw-semibold">{restaurant.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default SimilarRestaurants;
