import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { apiRequest } from '../api/api';
import type {
  Place,
  PlacePhoto,
  PlaceStatus,
  Review,
  User,
} from '../types';

interface ReviewForm {
  rating: string;
  comment: string;
}

interface PhotoForm {
  url: string;
  caption: string;
}

export default function PlaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] =
    useState<Place | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [status, setStatus] =
    useState<PlaceStatus | null>(null);

  const [photos, setPhotos] =
    useState<PlacePhoto[]>([]);

  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [reviewForm, setReviewForm] =
    useState<ReviewForm>({
      rating: '5',
      comment: '',
    });

  const [photoForm, setPhotoForm] =
    useState<PhotoForm>({
      url: '',
      caption: '',
    });

  const [savingReview, setSavingReview] =
    useState(false);

  const [savingPhoto, setSavingPhoto] =
    useState(false);

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [
        placeResponse,
        reviewsResponse,
        statusResponse,
        photosResponse,
        userResponse,
      ] = await Promise.all([
        apiRequest<Place>(
          `/places/${id}`,
        ),

        apiRequest<Review[]>(
          `/places/${id}/reviews`,
        ),

        apiRequest<PlaceStatus | null>(
          `/places/${id}/status`,
        ),

        apiRequest<PlacePhoto[]>(
          `/places/${id}/photos`,
        ),

        apiRequest<User>(
          '/auth/me',
        ),
      ]);

      setPlace(placeResponse);
      setReviews(reviewsResponse);
      setStatus(statusResponse);
      setPhotos(photosResponse);
      setCurrentUser(userResponse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger le lieu.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const myReview =
    reviews.find(
      (review) =>
        review.userId === currentUser?.id,
    ) ?? null;

  const isOwner =
    place?.createdById === currentUser?.id;

  async function updateStatus(
    field:
      | 'visited'
      | 'wantToVisit'
      | 'favorite',
    value: boolean,
  ) {
    if (!id) {
      return;
    }

    setError('');

    try {
      const response =
        await apiRequest<PlaceStatus>(
          `/places/${id}/status`,
          {
            method: 'PATCH',
            body: {
              [field]: value,
            },
          },
        );

      setStatus(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de modifier le statut.',
      );
    }
  }

  async function saveReview(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!id) {
      return;
    }

    setSavingReview(true);
    setError('');

    try {
      const body = {
        rating: Number(
          reviewForm.rating,
        ),
        comment:
          reviewForm.comment,
      };

      if (myReview) {
        await apiRequest(
          `/places/${id}/reviews/${myReview.id}`,
          {
            method: 'PATCH',
            body,
          },
        );
      } else {
        await apiRequest(
          `/places/${id}/reviews`,
          {
            method: 'POST',
            body,
          },
        );
      }

      setReviewForm({
        rating: '5',
        comment: '',
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer l'avis.",
      );
    } finally {
      setSavingReview(false);
    }
  }

  async function editMyReview() {
    if (!myReview) {
      return;
    }

    setReviewForm({
      rating: String(
        myReview.rating,
      ),
      comment:
        myReview.comment,
    });

    document
      .getElementById('review-form')
      ?.scrollIntoView({
        behavior: 'smooth',
      });
  }

  async function deleteMyReview() {
    if (
      !id ||
      !myReview ||
      !window.confirm(
        'Supprimer votre avis ?',
      )
    ) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/places/${id}/reviews/${myReview.id}`,
        {
          method: 'DELETE',
        },
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer l'avis.",
      );
    }
  }

  async function addPhoto(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!id) {
      return;
    }

    setSavingPhoto(true);
    setError('');

    try {
      await apiRequest(
        `/places/${id}/photos`,
        {
          method: 'POST',
          body: {
            url: photoForm.url,
            caption:
              photoForm.caption ||
              undefined,
          },
        },
      );

      setPhotoForm({
        url: '',
        caption: '',
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’ajouter la photo.',
      );
    } finally {
      setSavingPhoto(false);
    }
  }

  async function deletePhoto(
    photoId: string,
  ) {
    if (
      !id ||
      !window.confirm(
        'Supprimer cette photo ?',
      )
    ) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/places/${id}/photos/${photoId}`,
        {
          method: 'DELETE',
        },
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer la photo.',
      );
    }
  }

  async function deletePlace() {
    if (
      !id ||
      !window.confirm(
        'Supprimer définitivement ce lieu ?',
      )
    ) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/places/${id}`,
        {
          method: 'DELETE',
        },
      );

      navigate('/places');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer le lieu.',
      );
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p>Chargement...</p>
      </main>
    );
  }

  if (!place) {
    return (
      <main className="page">
        <p className="error">
          {error || 'Lieu introuvable.'}
        </p>

        <Link to="/places">
          Retour aux lieux
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <Link
        to="/places"
        className="back-link"
      >
        ← Retour aux lieux
      </Link>

      <div className="place-details-header">
        <div>
          <span className="category-badge">
            {place.category}
          </span>

          <h1>{place.name}</h1>

          <p>
            {place.address}
            <br />
            {place.city}, {place.country}
          </p>
        </div>

        <div className="place-score">
          <strong>
            {place.ratingAverage.toFixed(1)} ★
          </strong>

          <span>
            {place.reviewCount} avis
          </span>
        </div>
      </div>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <section className="panel">
        <h2>Informations</h2>

        <p>
          {place.description}
        </p>

        <div className="place-meta">
          <span>
            <strong>Prix :</strong>{' '}
            {place.priceLevel
              ? '€'.repeat(
                  place.priceLevel,
                )
              : 'Non renseigné'}
          </span>

          <span>
            <strong>Note :</strong>{' '}
            {place.ratingAverage.toFixed(1)}
            /5
          </span>
        </div>

        {place.tags.length > 0 && (
          <div className="tags">
            {place.tags.map(
              (tag) => (
                <span
                  key={tag}
                  className="tag"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        )}

        <p className="coordinates">
          GPS :{' '}
          {place.location.coordinates[1]},{' '}
          {place.location.coordinates[0]}
        </p>

        {isOwner && (
          <button
            type="button"
            className="danger-button"
            onClick={() =>
              void deletePlace()
            }
          >
            Supprimer le lieu
          </button>
        )}
      </section>

      <section className="panel">
        <h2>Mon statut</h2>

        <div className="status-buttons">
          <button
            type="button"
            className={
              status?.visited
                ? 'status-button active'
                : 'status-button'
            }
            onClick={() =>
              void updateStatus(
                'visited',
                !status?.visited,
              )
            }
          >
            ✓ Visité
          </button>

          <button
            type="button"
            className={
              status?.wantToVisit
                ? 'status-button active'
                : 'status-button'
            }
            onClick={() =>
              void updateStatus(
                'wantToVisit',
                !status?.wantToVisit,
              )
            }
          >
            À visiter
          </button>

          <button
            type="button"
            className={
              status?.favorite
                ? 'status-button active'
                : 'status-button'
            }
            onClick={() =>
              void updateStatus(
                'favorite',
                !status?.favorite,
              )
            }
          >
            ★ Favori
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Photos</h2>

        {photos.length > 0 ? (
          <div className="photo-grid">
            {photos.map(
              (photo) => (
                <article
                  key={photo.id}
                  className="photo-card"
                >
                  <img
                    src={photo.url}
                    alt={
                      photo.caption ??
                      place.name
                    }
                  />

                  {photo.caption && (
                    <p>
                      {photo.caption}
                    </p>
                  )}

                  {isOwner && (
                    <button
                      type="button"
                      className="small-danger-button"
                      onClick={() =>
                        void deletePhoto(
                          photo.id,
                        )
                      }
                    >
                      Supprimer
                    </button>
                  )}
                </article>
              ),
            )}
          </div>
        ) : (
          <p>
            Aucune photo pour ce lieu.
          </p>
        )}

        {isOwner && (
          <form
            className="photo-form"
            onSubmit={addPhoto}
          >
            <h3>Ajouter une photo</h3>

            <input
              type="url"
              placeholder="https://..."
              value={photoForm.url}
              onChange={(event) =>
                setPhotoForm({
                  ...photoForm,
                  url: event.target.value,
                })
              }
              required
            />

            <input
              placeholder="Légende"
              value={photoForm.caption}
              onChange={(event) =>
                setPhotoForm({
                  ...photoForm,
                  caption:
                    event.target.value,
                })
              }
            />

            <button
              type="submit"
              disabled={savingPhoto}
            >
              {savingPhoto
                ? 'Ajout...'
                : 'Ajouter'}
            </button>
          </form>
        )}
      </section>

      <section
        className="panel"
        id="review-form"
      >
        <h2>
          {myReview
            ? 'Mon avis'
            : 'Donner mon avis'}
        </h2>

        {myReview && (
          <div className="my-review-actions">
            <p>
              Votre note actuelle :{' '}
              <strong>
                {myReview.rating}/5
              </strong>
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                void editMyReview()
              }
            >
              Modifier
            </button>

            <button
              type="button"
              className="danger-button"
              onClick={() =>
                void deleteMyReview()
              }
            >
              Supprimer
            </button>
          </div>
        )}

        <form
          className="review-form"
          onSubmit={saveReview}
        >
          <label>
            Note
            <select
              value={
                reviewForm.rating
              }
              onChange={(event) =>
                setReviewForm({
                  ...reviewForm,
                  rating:
                    event.target.value,
                })
              }
            >
              <option value="5">
                5 - Excellent
              </option>
              <option value="4">
                4 - Très bien
              </option>
              <option value="3">
                3 - Bien
              </option>
              <option value="2">
                2 - Moyen
              </option>
              <option value="1">
                1 - Mauvais
              </option>
            </select>
          </label>

          <label>
            Commentaire
            <textarea
              rows={4}
              value={
                reviewForm.comment
              }
              onChange={(event) =>
                setReviewForm({
                  ...reviewForm,
                  comment:
                    event.target.value,
                })
              }
              required
            />
          </label>

          <button
            type="submit"
            disabled={savingReview}
          >
            {savingReview
              ? 'Enregistrement...'
              : myReview
                ? 'Enregistrer'
                : 'Publier'}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>
          Avis ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p>
            Aucun avis pour le moment.
          </p>
        ) : (
          <div className="reviews-list">
            {reviews.map(
              (review) => (
                <article
                  key={review.id}
                  className="review-card"
                >
                  <div className="review-header">
                    <strong>
                      {review.rating}/5 ★
                    </strong>

                    <span>
                      {new Date(
                        review.createdAt,
                      ).toLocaleDateString(
                        'fr-FR',
                      )}
                    </span>
                  </div>

                  <p>
                    {review.comment}
                  </p>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}