import { Link } from "react-router-dom";
import "./AssignmentsClassThree.css";

const assignments = [
  {
    path: "assignments/numbers",
    name: "Numbers",
  },
];
function AssignmentsClassThree() {
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
          {assignments.map((assignment, index) => (
            <Link
              key={index}
              to={`/${assignment.path}`}
              className='assignment-link'
            >
              <i className='fa-solid fa-file-lines'></i>
              <span>{assignment.name}</span>
              <i className='fa-solid fa-chevron-right'></i>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssignmentsClassThree;
