import { Component } from "react";
import L, { LatLngExpression } from "leaflet";
import "leaflet-routing-machine";

interface Props {
    map: L.Map;
    start: LatLngExpression;
    end: LatLngExpression;
}

interface FixedRoutingOptions extends L.Routing.RoutingControlOptions {
    draggableWaypoints?: boolean;
}

export class RoutingMachineController extends Component<Props> {
    control: L.Routing.Control | null = null;

    componentDidMount() {
        this.addRouting();
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.control) return;

        if (prevProps.start !== this.props.start || prevProps.end !== this.props.end) {
            this.control.setWaypoints([L.latLng(this.props.start), L.latLng(this.props.end)]);
        }
    }

    componentWillUnmount() {
        this.removeRouting();
    }

    addRouting() {
        const { map, start, end } = this.props;

        const options: FixedRoutingOptions = {
            waypoints: [L.latLng(start), L.latLng(end)],
            lineOptions: {
                styles: [{ color: "blue", weight: 4 }],
                extendToWaypoints: false,
                missingRouteTolerance: 0,
            },
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
        };

        type ExtendedOptions = FixedRoutingOptions & {
            createMarker?: (i: number, wp: L.Routing.Waypoint, n: number) => L.Marker | null;
        };

        this.control = L.Routing.control({
            ...options,
            createMarker: () => null,
        } as ExtendedOptions);

        this.control.on("routeselected", () => {
            const container = this.control?.getContainer();
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });

        this.control.addTo(map);
    }

    removeRouting() {
        if (this.control) {
            this.props.map.removeControl(this.control);
            this.control = null;
        }
    }

    render() {
        return null;
    }
}
