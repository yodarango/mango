import "./Resources.css";

function Resources() {
  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>
          <i className="fa-solid fa-book"></i> Resources
        </h1>
        <p className="subtitle">Study materials and learning resources</p>
      </div>

      <div className="empty-state">
        <i className="fa-solid fa-folder-open"></i>
        <h2>Materials Coming Soon</h2>
        <p>Your teacher will be adding study materials, PDFs, images, and other helpful resources here.</p>
      </div>
    </div>
  );
}

export default Resources;

