"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import JobDetailsModal from './JobDetailsModal';

const JobTable = ({ jobs, onStatusChange, onDelete, onDateChange, onJobUpdate }) => {
  const [sortField, setSortField] = useState('applicationDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [editingDateId, setEditingDateId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedJobs = [...jobs].sort((a, b) => {
    // Handle null values
    if (!a[sortField] && !b[sortField]) return 0;
    if (!a[sortField]) return 1;
    if (!b[sortField]) return -1;
    
    // Sort by date or string
    if (sortField === 'applicationDate' || sortField === 'createdAt' || sortField === 'nextActionDate') {
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Default string comparison
    const valueA = String(a[sortField]).toLowerCase();
    const valueB = String(b[sortField]).toLowerCase();
    return sortDirection === 'asc' 
      ? valueA.localeCompare(valueB) 
      : valueB.localeCompare(valueA);
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDateClick = (e, jobId) => {
    e.stopPropagation();
    setEditingDateId(jobId);
  };

  const handleDateChange = (e, jobId) => {
    e.stopPropagation();
    const newDate = e.target.value;
    onDateChange(jobId, newDate);
    setEditingDateId(null);
  };
  
  const handleStatusChange = (e, jobId) => {
    e.stopPropagation();
    onStatusChange(jobId, e.target.value);
  };
  
  const handleDelete = (e, jobId) => {
    e.stopPropagation();
    onDelete(jobId);
  };
  
  const handleRowClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };
  
  const handleJobUpdate = (updatedJob) => {
    if (onJobUpdate) {
      onJobUpdate(updatedJob);
    }
  };

  // Column definitions for better organization
  const columns = [
    { field: 'company', label: 'Company', sortable: true },
    { field: 'position', label: 'Position', sortable: true },
    { field: 'status', label: 'Status', sortable: true },
    { field: 'applicationDate', label: 'Applied On', sortable: true },
    { field: 'nextActionDate', label: 'Next Action', sortable: true },
    { field: 'actions', label: 'Actions', sortable: false }
  ];

  return (
    <>
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.field}
                  onClick={() => column.sortable && handleSort(column.field)}
                  className={column.sortable ? "cursor-pointer hover:bg-base-200" : ""}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortField === column.field && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job) => (
              <tr 
                key={job._id} 
                onClick={() => handleRowClick(job)}
                className="hover:bg-base-200 cursor-pointer"
              >
                <td>
                  <div className="font-medium">
                    {job.jobUrl ? (
                      <a 
                        href={job.jobUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link link-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {job.company}
                      </a>
                    ) : (
                      job.company
                    )}
                  </div>
                  {job.location && (
                    <div className="text-xs text-base-content/70">{job.location}</div>
                  )}
                </td>
                <td>
                  <div>{job.position}</div>
                  <div className="text-xs text-base-content/70">{job.jobType}</div>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select 
                    className="select select-bordered select-sm w-full max-w-xs"
                    value={job.status}
                    onChange={(e) => handleStatusChange(e, job._id)}
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
                <td onClick={(e) => e.stopPropagation()}>
                  {editingDateId === job._id ? (
                    <input 
                      type="date" 
                      className="input input-bordered input-sm"
                      defaultValue={job.applicationDate ? new Date(job.applicationDate).toISOString().split('T')[0] : ''}
                      onBlur={(e) => handleDateChange(e, job._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDateChange(e, job._id);
                        } else if (e.key === 'Escape') {
                          setEditingDateId(null);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div 
                      onClick={(e) => handleDateClick(e, job._id)}
                      className="cursor-pointer hover:underline"
                    >
                      {job.applicationDate ? 
                        format(new Date(job.applicationDate), 'MMM dd, yyyy') : 
                        <span className="text-base-content/50">Set date</span>}
                    </div>
                  )}
                </td>
                <td>
                  {job.nextActionDate ? (
                    <div>
                      <div className="text-sm">{format(new Date(job.nextActionDate), 'MMM dd, yyyy')}</div>
                      {job.nextActionStep && (
                        <div className="text-xs text-base-content/70">{job.nextActionStep}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-base-content/50">No action set</span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()} className="flex gap-2">
                  <button 
                    onClick={(e) => handleDelete(e, job._id)}
                    className="btn btn-ghost btn-sm"
                    title="Delete job"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                        className="w-4 h-4 stroke-current"><path strokeLinecap="round" 
                        strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(job);
                    }}
                    className="btn btn-ghost btn-sm"
                    title="View details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                        className="w-4 h-4 stroke-current"><path strokeLinecap="round" 
                        strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={handleCloseModal} 
          onUpdate={handleJobUpdate}
        />
      )}
    </>
  );
};

export default JobTable;