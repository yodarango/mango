import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Drawer.css";

function Drawer({ isOpen, onClose }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [avatarId, setAvatarId] = useState(null);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const response = await fetch("/api/avatars");
        const avatars = await response.json();
        const userAvatar = avatars.find((a) => a.userId === user.id);
        if (userAvatar) {
          setAvatarId(userAvatar.id);
        }
      } catch (error) {
        console.error("Error fetching user avatar:", error);
      }
    };

    if (user.id) {
      fetchUserAvatar();
    }
  }, [user.id]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className='drawer-header'>
          <h2>
            <i className='fa-solid fa-bars'></i> Menu
          </h2>
          <button className='drawer-close-btn' onClick={onClose}>
            <i className='fa-solid fa-times'></i>
          </button>
        </div>

        <div className='drawer-content'>
          <div className='drawer-user-info'>
            <i className='fa-solid fa-user-circle'></i>
            <span>{user.name || "Guest"}</span>
          </div>

          <nav className='drawer-nav'>
            <Link to='/' className='drawer-link' onClick={onClose}>
              <i className='fa-solid fa-home'></i>
              <span>Home</span>
            </Link>

            <Link to='/store' className='drawer-link' onClick={onClose}>
              <i className='fa-solid fa-store'></i>
              <span>Store</span>
            </Link>

            {avatarId && (
              <Link
                to={`/avatar/${avatarId}`}
                className='drawer-link'
                onClick={onClose}
              >
                <i className='fa-solid fa-user'></i>
                <span>My Profile</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Drawer;
