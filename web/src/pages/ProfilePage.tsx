import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import { apiRequest } from '../api/api';
import type { UserSettings } from '../types';

export default function ProfilePage() {
  const [settings, setSettings] =
    useState<UserSettings | null>(null);

  const [displayName, setDisplayName] =
    useState('');

  const [
    travelPreferences,
    setTravelPreferences,
  ] = useState('{}');

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response =
          await apiRequest<UserSettings>(
            '/users/me/settings',
          );

        setSettings(response);
        setDisplayName(
          response.displayName,
        );

        setTravelPreferences(
          JSON.stringify(
            response.travelPreferences,
            null,
            2,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Impossible de charger le profil.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  async function saveProfile(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    try {
      let preferences:
        Record<string, unknown>;

      try {
        preferences =
          JSON.parse(
            travelPreferences,
          ) as Record<
            string,
            unknown
          >;
      } catch {
        setError(
          'Les préférences doivent être un JSON valide.',
        );
        return;
      }

      await apiRequest(
        '/users/me',
        {
          method: 'PATCH',
          body: {
            displayName,
            travelPreferences:
              preferences,
          },
        },
      );

      setSuccess(
        'Profil enregistré.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de modifier le profil.',
      );
    }
  }

  async function changePassword(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    try {
      await apiRequest(
        '/users/me/password',
        {
          method: 'PATCH',
          body: {
            currentPassword,
            newPassword,
          },
        },
      );

      setCurrentPassword('');
      setNewPassword('');

      setSuccess(
        'Mot de passe modifié.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de modifier le mot de passe.',
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

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Profil</h1>

          <p>
            Gérez votre compte et vos
            préférences de voyage.
          </p>
        </div>
      </div>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {success && (
        <p className="success">
          {success}
        </p>
      )}

      <div className="profile-grid">
        <section className="panel">
          <h2>Informations</h2>

          <form
            className="form"
            onSubmit={saveProfile}
          >
            <label>
              Adresse e-mail
              <input
                value={
                  settings?.email ??
                  ''
                }
                disabled
              />
            </label>

            <label>
              Nom affiché
              <input
                value={displayName}
                onChange={(event) =>
                  setDisplayName(
                    event.target.value,
                  )
                }
                minLength={2}
                maxLength={80}
                required
              />
            </label>

            <label>
              Préférences de voyage
              <textarea
                rows={10}
                value={
                  travelPreferences
                }
                onChange={(event) =>
                  setTravelPreferences(
                    event.target.value,
                  )
                }
              />
            </label>

            <p className="field-help">
              Exemple :{" "}
              {'{"categories":["restaurant","museum"],"budget":"medium"}'}
            </p>

            <button type="submit">
              Enregistrer
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Connexion</h2>

          <dl className="account-info">
            <div>
              <dt>
                Connexion OAuth
              </dt>

              <dd>
                {settings?.oauthProvider ??
                  'Aucune'}
              </dd>
            </div>

            <div>
              <dt>
                Mot de passe local
              </dt>

              <dd>
                {settings?.hasPassword
                  ? 'Configuré'
                  : 'Non configuré'}
              </dd>
            </div>
          </dl>

          {settings?.hasPassword && (
            <form
              className="form"
              onSubmit={
                changePassword
              }
            >
              <h3>
                Modifier le mot de passe
              </h3>

              <label>
                Mot de passe actuel
                <input
                  type="password"
                  value={
                    currentPassword
                  }
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target
                        .value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Nouveau mot de passe
                <input
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target
                        .value,
                    )
                  }
                  required
                />
              </label>

              <button type="submit">
                Modifier
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}