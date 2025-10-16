import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useNotifications } from "../components/NotificationProvider";
import "./Messages.css";

function Messages() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { refreshUnreadCount } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setNotifications(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);

    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update local state
        setNotifications(
          notifications.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );

        // Refresh unread count
        refreshUnreadCount();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className='messages-container'>
      <div className='messages-header'>
        <h1>
          <i className='fa-solid fa-envelope'></i> Messages
        </h1>
        <p className='messages-subtitle'>
          {unreadCount > 0
            ? `You have ${unreadCount} unread message${
                unreadCount > 1 ? "s" : ""
              }`
            : "All messages read"}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className='empty-messages'>
          <i className='fa-solid fa-inbox'></i>
          <h2>No Messages</h2>
          <p>You don't have any messages yet.</p>
        </div>
      ) : (
        <div className='notifications-list'>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.isRead ? "read" : "unread"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className='notification-icon'>
                {notification.isRead ? (
                  <i className='fa-solid fa-envelope-open'></i>
                ) : (
                  <i className='fa-solid fa-envelope'></i>
                )}
              </div>
              <div className='notification-content'>
                <h3>{notification.title}</h3>
                <p className='notification-preview'>
                  {notification.message.substring(0, 100)}
                  {notification.message.length > 100 ? "..." : ""}
                </p>
                <div className='notification-meta'>
                  <span className='notification-date'>
                    <i className='fa-solid fa-clock'></i>{" "}
                    {formatDate(notification.createdAt)}
                  </span>
                  {!notification.isRead && (
                    <span className='unread-badge'>
                      <i className='fa-solid fa-circle'></i> New
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing full notification */}
      {selectedNotification && (
        <>
          <div className='modal-overlay' onClick={closeModal}></div>
          <div className='notification-modal'>
            <div className='modal-header'>
              <h2>{selectedNotification.title}</h2>
              <button className='modal-close-btn' onClick={closeModal}>
                <i className='fa-solid fa-times'></i>
              </button>
            </div>
            <div className='modal-body'>
              <div className='modal-message'>
                <ReactMarkdown>{selectedNotification.message}</ReactMarkdown>
              </div>
              <div className='modal-footer'>
                <span className='modal-date'>
                  <i className='fa-solid fa-calendar'></i>{" "}
                  {formatDate(selectedNotification.createdAt)}
                </span>
                {selectedNotification.isRead && selectedNotification.readAt && (
                  <span className='modal-read-date'>
                    <i className='fa-solid fa-check-double'></i> Read on{" "}
                    {formatDate(selectedNotification.readAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Messages;
