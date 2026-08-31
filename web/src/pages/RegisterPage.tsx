import {
  type FormEvent,
  useState,
} from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  apiRequest,
  setToken,
} from '../api/api';
import type { AuthResponse } from '../types';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [
    displayName,
    setDisplayName,
  ] = useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response =
        await apiRequest<AuthResponse>(
          '/auth/register',
          {
            method: 'POST',
            body: {
              displayName,
              email,
              password,
            },
          },
        );

      setToken(response.accessToken);

      navigate('/places');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Inscription impossible.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>SUPSTAR</h1>
        <h2>Créer un compte</h2>

        <form
          onSubmit={handleSubmit}
          className="form"
        >
          <label>
            Nom
            <input
              type="text"
              value={displayName}
              onChange={(event) =>
                setDisplayName(
                  event.target.value,
                )
              }
              minLength={2}
              required
            />
          </label>

          <label>
            Adresse e-mail
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              minLength={8}
              required
            />
          </label>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Création...'
              : 'Créer le compte'}
          </button>
        </form>

        <p>
          Déjà inscrit ?{' '}
          <Link to="/login">
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  );
}