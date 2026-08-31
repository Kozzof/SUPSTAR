import {
  NavLink,
  useNavigate,
} from 'react-router-dom';

import { clearToken } from '../api/api';

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        SUPSTAR
      </div>

      <nav className="navbar-links">
        <NavLink to="/places">
          Lieux
        </NavLink>

        <NavLink to="/map">
          Carte
        </NavLink>

        <NavLink to="/lists">
          Listes
        </NavLink>

        <NavLink to="/data">
          Import / Export
        </NavLink>

        <NavLink to="/profile">
          Profil
        </NavLink>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Déconnexion
        </button>
      </nav>
    </header>
  );
}