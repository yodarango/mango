import "./Assignments.css";

function Assignments() {
  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h1>
          <i className="fa-solid fa-clipboard-list"></i> Assignments
        </h1>
        <p className="subtitle">Complete your Spanish Quest assignments</p>
      </div>

      <div className="empty-state">
        <i className="fa-solid fa-clipboard-check"></i>
        <h2>No Assignments Yet</h2>
        <p>Check back soon for new assignments from your teacher!</p>
      </div>
    </div>
  );
}

export default Assignments;

