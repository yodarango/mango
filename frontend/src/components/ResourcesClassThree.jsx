import { Link } from "react-router-dom";
import "./ResourcesClassThree.css";

function ResourcesClassThree() {
  return (
    <div className='resources-class-container'>
      <div className='resources-header'>
        <h1>
          <i className='fa-solid fa-book'></i> Resources - Class 3
        </h1>
        <p className='subtitle'>Study materials and learning resources</p>
      </div>

      <div className='resources-list'>
        <Link to='/assignments/numbers' className='resource-link'>
          <i className='fa-solid fa-hashtag'></i>
          <div className='resource-info'>
            <span className='resource-name'>Numbers</span>
            <span className='resource-description'>
              Learn Spanish numbers from 0 to 100 and beyond
            </span>
          </div>
          <i className='fa-solid fa-chevron-right'></i>
        </Link>
      </div>
    </div>
  );
}

export default ResourcesClassThree;
