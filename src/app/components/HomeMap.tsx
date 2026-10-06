import React from "react";
import Restaurant from "../types/Restaurant";
import L, { LatLngExpression } from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { withTranslation, WithTranslation } from "react-i18next";
import { getRestaurantPopupHTML } from "./RestaurantPopup";
import { notificationService } from "../utils/notificationService";
import "../deps/css/map.css";

const DefaultIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface HomeMapProps extends WithTranslation {
    restaurants: Restaurant[];
    userPosition?: LatLngExpression;
}

interface HomeMapState {
    mapInstance: L.Map | null;
    hasValidRestaurants: boolean;
}

class HomeMap extends React.Component<HomeMapProps, HomeMapState> {
    mapRef: HTMLDivElement | null = null;
    private markers: L.Marker[] = [];

    state: HomeMapState = {
        mapInstance: null,
        hasValidRestaurants: false
    };

    componentDidMount() {
        this.initializeMap();
    }

    componentDidUpdate(prevProps: HomeMapProps) {
        const hasValidRestaurants = this.hasValidRestaurants();

        if (this.state.hasValidRestaurants !== hasValidRestaurants) {
            this.setState({ hasValidRestaurants }, () => {
                if (hasValidRestaurants && this.state.mapInstance) {
                    this.updateMarkers();
                } else if (!hasValidRestaurants && this.state.mapInstance) {
                    this.clearMap();
                }
            });
        }

        if (hasValidRestaurants && prevProps.restaurants !== this.props.restaurants && this.state.mapInstance) {
            this.updateMarkers();
        }

        if (prevProps.userPosition !== this.props.userPosition && this.state.mapInstance) {
            this.updateMapCenter();
        }

        if (prevProps.i18n.language !== this.props.i18n.language && this.state.mapInstance && hasValidRestaurants) {
            this.updateMarkers();
        }
    }

    componentWillUnmount() {
        this.clearMarkers();
        if (this.state.mapInstance) {
            this.state.mapInstance.remove();
        }
    }

    hasValidRestaurants(): boolean {
        const { restaurants } = this.props;
        const restaurantsWithCoordinates = restaurants.filter(restaurant =>
            restaurant.coordinates &&
            restaurant.coordinates.lat &&
            restaurant.coordinates.lng
        );
        return restaurantsWithCoordinates.length > 0;
    }

    getDefaultCenter(): LatLngExpression {
        const { userPosition } = this.props;

        if (userPosition) {
            return userPosition;
        }

        return [45.5017, -73.5673];
    }

    clearMap() {
        this.clearMarkers();
        if (this.state.mapInstance) {
            const center = this.getDefaultCenter();
            this.state.mapInstance.setView(center, 12);
        }
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            if (this.state.mapInstance) {
                this.state.mapInstance.removeLayer(marker);
            }
        });
        this.markers = [];
    }

    initializeMap() {
        if (!this.mapRef) {
            return;
        }

        const hasValidRestaurants = this.hasValidRestaurants();
        const center = this.getDefaultCenter();
        const zoom = hasValidRestaurants ? 13 : 12;

        try {
            const map = L.map(this.mapRef).setView(center, zoom);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap",
            }).addTo(map);

            if (hasValidRestaurants) {
                this.addMarkers(map);
                this.fitMapToMarkers(map);
            }

            this.setState({
                mapInstance: map,
                hasValidRestaurants
            });
        } catch (error) {
            notificationService.logError("HomeMap.initializeMap", error, {
                hasValidRestaurants,
                center,
                zoom
            });
        }
    }

    updateMapCenter() {
        const { mapInstance } = this.state;
        if (!mapInstance) return;

        const center = this.getDefaultCenter();
        mapInstance.setView(center, 12);
    }

    getValidRestaurants(): Restaurant[] {
        const { restaurants } = this.props;
        return restaurants.filter(restaurant =>
            restaurant.coordinates &&
            restaurant.coordinates.lat &&
            restaurant.coordinates.lng
        );
    }

    addMarkers(map: L.Map) {
        const restaurantsWithCoordinates = this.getValidRestaurants();

        this.clearMarkers();

        restaurantsWithCoordinates.forEach(restaurant => {
            if (restaurant.coordinates) {
                const { lat, lng } = restaurant.coordinates;

                const marker = L.marker([lat, lng], { icon: DefaultIcon })
                    .addTo(map)
                    .bindPopup(getRestaurantPopupHTML(restaurant));

                this.markers.push(marker);
            }
        });
    }

    fitMapToMarkers(map: L.Map) {
        const { userPosition } = this.props;
        const restaurantsWithCoordinates = this.getValidRestaurants();

        if (restaurantsWithCoordinates.length === 0) return;

        const bounds = L.latLngBounds([]);

        if (userPosition) {
            bounds.extend(userPosition);
        }

        restaurantsWithCoordinates.forEach(restaurant => {
            if (restaurant.coordinates) {
                bounds.extend([restaurant.coordinates.lat, restaurant.coordinates.lng]);
            }
        });

        if (bounds.isValid()) {
            setTimeout(() => {
                try {
                    map.fitBounds(bounds, {
                        padding: [20, 20],
                        maxZoom: 15
                    });
                } catch (error) {
                    notificationService.logError("HomeMap.fitMapToMarkers", error, {
                        bounds: {
                            northEast: bounds.getNorthEast(),
                            southWest: bounds.getSouthWest(),
                            center: bounds.getCenter()
                        },
                        restaurantsCount: restaurantsWithCoordinates.length
                    });
                }
            }, 100);
        }
    }

    updateMarkers() {
        const { mapInstance } = this.state;
        if (!mapInstance) return;

        if (this.hasValidRestaurants()) {
            this.addMarkers(mapInstance);
            this.fitMapToMarkers(mapInstance);
        } else {
            this.clearMap();
        }
    }

    render() {
        return (
            <div
                ref={(ref) => {
                    this.mapRef = ref;
                }}
                className="w-100 h-100 rounded shadow-sm border home-map-container"
            />
        );
    }
}

export default withTranslation()(HomeMap);