"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import ButtonLogout from "@/components/ButtonLogout";
import AddJobForm from "@/components/AddFormJob";
import JobTable from "@/components/JobTable";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      await axios.put('/api/jobs', { id: jobId, status: newStatus });
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
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

  return (
    <main className="bg-base-200 min-h-screen">
      <section className="bg-base-100">
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
            <div className="stats shadow mb-8">
              <div className="stat">
                <div className="stat-title">Total Applications</div>
                <div className="stat-value">{jobs.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Active Applications</div>
                <div className="stat-value">
                  {jobs.filter(job => !['Rejected', 'Declined', 'Accepted'].includes(job.status)).length}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Success Rate</div>
                <div className="stat-value">
                  {jobs.length ? 
                    Math.round((jobs.filter(job => job.status === 'Accepted').length / jobs.length) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div>
                <AddJobForm onJobAdded={handleJobAdded} />
              </div>
              <div className="lg:col-span-3">
                <JobTable 
                  jobs={jobs} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDelete} 
                />
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}