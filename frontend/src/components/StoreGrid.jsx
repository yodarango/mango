import { useState, useMemo } from "react";
import StoreItemCard from "./StoreItemCard";
import "./StoreGrid.css";

function StoreGrid({ items, userCoins, userLevel, purchasing, onPurchase }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Get unique levels and types for filter options
  const uniqueLevels = useMemo(() => {
    const levels = [...new Set(items.map((item) => item.requiredLevel))];
    return levels.sort((a, b) => a - b);
  }, [items]);

  const uniqueTypes = useMemo(() => {
    const types = [...new Set(items.map((item) => item.type))];
    return types.sort();
  }, [items]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Level filter
      const matchesLevel =
        filterLevel === "all" || item.requiredLevel === parseInt(filterLevel);

      // Type filter
      const matchesType = filterType === "all" || item.type === filterType;

      return matchesSearch && matchesLevel && matchesType;
    });
  }, [items, searchTerm, filterLevel, filterType]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterLevel("all");
    setFilterType("all");
  };

  const hasActiveFilters =
    searchTerm !== "" || filterLevel !== "all" || filterType !== "all";

  return (
    <div className='store-grid-container'>
      <div className='store-filters'>
        <div className='filter-group'>
          <div className='search-box'>
            <i className='fa-solid fa-search'></i>
            <input
              type='text'
              placeholder='Search by name...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className='clear-search'
                onClick={() => setSearchTerm("")}
              >
                <i className='fa-solid fa-times'></i>
              </button>
            )}
          </div>
        </div>

        <div className='filter-group'>
          <label htmlFor='level-filter'>
            <i className='fa-solid fa-star'></i> Level:
          </label>
          <select
            id='level-filter'
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value='all'>All Levels</option>
            {uniqueLevels.map((level) => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
        </div>

        <div className='filter-group'>
          <label htmlFor='type-filter'>
            <i className='fa-solid fa-tag'></i> Type:
          </label>
          <select
            id='type-filter'
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value='all'>All Types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className='clear-filters-btn' onClick={handleClearFilters}>
            <i className='fa-solid fa-filter-circle-xmark'></i> Clear Filters
          </button>
        )}
      </div>

      <div className='results-info'>
        <span className='results-count'>
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}{" "}
          found
        </span>
      </div>

      {filteredItems.length === 0 ? (
        <div className='no-results'>
          <i className='fa-solid fa-box-open'></i>
          <h3>No items found</h3>
          <p>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className='store-grid'>
          {filteredItems.map((item) => (
            <StoreItemCard
              key={item.type}
              item={item}
              userCoins={userCoins}
              userLevel={userLevel}
              purchasing={purchasing}
              onPurchase={onPurchase}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StoreGrid;
