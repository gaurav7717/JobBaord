// components/JobTable.jsx
import React from "react";

const JobTable = ({ jobs }) => {
  console.log("Jobs prop in JobTable:", jobs);

  return (
    <table className="shadow-lg rounded-lg w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="font-semibold p-2">Title</th>
          <th className="font-semibold p-2">Company</th>
          <th className="font-semibold p-2">Location</th>
          <th className="font-semibold p-2">Experience</th>
          <th className="font-semibold p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(jobs) && jobs.map((job) => (
          <tr key={job._id}>
            <td className="p-2">{job.job_title}</td>
            <td className="p-2">{job.company}</td>
            <td className="p-2">{job.location}</td>
            <td className="p-2">{job.experience}</td>
            <td className="p-2">
              <a href={job.URL} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-4 py-2 rounded inline-block">
                Apply
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default JobTable;