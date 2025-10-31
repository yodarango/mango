import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AssignmentsClassTwo.css";

function AssignmentsClassTwo() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/assignments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out completed assignments
        const unfinished = data.filter((a) => !a.completed);
        setAssignments(unfinished);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;

    if (diff < 0) return "expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className='assignments-class-container'>
        <div className='assignments-header'>
          <h1>
            <i className='fa-solid fa-clipboard-list'></i> Assignments
          </h1>
          <p className='subtitle'>Complete your Spanish Quest assignments</p>
        </div>
        <div className='empty-state'>
          <i className='fa-solid fa-spinner fa-spin'></i>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='assignments-class-container'>
      <div className='assignments-header'>
        <h1>
          <i className='fa-solid fa-clipboard-list'></i> Assignments
        </h1>
        <p className='subtitle'>Complete your Spanish Quest assignments</p>
      </div>

      {assignments.length === 0 ? (
        <div className='empty-state'>
          <i className='fa-solid fa-clipboard-check'></i>
          <h2>No Assignments Yet</h2>
          <p>Check back soon for new assignments from your teacher!</p>
        </div>
      ) : (
        <div className='assignments-list'>
          {assignments.map((assignment) => {
            const timeRemaining = getTimeRemaining(assignment.dueDate);
            const isExpired = timeRemaining === "expired";

            if (isExpired) {
              return (
                <div key={assignment.id} className='assignment-link expired'>
                  <i className='fa-solid fa-file-lines'></i>
                  <div className='assignment-info'>
                    <span className='assignment-name'>{assignment.name}</span>
                    <div className='assignment-meta'>
                      <span className='coins'>
                        <i className='fa-solid fa-coins'></i> Total coins
                        possible: {assignment.coins}
                      </span>
                      <span className='expired-label'>EXPIRED</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={assignment.id}
                to={`/assignments/quizes/${assignment.assignment_id}`}
                className='assignment-link'
              >
                <i className='fa-solid fa-file-lines'></i>
                <div className='assignment-info'>
                  <span className='assignment-name'>{assignment.name}</span>
                  <div className='assignment-meta'>
                    <span className='coins'>
                      <i className='fa-solid fa-coins'></i> Total coins
                      possible: {assignment.coins}
                    </span>
                    {assignment.completed ? (
                      <span className='completed-badge'>
                        <i className='fa-solid fa-check-circle'></i> Completed
                      </span>
                    ) : (
                      <span className='time-remaining'>
                        <i className='fa-solid fa-clock'></i> Due in:{" "}
                        {timeRemaining}
                      </span>
                    )}
                  </div>
                </div>
                <i className='fa-solid fa-chevron-right'></i>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AssignmentsClassTwo;
