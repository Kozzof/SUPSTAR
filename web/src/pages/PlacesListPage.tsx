import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { apiRequest } from '../api/api';
import type {
  Place,
  SearchPlacesResult,
} from '../types';

interface CreatePlaceForm {
  name: string;
  address: string;
  city: string;
  country: string;
  category: string;
  description: string;
  priceLevel: string;
  tags: string;
  latitude: string;
  longitude: string;
}

const emptyPlaceForm: CreatePlaceForm = {
  name: '',
  address: '',
  city: '',
  country: 'France',
  category: '',
  description: '',
  priceLevel: '',
  tags: '',
  latitude: '',
  longitude: '',
};

export default function PlacesListPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState('');

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreatePlaceForm>(emptyPlaceForm);
  const [creating, setCreating] = useState(false);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set('search', search.trim());
      }

      if (category.trim()) {
        params.set('category', category.trim());
      }

      if (city.trim()) {
        params.set('city', city.trim());
      }

      if (minRating) {
        params.set('minRating', minRating);
      }

      if (maxPrice) {
        params.set('maxPrice', maxPrice);
      }

      if (status) {
        params.set('status', status);
      }

      params.set('page', String(page));
      params.set('limit', '12');

      const response =
        await apiRequest<SearchPlacesResult>(
          `/places?${params.toString()}`,
        );

      setPlaces(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les lieux.',
      );
    } finally {
      setLoading(false);
    }
  }, [
    search,
    category,
    city,
    minRating,
    maxPrice,
    status,
    page,
  ]);

  useEffect(() => {
    void loadPlaces();
  }, [loadPlaces]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();

    if (page === 1) {
      void loadPlaces();
    } else {
      setPage(1);
    }
  }

  function resetFilters() {
    setSearch('');
    setCategory('');
    setCity('');
    setMinRating('');
    setMaxPrice('');
    setStatus('');
    setPage(1);
  }

  async function createPlace(event: FormEvent) {
    event.preventDefault();

    setCreating(true);
    setError('');

    try {
      await apiRequest<Place>('/places', {
        method: 'POST',
        body: {
          name: createForm.name,
          address: createForm.address,
          city: createForm.city,
          country: createForm.country,
          category: createForm.category,
          description: createForm.description,
          priceLevel: createForm.priceLevel
            ? Number(createForm.priceLevel)
            : undefined,
          tags: createForm.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          latitude: Number(createForm.latitude),
          longitude: Number(createForm.longitude),
        },
      });

      setCreateForm(emptyPlaceForm);
      setShowCreate(false);
      setPage(1);

      await loadPlaces();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de créer le lieu.',
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Lieux</h1>
          <p>
            {total} lieu{total > 1 ? 'x' : ''} disponible
            {total > 1 ? 's' : ''}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate
            ? 'Fermer'
            : 'Ajouter un lieu'}
        </button>
      </div>

      {showCreate && (
        <section className="panel">
          <h2>Nouveau lieu</h2>

          <form
            className="place-form"
            onSubmit={createPlace}
          >
            <label>
              Nom
              <input
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    name: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Catégorie
              <input
                value={createForm.category}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    category: event.target.value,
                  })
                }
                placeholder="Restaurant"
                required
              />
            </label>

            <label>
              Adresse
              <input
                value={createForm.address}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    address: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Ville
              <input
                value={createForm.city}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    city: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Pays
              <input
                value={createForm.country}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    country: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Prix
              <select
                value={createForm.priceLevel}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    priceLevel: event.target.value,
                  })
                }
              >
                <option value="">
                  Non renseigné
                </option>
                <option value="1">€</option>
                <option value="2">€€</option>
                <option value="3">€€€</option>
                <option value="4">€€€€</option>
              </select>
            </label>

            <label>
              Latitude
              <input
                type="number"
                step="any"
                value={createForm.latitude}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    latitude: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Longitude
              <input
                type="number"
                step="any"
                value={createForm.longitude}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    longitude: event.target.value,
                  })
                }
                required
              />
            </label>

            <label className="full-width">
              Tags
              <input
                value={createForm.tags}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    tags: event.target.value,
                  })
                }
                placeholder="italien, terrasse, pizza"
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                rows={4}
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    description: event.target.value,
                  })
                }
                required
              />
            </label>

            <button
              type="submit"
              disabled={creating}
            >
              {creating
                ? 'Création...'
                : 'Créer le lieu'}
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <form
          className="filters"
          onSubmit={handleSearch}
        >
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <input
            placeholder="Catégorie"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          />

          <input
            placeholder="Ville"
            value={city}
            onChange={(event) =>
              setCity(event.target.value)
            }
          />

          <select
            value={minRating}
            onChange={(event) =>
              setMinRating(event.target.value)
            }
          >
            <option value="">
              Note minimale
            </option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4,5+</option>
          </select>

          <select
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(event.target.value)
            }
          >
            <option value="">
              Prix maximum
            </option>
            <option value="1">€</option>
            <option value="2">€€</option>
            <option value="3">€€€</option>
            <option value="4">€€€€</option>
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option value="">
              Tous les statuts
            </option>
            <option value="visited">
              Visités
            </option>
            <option value="wantToVisit">
              À visiter
            </option>
            <option value="favorite">
              Favoris
            </option>
          </select>

          <button type="submit">
            Rechercher
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={resetFilters}
          >
            Réinitialiser
          </button>
        </form>
      </section>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <section className="places-grid">
          {places.map((place) => (
            <Link
              key={place.id}
              to={`/places/${place.id}`}
              className="place-card"
            >
              <div className="place-card-top">
                <span className="category-badge">
                  {place.category}
                </span>

                <span>
                  {place.ratingAverage.toFixed(1)} ★
                </span>
              </div>

              <h2>{place.name}</h2>

              <p>
                {place.address}
                <br />
                {place.city}, {place.country}
              </p>

              <p className="place-description">
                {place.description}
              </p>

              <div className="place-card-footer">
                <span>
                  {place.priceLevel
                    ? '€'.repeat(place.priceLevel)
                    : 'Prix non renseigné'}
                </span>

                <span>
                  {place.reviewCount} avis
                </span>
              </div>
            </Link>
          ))}

          {places.length === 0 && (
            <p>
              Aucun lieu ne correspond à la recherche.
            </p>
          )}
        </section>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage((current) => current - 1)
            }
          >
            Précédent
          </button>

          <span>
            Page {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => current + 1)
            }
          >
            Suivant
          </button>
        </div>
      )}
    </main>
  );
}