"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const JobDetailsModal = ({ job, onClose, onUpdate }) => {
  const [editedJob, setEditedJob] = useState(job);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'yyyy-MM-dd');
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedJob(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.put('/api/jobs', { 
        id: editedJob._id,
        ...editedJob
      });
      
      toast.success('Job updated successfully!');
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update job');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {isEditing ? 'Edit Job' : 'Job Details'}
            </h2>
            <div className="flex gap-2">
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="btn btn-sm"
                >
                  Edit
                </button>
              )}
              <button onClick={onClose} className="btn btn-sm btn-circle">✕</button>
            </div>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">Company</label>
                  <input
                    type="text"
                    name="company"
                    className="input input-bordered"
                    value={editedJob.company}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">Position</label>
                  <input
                    type="text"
                    name="position"
                    className="input input-bordered"
                    value={editedJob.position}
                    onChange={handleChange}
                    required
                  />
                </div>

                
                <div className="form-control">
                  <label className="label">Status</label>
                  <select
                    name="status"
                    className="select select-bordered"
                    value={editedJob.status}
                    onChange={handleChange}
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
                </div>
                
                <div className="form-control">
                  <label className="label">Application Date</label>
                  <input
                    type="date"
                    name="applicationDate"
                    className="input input-bordered"
                    value={editedJob.applicationDate ? formatDate(editedJob.applicationDate) : ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="input input-bordered"
                    value={editedJob.location || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">Job Type</label>
                  <select
                    name="jobType"
                    className="select select-bordered"
                    value={editedJob.jobType || 'Full-time'}
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
                  <label className="label">Job URL</label>
                  <input
                    type="url"
                    name="jobUrl"
                    className="input input-bordered"
                    value={editedJob.jobUrl || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">Application Source</label>
                  <select
                    name="applicationSource"
                    className="select select-bordered"
                    value={editedJob.applicationSource || ''}
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
                  <label className="label">Contact Name</label>
                  <input
                    type="text"
                    name="contactName"
                    className="input input-bordered"
                    value={editedJob.contactName || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="input input-bordered"
                    value={editedJob.contactEmail || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">Next Action Date</label>
                  <input
                    type="date"
                    name="nextActionDate"
                    className="input input-bordered"
                    value={editedJob.nextActionDate ? formatDate(editedJob.nextActionDate) : ''}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Add this new field */}
<div className="form-control">
  <label className="label">Next Action Step</label>
  <input
    type="text"
    name="nextActionStep"
    className="input input-bordered"
    value={editedJob.nextActionStep || ''}
    onChange={handleChange}
  />
</div>
              </div>
              
              <div className="form-control">
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  className="textarea textarea-bordered h-24"
                  value={editedJob.notes || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-base-content/70">Company</h3>
                  <p className="text-lg">
                    {job.jobUrl ? (
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="link link-primary">
                        {job.company}
                      </a>
                    ) : (
                      job.company
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-base-content/70">Position</h3>
                  <p className="text-lg">{job.position}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-base-content/70">Status</h3>
                  <div className="badge badge-lg">{job.status}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-base-content/70">Application Date</h3>
                  <p>{job.applicationDate ? format(new Date(job.applicationDate), 'MMMM dd, yyyy') : 'Not applied yet'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-base-content/70">Location</h3>
                  <p>{job.location || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-base-content/70">Job Type</h3>
                  <p>{job.jobType || 'Full-time'}</p>
                </div>
                
                {job.applicationSource && (
                  <div>
                    <h3 className="text-sm font-semibold text-base-content/70">Application Source</h3>
                    <p>{job.applicationSource}</p>
                  </div>
                )}
                
                {job.contactName && (
                  <div>
                    <h3 className="text-sm font-semibold text-base-content/70">Contact</h3>
                    <p>{job.contactName}</p>
                    {job.contactEmail && (
                      <p>
                        <a href={`mailto:${job.contactEmail}`} className="link link-primary text-sm">
                          {job.contactEmail}
                        </a>
                      </p>
                    )}
                  </div>
                )}
                
                {job.nextActionDate && (
                  <div>
                    <h3 className="text-sm font-semibold text-base-content/70">Next Action Date</h3>
                    <p>{format(new Date(job.nextActionDate), 'MMMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
              
              {job.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-base-content/70">Notes</h3>
                  <div className="bg-base-200 p-3 rounded-lg whitespace-pre-wrap">
                    {job.notes}
                  </div>
                </div>
              )}
              
              <div className="divider"></div>
              
              <div className="text-sm text-base-content/70">
                <p>Created: {format(new Date(job.createdAt), 'MMMM dd, yyyy')}</p>
                <p>Last Updated: {format(new Date(job.updatedAt), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;