// components/JobTable.jsx
import React from "react";

const JobTable = ({ jobs }) => {
  console.log("Jobs prop in JobTable:", jobs);

  return (
    <div className="shadow-lg rounded-lg w-full md:w-11/12 mx-auto max-h-screen overflow-y-auto hide-scrollbar ">
      <table className="rounded-lg w-full table-auto"> {/* Use table-auto for flexible layout */}
        <thead className="bg-gray-700 sticky top-0">
          <tr className="">
            <th className="font-semibold p-2 text-white text-left">Title</th>
            <th className="font-semibold p-2 text-white text-left hidden sm:table-cell">Company</th> {/* Hide on small screens */}
            <th className="font-semibold p-2 text-white text-left">Location</th>
            <th className="font-semibold p-2 text-white text-left hidden md:table-cell">Experience</th> {/* Hide on medium screens if needed */}
            <th className="font-semibold p-2 text-white text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="border divide-y bg-slate-800">
          {Array.isArray(jobs) && jobs.map((job) => (
            <tr key={job._id} className="">
              <td className="p-2 break-words">{job.job_title}</td>
              <td className="p-2 break-words hidden sm:table-cell">{job.company}</td>
              <td className="p-2 break-words">{job.location}</td>
              <td className="p-2 break-words hidden md:table-cell">{job.experience}</td>
              <td className="p-2">
                <a href={job.URL} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded inline-block text-sm">
                  Apply
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobTable;