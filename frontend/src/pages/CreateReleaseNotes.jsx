import { useState, useEffect } from "react";
import "./CreateReleaseNotes.css";

function CreateReleaseNotes() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(true); // Default to all users
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
    setSelectAll(!selectAll);
  };

  const handleUserToggle = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    if (selectedUsers.length === 0 && !selectAll) {
      alert("Please select at least one user or select all");
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/release-notes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: selectAll ? [] : selectedUsers,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);
        setMessage("");
        setSelectedUsers([]);
        setSelectAll(true);
      } else {
        alert("Failed to create release notes");
      }
    } catch (error) {
      console.error("Error creating release notes:", error);
      alert("Error creating release notes");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className='create-release-notes-container'>
      <div className='release-notes-header'>
        <h1>
          <i className='fa-solid fa-bullhorn'></i> Create Release Notes
        </h1>
        <p className='release-notes-subtitle'>
          Announce new features and updates to users
        </p>
      </div>

      <form className='release-note-form' onSubmit={handleSubmit}>
        <div className='form-section'>
          <h2>
            <i className='fa-solid fa-users'></i> Select Recipients
          </h2>

          <div className='select-all-container'>
            <label className='user-checkbox'>
              <input
                type='checkbox'
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <span className='checkbox-label'>
                <strong>All Users ({users.length})</strong>
              </span>
            </label>
          </div>

          <div className='users-grid'>
            {users.map((user) => (
              <label key={user.id} className='user-checkbox'>
                <input
                  type='checkbox'
                  checked={selectAll || selectedUsers.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                  disabled={selectAll}
                />
                <span className='checkbox-label'>
                  <i className='fa-solid fa-user'></i> {user.name}
                </span>
              </label>
            ))}
          </div>

          <div className='selected-count'>
            <i className='fa-solid fa-check-circle'></i>
            <span>
              {selectAll
                ? `All ${users.length} users selected`
                : `${selectedUsers.length} user(s) selected`}
            </span>
          </div>
        </div>

        <div className='form-section'>
          <h2>
            <i className='fa-solid fa-file-lines'></i> Release Note Content
          </h2>

          <div className='form-group'>
            <label htmlFor='message'>
              <i className='fa-solid fa-markdown'></i> Message (Markdown
              Supported)
            </label>
            <textarea
              id='message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Enter release note message (supports markdown formatting)'
              rows='12'
            ></textarea>
            <div className='markdown-hint'>
              <i className='fa-solid fa-info-circle'></i>
              Supports markdown: **bold**, *italic*, # headings, - lists,
              [links](url)
            </div>
          </div>
        </div>

        <button type='submit' className='send-btn' disabled={sending}>
          {sending ? (
            <>
              <i className='fa-solid fa-spinner fa-spin'></i> Creating...
            </>
          ) : (
            <>
              <i className='fa-solid fa-paper-plane'></i> Create Release Note
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateReleaseNotes;
