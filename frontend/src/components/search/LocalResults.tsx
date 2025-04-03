import React, { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";

interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

interface LocalResult {
  title: string;
  address: string;
  rating?: number;
  reviews?: number;
  gps_coordinates: GPSCoordinates;
}

interface LocalResultsProps {
  localResults: LocalResult[];
  isGoogleMapsLoaded: boolean;
  content: string;
}

const isLocationRelevantQuery = (query: string): boolean => {
  const locationKeywords = [
    "near me",
    "nearby",
    "around",
    "local",
    "restaurant",
    "cafe",
    "shop",
    "store",
    "location",
    "where",
    "address",
    "directions",
    "food",
    "coffee",
    "bar",
    "hotel",
  ];
  return locationKeywords.some((keyword) => query.toLowerCase().includes(keyword));
};

const LocalResults: React.FC<LocalResultsProps> = ({ localResults, isGoogleMapsLoaded, content }) => {
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current || localResults.length === 0 || !isLocationRelevantQuery(content)) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      disableDefaultUI: true,
    });

    const bounds = new window.google.maps.LatLngBounds();
    localResults.forEach((place, index) => {
      const position = {
        lat: place.gps_coordinates.latitude,
        lng: place.gps_coordinates.longitude,
      };

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance,
        title: place.title,
        icon: selectedLocationIndex === index
          ? {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillOpacity: 1,
              strokeWeight: 2,
            }
          : undefined,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px; font-weight: 500;">${place.title}</h3>
            <p style="margin: 0 0 4px;">${place.address}</p>
            ${place.rating ? `<p style="margin: 0;">Rating: ${place.rating}⭐ (${place.reviews} reviews)</p>` : ""}
          </div>
        `,
        maxWidth: 200,
      });

      if (selectedLocationIndex === index) {
        infoWindow.open(mapInstance, marker);
        mapInstance.panTo(position);
      }

      marker.addListener("click", () => {
        setSelectedLocationIndex(index);
      });
      bounds.extend(position);
    });
    mapInstance.fitBounds(bounds);
  }, [isGoogleMapsLoaded, localResults, selectedLocationIndex, content]);

  if (!isLocationRelevantQuery(content)) {
    return null;
  }

  return (
    <Card className="p-4 border border-gray-200 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {localResults.map((place, index) => (
            <button
              key={index}
              type="button"
              className={`p-3 text-left bg-gray-50 rounded-2xl w-full transition-colors ${
                selectedLocationIndex === index
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedLocationIndex(index)}
            >
              <h4 className="font-medium">{place.title}</h4>
              <p className="text-sm text-gray-600">{place.address}</p>
              {place.rating && (
                <p className="text-sm mt-1">
                  Rating: {place.rating}⭐ ({place.reviews} reviews)
                </p>
              )}
            </button>
          ))}
        </div>
        <div ref={mapRef} className="h-[300px] rounded-2xl overflow-hidden" />
      </div>
    </Card>
  );
};

export default LocalResults;
