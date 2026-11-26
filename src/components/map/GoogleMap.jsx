import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { MapPin } from "lucide-react";

import "leaflet/dist/leaflet.css";

export const OSM_TILE_URL =
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function GoogleMapProvider({ center, zoom, markers, height }) {
    return (
        <div style={{ height }} className="w-full">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API}>
                <Map
                    center={[center.lat, center.lng]}
                    zoom={zoom}
                    mapId="smart-health-map"
                    gestureHandling="greedy"
                    style={{ height: "100%", width: "100%" }}
                >
                    {markers.map((marker, index) => (
                        <AdvancedMarker
                            key={index}
                            position={[marker.lat, marker.lng]}
                            title={marker.title}
                        />
                    ))}
                </Map>
            </APIProvider>
        </div>
    );
}

function LeafletMap({ center, zoom, markers, height }) {
    return (
        <div style={{ height }} className="w-full">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url={OSM_TILE_URL}
                    attribution="© OpenStreetMap contributors"
                />
                {markers.map((marker, index) => (
                    <Marker key={index} position={[marker.lat, marker.lng]} />
                ))}
            </MapContainer>
        </div>
    );
}

function GoogleMap({
    title = "GPS Tracking",
    subtitle = "Current Device Location",
    center = null,
    zoom = 15,
    markers = [],
    height = 320,
}) {
    const hasGoogleKey = Boolean(import.meta.env.VITE_GOOGLE_MAP_API);
    const hasCenter =
        center != null &&
        Number.isFinite(Number(center.lat)) &&
        Number.isFinite(Number(center.lng));

    const mapMarkers = hasCenter
        ? markers && markers.length > 0
            ? markers
            : [{ lat: Number(center.lat), lng: Number(center.lng), title }]
        : [];

    return (
        <div className="ui-card p-5 md:p-6 h-full flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="ui-gradient-icon w-10 h-10 shrink-0">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
                        {subtitle && <p className="text-xs text-[var(--midnight-muted)] mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                <span className="ui-badge">
                    {hasGoogleKey ? "Google Maps" : "OpenStreetMap"}
                </span>
            </div>
            <div className="w-full flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10">
                {hasCenter ? (
                    hasGoogleKey ? (
                        <GoogleMapProvider
                            center={{ lat: Number(center.lat), lng: Number(center.lng) }}
                            zoom={zoom}
                            markers={mapMarkers}
                            height={height}
                        />
                    ) : (
                        <LeafletMap
                            center={{ lat: Number(center.lat), lng: Number(center.lng) }}
                            zoom={zoom}
                            markers={mapMarkers}
                            height={height}
                        />
                    )
                ) : (
                    <div
                        style={{ height }}
                        className="flex flex-col items-center justify-center gap-3 bg-[var(--midnight-surface-2)] text-center px-4"
                    >
                        <MapPin size={30} strokeWidth={1.5} className="text-[var(--midnight-muted)]" />
                        <p className="text-sm font-medium text-[var(--midnight-muted)]">
                            No location data available yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GoogleMap;
