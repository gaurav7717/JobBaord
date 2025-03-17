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

  const API_URL = "https://job-board-backend-latest.onrender.com"; // Use env var or default

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
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 to-gray-950 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header and GitHub Link */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-300 mb-4 md:mb-0">
            All Job Listings
          </h1>
          <a
            href="https://github.com/gaurav7717/JobBaord"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 underline italic"
          >
            GitHub Repo
          </a>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Title Search */}
          <div className="relative">
            {/* <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" /> */}
            <input
              type="text"
              placeholder="Job title or keywords"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            {/* <MapPinIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" /> */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 appearance-none"
            >
              <option value="">All Locations</option>
              {availableLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="relative">
            {/* <BriefcaseIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" /> */}
            <input
              type="number"
              min="0"
              placeholder="Experience (years)"
              value={experienceInput}
              onChange={(e) => setExperienceInput(e.target.value.replace(/\D/g, ""))}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Job Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <JobTable jobs={filteredJobs} />
        )}
      </div>
    </div>
  );
};


export default Home;
