import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

// --- Hardcoded Data & Helpers ---
const CITY_COORDINATES: Record<string, [number, number]> = {
    'Bucuresti': [44.4268, 26.1025], 'Bucharest': [44.4268, 26.1025], 'Cluj': [46.7712, 23.6236],
    'Timisoara': [45.7489, 21.2087], 'Iasi': [47.1585, 27.6014], 'Brasov': [45.6427, 25.5887],
    'Constanta': [44.1598, 28.6348], 'Sibiu': [45.7983, 24.1256], 'Craiova': [44.3302, 23.7949],
    'Oradea': [47.0465, 21.9189], 'Galati': [45.4353, 28.0080], 'Ploiesti': [44.9367, 26.0125],
    'Remote': [45.9, 25.0], 'Romania': [45.9432, 24.9668], 'Ilfov': [44.5, 26.1], 'Iași': [47.1585, 27.6014],
    'Brașov': [45.6427, 25.5887], 'New York': [40.7128, -74.0060], 'Seattle': [47.6062, -122.3321],
    'London': [51.5074, -0.1278], 'San Francisco': [37.7749, -122.4194], 'Chicago': [41.8781, -87.6298],
    'Houston': [29.7604, -95.3698], 'Los Angeles': [34.0522, -118.2437], 'Paris': [48.8566, 2.3522],
    'Charlotte': [35.2271, -80.8431], 'Atlanta': [33.7490, -84.3880], 'Dallas': [32.7767, -96.7970],
    'Austin': [30.2672, -97.7431], 'Boston': [42.3601, -71.0589], 'Los Gatos': [37.2222, -121.9841],
    'Waltham': [42.3765, -71.2356], 'Cincinnati': [39.1031, -84.5120], 'Juno Beach': [26.8798, -80.0534],
    'Midland': [43.6156, -84.2472], 'Cupertino': [37.3230, -122.0322], 'Purchase': [41.0409, -73.7151],
    'Stockholm': [59.3293, 18.0686], 'Dearborn': [42.3223, -83.1763], 'Bentonville': [36.3729, -94.2088],
    'Camden': [39.9259, -75.1196], 'San Diego': [32.7157, -117.1611], 'Bethesda': [38.9822, -77.0945],
    'Menlo Park': [37.4529, -122.1817], 'Memphis': [35.1495, -90.0490], 'Aarhus': [56.1629, 10.2039],
    'Washington': [38.9072, -77.0369], 'Mountain View': [37.3861, -122.0839], 'New Brunswick': [40.4862, -74.4518],
    'Peoria': [40.6936, -89.5890], 'Bengaluru, India': [12.9716, 77.5946], 'Toronto, Canada': [43.6510, -79.3470],
    'Herzliya, Israel': [32.1624, 34.8447]
};

const extractCityFromAdzunaLocation = (location: string): string => {
    let city = location.split(',')[0].trim();
    const prefixes = ['South East ', 'South West ', 'North East ', 'North West ', 'Central ', 'Greater ', 'Inner ', 'Outer '];
    for (const prefix of prefixes) {
        if (city.startsWith(prefix)) {
            city = city.substring(prefix.length).trim();
            break;
        }
    }
    return city;
};

// --- Sub-components ---
function MapEvents({ onViewChange }: { onViewChange: (center: LatLngExpression, zoom: number) => void }) {
    const map = useMapEvents({
        moveend: () => onViewChange(map.getCenter(), map.getZoom()),
        zoomend: () => onViewChange(map.getCenter(), map.getZoom()),
    });
    return null;
}

function MapSettings({ active }: { active: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (active) {
            map.scrollWheelZoom.enable();
            map.dragging.enable();
        } else {
            map.scrollWheelZoom.disable();
            map.dragging.disable();
        }
    }, [active, map]);
    return null;
}

function MapViewUpdater({ viewState }: { viewState: MapViewState }) {
    const map = useMap();
    useEffect(() => {
        map.setView(viewState.center, viewState.zoom);
    }, [viewState, map]);
    return null;
}

