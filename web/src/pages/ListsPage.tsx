import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { apiRequest } from '../api/api';
import type {
  ListMemberRole,
  Place,
  PlaceList,
  SearchPlacesResult,
} from '../types';

interface ListSummary {
  list: PlaceList;
  role: ListMemberRole;
}

interface ListMember {
  id: string;
  userId: string;
  role: ListMemberRole;
  createdAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface ListPlace {
  id: string;
  placeId: string;
  addedById: string | null;
  createdAt: string;
  place: Place;
}

interface ListComment {
  id: string;
  listId: string;
  userId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface ListDetails extends PlaceList {
  currentUserRole: ListMemberRole;
  members: ListMember[];
  places: ListPlace[];
  comments: ListComment[];
}

export default function ListsPage() {
  const [lists, setLists] =
    useState<ListSummary[]>([]);

  const [selectedList, setSelectedList] =
    useState<ListDetails | null>(null);

  const [availablePlaces, setAvailablePlaces] =
    useState<Place[]>([]);

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [memberEmail, setMemberEmail] =
    useState('');

  const [memberRole, setMemberRole] =
    useState<ListMemberRole>('reader');

  const [placeId, setPlaceId] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [comment, setComment] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const loadLists = useCallback(
    async () => {
      try {
        const response =
          await apiRequest<ListSummary[]>(
            '/lists',
          );

        setLists(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Impossible de charger les listes.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadAvailablePlaces =
    useCallback(async () => {
      try {
        const response =
          await apiRequest<SearchPlacesResult>(
            '/places?limit=100',
          );

        setAvailablePlaces(
          response.items,
        );
      } catch {
        // La page reste utilisable sans ce sélecteur.
      }
    }, []);

  async function openList(
    listId: string,
  ) {
    setError('');

    try {
      const response =
        await apiRequest<ListDetails>(
          `/lists/${listId}`,
        );

      setSelectedList(response);
      setSearch('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger la liste.',
      );
    }
  }

  useEffect(() => {
    void loadLists();
    void loadAvailablePlaces();
  }, [
    loadLists,
    loadAvailablePlaces,
  ]);

  async function createList(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError('');

    try {
      const list =
        await apiRequest<PlaceList>(
          '/lists',
          {
            method: 'POST',
            body: {
              name,
              description:
                description ||
                undefined,
            },
          },
        );

      setName('');
      setDescription('');

      await loadLists();
      await openList(list.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de créer la liste.',
      );
    }
  }

  async function updateList(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!selectedList) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}`,
        {
          method: 'PATCH',
          body: {
            name:
              selectedList.name,
            description:
              selectedList.description ??
              '',
          },
        },
      );

      await loadLists();
      await openList(
        selectedList.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de modifier la liste.',
      );
    }
  }

  async function deleteList() {
    if (
      !selectedList ||
      !window.confirm(
        'Supprimer cette liste ?',
      )
    ) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}`,
        {
          method: 'DELETE',
        },
      );

      setSelectedList(null);

      await loadLists();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer la liste.',
      );
    }
  }

