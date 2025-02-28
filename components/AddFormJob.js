"use client";

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddFormJob = ({ onJobAdded }) => {
  const initialFormState = {
    company: '',
    position: '',
    location: '',
    jobType: 'Full-time',
    jobUrl: '',
    status: 'Not Applied',
    applicationSource: '',
    contactName: '',
    contactEmail: '',
    notes: '',
    nextActionDate: '',
    nextActionStep: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    if (formData.jobUrl && !isValidUrl(formData.jobUrl)) {
      newErrors.jobUrl = 'Please enter a valid URL';
    }
    
    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Set application date if status is Applied
      const dataToSubmit = { ...formData };
      if (formData.status === 'Applied') {
        dataToSubmit.applicationDate = new Date().toISOString();
      }
      
      const response = await axios.post('/api/jobs', dataToSubmit);
      
      toast.success('Job added successfully!');
      setFormData(initialFormState);
      
      if (onJobAdded) {
        onJobAdded(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Add New Job</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Company*</span>
          </label>
          <input
            type="text"
            name="company"
            placeholder="Company name"
            className={`input input-bordered w-full ${errors.company ? 'input-error' : ''}`}
            value={formData.company}
            onChange={handleChange}
          />
          {errors.company && <span className="text-error text-sm mt-1">{errors.company}</span>}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Position*</span>
          </label>
          <input
            type="text"
            name="position"
            placeholder="Job title"
            className={`input input-bordered w-full ${errors.position ? 'input-error' : ''}`}
            value={formData.position}
            onChange={handleChange}
          />
          {errors.position && <span className="text-error text-sm mt-1">{errors.position}</span>}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Location</span>
          </label>
          <input
            type="text"
            name="location"
            placeholder="City, State or Remote"
            className="input input-bordered w-full"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Job Type</span>
          </label>
          <select
            name="jobType"
            className="select select-bordered w-full"
            value={formData.jobType}
            onChange={handleChange}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <select
            name="status"
            className="select select-bordered w-full"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Not Applied">Not Applied</option>
            <option value="Applied">Applied</option>
            <option value="No Response">No Response</option>
            <option value="Phone Screen">Phone Screen</option>
            <option value="Interview">Interview</option>
            <option value="Final Round">Final Round</option>
            <option value="Offer">Offer</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Job URL</span>
          </label>
          <input
            type="url"
            name="jobUrl"
            placeholder="https://example.com/job"
            className={`input input-bordered w-full ${errors.jobUrl ? 'input-error' : ''}`}
            value={formData.jobUrl}
            onChange={handleChange}
          />
          {errors.jobUrl && <span className="text-error text-sm mt-1">{errors.jobUrl}</span>}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Application Source</span>
          </label>
          <select
            name="applicationSource"
            className="select select-bordered w-full"
            value={formData.applicationSource}
            onChange={handleChange}
          >
            <option value="">Select Source</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Indeed">Indeed</option>
            <option value="Company Website">Company Website</option>
            <option value="Referral">Referral</option>
            <option value="Job Board">Job Board</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Contact Name</span>
          </label>
          <input
            type="text"
            name="contactName"
            placeholder="Recruiter or hiring manager"
            className="input input-bordered w-full"
            value={formData.contactName}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Contact Email</span>
          </label>
          <input
            type="email"
            name="contactEmail"
            placeholder="contact@example.com"
            className={`input input-bordered w-full ${errors.contactEmail ? 'input-error' : ''}`}
            value={formData.contactEmail}
            onChange={handleChange}
          />
          {errors.contactEmail && <span className="text-error text-sm mt-1">{errors.contactEmail}</span>}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Next Action Date</span>
          </label>
          <input
            type="date"
            name="nextActionDate"
            className="input input-bordered"
            value={formData.nextActionDate || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Next Action Step</span>
          </label>
          <input
            type="text"
            name="nextActionStep"
            className="input input-bordered"
            value={formData.nextActionStep || ''}
            onChange={handleChange}
            placeholder="What's the next step for this application?"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Notes</span>
          </label>
          <textarea
            name="notes"
            placeholder="Any additional information"
            className="textarea textarea-bordered h-24"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-control mt-6">
          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Adding...
              </>
            ) : (
              'Add Job'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFormJob;