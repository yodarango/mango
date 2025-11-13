import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomMultiSelect from "../components/CustomMultiSelect";
import "./AdminAssignments.css";

function AdminAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Accumulative filters
  const [statusFilter, setStatusFilter] = useState("all"); // all, completed, pending, expired
  const [selectedClasses, setSelectedClasses] = useState(new Set());
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Bulk edit mode
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState(new Set());

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

  // Get unique classes and students for filter options
  const getUniqueClasses = () => {
    const classes = new Set();
    Object.values(students).forEach((student) => {
      if (student.class) classes.add(student.class);
    });
    return Array.from(classes).sort();
  };

  const toggleClassFilter = (className) => {
    const newClasses = new Set(selectedClasses);
    if (newClasses.has(className)) {
      newClasses.delete(className);
    } else {
      newClasses.add(className);
    }
    setSelectedClasses(newClasses);
  };

  const toggleStudentFilter = (studentId) => {
    const newStudents = new Set(selectedStudents);
    if (newStudents.has(studentId)) {
      newStudents.delete(studentId);
    } else {
      newStudents.add(studentId);
    }
    setSelectedStudents(newStudents);
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSelectedClasses(new Set());
    setSelectedStudents(new Set());
    setDateRange({ start: "", end: "" });
  };

  const toggleEditMode = () => {
    if (isEditingDueDate) {
      // Cancel edit mode
      setIsEditingDueDate(false);
      setSelectedAssignments(new Set());
      setNewDueDate("");
    } else {
      // Enter edit mode - select all filtered assignments by default
      setIsEditingDueDate(true);
      const allFilteredIds = new Set(filteredAssignments.map((a) => a.id));
      setSelectedAssignments(allFilteredIds);
    }
  };

  const toggleAssignmentSelection = (assignmentId) => {
    const newSelection = new Set(selectedAssignments);
    if (newSelection.has(assignmentId)) {
      newSelection.delete(assignmentId);
    } else {
      newSelection.add(assignmentId);
    }
    setSelectedAssignments(newSelection);
  };

  const handleBulkUpdateDueDate = async () => {
    if (!newDueDate) {
      alert("Please select a new due date and time");
      return;
    }

    if (selectedAssignments.size === 0) {
      alert("Please select at least one assignment to update");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Convert datetime-local format to ISO string
      // datetime-local gives us: "2024-03-15T14:30"
      // We need to convert it to ISO format for the backend
      const dueDateISO = new Date(newDueDate).toISOString();

      const response = await fetch("/api/assignments/bulk-update-due-dates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentIds: Array.from(selectedAssignments),
          dueDate: dueDateISO,
        }),
      });

      if (!response.ok) throw new Error("Failed to update due dates");

      const result = await response.json();
      alert(`Successfully updated ${result.rowsAffected} assignment(s)`);

      // Reset edit mode and refresh data
      setIsEditingDueDate(false);
      setSelectedAssignments(new Set());
      setNewDueDate("");
      fetchData();
    } catch (error) {
      console.error("Error updating due dates:", error);
      alert("Failed to update due dates");
    }
  };

  const isExpired = (assignment) => {
    if (assignment.completed) return false;
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    return dueDate < now;
  };

  const getFilteredAssignments = () => {
    return assignments.filter((assignment) => {
      // Status filter
      if (statusFilter === "completed" && !assignment.completed) return false;
      if (
        statusFilter === "pending" &&
        (assignment.completed || isExpired(assignment))
      )
        return false;
      if (statusFilter === "expired" && !isExpired(assignment)) return false;

      // Class filter
      if (selectedClasses.size > 0) {
        const studentClass = students[assignment.userId]?.class;
        if (!selectedClasses.has(studentClass)) return false;
      }

      // Student filter
      if (selectedStudents.size > 0) {
        if (!selectedStudents.has(assignment.userId)) return false;
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const dueDate = new Date(assignment.dueDate);
        if (dateRange.start && dueDate < new Date(dateRange.start))
          return false;
        if (dateRange.end && dueDate > new Date(dateRange.end)) return false;
      }

      return true;
    });
  };

  const getStatusBadge = (assignment) => {
    if (assignment.completed) {
      return (
        <span className='status-badge completed'>
          <i className='fa-solid fa-check-circle'></i> Completed
        </span>
      );
    }
    if (isExpired(assignment)) {
      return (
        <span className='status-badge expired'>
          <i className='fa-solid fa-exclamation-triangle'></i> Expired
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
  const expiredCount = assignments.filter((a) => isExpired(a)).length;
  const pendingCount = assignments.filter(
    (a) => !a.completed && !isExpired(a)
  ).length;

  const uniqueClasses = getUniqueClasses();
  const hasActiveFilters =
    statusFilter !== "all" ||
    selectedClasses.size > 0 ||
    selectedStudents.size > 0 ||
    dateRange.start ||
    dateRange.end;

  return (
    <div className='admin-assignments-container'>
      <div className='assignments-header'>
        <h1>
          <i className='fa-solid fa-clipboard-list'></i> Assignments Management
        </h1>
        <button
          className='create-btn'
          onClick={() => navigate("/admin/create-assignment")}
        >
          <i className='fa-solid fa-plus'></i> Create Assignment
        </button>
      </div>

      {/* Clickable Stat Cards */}
      <div className='stats-cards'>
        <div
          className={`stat-card ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <div className='stat-icon all'>
            <i className='fa-solid fa-list'></i>
          </div>
          <div className='stat-content'>
            <span className='stat-label'>Total</span>
            <span className='stat-value'>{assignments.length}</span>
          </div>
        </div>

        <div
          className={`stat-card ${
            statusFilter === "completed" ? "active" : ""
          }`}
          onClick={() => setStatusFilter("completed")}
        >
          <div className='stat-icon completed'>
            <i className='fa-solid fa-check-circle'></i>
          </div>
          <div className='stat-content'>
            <span className='stat-label'>Completed</span>
            <span className='stat-value'>{completedCount}</span>
          </div>
        </div>

        <div
          className={`stat-card ${statusFilter === "pending" ? "active" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          <div className='stat-icon pending'>
            <i className='fa-solid fa-clock'></i>
          </div>
          <div className='stat-content'>
            <span className='stat-label'>Pending</span>
            <span className='stat-value'>{pendingCount}</span>
          </div>
        </div>

        <div
          className={`stat-card ${statusFilter === "expired" ? "active" : ""}`}
          onClick={() => setStatusFilter("expired")}
        >
          <div className='stat-icon expired'>
            <i className='fa-solid fa-exclamation-triangle'></i>
          </div>
          <div className='stat-content'>
            <span className='stat-label'>Expired</span>
            <span className='stat-value'>{expiredCount}</span>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className='filters-section'>
        <div className='filters-header'>
          <h3>
            <i className='fa-solid fa-filter'></i> Filters
          </h3>
          {hasActiveFilters && (
            <button className='clear-filters-btn' onClick={clearAllFilters}>
              <i className='fa-solid fa-times'></i> Clear All
            </button>
          )}
        </div>

        <div className='filters-grid'>
          {/* Class Filter */}
          {uniqueClasses.length > 0 && (
            <CustomMultiSelect
              label='Class'
              icon='fa-solid fa-school'
              options={uniqueClasses.map((className) => ({
                value: className,
                label: `Class ${className}`,
              }))}
              selectedValues={selectedClasses}
              onToggle={toggleClassFilter}
              placeholder='All classes'
            />
          )}

          {/* Student Filter */}
          <CustomMultiSelect
            label='Student'
            icon='fa-solid fa-user'
            options={Object.values(students).map((student) => ({
              value: student.id,
              label: student.name,
            }))}
            selectedValues={selectedStudents}
            onToggle={toggleStudentFilter}
            placeholder='All students'
          />

          {/* Date Range Filter */}
          <div className='filter-group date-range-group'>
            <label className='filter-label'>
              <i className='fa-solid fa-calendar'></i> Due Date Range
            </label>
            <div className='date-range-inputs'>
              <input
                type='date'
                className='date-input'
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                placeholder='Start date'
              />
              <span className='date-separator'>to</span>
              <input
                type='date'
                className='date-input'
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                placeholder='End date'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Edit Controls */}
      {isEditingDueDate && (
        <div className='bulk-edit-controls'>
          <div className='bulk-edit-info'>
            <i className='fa-solid fa-info-circle'></i>
            <span>
              Editing due dates for {selectedAssignments.size} of{" "}
              {filteredAssignments.length} filtered assignment(s)
            </span>
          </div>
          <div className='bulk-edit-actions'>
            <input
              type='datetime-local'
              className='bulk-date-input'
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              placeholder='Select new due date and time'
            />
            <button className='bulk-save-btn' onClick={handleBulkUpdateDueDate}>
              <i className='fa-solid fa-check'></i> Update
            </button>
            <button className='bulk-cancel-btn' onClick={toggleEditMode}>
              <i className='fa-solid fa-times'></i> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className='empty-state'>
          <i className='fa-solid fa-clipboard-list'></i>
          <h2>No Assignments Found</h2>
          <p>
            {hasActiveFilters
              ? "No assignments match your current filters. Try adjusting your filter criteria."
              : "Create your first assignment to get started!"}
          </p>
        </div>
      ) : (
        <div className='assignments-table'>
          <div className='table-header'>
            <div className='col-student'>Student</div>
            <div className='col-assignment'>Assignment</div>
            <div className='col-due'>
              Due Date
              <button
                className='edit-due-date-btn'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEditMode();
                }}
                title='Bulk edit due dates'
              >
                <i
                  className={`fa-solid ${
                    isEditingDueDate ? "fa-times" : "fa-pencil"
                  }`}
                ></i>
              </button>
            </div>
            <div className='col-status'>Status</div>
            <div className='col-coins'>Coins</div>
            <div className='col-actions'>Actions</div>
            {isEditingDueDate && <div className='col-select'>Select</div>}
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
                  <span className='assignment-id'>
                    ID: {assignment.assignmentId}
                  </span>
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
              {isEditingDueDate && (
                <div className='col-select'>
                  <input
                    type='checkbox'
                    className='assignment-checkbox'
                    checked={selectedAssignments.has(assignment.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleAssignmentSelection(assignment.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAssignments;
