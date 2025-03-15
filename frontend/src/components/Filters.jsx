import React, { useState } from "react";

const Filters = ({ onFilterChange }) => {
  const [selectedLocations, setSelectedLocations] = useState();
  const [selectedExperience, setSelectedExperience] = useState("");

  const handleLocationChange = (loc) => {
    // For debugging, just log the change
    console.log("Location filter changed:", loc);
  };

  const handleExperienceChange = (e) => {
    // For debugging, just log the change
    console.log("Experience filter changed:", e.target.value);
  };

  return (
    <div className="border p-4 rounded-lg shadow-md mb-4 bg-white">
      <h3 className="font-semibold text-lg mb-2">Filters</h3>

      {/* Location Filter */}
      <div className="mb-3">
        <h4 className="font-medium">Location</h4>
        <div>
          <input type="checkbox" id="loc-hyderabad" className="mr-2" onChange={() => handleLocationChange("Hyderabad")} />
          <label htmlFor="loc-hyderabad" className="text-sm">Hyderabad</label>
        </div>
        <div>
          <input type="checkbox" id="loc-chennai" className="mr-2" onChange={() => handleLocationChange("Chennai")} />
          <label htmlFor="loc-chennai" className="text-sm">Chennai</label>
        </div>
        <div>
          <input type="checkbox" id="loc-bengaluru" className="mr-2" onChange={() => handleLocationChange("Bengaluru")} />
          <label htmlFor="loc-bengaluru" className="text-sm">Bengaluru</label>
        </div>
      </div>

      {/* Experience Filter */}
      <div>
        <h4 className="font-medium">Experience</h4>
        <select className="border p-2 rounded w-full" value={selectedExperience} onChange={handleExperienceChange}>
          <option value="">All</option>
          <option value="0">0 Years</option>
          {/* You can add more static options here if needed */}
        </select>
      </div>
    </div>
  );
};

export default Filters;