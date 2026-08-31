import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import DataPage from './pages/DataPage';
import ListsPage from './pages/ListsPage';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import PlaceDetailsPage from './pages/PlaceDetailsPage';
import PlacesListPage from './pages/PlacesListPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

function AppLayout() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/places"
          element={<PlacesListPage />}
        />

        <Route
          path="/places/:id"
          element={<PlaceDetailsPage />}
        />

        <Route
          path="/lists"
          element={<ListsPage />}
        />

        <Route
          path="/map"
          element={<MapPage />}
        />

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        <Route
          path="/data"
          element={<DataPage />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/places"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}