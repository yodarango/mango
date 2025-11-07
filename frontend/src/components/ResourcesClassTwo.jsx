import { Link } from "react-router-dom";
import "./ResourcesClassTwo.css";

function ResourcesClassTwo() {
  return (
    <div className='resources-class-container'>
      <div className='resources-header'>
        <h1>
          <i className='fa-solid fa-book'></i> Resources - Class 2
        </h1>
        <p className='subtitle'>Study materials and learning resources</p>
      </div>

      <div className='resources-list'>
        <Link to='/assignments/daily-vocab-ii' className='resource-link'>
          <i className='fa-solid fa-arrows-turn-right'></i>
          <div className='resource-info'>
            <span className='resource-name'>Daily Vocab</span>
            <span className='resource-description'>
              Learn today's daily words
            </span>
          </div>
          <i className='fa-solid fa-chevron-right'></i>
        </Link>
        {/* they are not ready yet */}
        {/* <Link to='/assignments/ser-conjugation' className='resource-link'>
          <i className='fa-solid fa-key'></i>
          <div className='resource-info'>
            <span className='resource-name'>
              2. Ser Conjugation - Identity Words
            </span>
            <span className='resource-description'>
              Learn the six forms of "ser" (to be) with interactive exercises
            </span>
          </div>
          <i className='fa-solid fa-chevron-right'></i>
        </Link> */}
        <Link to='/assignments/subject-pronouns' className='resource-link'>
          <i className='fa-solid fa-user-group'></i>
          <div className='resource-info'>
            <span className='resource-name'>1. Subject Pronouns</span>
            <span className='resource-description'>
              Learn about Spanish subject pronouns (yo, tú, él, ella, etc.)
            </span>
          </div>
          <i className='fa-solid fa-chevron-right'></i>
        </Link>
      </div>
    </div>
  );
}

export default ResourcesClassTwo;