// --- Main Component ---
export interface MapViewState {
    center: LatLngExpression;
    zoom: number;
}

interface MapChartProps {
    locationData: Record<string, number>;
    viewState: MapViewState;
    onViewChange: (state: MapViewState) => void;
    isActive: boolean;
    onActiveChange: (active: boolean) => void;
}

export default function MapChart({ locationData, viewState, onViewChange, isActive, onActiveChange }: MapChartProps) {
    const [markers, setMarkers] = useState<{name: string, coords: [number, number], count: number}[]>([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (!isActive) {
                e.preventDefault();
                setShowOverlay(true);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => setShowOverlay(false), 1500);
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [isActive]);

    const handleClick = () => {
        if (!isActive) {
            onActiveChange(true);
            setShowOverlay(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    };

    const handleMouseLeave = () => {
        onActiveChange(false);
    };

    useEffect(() => {
        const newMarkers: {name: string, coords: [number, number], count: number}[] = [];
        Object.entries(locationData).forEach(([location, count]) => {
            const extractedCity = extractCityFromAdzunaLocation(location);
            let coords = CITY_COORDINATES[extractedCity];
            if (!coords) {
                 for (const [city, latlng] of Object.entries(CITY_COORDINATES)) {
                     if (extractedCity.toLowerCase().includes(city.toLowerCase()) || location.toLowerCase().includes(city.toLowerCase())) {
                         coords = latlng;
                         break;
                     }
                 }
            }
            if (coords) {
                newMarkers.push({ name: location, coords, count });
            } else {
                 console.warn(`Could not find coordinates for: ${location} (Extracted: ${extractedCity})`);
            }
        });
        setMarkers(newMarkers);
    }, [locationData]);

    if (!locationData || Object.keys(locationData).length === 0 || markers.length === 0) {
        return <div className="h-full w-full min-h-[300px] flex items-center justify-center bg-muted/20 rounded-xl text-muted-foreground border border-dashed border-border">No location data to map.</div>;
    }

    const createClusterCustomIcon = (cluster: any) => {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 10) size = 'medium';
        if (count > 100) size = 'large';

        return L.divIcon({
            html: `<div class="flex items-center justify-center w-full h-full bg-primary/80 text-primary-foreground font-bold rounded-full border-2 border-primary shadow-sm"><span>${count}</span></div>`,
            className: `marker-cluster marker-cluster-${size} bg-transparent`,
            iconSize: L.point(40, 40, true),
        });
    };

    return (
        <div 
            ref={containerRef}
            className="h-full w-full rounded-xl overflow-hidden relative border border-border isolate z-0" 
            style={{ minHeight: '400px' }}
            onClick={handleClick}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-300 flex items-center justify-center ${showOverlay ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="bg-black/70 text-white text-lg font-medium px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm">
                    Click the map to enable zoom and pan
                </div>
            </div>

            <MapContainer 
                center={viewState.center}
                zoom={viewState.zoom} 
                style={{ height: '100%', width: '100%', minHeight: '400px', zIndex: 0 }}
                scrollWheelZoom={false} // Managed by MapSettings
                dragging={false} // Managed by MapSettings
            >
                <MapViewUpdater viewState={viewState} />
                <MapEvents onViewChange={(center, zoom) => onViewChange({ center, zoom })} />
                <MapSettings active={isActive} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                />
                
                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                >
                    {markers.map((marker, idx) => (
                        <CircleMarker
                            key={`${marker.name}-${idx}`}
                            center={marker.coords}
                            radius={10}
                            fillColor="hsl(var(--primary))"
                            color="hsl(var(--primary))"
                            weight={2}
                            opacity={0.8}
                            fillOpacity={0.6}
                        >
                            <Tooltip>
                                <div className="text-center">
                                    <strong className="block mb-1">{marker.name}</strong>
                                    <span>{marker.count} Job{marker.count !== 1 ? 's' : ''}</span>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}