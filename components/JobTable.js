"use client";

import { useState } from 'react';
import { format } from 'date-fns';

const JobTable = ({ jobs, onStatusChange, onDelete }) => {
  const [sortField, setSortField] = useState('applicationDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] < b[sortField] ? -1 : 1;
    }
    return a[sortField] > b[sortField] ? -1 : 1;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th onClick={() => handleSort('company')} className="cursor-pointer">
              Company {sortField === 'company' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('position')} className="cursor-pointer">
              Position {sortField === 'position' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('status')} className="cursor-pointer">
              Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('applicationDate')} className="cursor-pointer">
              Applied On {sortField === 'applicationDate' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedJobs.map((job) => (
            <tr key={job._id}>
              <td>
                {job.jobUrl ? (
                  <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" 
                     className="link link-primary">
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}
              </td>
              <td>{job.position}</td>
              <td>
                <select 
                  className="select select-bordered select-sm w-full max-w-xs"
                  value={job.status}
                  onChange={(e) => onStatusChange(job._id, e.target.value)}
                >
                  <option value="Not Applied">Not Applied</option>
                  <option value="Applied">Applied</option>
                  <option value="No Response">No Response</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Phone Screen">Phone Screen</option>
                  <option value="Interview">Interview</option>
                  <option value="Final Round">Final Round</option>
                  <option value="Offer">Offer</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                </select>
              </td>
              <td>
                {job.applicationDate ? 
                  format(new Date(job.applicationDate), 'MMM dd, yyyy') : 
                  'Not applied'}
              </td>
              <td>
                <button 
                  onClick={() => onDelete(job._id)}
                  className="btn btn-ghost btn-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                       className="w-4 h-4 stroke-current"><path strokeLinecap="round" 
                       strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobTable;