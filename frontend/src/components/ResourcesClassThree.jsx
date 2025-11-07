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
        <Link to='/assignments/daily-vocab-iii' className='resource-link'>
          <i className='fa-solid fa-arrows-turn-right'></i>
          <div className='resource-info'>
            <span className='resource-name'>Daily Vocab</span>
            <span className='resource-description'>
              Learn today's daily words
            </span>
          </div>
          <i className='fa-solid fa-chevron-right'></i>
        </Link>
        <Link
          to='/assignments/direct-object-pronouns'
          className='resource-link'
        >
          <i className='fa-solid fa-arrows-turn-right'></i>
          <div className='resource-info'>
            <span className='resource-name'>2. Direct Object Pronouns</span>
            <span className='resource-description'>
              Master the "shortcut" pronouns: me, te, lo, la, nos, os, los, las
            </span>
          </div>
          <i className='fa-solid fa-chevron-right'></i>
        </Link>
        <Link to='/assignments/numbers' className='resource-link'>
          <i className='fa-solid fa-hashtag'></i>
          <div className='resource-info'>
            <span className='resource-name'>1. Numbers</span>
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
