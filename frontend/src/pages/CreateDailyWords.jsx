import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateDailyWords.css";

function CreateDailyWords() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [wordCount, setWordCount] = useState(3);
  const [wordWorth, setWordWorth] = useState(50);
  const [wordType, setWordType] = useState("nouns");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
    }
  };

  const getStudentsByClass = (classNum) => {
    return students.filter((s) => s.class === classNum);
  };

  const handleCreate = async () => {
    if (!selectedClass) {
      alert("Please select a class");
      return;
    }

    if (wordCount < 1 || wordCount > 100) {
      alert("Please enter a valid word count (1-100)");
      return;
    }

    if (wordWorth < 1) {
      alert("Please enter a valid word worth (minimum 1)");
      return;
    }

    const selectedStudents = getStudentsByClass(parseInt(selectedClass));
    if (selectedStudents.length === 0) {
      alert("No students found in the selected class");
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/assignments/daily-vocab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classNum: parseInt(selectedClass),
          wordCount: parseInt(wordCount),
          wordWorth: parseInt(wordWorth),
          name: `Daily Vocab - ${
            wordType.charAt(0).toUpperCase() + wordType.slice(1)
          }`,
          wordType: wordType,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();
      alert(
        `Successfully created ${result.assignmentsCreated} assignments for ${selectedStudents.length} students!`
      );
      window.location.reload();
    } catch (error) {
      console.error("Error creating assignments:", error);
      alert("Error creating assignments: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (selectedClass === "2") {
      setWordCount(2);
      setWordWorth(75);
    } else if (selectedClass === "3") {
      setWordCount(3);
      setWordWorth(50);
    }
  }, [selectedClass]);

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading students...</p>
      </div>
    );
  }

  const class2Students = getStudentsByClass(2);
  const class3Students = getStudentsByClass(3);

  return (
    <div className='create-daily-words-container'>
      <div className='page-header'>
        <button
          className='back-btn'
          onClick={() => navigate("/admin/assignments")}
        >
          <i className='fa-solid fa-arrow-left'></i> Back
        </button>
        <h1>
          <i className='fa-solid fa-book'></i> Create Daily Vocabulary
          Assignment
        </h1>
      </div>

      <div className='create-form-card'>
        <div className='form-section'>
          <h2>
            <i className='fa-solid fa-users'></i> Select Class
          </h2>
          <div className='class-selection'>
            <div
              className={`class-option ${
                selectedClass === "2" ? "selected" : ""
              }`}
              onClick={() => setSelectedClass("2")}
            >
              <div className='class-header'>
                <i className='fa-solid fa-graduation-cap'></i>
                <span className='class-name'>Class 2</span>
              </div>
              <div className='student-count'>
                {class2Students.length} student
                {class2Students.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div
              className={`class-option ${
                selectedClass === "3" ? "selected" : ""
              }`}
              onClick={() => setSelectedClass("3")}
            >
              <div className='class-header'>
                <i className='fa-solid fa-graduation-cap'></i>
                <span className='class-name'>Class 3</span>
              </div>
              <div className='student-count'>
                {class3Students.length} student
                {class3Students.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className='form-section'>
          <h2>
            <i className='fa-solid fa-sliders'></i> Assignment Settings
          </h2>
          <div className='settings-grid'>
            <div className='form-group'>
              <label>
                <i className='fa-solid fa-hashtag'></i> Number of Words
              </label>
              <input
                type='number'
                min='1'
                max='100'
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
              />
            </div>

            <div className='form-group'>
              <label>
                <i className='fa-solid fa-coins'></i> Coins per Word
              </label>
              <input
                type='number'
                min='1'
                value={wordWorth}
                onChange={(e) => setWordWorth(e.target.value)}
              />
            </div>

            <div className='form-group'>
              <label>
                <i className='fa-solid fa-language'></i> Word Type
              </label>
              <select
                value={wordType}
                onChange={(e) => setWordType(e.target.value)}
              >
                <option value='nouns'>Nouns</option>
                <option value='verbs'>Verbs</option>
              </select>
            </div>
          </div>
        </div>

        <div className='form-section summary-section'>
          <h2>
            <i className='fa-solid fa-clipboard-check'></i> Summary
          </h2>
          <div className='summary-grid'>
            <div className='summary-item'>
              <span className='summary-label'>Class:</span>
              <span className='summary-value'>
                {selectedClass ? `Class ${selectedClass}` : "Not selected"}
              </span>
            </div>
            <div className='summary-item'>
              <span className='summary-label'>Students:</span>
              <span className='summary-value'>
                {selectedClass
                  ? getStudentsByClass(parseInt(selectedClass)).length
                  : 0}
              </span>
            </div>
            <div className='summary-item'>
              <span className='summary-label'>Words per student:</span>
              <span className='summary-value'>{wordCount}</span>
            </div>
            <div className='summary-item'>
              <span className='summary-label'>Total coins per student:</span>
              <span className='summary-value'>{wordCount * wordWorth}</span>
            </div>
            <div className='summary-item'>
              <span className='summary-label'>Word type:</span>
              <span className='summary-value'>
                {wordType.charAt(0).toUpperCase() + wordType.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className='form-actions'>
          <button
            className='btn-create'
            onClick={handleCreate}
            disabled={creating || !selectedClass}
          >
            {creating ? (
              <>
                <i className='fa-solid fa-spinner fa-spin'></i> Creating...
              </>
            ) : (
              <>
                <i className='fa-solid fa-plus-circle'></i> Create Assignments
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateDailyWords;
