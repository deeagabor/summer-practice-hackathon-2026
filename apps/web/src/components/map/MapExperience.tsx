"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation, Search, SlidersHorizontal, X } from "lucide-react";
import type { Sport, SportsEvent } from "@showup2move/shared";

interface MapExperienceProps {
  events: SportsEvent[];
  sports: Sport[];
  mapsApiKey?: string;
}

interface GoogleLatLng {
  lat: number;
  lng: number;
}

interface GoogleLatLngBounds {
  extend(position: GoogleLatLng): void;
}

interface GoogleMapInstance {
  fitBounds(bounds: GoogleLatLngBounds): void;
  panTo(position: GoogleLatLng): void;
  setZoom(zoom: number): void;
}

interface GoogleMarkerInstance {
  addListener(eventName: string, handler: () => void): void;
  setMap(map: GoogleMapInstance | null): void;
}

interface GoogleMapsApi {
  maps: {
    LatLngBounds: new () => GoogleLatLngBounds;
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
    Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
  };
}

declare global {
  interface Window {
    google?: GoogleMapsApi;
    __showUpGoogleMapsPromise?: Promise<void>;
  }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is missing."));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (window.__showUpGoogleMapsPromise) {
    return window.__showUpGoogleMapsPromise;
  }

  window.__showUpGoogleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-showup-google-maps]");

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.showupGoogleMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load."));
    document.head.appendChild(script);
  });

  return window.__showUpGoogleMapsPromise;
}

export function MapExperience({ events, sports, mapsApiKey = "" }: MapExperienceProps) {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<string | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(events[0]?.id ?? null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        const queryMatch =
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.location.name.toLowerCase().includes(query.toLowerCase()) ||
          event.location.address.toLowerCase().includes(query.toLowerCase());
        const sportMatch = sport === "all" || event.sportId === sport;

        return queryMatch && sportMatch;
      }),
    [events, query, sport],
  );

  const selectedEvent = selectedId ? visibleEvents.find((event) => event.id === selectedId) ?? null : null;
  const fallbackMarkers = useMemo(() => getFallbackMarkers(visibleEvents), [visibleEvents]);
  const showFallbackMap = Boolean(mapError || !mapsApiKey);

  useEffect(() => {
    if (selectedId && !visibleEvents.some((event) => event.id === selectedId)) {
      setSelectedId(visibleEvents[0]?.id ?? null);
    }
  }, [selectedId, visibleEvents]);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps(mapsApiKey)
      .then(() => {
        if (cancelled || !window.google?.maps || !mapElementRef.current || visibleEvents.length === 0) {
          return;
        }

        const maps = window.google.maps;
        const firstCoordinates = visibleEvents.at(0)?.location.coordinates;
        const center = firstCoordinates
          ? { lat: firstCoordinates.lat, lng: firstCoordinates.lng }
          : { lat: 44.4268, lng: 26.1025 };

        const map =
          googleMapRef.current ??
          new maps.Map(mapElementRef.current, {
            center,
            disableDefaultUI: false,
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoom: 13,
          });

        googleMapRef.current = map;
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        const bounds = new maps.LatLngBounds();

        visibleEvents.forEach((event) => {
          if (!event.location.coordinates) {
            return;
          }

          const position = { lat: event.location.coordinates.lat, lng: event.location.coordinates.lng };
          bounds.extend(position);

          const marker = new maps.Marker({
            map,
            position,
            title: event.title,
          });

          marker.addListener("click", () => setSelectedId(event.id));
          markersRef.current.push(marker);
        });

        if (markersRef.current.length > 1) {
          map.fitBounds(bounds);
        } else {
          map.panTo(center);
          map.setZoom(14);
        }

        setMapError(null);
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setMapError(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mapsApiKey, visibleEvents]);

  useEffect(() => {
    if (!selectedEvent?.location.coordinates || !googleMapRef.current) {
      return;
    }

    googleMapRef.current.panTo({
      lat: selectedEvent.location.coordinates.lat,
      lng: selectedEvent.location.coordinates.lng,
    });
  }, [selectedEvent]);

  return (
    <section className="map-shell">
      <div className="map-toolbar">
        <div>
          <p className="eyebrow">Live city map</p>
          <h1>Find the next game around you</h1>
        </div>

        <div className="map-controls" aria-label="Map filters">
          <label className="search-control">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search events</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search venue, sport, event"
            />
          </label>

          <label className="select-control">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">Filter by sport</span>
            <select value={sport} onChange={(event) => setSport(event.target.value)}>
              <option value="all">All sports</option>
              {sports.map((sportOption) => (
                <option key={sportOption.id} value={sportOption.id}>
                  {sportOption.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="map-stage">
        {showFallbackMap ? (
          <div className="map-fallback map-grid" aria-label="Local event map preview">
            <span className="map-road map-road-one" />
            <span className="map-road map-road-two" />
            <span className="map-road map-road-three" />
            {fallbackMarkers.map((marker) => (
              <button
                className={`fallback-marker ${selectedEvent?.id === marker.id ? "is-active" : ""}`}
                key={marker.id}
                onClick={() => setSelectedId(marker.id)}
                style={{ left: `${marker.left}%`, top: `${marker.top}%` }}
                type="button"
              >
                <MapPin size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : null}
        <div
          className={`google-map ${showFallbackMap ? "is-hidden" : ""}`}
          ref={mapElementRef}
          role="application"
          aria-label="Google map of nearby events"
        />
        {mapError ? (
          <div className="map-error" role="status">
            <MapPin size={18} aria-hidden="true" />
            Local map preview is active. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable live Google Maps.
          </div>
        ) : null}

        {selectedEvent ? (
          <article className="event-detail-panel" aria-live="polite">
            <button
              type="button"
              className="icon-button event-detail-close"
              onClick={() => setSelectedId(null)}
              aria-label="Close event details"
            >
              <X size={16} aria-hidden="true" />
            </button>
            <span className="sport-badge">{sports.find((sportOption) => sportOption.id === selectedEvent.sportId)?.name ?? selectedEvent.sportId}</span>
            <h2>{selectedEvent.title}</h2>
            <p>{selectedEvent.description}</p>
            <div className="event-detail-meta">
              <Navigation size={16} aria-hidden="true" />
              <span>
                {selectedEvent.location.name} - {selectedEvent.location.address}
              </span>
            </div>
          </article>
        ) : null}
      </div>

      <div className="event-strip" aria-label="Visible events">
        {visibleEvents.map((event) => (
          <button
            key={event.id}
            type="button"
            className={`event-card-button ${selectedEvent?.id === event.id ? "is-active" : ""}`}
            onClick={() => setSelectedId(event.id)}
          >
            <span>{sports.find((sportOption) => sportOption.id === event.sportId)?.name ?? event.sportId}</span>
            <strong>{event.title}</strong>
            <small>{event.location.name}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function getFallbackMarkers(events: SportsEvent[]) {
  if (events.length === 0) {
    return [];
  }

  const lats = events.map((event) => event.location.coordinates.lat);
  const lngs = events.map((event) => event.location.coordinates.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = Math.max(maxLat - minLat, 0.001);
  const lngRange = Math.max(maxLng - minLng, 0.001);

  return events.map((event) => ({
    id: event.id,
    left: 14 + ((event.location.coordinates.lng - minLng) / lngRange) * 72,
    top: 86 - ((event.location.coordinates.lat - minLat) / latRange) * 72,
  }));
}
