"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import ButtonLogout from "@/components/ButtonLogout";
import AddJobForm from "@/components/AddFormJob";
import JobTable from "@/components/JobTable";
import KanbanBoard from "@/components/KanbanBoard";
import JobAnalytics from "@/components/JobAnalytics";


// Inside your Dashboard component in app/dashboard/page.js
// Remove any import related to suggestNextAction at the top of the file

// Add this function inside the Dashboard component function, before you use it
function suggestNextAction(status) {
  switch (status) {
    case 'Not Applied':
      return {
        action: "Submit application",
        timeframe: 7
      };
    case 'Applied':
      return {
        action: "Follow up on application",
        timeframe: 14
      };
    case 'No Response':
      return {
        action: "Send follow-up email",
        timeframe: 7
      };
    case 'Phone Screen':
      return {
        action: "Prepare for phone screen",
        timeframe: 3
      };
    case 'Interview':
      return {
        action: "Send thank you note",
        timeframe: 1
      };
    case 'Final Round':
      return {
        action: "Send final thank you note",
        timeframe: 1
      };
    case 'Offer':
      return {
        action: "Review and respond to offer",
        timeframe: 5
      };
    default:
      return {
        action: "Update status",
        timeframe: 7
      };
  }
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'kanban', 'analytics'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/jobs');
      setJobs(response.data);
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobAdded = (newJob) => {
    setJobs(prevJobs => [newJob, ...prevJobs]);
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      console.log("Starting status change:", jobId, newStatus);
      
      // Get the current job
      const currentJob = jobs.find(job => job._id === jobId);
      if (!currentJob) {
        console.error("Job not found:", jobId);
        toast.error("Job not found");
        return;
      }
      
      // Generate suggested next action based on new status
      const suggestion = suggestNextAction(newStatus);
      console.log("Suggestion:", suggestion);
      
      // Calculate suggested next action date
      const nextActionDate = new Date();
      nextActionDate.setDate(nextActionDate.getDate() + suggestion.timeframe);
      
      // Only auto-update if there's no existing next action or status changed
      const shouldUpdateNextAction = 
        !currentJob.nextActionDate || 
        currentJob.status !== newStatus;
      
      console.log("Should update next action:", shouldUpdateNextAction);
      
      // Update job with new status and suggested next action
      const updateData = { 
        id: jobId, 
        status: newStatus 
      };
      
      // Add next action fields if appropriate
      if (shouldUpdateNextAction) {
        updateData.nextActionDate = nextActionDate.toISOString();
        updateData.nextActionStep = suggestion.action;
      }
      
      console.log("Update data:", updateData);
      
      const response = await axios.put('/api/jobs', updateData);
      console.log("API response:", response.data);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === jobId ? { 
            ...job, 
            status: newStatus,
            ...(shouldUpdateNextAction && {
              nextActionDate: nextActionDate,
              nextActionStep: suggestion.action
            })
          } : job
        )
      );
      
      toast.success("Status updated");
      
      // If next action was auto-updated, show additional toast
      if (shouldUpdateNextAction) {
        toast.success(`Next action suggested: ${suggestion.action}`);
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDateChange = async (jobId, newDate) => {
    try {
      await axios.put('/api/jobs', { 
        id: jobId, 
        applicationDate: newDate ? new Date(newDate).toISOString() : null 
      });
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === jobId ? { ...job, applicationDate: newDate ? new Date(newDate) : null } : job
        )
      );
      toast.success("Application date updated");
    } catch (error) {
      toast.error("Failed to update application date");
    }
  };

  const handleJobUpdate = (updatedJob) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job._id === updatedJob._id ? updatedJob : job
      )
    );
    toast.success("Job updated successfully");
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await axios.delete(`/api/jobs?id=${jobId}`);
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      toast.success("Job deleted");
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.notes && job.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const activeJobs = jobs.filter(job => !['Rejected', 'Declined', 'Accepted'].includes(job.status)).length;
  const acceptedJobs = jobs.filter(job => job.status === 'Accepted').length;
  const successRate = jobs.length ? Math.round((acceptedJobs / jobs.length) * 100) : 0;
  const interviewRate = jobs.length ? 
    Math.round((jobs.filter(job => ['Phone Screen', 'Interview', 'Final Round', 'Offer', 'Accepted'].includes(job.status)).length / jobs.length) * 100) : 0;

  return (
    <main className="bg-base-200 min-h-screen">
      <section className="bg-base-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Job Applications</h1>
          <ButtonLogout />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-8">
        {isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            <div className="stats shadow mb-8 w-full">
              <div className="stat">
                <div className="stat-title">Total Applications</div>
                <div className="stat-value">{jobs.length}</div>
                <div className="stat-desc">{jobs.length > 0 ? `Last added on ${new Date(jobs[0].createdAt).toLocaleDateString()}` : "No applications yet"}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Active Applications</div>
                <div className="stat-value">{activeJobs}</div>
                <div className="stat-desc">{activeJobs > 0 ? `${Math.round((activeJobs / jobs.length) * 100)}% of total` : "No active applications"}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Success Rate</div>
                <div className="stat-value">{successRate}%</div>
                <div className="stat-desc">{acceptedJobs} accepted offers</div>
              </div>
              <div className="stat">
                <div className="stat-title">Interview Rate</div>
                <div className="stat-value">{interviewRate}%</div>
                <div className="stat-desc">Applications reaching interview stage</div>
              </div>
            </div>

            {/* View Toggle and Search/Filter Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="btn-group">
                <button 
                  className={`btn ${viewMode === 'table' ? 'btn-active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                  </svg>
                  Table
                </button>
                <button 
                  className={`btn ${viewMode === 'kanban' ? 'btn-active' : ''}`}
                  onClick={() => setViewMode('kanban')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Kanban
                </button>
                <button 
                  className={`btn ${viewMode === 'analytics' ? 'btn-active' : ''}`}
                  onClick={() => setViewMode('analytics')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Analytics
                </button>
              </div>

              {viewMode !== 'analytics' && (
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="form-control">
                    <div className="input-group">
                      <input 
                        type="text" 
                        placeholder="Search company, position, location..." 
                        className="input input-bordered"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-square">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <select 
                    className="select select-bordered"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
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
                </div>
              )}
            </div>

            {/* Content based on view mode */}
            {viewMode === 'table' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div>
                  <AddJobForm onJobAdded={handleJobAdded} />
                </div>
                <div className="lg:col-span-3">
                  <JobTable 
                    jobs={filteredJobs} 
                    onStatusChange={handleStatusChange} 
                    onDelete={handleDelete}
                    onDateChange={handleDateChange}
                    onJobUpdate={handleJobUpdate}
                  />
                </div>
              </div>
            )}

            {viewMode === 'kanban' && (
              <div className="space-y-8">
                <div className="bg-base-100 p-4 rounded-lg shadow">
                  <AddJobForm onJobAdded={handleJobAdded} />
                </div>
                <KanbanBoard 
                  jobs={filteredJobs} 
                  onStatusChange={handleStatusChange}
                  onJobUpdate={handleJobUpdate}
                />
              </div>
            )}

            {viewMode === 'analytics' && (
              <JobAnalytics jobs={jobs} />
            )}
          </>
        )}
      </section>
    </main>
  );
};