import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Link } from 'react-router-dom';

import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { apiRequest } from '../api/api';
import type {
  Place,
  SearchPlacesResult,
} from '../types';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface ViewportLoaderProps {
  onViewportChange: (
    coordinates: Coordinates,
    radiusKm: number,
  ) => void;
  onStartPointChange: (
    coordinates: Coordinates,
  ) => void;
}

function distanceKm(
  first: Coordinates,
  second: Coordinates,
): number {
  const earthRadius = 6371;

  const latitude1 =
    (first.latitude * Math.PI) / 180;

  const latitude2 =
    (second.latitude * Math.PI) / 180;

  const deltaLatitude =
    ((second.latitude -
      first.latitude) *
      Math.PI) /
    180;

  const deltaLongitude =
    ((second.longitude -
      first.longitude) *
      Math.PI) /
    180;

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(
        deltaLongitude / 2,
      ) **
        2;

  return (
    earthRadius *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    )
  );
}

function ViewportLoader({
  onViewportChange,
  onStartPointChange,
}: ViewportLoaderProps) {
  const map = useMapEvents({
    moveend() {
      loadViewport();
    },

    zoomend() {
      loadViewport();
    },

    click(event) {
      onStartPointChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  const loadViewport =
    useCallback(() => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      const northEast =
        bounds.getNorthEast();

      const centerCoordinates = {
        latitude: center.lat,
        longitude: center.lng,
      };

      const radius = Math.min(
        Math.max(
          distanceKm(
            centerCoordinates,
            {
              latitude:
                northEast.lat,
              longitude:
                northEast.lng,
            },
          ),
          1,
        ),
        500,
      );

      onViewportChange(
        centerCoordinates,
        radius,
      );
    }, [
      map,
      onViewportChange,
    ]);

  useEffect(() => {
    loadViewport();
  }, [loadViewport]);

  return null;
}

function FlyToPosition({
  position,
}: {
  position: Coordinates | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.flyTo(
      [
        position.latitude,
        position.longitude,
      ],
      14,
    );
  }, [map, position]);

  return null;
}

export default function MapPage() {
  const [places, setPlaces] =
    useState<Place[]>([]);

  const [userPosition, setUserPosition] =
    useState<Coordinates | null>(null);

  const [startPoint, setStartPoint] =
    useState<Coordinates | null>(null);

  const [category, setCategory] =
    useState('');

  const [minRating, setMinRating] =
    useState('');

  const [viewport, setViewport] =
    useState<{
      center: Coordinates;
      radiusKm: number;
    } | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadPlaces =
    useCallback(async () => {
      if (!viewport) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const params =
          new URLSearchParams();

        params.set(
          'latitude',
          String(
            viewport.center.latitude,
          ),
        );

        params.set(
          'longitude',
          String(
            viewport.center.longitude,
          ),
        );

        params.set(
          'radiusKm',
          String(viewport.radiusKm),
        );

        params.set('limit', '100');

        if (category.trim()) {
          params.set(
            'category',
            category.trim(),
          );
        }

        if (minRating) {
          params.set(
            'minRating',
            minRating,
          );
        }

        const response =
          await apiRequest<SearchPlacesResult>(
            `/places?${params.toString()}`,
          );

        setPlaces(response.items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Impossible de charger la carte.',
        );
      } finally {
        setLoading(false);
      }
    }, [
      viewport,
      category,
      minRating,
    ]);

  useEffect(() => {
    void loadPlaces();
  }, [loadPlaces]);

  function locateUser() {
    setError('');

    if (!navigator.geolocation) {
      setError(
        'La géolocalisation n’est pas disponible.',
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude,
        };

        setUserPosition(
          coordinates,
        );

        setStartPoint(
          coordinates,
        );
      },
      () => {
        setError(
          'Impossible de récupérer votre position.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  function createDirectionsUrl(
    place: Place,
  ): string {
    const destinationLatitude =
      place.location.coordinates[1];

    const destinationLongitude =
      place.location.coordinates[0];

    if (startPoint) {
      return (
        'https://www.openstreetmap.org/directions' +
        `?engine=fossgis_osrm_car` +
        `&route=${startPoint.latitude}%2C${startPoint.longitude}` +
        `%3B${destinationLatitude}%2C${destinationLongitude}`
      );
    }

    return (
      'https://www.openstreetmap.org/' +
      `?mlat=${destinationLatitude}` +
      `&mlon=${destinationLongitude}` +
      `#map=16/${destinationLatitude}/${destinationLongitude}`
    );
  }

  return (
    <main className="page map-page">
      <div className="page-header">
        <div>
          <h1>Carte</h1>

          <p>
            Explorez les lieux
            disponibles sur la carte.
          </p>
        </div>

        <button
          type="button"
          onClick={locateUser}
        >
          Me localiser
        </button>
      </div>

      <section className="panel map-toolbar">
        <label>
          Catégorie
          <input
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
            placeholder="Restaurant"
          />
        </label>

        <label>
          Note minimale
          <select
            value={minRating}
            onChange={(event) =>
              setMinRating(
                event.target.value,
              )
            }
          >
            <option value="">
              Toutes
            </option>

            <option value="3">
              3+
            </option>

            <option value="4">
              4+
            </option>

            <option value="4.5">
              4,5+
            </option>
          </select>
        </label>

        <div className="map-information">
          <strong>
            {places.length}
          </strong>{' '}
          lieu
          {places.length > 1
            ? 'x'
            : ''}{' '}
          affiché
          {places.length > 1
            ? 's'
            : ''}
        </div>

        <div className="map-information">
          {startPoint
            ? 'Point de départ sélectionné'
            : 'Cliquez sur la carte pour choisir un départ'}
        </div>
      </section>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {loading && (
        <p>
          Chargement des lieux...
        </p>
      )}

      <section className="map-container-wrapper">
        <MapContainer
          center={[
            48.8566,
            2.3522,
          ]}
          zoom={12}
          className="supstar-map"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ViewportLoader
            onViewportChange={(
              center,
              radiusKm,
            ) =>
              setViewport({
                center,
                radiusKm,
              })
            }
            onStartPointChange={
              setStartPoint
            }
          />

          <FlyToPosition
            position={userPosition}
          />

          <MarkerClusterGroup
            chunkedLoading
          >
            {places.map(
              (place) => (
                <Marker
                  key={place.id}
                  position={[
                    place.location
                      .coordinates[1],
                    place.location
                      .coordinates[0],
                  ]}
                >
                  <Popup>
                    <div className="map-popup">
                      <strong>
                        {place.name}
                      </strong>

                      <span>
                        {place.category}
                      </span>

                      <span>
                        {place.city}
                      </span>

                      <span>
                        {place.ratingAverage.toFixed(
                          1,
                        )}{' '}
                        ★ —{' '}
                        {place.reviewCount}{' '}
                        avis
                      </span>

                      <Link
                        to={`/places/${place.id}`}
                      >
                        Voir la fiche
                      </Link>

                      <a
                        href={createDirectionsUrl(
                          place,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Itinéraire
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ),
            )}
          </MarkerClusterGroup>

          {userPosition && (
            <Marker
              position={[
                userPosition.latitude,
                userPosition.longitude,
              ]}
            >
              <Popup>
                Votre position
              </Popup>
            </Marker>
          )}

          {startPoint &&
            (!userPosition ||
              startPoint.latitude !==
                userPosition.latitude ||
              startPoint.longitude !==
                userPosition.longitude) && (
              <Marker
                position={[
                  startPoint.latitude,
                  startPoint.longitude,
                ]}
              >
                <Popup>
                  Point de départ
                </Popup>
              </Marker>
            )}
        </MapContainer>
      </section>

      <p className="map-help">
        Déplacez ou zoomez la carte :
        les lieux de la zone affichée
        sont chargés automatiquement.
        Cliquez sur la carte pour choisir
        un point de départ.
      </p>
    </main>
  );
}