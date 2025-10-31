import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAssignments.css";

function AdminAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState("all"); // all, completed, pending

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch all assignments
      const assignmentsRes = await fetch("/api/assignments/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const assignmentsData = await assignmentsRes.json();

      // Fetch students
      const studentsRes = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentsData = await studentsRes.json();

      // Create student lookup map
      const studentMap = {};
      studentsData.forEach((s) => {
        studentMap[s.id] = s;
      });

      setAssignments(assignmentsData || []);
      setStudents(studentMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId, assignmentName, studentName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${assignmentName}" for ${studentName}?`
      )
    ) {
      return;
    }

    setDeleting(assignmentId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setAssignments(assignments.filter((a) => a.id !== assignmentId));
      } else {
        alert("Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Error deleting assignment");
    } finally {
      setDeleting(null);
    }
  };

  const getFilteredAssignments = () => {
    if (filter === "completed") {
      return assignments.filter((a) => a.completed);
    } else if (filter === "pending") {
      return assignments.filter((a) => !a.completed);
    }
    return assignments;
  };

  const getStatusBadge = (assignment) => {
    if (assignment.completed) {
      return (
        <span className='status-badge completed'>
          <i className='fa-solid fa-check-circle'></i> Completed
        </span>
      );
    }
    return (
      <span className='status-badge pending'>
        <i className='fa-solid fa-clock'></i> Pending
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading assignments...</p>
      </div>
    );
  }

  const filteredAssignments = getFilteredAssignments();
  const completedCount = assignments.filter((a) => a.completed).length;
  const pendingCount = assignments.filter((a) => !a.completed).length;

  return (
    <div className='admin-assignments-container'>
      <div className='assignments-header'>
        <div className='header-content'>
          <h1>
            <i className='fa-solid fa-clipboard-list'></i> Assignments
            Management
          </h1>
          <div className='stats-row'>
            <div className='stat-item'>
              <span className='stat-label'>Total:</span>
              <span className='stat-value'>{assignments.length}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Completed:</span>
              <span className='stat-value completed'>{completedCount}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Pending:</span>
              <span className='stat-value pending'>{pendingCount}</span>
            </div>
          </div>
        </div>
        <button
          className='create-btn'
          onClick={() => navigate("/admin/create-assignment")}
        >
          <i className='fa-solid fa-plus'></i> Create Assignment
        </button>
      </div>

      {/* Filters */}
      <div className='filters'>
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({assignments.length})
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed ({completedCount})
        </button>
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending ({pendingCount})
        </button>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className='empty-state'>
          <i className='fa-solid fa-clipboard-list'></i>
          <h2>No Assignments Found</h2>
          <p>
            {filter === "all"
              ? "Create your first assignment to get started!"
              : `No ${filter} assignments found.`}
          </p>
        </div>
      ) : (
        <div className='assignments-table'>
          <div className='table-header'>
            <div className='col-student'>Student</div>
            <div className='col-assignment'>Assignment</div>
            <div className='col-due'>Due Date</div>
            <div className='col-status'>Status</div>
            <div className='col-coins'>Coins</div>
            <div className='col-actions'>Actions</div>
          </div>
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className='table-row'
              onClick={() => navigate(`/admin/assignments/${assignment.id}`)}
            >
              <div className='col-student'>
                <div className='student-info'>
                  <i className='fa-solid fa-user'></i>
                  <span>{students[assignment.userId]?.name || "Unknown"}</span>
                  <span className='student-class'>
                    Class {students[assignment.userId]?.class || "?"}
                  </span>
                </div>
              </div>
              <div className='col-assignment'>
                <div className='assignment-info'>
                  <span className='assignment-name'>{assignment.name}</span>
                  <span className='assignment-id'>ID: {assignment.assignmentId}</span>
                </div>
              </div>
              <div className='col-due'>{formatDate(assignment.dueDate)}</div>
              <div className='col-status'>{getStatusBadge(assignment)}</div>
              <div className='col-coins'>
                <div className='coins-info'>
                  {assignment.completed ? (
                    <>
                      <span className='coins-earned'>
                        <i className='fa-solid fa-coins'></i>{" "}
                        {assignment.coinsReceived}
                      </span>
                      <span className='coins-total'>/ {assignment.coins}</span>
                    </>
                  ) : (
                    <span className='coins-total'>
                      <i className='fa-solid fa-coins'></i> {assignment.coins}
                    </span>
                  )}
                </div>
              </div>
              <div className='col-actions'>
                <button
                  className='delete-btn'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(
                      assignment.id,
                      assignment.name,
                      students[assignment.userId]?.name || "Unknown"
                    );
                  }}
                  disabled={deleting === assignment.id}
                >
                  {deleting === assignment.id ? (
                    <i className='fa-solid fa-spinner fa-spin'></i>
                  ) : (
                    <i className='fa-solid fa-trash'></i>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAssignments;

