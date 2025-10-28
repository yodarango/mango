import { useState, useEffect } from "react";
import "./AdminMessages.css";

function AdminMessages() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications/admin/all", {
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

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    setDeleting(notificationId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(notifications.filter((n) => n.id !== notificationId));
        if (selectedNotification?.id === notificationId) {
          setSelectedNotification(null);
        }
      } else {
        alert("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Error deleting notification");
    } finally {
      setDeleting(null);
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

  const totalNotifications = notifications.length;
  const readCount = notifications.filter((n) => n.isRead).length;
  const unreadCount = totalNotifications - readCount;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="admin-messages-container">
      <div className="admin-messages-header">
        <h1>
          <i className="fa-solid fa-envelope"></i> Message Management
        </h1>
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{totalNotifications}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Read:</span>
            <span className="stat-value read">{readCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unread:</span>
            <span className="stat-value unread">{unreadCount}</span>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-messages">
          <i className="fa-solid fa-inbox"></i>
          <h2>No Messages</h2>
          <p>No notifications have been sent yet.</p>
        </div>
      ) : (
        <div className="notifications-table">
          <div className="table-header">
            <div className="col-sent-to">Sent To</div>
            <div className="col-title">Title</div>
            <div className="col-status">Status</div>
            <div className="col-date">Sent</div>
            <div className="col-actions">Actions</div>
          </div>
          <div className="table-body">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-row ${
                  notification.isRead ? "read" : "unread"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="col-sent-to">
                  <i className="fa-solid fa-user"></i>
                  {notification.userName}
                </div>
                <div className="col-title">{notification.title}</div>
                <div className="col-status">
                  {notification.isRead ? (
                    <span className="status-badge read">
                      <i className="fa-solid fa-check"></i> Read
                    </span>
                  ) : (
                    <span className="status-badge unread">
                      <i className="fa-solid fa-circle"></i> Unread
                    </span>
                  )}
                </div>
                <div className="col-date">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </div>
                <div className="col-actions">
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(notification.id, e)}
                    disabled={deleting === notification.id}
                    title="Delete notification"
                  >
                    {deleting === notification.id ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-trash"></i>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedNotification && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNotification.title}</h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-info-row">
                <div className="info-item">
                  <label>
                    <i className="fa-solid fa-user"></i> Sent To:
                  </label>
                  <span>{selectedNotification.userName}</span>
                </div>
                <div className="info-item">
                  <label>
                    <i className="fa-solid fa-clock"></i> Sent:
                  </label>
                  <span>{formatDate(selectedNotification.createdAt)}</span>
                </div>
              </div>
              <div className="modal-info-row">
                <div className="info-item">
                  <label>
                    <i className="fa-solid fa-circle-check"></i> Status:
                  </label>
                  <span>
                    {selectedNotification.isRead ? (
                      <span className="status-badge read">
                        <i className="fa-solid fa-check"></i> Read
                      </span>
                    ) : (
                      <span className="status-badge unread">
                        <i className="fa-solid fa-circle"></i> Unread
                      </span>
                    )}
                  </span>
                </div>
                {selectedNotification.readAt && (
                  <div className="info-item">
                    <label>
                      <i className="fa-solid fa-eye"></i> Read At:
                    </label>
                    <span>{formatDate(selectedNotification.readAt)}</span>
                  </div>
                )}
              </div>
              <div className="message-content">
                <label>
                  <i className="fa-solid fa-message"></i> Message:
                </label>
                <p>{selectedNotification.message}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="delete-modal-btn"
                onClick={(e) => {
                  handleDelete(selectedNotification.id, e);
                  closeModal();
                }}
              >
                <i className="fa-solid fa-trash"></i> Delete Message
              </button>
              <button className="close-modal-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMessages;