  async function addPlace(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !selectedList ||
      !placeId
    ) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}/places`,
        {
          method: 'POST',
          body: {
            placeId,
          },
        },
      );

      setPlaceId('');

      await openList(
        selectedList.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’ajouter le lieu.',
      );
    }
  }

  async function removePlace(
    targetPlaceId: string,
  ) {
    if (!selectedList) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}/places/${targetPlaceId}`,
        {
          method: 'DELETE',
        },
      );

      await openList(
        selectedList.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de retirer le lieu.',
      );
    }
  }

  async function addMember(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!selectedList) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}/members`,
        {
          method: 'POST',
          body: {
            email: memberEmail,
            role: memberRole,
          },
        },
      );

      setMemberEmail('');
      setMemberRole('reader');

      await openList(
        selectedList.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’ajouter le membre.',
      );
    }
  }

  async function changeMemberRole(
    memberId: string,
    role: ListMemberRole,
  ) {
    if (!selectedList) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}/members/${memberId}`,
        {
          method: 'PATCH',
          body: {
            role,
          },
        },
      );

      await openList(
        selectedList.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de modifier le rôle.',
      );
    }
  }

  async function removeMember(
    memberId: string,
  ) {
    if (!selectedList) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}/members/${memberId}`,
        {
          method: 'DELETE',
        },
      );

      await openList(
        selectedList.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de retirer le membre.',
      );
    }
  }

  async function addComment(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !selectedList ||
      !comment.trim()
    ) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}/comments`,
        {
          method: 'POST',
          body: {
            comment:
              comment.trim(),
          },
        },
      );

      setComment('');

      await openList(
        selectedList.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’ajouter le commentaire.',
      );
    }
  }

  async function removeComment(
    commentId: string,
  ) {
    if (!selectedList) {
      return;
    }

    if (
      !window.confirm(
        'Supprimer ce commentaire ?',
      )
    ) {
      return;
    }

    setError('');

    try {
      await apiRequest(
        `/lists/${selectedList.id}/comments/${commentId}`,
        {
          method: 'DELETE',
        },
      );

      await openList(
        selectedList.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer le commentaire.',
      );
    }
  }

  const filteredPlaces =
    selectedList?.places.filter(
      ({ place }) => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return true;
        }

        return (
          place.name
            .toLowerCase()
            .includes(term) ||
          place.city
            .toLowerCase()
            .includes(term) ||
          place.category
            .toLowerCase()
            .includes(term) ||
          place.tags.some(
            (tag) =>
              tag
                .toLowerCase()
                .includes(term),
          )
        );
      },
    ) ?? [];

  const canEdit =
    selectedList?.currentUserRole ===
      'creator' ||
    selectedList?.currentUserRole ===
      'editor';

  const canComment =
    selectedList?.currentUserRole ===
      'creator' ||
    selectedList?.currentUserRole ===
      'editor' ||
    selectedList?.currentUserRole ===
      'commenter';

  const isCreator =
    selectedList?.currentUserRole ===
    'creator';

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Listes</h1>

          <p>
            Organisez et partagez vos
            lieux.
          </p>
        </div>
      </div>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <div className="lists-layout">
        <aside>
          <section className="panel">
            <h2>Nouvelle liste</h2>

            <form
              className="form"
              onSubmit={createList}
            >
              <label>
                Nom
                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                />
              </label>

              <button type="submit">
                Créer
              </button>
            </form>
          </section>

          <section className="panel">
            <h2>Mes listes</h2>

            {loading ? (
              <p>Chargement...</p>
            ) : (
              <div className="lists-menu">
                {lists.map(
                  ({ list, role }) => (
                    <button
                      key={list.id}
                      type="button"
                      className={
                        selectedList?.id ===
                        list.id
                          ? 'list-menu-item active'
                          : 'list-menu-item'
                      }
                      onClick={() =>
                        void openList(
                          list.id,
                        )
                      }
                    >
                      <strong>
                        {list.name}
                      </strong>

                      <span>
                        {role}
                      </span>
                    </button>
                  ),
                )}

                {lists.length === 0 && (
                  <p>
                    Aucune liste.
                  </p>
                )}
              </div>
            )}
          </section>
        </aside>

        <section>
          {!selectedList ? (
            <div className="panel">
              <h2>
                Sélectionnez une liste
              </h2>

              <p>
                Choisissez une liste
                dans la colonne de
                gauche.
              </p>
            </div>
          ) : (
            <>
              <section className="panel">
                <div className="list-title-row">
                  <div>
                    <h2>
                      {selectedList.name}
                    </h2>

                    <span className="role-badge">
                      {
                        selectedList.currentUserRole
                      }
                    </span>
                  </div>

                  {isCreator && (
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        void deleteList()
                      }
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                {canEdit ? (
                  <form
                    className="form"
                    onSubmit={updateList}
                  >
                    <label>
                      Nom
                      <input
                        value={
                          selectedList.name
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedList({
                            ...selectedList,
                            name:
                              event
                                .target
                                .value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Description
                      <textarea
                        rows={3}
                        value={
                          selectedList.description ??
                          ''
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedList({
                            ...selectedList,
                            description:
                              event
                                .target
                                .value,
                          })
                        }
                      />
                    </label>

                    <button type="submit">
                      Enregistrer
                    </button>
                  </form>
                ) : (
                  <p>
                    {selectedList.description ||
                      'Aucune description.'}
                  </p>
                )}
              </section>

              <section className="panel">
                <h2>
                  Lieux de la liste
                </h2>

                <input
                  placeholder="Rechercher dans la liste..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                />

                {canEdit && (
                  <form
                    className="inline-form"
                    onSubmit={addPlace}
                  >
                    <select
                      value={placeId}
                      onChange={(event) =>
                        setPlaceId(
                          event.target.value,
                        )
                      }
                      required
                    >
                      <option value="">
                        Choisir un lieu
                      </option>

                      {availablePlaces.map(
                        (place) => (
                          <option
                            key={place.id}
                            value={place.id}
                          >
                            {place.name} —{' '}
                            {place.city}
                          </option>
                        ),
                      )}
                    </select>

                    <button type="submit">
                      Ajouter
                    </button>
                  </form>
                )}

                <div className="list-places">
                  {filteredPlaces.map(
                    ({ place }) => (
                      <article
                        key={place.id}
                        className="list-place-row"
                      >
                        <div>
                          <strong>
                            {place.name}
                          </strong>

                          <span>
                            {place.category}
                            {' · '}
                            {place.city}
                          </span>
                        </div>

                        <div>
                          <span>
                            {place.ratingAverage.toFixed(
                              1,
                            )}{' '}
                            ★
                          </span>

                          {canEdit && (
                            <button
                              type="button"
                              className="small-danger-button"
                              onClick={() =>
                                void removePlace(
                                  place.id,
                                )
                              }
                            >
                              Retirer
                            </button>
                          )}
                        </div>
                      </article>
                    ),
                  )}

                  {filteredPlaces.length ===
                    0 && (
                    <p>
                      Aucun lieu dans
                      cette liste.
                    </p>
                  )}
                </div>
              </section>

              <section className="panel">
                <h2>Commentaires</h2>

                {canComment && (
                  <form
                    className="list-comment-form"
                    onSubmit={addComment}
                  >
                    <textarea
                      rows={3}
                      placeholder="Écrire un commentaire..."
                      value={comment}
                      onChange={(event) =>
                        setComment(
                          event.target.value,
                        )
                      }
                      required
                    />

                    <button type="submit">
                      Publier
                    </button>
                  </form>
                )}

                <div className="list-comments">
                  {selectedList.comments.map(
                    (listComment) => (
                      <article
                        key={listComment.id}
                        className="list-comment"
                      >
                        <div className="list-comment-header">
                          <div>
                            <strong>
                              {
                                listComment
                                  .user
                                  .displayName
                              }
                            </strong>

                            <span>
                              {new Date(
                                listComment.createdAt,
                              ).toLocaleString(
                                'fr-FR',
                              )}
                            </span>
                          </div>

                          {(isCreator ||
                            selectedList.members.some(
                              (member) =>
                                member.userId ===
                                  listComment.userId &&
                                member.userId ===
                                  selectedList.members.find(
                                    (
                                      currentMember,
                                    ) =>
                                      currentMember.role ===
                                      selectedList.currentUserRole,
                                  )
                                    ?.userId,
                            )) && (
                            <button
                              type="button"
                              className="small-danger-button"
                              onClick={() =>
                                void removeComment(
                                  listComment.id,
                                )
                              }
                            >
                              Supprimer
                            </button>
                          )}
                        </div>

                        <p>
                          {
                            listComment.comment
                          }
                        </p>
                      </article>
                    ),
                  )}

                  {selectedList.comments.length ===
                    0 && (
                    <p>
                      Aucun commentaire.
                    </p>
                  )}
                </div>
              </section>

              <section className="panel">
                <h2>Membres</h2>

                {isCreator && (
                  <form
                    className="inline-form"
                    onSubmit={addMember}
                  >
                    <input
                      type="email"
                      placeholder="Adresse e-mail"
                      value={memberEmail}
                      onChange={(event) =>
                        setMemberEmail(
                          event.target
                            .value,
                        )
                      }
                      required
                    />

                    <select
                      value={memberRole}
                      onChange={(event) =>
                        setMemberRole(
                          event.target
                            .value as ListMemberRole,
                        )
                      }
                    >
                      <option value="editor">
                        Éditeur
                      </option>

                      <option value="commenter">
                        Commentateur
                      </option>

                      <option value="reader">
                        Lecteur
                      </option>
                    </select>

                    <button type="submit">
                      Ajouter
                    </button>
                  </form>
                )}

                <div className="members-list">
                  {selectedList.members.map(
                    (member) => (
                      <article
                        key={member.id}
                        className="member-row"
                      >
                        <div>
                          <strong>
                            {
                              member.user
                                .displayName
                            }
                          </strong>

                          <span>
                            {
                              member.user
                                .email
                            }
                          </span>
                        </div>

                        <div className="member-actions">
                          {isCreator &&
                          member.role !==
                            'creator' ? (
                            <>
                              <select
                                value={
                                  member.role
                                }
                                onChange={(
                                  event,
                                ) =>
                                  void changeMemberRole(
                                    member.id,
                                    event
                                      .target
                                      .value as ListMemberRole,
                                  )
                                }
                              >
                                <option value="editor">
                                  Éditeur
                                </option>

                                <option value="commenter">
                                  Commentateur
                                </option>

                                <option value="reader">
                                  Lecteur
                                </option>
                              </select>

                              <button
                                type="button"
                                className="small-danger-button"
                                onClick={() =>
                                  void removeMember(
                                    member.id,
                                  )
                                }
                              >
                                Retirer
                              </button>
                            </>
                          ) : (
                            <span className="role-badge">
                              {member.role}
                            </span>
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}