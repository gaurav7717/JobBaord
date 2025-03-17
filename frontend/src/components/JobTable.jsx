// components/JobTable.jsx
import React from "react";

const JobTable = ({ jobs }) => {
  console.log("Jobs prop in JobTable:", jobs);

  return (
    <div className="shadow-lg rounded-lg w-11/12 mx-auto max-h-[80vh] overflow-y-auto hide-scrollbar">
      <table className="rounded-lg w-full">
        <thead className="bg-gray-700 w-full sticky top-0">
          <tr className=" ">
            <th className="font-semibold p-2 text-white">Title</th>
            <th className="font-semibold p-2 text-white">Company</th>
            <th className="font-semibold p-2 text-white">Location</th>
            <th className="font-semibold p-2 text-white">Experience</th>
            <th className="font-semibold p-2 text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="border divide-y ">
          {Array.isArray(jobs) && jobs.map((job) => (
            <tr key={job._id} className="">
              <td className="p-2 w-4/12">{job.job_title}</td>
              <td className="p-2 w-3/12">{job.company}</td>
              <td className="p-2">{job.location}</td>
              <td className="p-2 w-1/12">{job.experience}</td>
              <td className="p-2">
                <a href={job.URL} target="_blank" rel="noopener noreferrer" className="bg-blue-200 text-black px-4 py-2 rounded inline-block">
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