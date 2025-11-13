import { useState, useRef, useEffect } from "react";
import "./CustomMultiSelect.css";

function CustomMultiSelect({ label, icon, options, selectedValues, onToggle, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCount = selectedValues.size;
  const displayText = selectedCount > 0 
    ? `${selectedCount} selected` 
    : placeholder;

  return (
    <div className="custom-multi-select" ref={dropdownRef}>
      <label className="cms-label">
        {icon && <i className={icon}></i>}
        {label}
      </label>
      
      <div 
        className={`cms-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedCount > 0 ? 'has-selection' : ''}>
          {displayText}
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>

      {isOpen && (
        <div className="cms-dropdown">
          {options.length === 0 ? (
            <div className="cms-empty">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = selectedValues.has(option.value);
              return (
                <div
                  key={option.value}
                  className={`cms-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => onToggle(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected && <i className="fa-solid fa-check"></i>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CustomMultiSelect;

