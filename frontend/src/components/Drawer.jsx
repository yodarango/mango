import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "./NotificationProvider";
import "./Drawer.css";

function Drawer({ isOpen, onClose }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [avatarId, setAvatarId] = useState(null);
  const { unreadCount } = useNotifications();

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

            <Link to='/messages' className='drawer-link' onClick={onClose}>
              <i className='fa-solid fa-envelope'></i>
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className='notification-badge'>{unreadCount}</span>
              )}
            </Link>

            <Link to='/assignments' className='drawer-link' onClick={onClose}>
              <i className='fa-solid fa-clipboard-list'></i>
              <span>Assignments</span>
            </Link>

            <Link to='/resources' className='drawer-link' onClick={onClose}>
              <i className='fa-solid fa-book'></i>
              <span>Resources</span>
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

            {/* Admin-only links */}
            {user.role === "admin" && (
              <>
                <div className='drawer-divider'></div>
                <div className='drawer-section-title'>
                  <i className='fa-solid fa-crown'></i>
                  <span>Admin Panel</span>
                </div>

                <Link
                  to='/admin/create-notifications'
                  className='drawer-link admin-link'
                  onClick={onClose}
                >
                  <i className='fa-solid fa-bell'></i>
                  <span>Create Notifications</span>
                </Link>

                <Link
                  to='/admin/assignments'
                  className='drawer-link admin-link'
                  onClick={onClose}
                >
                  <i className='fa-solid fa-clipboard-list'></i>
                  <span>Assignments</span>
                </Link>

                <Link
                  to='/admin/create-assignment'
                  className='drawer-link admin-link'
                  onClick={onClose}
                >
                  <i className='fa-solid fa-plus-circle'></i>
                  <span>Create Assignment</span>
                </Link>

                <Link
                  to='/admin/assignments/create-daily-words'
                  className='drawer-link admin-link'
                  onClick={onClose}
                >
                  <i className='fa-solid fa-book'></i>
                  <span>Create Daily Words</span>
                </Link>

                <Link
                  to='/admin/messages'
                  className='drawer-link admin-link'
                  onClick={onClose}
                >
                  <i className='fa-solid fa-envelope'></i>
                  <span>Messages</span>
                </Link>

                <Link
                  to='/admin/games'
                  className='drawer-link admin-link'
                  onClick={onClose}
                >
                  <i className='fa-solid fa-chess-board'></i>
                  <span>Games</span>
                </Link>

                <Link
                  to='/admin/create-game'
                  className='drawer-link admin-link'
                  onClick={onClose}
                >
                  <i className='fa-solid fa-plus-circle'></i>
                  <span>Create Game</span>
                </Link>

                <Link
                  to='/admin/create-battle'
                  className='drawer-link admin-link'
                  onClick={onClose}
                >
                  <i className='fa-solid fa-swords'></i>
                  <span>Create Battle</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Drawer;
