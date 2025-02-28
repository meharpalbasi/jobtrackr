// components/KanbanBoard.js
"use client";

import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format } from 'date-fns';
import JobDetailsModal from './JobDetailsModal';

// Define the status columns and their order
const statusColumns = [
  { id: 'not-applied', title: 'Not Applied', status: 'Not Applied', color: 'bg-base-100' },
  { id: 'applied', title: 'Applied', status: 'Applied', color: 'bg-blue-50' },
  { id: 'no-response', title: 'No Response', status: 'No Response', color: 'bg-gray-50' },
  { id: 'phone-screen', title: 'Phone Screen', status: 'Phone Screen', color: 'bg-purple-50' },
  { id: 'interview', title: 'Interview', status: 'Interview', color: 'bg-indigo-50' },
  { id: 'final-round', title: 'Final Round', status: 'Final Round', color: 'bg-teal-50' },
  { id: 'offer', title: 'Offer', status: 'Offer', color: 'bg-green-50' },
  { id: 'accepted', title: 'Accepted', status: 'Accepted', color: 'bg-emerald-50' },
  { id: 'rejected', title: 'Rejected', status: 'Rejected', color: 'bg-red-50' },
  { id: 'declined', title: 'Declined', status: 'Declined', color: 'bg-orange-50' },
];

// Card component with drag functionality
const JobCard = ({ job, onStatusChange, onCardClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'JOB_CARD',
    item: { id: job._id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Determine card color based on status
  const getCardColor = () => {
    switch (job.status) {
      case 'Not Applied':
        return 'border-l-4 border-l-gray-400';
      case 'Applied':
        return 'border-l-4 border-l-blue-400';
      case 'No Response':
        return 'border-l-4 border-l-gray-500';
      case 'Phone Screen':
        return 'border-l-4 border-l-purple-400';
      case 'Interview':
        return 'border-l-4 border-l-indigo-500';
      case 'Final Round':
        return 'border-l-4 border-l-teal-500';
      case 'Offer':
        return 'border-l-4 border-l-green-500';
      case 'Accepted':
        return 'border-l-4 border-l-emerald-600';
      case 'Rejected':
        return 'border-l-4 border-l-red-500';
      case 'Declined':
        return 'border-l-4 border-l-orange-500';
      default:
        return 'border-l-4 border-l-gray-400';
    }
  };

  // Calculate days since application
  const getDaysSinceApplication = () => {
    if (!job.applicationDate) return null;
    const now = new Date();
    const appDate = new Date(job.applicationDate);
    const diffTime = Math.abs(now - appDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceApplication = getDaysSinceApplication();

  return (
    <div
      ref={drag}
      className={`card bg-base-100 shadow-md mb-3 ${getCardColor()} ${isDragging ? 'opacity-50' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onCardClick(job)}
    >
      <div className="card-body p-4">
        <h3 className="card-title text-sm font-bold">{job.company}</h3>
        <p className="text-xs">{job.position}</p>
        {job.location && <p className="text-xs text-base-content/70">{job.location}</p>}
        
        <div className="flex justify-between items-center mt-2">
          {job.applicationDate ? (
            <div className="text-xs">
              Applied: {format(new Date(job.applicationDate), 'MMM dd')}
              {daysSinceApplication && (
                <span className="ml-1 text-base-content/70">({daysSinceApplication}d)</span>
              )}
            </div>
          ) : (
            <div className="text-xs text-base-content/70">Not applied yet</div>
          )}
          
          {job.nextActionDate && (
  <div className="flex flex-col">
    <div className="badge badge-sm" title={job.nextActionStep || "Next action date"}>
      {format(new Date(job.nextActionDate), 'MMM dd')}
    </div>
    {job.nextActionStep && (
      <span className="text-[10px] text-base-content/70 mt-1 truncate max-w-[100px]">
        {job.nextActionStep}
      </span>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
};

// Column component with drop functionality
const Column = ({ title, status, color, jobs, onStatusChange, onCardClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'JOB_CARD',
    drop: (item) => onStatusChange(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Filter jobs for this column
  const columnJobs = jobs.filter(job => job.status === status);

  return (
    <div 
      ref={drop} 
      className={`rounded-lg p-3 ${color} ${isOver ? 'ring-2 ring-primary' : ''}`}
      style={{ minHeight: '300px' }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">{title}</h3>
        <div className="badge badge-neutral badge-sm">{columnJobs.length}</div>
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {columnJobs.map(job => (
          <JobCard 
            key={job._id} 
            job={job} 
            onStatusChange={onStatusChange}
            onCardClick={onCardClick}
          />
        ))}
        
        {columnJobs.length === 0 && (
          <div className="text-center py-4 text-base-content/50 text-sm">
            No jobs
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ jobs, onStatusChange, onJobUpdate }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleCardClick = (job) => {
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statusColumns.map(column => (
          <Column
            key={column.id}
            title={column.title}
            status={column.status}
            color={column.color}
            jobs={jobs}
            onStatusChange={onStatusChange}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
      
      {isModalOpen && selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={handleCloseModal} 
          onUpdate={handleJobUpdate}
        />
      )}
    </DndProvider>
  );
};

export default KanbanBoard;