import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Avatars from "./pages/Avatars";
import AvatarProfile from "./pages/AvatarProfile";
import Store from "./pages/Store";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Drawer from "./components/Drawer";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <div className='app'>
      <nav className='navbar'>
        <h1>Spanish Quest </h1>
        {!isLoginPage && user && (
          <div className='navbar-user'>
            <span className='user-name'>
              <i className='fa-solid fa-user'></i> {user.name}
            </span>
            <button onClick={handleLogout} className='logout-btn'>
              <i className='fa-solid fa-right-from-bracket'></i> Logout
            </button>
            <button onClick={toggleDrawer} className='menu-btn'>
              <i className='fa-solid fa-bars'></i>
            </button>
          </div>
        )}
      </nav>

      {/* Drawer Menu */}
      {!isLoginPage && user && (
        <Drawer isOpen={drawerOpen} onClose={closeDrawer} />
      )}

      <main className='main-content'>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Avatars />
              </ProtectedRoute>
            }
          />
          <Route
            path='/avatar/:id'
            element={
              <ProtectedRoute>
                <AvatarProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path='/store'
            element={
              <ProtectedRoute>
                <Store />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
