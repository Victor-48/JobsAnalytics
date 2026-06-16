import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Extended hardcoded coordinates for demonstration purposes, 
const CITY_COORDINATES: Record<string, [number, number]> = {
    'Bucuresti': [44.4268, 26.1025],
    'Bucharest': [44.4268, 26.1025],
    'Cluj': [46.7712, 23.6236],
    'Timisoara': [45.7489, 21.2087],
    'Iasi': [47.1585, 27.6014],
    'Brasov': [45.6427, 25.5887],
    'Constanta': [44.1598, 28.6348],
    'Sibiu': [45.7983, 24.1256],
    'Craiova': [44.3302, 23.7949],
    'Oradea': [47.0465, 21.9189],
    'Galati': [45.4353, 28.0080],
    'Ploiesti': [44.9367, 26.0125],
    'Remote': [45.9, 25.0], 
    'Romania': [45.9432, 24.9668], // Fallback for the whole country
    'Ilfov': [44.5, 26.1],
    'Iași': [47.1585, 27.6014],
    'Brașov': [45.6427, 25.5887],
    
    // US & Global Cities from mock data
    'New York': [40.7128, -74.0060],
    'Seattle': [47.6062, -122.3321],
    'London': [51.5074, -0.1278],
    'San Francisco': [37.7749, -122.4194],
    'Chicago': [41.8781, -87.6298],
    'Houston': [29.7604, -95.3698],
    'Los Angeles': [34.0522, -118.2437],
    'Paris': [48.8566, 2.3522],
    'Charlotte': [35.2271, -80.8431],
    'Atlanta': [33.7490, -84.3880],
    'Dallas': [32.7767, -96.7970],
    'Austin': [30.2672, -97.7431],
    'Boston': [42.3601, -71.0589],
    'Los Gatos': [37.2222, -121.9841],
    'Waltham': [42.3765, -71.2356],
    'Cincinnati': [39.1031, -84.5120],
    'Juno Beach': [26.8798, -80.0534],
    'Midland': [43.6156, -84.2472],
    'Cupertino': [37.3230, -122.0322],
    'Purchase': [41.0409, -73.7151],
    'Stockholm': [59.3293, 18.0686],
    'Dearborn': [42.3223, -83.1763],
    'Bentonville': [36.3729, -94.2088],
    'Camden': [39.9259, -75.1196],
    'San Diego': [32.7157, -117.1611],
    'Bethesda': [38.9822, -77.0945],
    'Menlo Park': [37.4529, -122.1817],
    'Memphis': [35.1495, -90.0490],
    'Aarhus': [56.1629, 10.2039],
    'Washington': [38.9072, -77.0369],
    'Mountain View': [37.3861, -122.0839],
    'New Brunswick': [40.4862, -74.4518],
    'Peoria': [40.6936, -89.5890],
    'Bengaluru, India': [12.9716, 77.5946],
    'Toronto, Canada': [43.6510, -79.3470],
    'Herzliya, Israel': [32.1624, 34.8447]
};

// API mapping for Adzuna locations (to extract the city name from complex strings)
const extractCityFromAdzunaLocation = (location: string): string => {
    // Adzuna locations often come in formats like "London, UK", "South East London", "London"
    // We want to extract just the first part before commas, and remove extra regions
    let city = location.split(',')[0].trim();
    
    // Some common Adzuna prefixes/suffixes to remove
    const prefixes = ['South East ', 'South West ', 'North East ', 'North West ', 'Central ', 'Greater ', 'Inner ', 'Outer '];
    for (const prefix of prefixes) {
        if (city.startsWith(prefix)) {
            city = city.substring(prefix.length).trim();
            break; // Assuming only one prefix
        }
    }
    return city;
};

interface MapChartProps {
    locationData: Record<string, number>;
}

// Component to dynamically adjust map bounds based on data
function ChangeView({ markers }: { markers: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers);
            // Invalidate size helps when map container size changes
            setTimeout(() => {
                map.invalidateSize();
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
            }, 100);
        }
    }, [markers, map]);
    return null;
}

export default function MapChart({ locationData }: MapChartProps) {
    const [markers, setMarkers] = useState<{name: string, coords: [number, number], count: number}[]>([]);

    useEffect(() => {
        const newMarkers: {name: string, coords: [number, number], count: number}[] = [];
        
        Object.entries(locationData).forEach(([location, count]) => {
            // Very basic matching for demo. 
            // Real app needs fuzzy matching or exact geocoding
            
            // Extract the city from potentially complex Adzuna location strings
            const extractedCity = extractCityFromAdzunaLocation(location);

            let coords = CITY_COORDINATES[extractedCity];
            
            if(!coords) {
                 // Try to find if the location string contains any of our known cities
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
                 console.warn(`Could not find coordinates for location: ${location} (Extracted: ${extractedCity})`);
            }
        });

        setMarkers(newMarkers);
    }, [locationData]);

    if (!locationData || Object.keys(locationData).length === 0 || markers.length === 0) {
        return <div className="h-full w-full min-h-[300px] flex items-center justify-center bg-muted/20 rounded-xl text-muted-foreground border border-dashed border-border">No known location data available to map</div>;
    }

    // Calculate max count for scaling circles
    const maxCount = Math.max(...markers.map(m => m.count), 1);

    return (
        <div className="h-full w-full rounded-xl overflow-hidden relative border border-border isolate z-0" style={{ minHeight: '400px' }}>
            <MapContainer 
                center={[45.9432, 24.9668]} // Default center
                zoom={2} 
                style={{ height: '100%', width: '100%', minHeight: '400px', zIndex: 0 }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Cleaner, more modern tile layer
                />
                
                {markers.length > 0 && <ChangeView markers={markers.map(m => m.coords)} />}

                {markers.map((marker, idx) => {
                    // Scale radius between 8 and 30 based on relative count
                    const radius = 8 + (22 * (marker.count / maxCount));
                    
                    return (
                        <CircleMarker
                            key={`${marker.name}-${idx}`}
                            center={marker.coords}
                            radius={radius}
                            fillColor="hsl(var(--primary))"
                            color="hsl(var(--primary))"
                            weight={2}
                            opacity={0.8}
                            fillOpacity={0.5}
                        >
                            <Tooltip>
                                <div className="text-center">
                                    <strong className="block mb-1">{marker.name}</strong>
                                    <span>{marker.count} Job{marker.count !== 1 ? 's' : ''}</span>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}