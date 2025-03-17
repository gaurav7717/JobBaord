import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import JobTable from "../components/JobTable";
import SearchFilter from "../components/SearchFilter";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [experienceInput, setExperienceInput] = useState("");
  const [availableLocations, setAvailableLocations] = useState([]);

  const API_URL = 'https://job-board-backend-latest.onrender.com'; // Use env var or default

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/jobs`); // Use API_URL
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    }
    setLoading(false);
  }, [API_URL]); // Add API_URL as dependency

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const locationMap = new Map();

    jobs.forEach((job) => {
      const locations = (job.location || "")
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l);

      locations.forEach((l) => {
        const normalized = l.toLowerCase();
        if (!locationMap.has(normalized)) {
          locationMap.set(normalized, l);
        }
      });
    });

    const uniqueLocations = Array.from(locationMap.values()).sort((a, b) =>
      a.localeCompare(b)
    );

    setAvailableLocations(uniqueLocations);
  }, [jobs]);

  const parseExperience = (expString) => {
    if (!expString) return 0;
    // Handle formats like "0-5 Yrs" or "5 Yrs"
    const numbers = expString.match(/\d+/g)?.map(Number) || [];
    return numbers.length > 0 ? Math.max(...numbers) : 0;
  };

  const filteredJobs = jobs.filter((job) => {
    // Title filter
    const titleMatch = job.job_title
      .toLowerCase()
      .includes(searchTitle.trim().toLowerCase());

    // Location filter
    const locationMatch =
      !selectedLocation ||
      (job.location || "")
        .split(",")
        .map((l) => l.trim().toLowerCase())
        .includes(selectedLocation.trim().toLowerCase());

    // Experience filter
    let experienceMatch = true;
    if (experienceInput) {
      const requiredExp = parseExperience(job.experience);
      const inputExp = parseInt(experienceInput, 10);
      experienceMatch = requiredExp === inputExp;
    }

    return titleMatch && locationMatch && experienceMatch;
  });

  return (
    <div className="w-full min-w-xl mx-auto p-6 bg-gray-900 text-white min-h-full max-h-screen bg-gradient-to-b from-slate-950 to-gray-950 bg-opacity-10">
      <div className="flex gap-4 mb-4">
        <SearchFilter onSearch={setSearchTitle} />

        <div className="w-64 mb-4">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-100 leading-tight bg-gray-800 focus:outline-none focus:shadow-outline h-[2.3em]"
          >
            <option value="">All Locations</option>
            {availableLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <input
            type="number"
            min="0"
            placeholder="Experience (years)"
            value={experienceInput}
            onChange={(e) =>
              setExperienceInput(e.target.value.replace(/\D/g, ""))
            }
            className="shadow border rounded w-full py-2 px-3 text-gray-100 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline h-[2.3em]"
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-gray-300">All Job Listings</h1>

      {loading ? (
        <p className="text-center w-full h-full">Loading...</p>
      ) : (
        <JobTable jobs={filteredJobs} />
      )}
    </div>
  );
};

export default Home;