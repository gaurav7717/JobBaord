import React, { useState } from 'react';

function SearchFilter({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value); // Call the onSearch function with the current value
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight bg-gray-800 focus:outline-none focus:shadow-outline h-[2.3em]"
        placeholder="Search job title..."
        value={searchTerm}
        onChange={handleChange}
      />
    </div>
  );
}

export default SearchFilter;