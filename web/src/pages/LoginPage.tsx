import {
  type FormEvent,
  useState,
} from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  API_URL,
  apiRequest,
  setToken,
} from '../api/api';
import type { AuthResponse } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();

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
          '/auth/login',
          {
            method: 'POST',
            body: {
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
          : 'Connexion impossible.',
      );
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogle() {
    window.location.href =
      `${API_URL}/auth/google`;
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>SUPSTAR</h1>
        <h2>Connexion</h2>

        <form
          onSubmit={handleSubmit}
          className="form"
        >
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
              ? 'Connexion...'
              : 'Se connecter'}
          </button>
        </form>

        <button
          type="button"
          className="secondary-button"
          onClick={loginWithGoogle}
        >
          Continuer avec Google
        </button>

        <p>
          Pas encore de compte ?{' '}
          <Link to="/register">
            Créer un compte
          </Link>
        </p>
      </section>
    </main>
  );
}