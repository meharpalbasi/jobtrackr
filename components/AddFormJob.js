"use client";

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddJobForm = ({ onJobAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [job, setJob] = useState({
    company: '',
    position: '',
    status: 'Not Applied',
    location: '',
    jobType: 'Full-time',
    jobUrl: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/api/jobs', job);
      toast.success('Job added successfully!');
      setJob({
        company: '',
        position: '',
        status: 'Not Applied',
        location: '',
        jobType: 'Full-time',
        jobUrl: '',
        notes: ''
      });
      onJobAdded(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-base-100 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Company"
          className="input input-bordered w-full"
          value={job.company}
          onChange={(e) => setJob({...job, company: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Position"
          className="input input-bordered w-full"
          value={job.position}
          onChange={(e) => setJob({...job, position: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Location"
          className="input input-bordered w-full"
          value={job.location}
          onChange={(e) => setJob({...job, location: e.target.value})}
        />
        <input
          type="url"
          placeholder="Job URL"
          className="input input-bordered w-full"
          value={job.jobUrl}
          onChange={(e) => setJob({...job, jobUrl: e.target.value})}
        />
      </div>
      <textarea
        placeholder="Notes"
        className="textarea textarea-bordered w-full"
        value={job.notes}
        onChange={(e) => setJob({...job, notes: e.target.value})}
      />
      <button 
        type="submit" 
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? <span className="loading loading-spinner"></span> : 'Add Job'}
      </button>
    </form>
  );
};

export default AddJobForm;