import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

// --- Hardcoded Data & Helpers (Fallback if needed) ---
const CITY_COORDINATES: Record<string, [number, number]> = {
    'Remote': [45.9, 25.0], 'Romania': [45.9432, 24.9668], 'Ilfov': [44.5, 26.1]
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

const createPermanentIcon = (count: number) => {
    return L.divIcon({
        html: `<div class="flex items-center justify-center w-full h-full bg-primary/80 text-primary-foreground font-bold text-xs rounded-full border-2 border-primary shadow-sm"><span>${count}</span></div>`,
        className: 'bg-transparent',
        iconSize: [30, 30],
    });
};

// --- Main Component ---
export interface MapViewState {
    center: LatLngExpression;
    zoom: number;
}

export interface MapChartProps {
    locationData: any[];
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
    const mapRef = useRef<L.Map>(null);

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
        
        if (Array.isArray(locationData)) {
            locationData.forEach((loc) => {
                if (loc.lat != null && loc.lng != null) {
                    newMarkers.push({ name: loc.name || loc.city, coords: [loc.lat, loc.lng], count: loc.count });
                } else {
                    const extractedCity = extractCityFromAdzunaLocation(loc.name || '');
                    let coords = CITY_COORDINATES[extractedCity];
                    if (!coords) {
                         for (const [city, latlng] of Object.entries(CITY_COORDINATES)) {
                             if (extractedCity.toLowerCase().includes(city.toLowerCase()) || (loc.name || '').toLowerCase().includes(city.toLowerCase())) {
                                 coords = latlng;
                                 break;
                             }
                         }
                    }
                    if (coords) {
                        newMarkers.push({ name: loc.name, coords, count: loc.count });
                    } else {
                         console.warn(`Could not find coordinates for: ${loc.name} (Extracted: ${extractedCity})`);
                    }
                }
            });
        }
        setMarkers(newMarkers);
    }, [locationData]);

    if (!locationData || locationData.length === 0 || markers.length === 0) {
        return <div className="h-full w-full min-h-[300px] flex items-center justify-center bg-muted/20 rounded-xl text-muted-foreground border border-dashed border-border">No location data to map.</div>;
    }

    const createClusterCustomIcon = (cluster: any) => {
        const markers = cluster.getAllChildMarkers();
        const totalJobs = markers.reduce((sum: number, marker: any) => sum + marker.options.count, 0);

        let size = 'small';
        if (totalJobs > 100) size = 'medium';
        if (totalJobs > 1000) size = 'large';

        return L.divIcon({
            html: `<div class="flex items-center justify-center w-full h-full bg-primary/80 text-primary-foreground font-bold rounded-full border-2 border-primary shadow-sm"><span>${totalJobs}</span></div>`,
            className: `marker-cluster marker-cluster-${size} bg-transparent`,
            iconSize: L.point(40, 40, true),
        });
    };

    const handleMarkerClick = (coords: [number, number]) => {
        if (mapRef.current) {
            mapRef.current.flyTo(coords, Math.max(mapRef.current.getZoom(), 16), {
                duration: 0.75
            });
        }
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
                ref={mapRef}
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
                        <Marker
                            key={`${marker.name}-${idx}`}
                            position={marker.coords}
                            icon={createPermanentIcon(marker.count)}
                            // @ts-ignore - Pass count to the marker options for the clusterer
                            count={marker.count}
                            eventHandlers={{
                                click: () => handleMarkerClick(marker.coords),
                            }}
                        >
                            <Tooltip>
                                <div className="text-center">
                                    <strong className="block mb-1">{marker.name}</strong>
                                    <span>{marker.count} Job{marker.count !== 1 ? 's' : ''}</span>
                                </div>
                            </Tooltip>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}