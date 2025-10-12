import { useState, useEffect } from "react";
import "./CreateNotifications.css";

function CreateNotifications() {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStudents(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleStudentToggle = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert("Please enter both title and message");
      return;
    }

    if (selectedStudents.length === 0 && !selectAll) {
      alert("Please select at least one student");
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: selectAll ? [] : selectedStudents,
          title: title,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);
        setTitle("");
        setMessage("");
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
        alert("Failed to send notifications");
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      alert("Error sending notifications");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="create-notifications-container">
      <div className="notifications-header">
        <h1>
          <i className="fa-solid fa-bell"></i> Create Notifications
        </h1>
        <p className="notifications-subtitle">
          Send notifications to students
        </p>
      </div>

      <form className="notification-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>
            <i className="fa-solid fa-users"></i> Select Recipients
          </h2>

          <div className="select-all-container">
            <label className="student-checkbox">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <span className="checkbox-label">
                <strong>Select All Students ({students.length})</strong>
              </span>
            </label>
          </div>

          <div className="students-grid">
            {students.map((student) => (
              <label key={student.id} className="student-checkbox">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                  disabled={selectAll}
                />
                <span className="checkbox-label">
                  <i className="fa-solid fa-user"></i> {student.name}
                </span>
              </label>
            ))}
          </div>

          <div className="selected-count">
            <i className="fa-solid fa-check-circle"></i>
            <span>
              {selectAll
                ? `All ${students.length} students selected`
                : `${selectedStudents.length} student(s) selected`}
            </span>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <i className="fa-solid fa-envelope"></i> Notification Content
          </h2>

          <div className="form-group">
            <label htmlFor="title">
              <i className="fa-solid fa-heading"></i> Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">
              <i className="fa-solid fa-message"></i> Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows="6"
              maxLength="500"
            ></textarea>
            <div className="char-count">{message.length}/500 characters</div>
          </div>
        </div>

        <button type="submit" className="send-btn" disabled={sending}>
          {sending ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Sending...
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane"></i> Send Notification
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateNotifications;

