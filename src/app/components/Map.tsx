import React from "react";
import { RoutingMachineController } from "./RoutingMachineController";
import Restaurant from "../types/Restaurant";
import L, { LatLngExpression } from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { withTranslation, WithTranslation } from "react-i18next";

const DefaultIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface MapProps extends WithTranslation {
    restaurant: Restaurant;
    showRoute: boolean;
    userPosition?: LatLngExpression;
}

interface MapState {
    mapInstance: L.Map | null;
}

class Map extends React.Component<MapProps, MapState> {
    mapRef: HTMLDivElement | null = null;

    state: MapState = { mapInstance: null };

    componentDidMount() {
        if (this.mapRef && this.props.restaurant.coordinates) {
            const { lat, lng } = this.props.restaurant.coordinates;
            const map = L.map(this.mapRef).setView([lat, lng], 15);
            
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap",
            }).addTo(map);

            L.marker([lat, lng], { icon: DefaultIcon })
                .addTo(map)
                .bindPopup(this.props.restaurant.name);

            this.setState({ mapInstance: map });
        }
    }

    render() {
        const { restaurant, showRoute, userPosition, t } = this.props;
        
        if (!restaurant.coordinates) {
            return (
                <div className="w-100 h-100 rounded shadow-sm border d-flex align-items-center justify-content-center">
                    <p className="text-muted">{t("restaurant_details.map_not_available")}</p>
                </div>
            );
        }
        
        return (
            <div
                ref={(ref) => { this.mapRef = ref; }}
                className="w-100 h-100 rounded shadow-sm border"
            >
                {showRoute && userPosition && this.state.mapInstance && (
                    <RoutingMachineController
                        map={this.state.mapInstance}
                        start={userPosition}
                        end={[restaurant.coordinates.lat, restaurant.coordinates.lng]}
                    />
                )}
            </div>
        );
    }
}

export default withTranslation()(Map);
