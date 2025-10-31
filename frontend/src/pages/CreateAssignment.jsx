import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateAssignment.css";

function CreateAssignment() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [coins, setCoins] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [path, setPath] = useState("");
  const [data, setData] = useState("");

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

  const validateJSON = (jsonString) => {
    if (!jsonString.trim()) return true; // Empty is OK
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!coins || !assignmentId || !name || !dueDate || !path) {
      alert("Please fill in all required fields");
      return;
    }

    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    if (data.trim() && !validateJSON(data)) {
      alert("Invalid JSON format in quiz data field");
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem("token");

      // Convert datetime-local format to RFC3339
      const dueDateISO = new Date(dueDate).toISOString();

      const response = await fetch("/api/assignments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coins: parseInt(coins),
          assignmentId: assignmentId,
          userIds: selectedStudents,
          name: name,
          dueDate: dueDateISO,
          path: path,
          data: data.trim() ? data : null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Assignments created successfully!");
        // Reset form
        setCoins("");
        setAssignmentId("");
        setName("");
        setDueDate("");
        setPath("");
        setData("");
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
        const errorText = await response.text();
        console.error("Error response:", response.status, errorText);
        alert(
          `Failed to create assignments: ${errorText || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error creating assignments:", error);
      alert("Error creating assignments: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className='create-assignment-container'>
      <div className='assignment-header'>
        <h1>
          <i className='fa-solid fa-clipboard-list'></i> Create Assignment
        </h1>
        <p className='assignment-subtitle'>
          Create a new assignment for selected students
        </p>
      </div>

      <form className='assignment-form' onSubmit={handleSubmit}>
        {/* Student Selection */}
        <div className='form-section'>
          <h2>
            <i className='fa-solid fa-users'></i> Select Students
          </h2>

          <div className='select-all-container'>
            <label className='checkbox-label'>
              <input
                type='checkbox'
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <span>Select All Students</span>
            </label>
            <span className='selected-count'>
              {selectedStudents.length} of {students.length} selected
            </span>
          </div>

          <div className='students-grid'>
            {students.map((student) => (
              <label key={student.id} className='student-checkbox'>
                <input
                  type='checkbox'
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                />
                <span className='student-name'>{student.name}</span>
                <span className='student-class'>Class {student.class}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Assignment Details */}
        <div className='form-section'>
          <h2>
            <i className='fa-solid fa-file-lines'></i> Assignment Details
          </h2>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='assignmentId'>
                <i className='fa-solid fa-hashtag'></i> Assignment ID *
              </label>
              <input
                type='text'
                id='assignmentId'
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                placeholder='e.g., 1001'
                required
              />
              <small>Unique identifier for this assignment</small>
            </div>

            <div className='form-group'>
              <label htmlFor='name'>
                <i className='fa-solid fa-heading'></i> Assignment Name *
              </label>
              <input
                type='text'
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g., Subject Pronouns'
                required
              />
            </div>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='coins'>
                <i className='fa-solid fa-coins'></i> Coins *
              </label>
              <input
                type='number'
                id='coins'
                value={coins}
                onChange={(e) => setCoins(e.target.value)}
                placeholder='e.g., 300'
                min='0'
                required
              />
              <small>Total coins possible for this assignment</small>
            </div>

            <div className='form-group'>
              <label htmlFor='dueDate'>
                <i className='fa-solid fa-calendar'></i> Due Date *
              </label>
              <input
                type='datetime-local'
                id='dueDate'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor='path'>
              <i className='fa-solid fa-link'></i> Path *
            </label>
            <input
              type='text'
              id='path'
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder='e.g., /quiz/1001 or /assignments/subject-pronouns'
              required
            />
            <small>Route path for this assignment</small>
          </div>

          <div className='form-group'>
            <label htmlFor='data'>
              <i className='fa-solid fa-code'></i> Quiz Data (JSON)
            </label>
            <textarea
              id='data'
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder='Paste JSON quiz data here (optional)'
              rows='10'
              className='json-textarea'
            ></textarea>
            <small>
              Optional: JSON array of quiz questions. Leave empty if not a quiz.
            </small>
            {data.trim() && !validateJSON(data) && (
              <div className='error-message'>
                <i className='fa-solid fa-exclamation-triangle'></i> Invalid
                JSON format
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className='form-actions'>
          <button
            type='button'
            className='btn-cancel'
            onClick={() => navigate(-1)}
            disabled={creating}
          >
            Cancel
          </button>
          <button type='submit' className='btn-submit' disabled={creating}>
            {creating ? (
              <>
                <i className='fa-solid fa-spinner fa-spin'></i> Creating...
              </>
            ) : (
              <>
                <i className='fa-solid fa-check'></i> Create Assignment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAssignment;
