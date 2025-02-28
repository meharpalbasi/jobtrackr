"use client";

import { useState, useEffect } from 'react';
import { format, subMonths, isWithinInterval, differenceInDays, parseISO } from 'date-fns';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const JobAnalytics = ({ jobs }) => {
  const [timeRange, setTimeRange] = useState('all'); // 'all', '3months', '6months', '1year'
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  
  // Filter jobs based on selected time range
  useEffect(() => {
    if (timeRange === 'all') {
      setFilteredJobs(jobs);
    } else {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '3months':
          startDate = subMonths(now, 3);
          break;
        case '6months':
          startDate = subMonths(now, 6);
          break;
        case '1year':
          startDate = subMonths(now, 12);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }
      
      setFilteredJobs(jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return isWithinInterval(jobDate, { start: startDate, end: now });
      }));
    }
  }, [timeRange, jobs]);

  // Calculate status distribution
  const statusCounts = {};
  const statusColors = {
    'Not Applied': 'rgba(156, 163, 175, 0.7)',
    'Applied': 'rgba(59, 130, 246, 0.7)',
    'No Response': 'rgba(107, 114, 128, 0.7)',
    'Phone Screen': 'rgba(139, 92, 246, 0.7)',
    'Interview': 'rgba(79, 70, 229, 0.7)',
    'Final Round': 'rgba(20, 184, 166, 0.7)',
    'Offer': 'rgba(34, 197, 94, 0.7)',
    'Accepted': 'rgba(16, 185, 129, 0.7)',
    'Rejected': 'rgba(239, 68, 68, 0.7)',
    'Declined': 'rgba(249, 115, 22, 0.7)'
  };
  
  filteredJobs.forEach(job => {
    statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
  });
  
  // Prepare data for pie chart
  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map(status => statusColors[status]),
        borderWidth: 1,
      },
    ],
  };
  
  // Calculate applications over time (by month)
  const getApplicationsByMonth = () => {
    const monthlyData = {};
    const sortedJobs = [...filteredJobs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    if (sortedJobs.length === 0) return { labels: [], data: [] };
    
    sortedJobs.forEach(job => {
      const date = new Date(job.createdAt);
      const monthYear = format(date, 'MMM yyyy');
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      monthlyData[monthYear]++;
    });
    
    return {
      labels: Object.keys(monthlyData),
      data: Object.values(monthlyData)
    };
  };
  
  const monthlyApplications = getApplicationsByMonth();
  
  // Prepare data for applications over time chart
  const lineData = {
    labels: monthlyApplications.labels,
    datasets: [
      {
        label: 'Applications',
        data: monthlyApplications.data,
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  // Calculate response times
  const calculateResponseTimes = () => {
    const responseTimes = [];
    
    filteredJobs.forEach(job => {
      // Only consider jobs that moved beyond "Applied" status
      if (job.applicationDate && 
          ['Phone Screen', 'Interview', 'Final Round', 'Offer', 'Accepted', 'Rejected'].includes(job.status)) {
        
        // For simplicity, we're using the updatedAt as a proxy for response date
        // In a real app, you'd track the actual date of status change
        const applicationDate = new Date(job.applicationDate);
        const responseDate = new Date(job.updatedAt);
        
        const daysToResponse = differenceInDays(responseDate, applicationDate);
        
        // Only include reasonable values (filter out negative or extremely large values)
        if (daysToResponse >= 0 && daysToResponse <= 90) {
          responseTimes.push({
            company: job.company,
            daysToResponse,
            status: job.status
          });
        }
      }
    });
    
    return responseTimes;
  };
  
  const responseTimes = calculateResponseTimes();
  
  // Calculate average response time
  const averageResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((sum, item) => sum + item.daysToResponse, 0) / responseTimes.length)
    : 0;
  
  // Group response times into buckets for the histogram
  const getResponseTimeDistribution = () => {
    const buckets = {
      '0-7 days': 0,
      '8-14 days': 0,
      '15-30 days': 0,
      '31-60 days': 0,
      '60+ days': 0
    };
    
    responseTimes.forEach(item => {
      if (item.daysToResponse <= 7) {
        buckets['0-7 days']++;
      } else if (item.daysToResponse <= 14) {
        buckets['8-14 days']++;
      } else if (item.daysToResponse <= 30) {
        buckets['15-30 days']++;
      } else if (item.daysToResponse <= 60) {
        buckets['31-60 days']++;
      } else {
        buckets['60+ days']++;
      }
    });
    
    return {
      labels: Object.keys(buckets),
      data: Object.values(buckets)
    };
  };
  
  const responseDistribution = getResponseTimeDistribution();
  
  // Prepare data for response time histogram
  const barData = {
    labels: responseDistribution.labels,
    datasets: [
      {
        label: 'Number of Companies',
        data: responseDistribution.data,
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Calculate success metrics
  const totalApplications = filteredJobs.length;
  const interviewRate = totalApplications > 0 
    ? Math.round((filteredJobs.filter(job => 
        ['Phone Screen', 'Interview', 'Final Round', 'Offer', 'Accepted'].includes(job.status)).length / totalApplications) * 100)
    : 0;
  const offerRate = totalApplications > 0
    ? Math.round((filteredJobs.filter(job => 
        ['Offer', 'Accepted', 'Declined'].includes(job.status)).length / totalApplications) * 100)
    : 0;
  const acceptanceRate = filteredJobs.filter(job => 
      ['Offer', 'Accepted', 'Declined'].includes(job.status)).length > 0
    ? Math.round((filteredJobs.filter(job => job.status === 'Accepted').length / 
        filteredJobs.filter(job => ['Offer', 'Accepted', 'Declined'].includes(job.status)).length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Job Application Analytics</h2>
        <select 
          className="select select-bordered select-sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>
      
      {/* Key Metrics */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">Total Applications</div>
          <div className="stat-value">{totalApplications}</div>
          <div className="stat-desc">In selected time period</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Interview Rate</div>
          <div className="stat-value">{interviewRate}%</div>
          <div className="stat-desc">Applications reaching interview</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Offer Rate</div>
          <div className="stat-value">{offerRate}%</div>
          <div className="stat-desc">Applications resulting in offers</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Acceptance Rate</div>
          <div className="stat-value">{acceptanceRate}%</div>
          <div className="stat-desc">Offers you accepted</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-base-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Application Status Distribution</h3>
          <div className="h-64">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
          
          {/* Status Counts Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <tr key={status}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: statusColors[status] }}
                        ></div>
                        {status}
                      </div>
                    </td>
                    <td>{count}</td>
                    <td>{Math.round((count / totalApplications) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Applications Over Time */}
        <div className="bg-base-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Applications Over Time</h3>
          <div className="h-64">
            <Line 
              data={lineData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }} 
            />
          </div>
          
          <div className="mt-4 text-sm">
            <p className="font-medium">Insights:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-base-content/80">
              <li>
                {monthlyApplications.data.length > 0 ? (
                  `Peak month: ${monthlyApplications.labels[monthlyApplications.data.indexOf(Math.max(...monthlyApplications.data))]} with ${Math.max(...monthlyApplications.data)} applications`
                ) : (
                  'No application data available for the selected period'
                )}
              </li>
              <li>
                {monthlyApplications.data.length > 1 ? (
                  `Average: ${(monthlyApplications.data.reduce((a, b) => a + b, 0) / monthlyApplications.data.length).toFixed(1)} applications per month`
                ) : (
                  'Not enough data to calculate monthly average'
                )}
              </li>
            </ul>
          </div>
        </div>
        
        {/* Response Time Analysis */}
        <div className="bg-base-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Response Time Analysis</h3>
          
          {responseTimes.length > 0 ? (
            <>
              <div className="stats shadow mb-4 w-full">
                <div className="stat">
                  <div className="stat-title">Average Response Time</div>
                  <div className="stat-value">{averageResponseTime} days</div>
                  <div className="stat-desc">From application to first response</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Fastest Response</div>
                  <div className="stat-value">
                    {Math.min(...responseTimes.map(item => item.daysToResponse))} days
                  </div>
                  <div className="stat-desc">
                    {responseTimes.find(item => 
                      item.daysToResponse === Math.min(...responseTimes.map(i => i.daysToResponse))
                    )?.company}
                  </div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Slowest Response</div>
                  <div className="stat-value">
                    {Math.max(...responseTimes.map(item => item.daysToResponse))} days
                  </div>
                  <div className="stat-desc">
                    {responseTimes.find(item => 
                      item.daysToResponse === Math.max(...responseTimes.map(i => i.daysToResponse))
                    )?.company}
                  </div>
                </div>
              </div>
              
              <div className="h-64">
                <Bar 
                  data={barData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    },
                    plugins: {
                      title: {
                        display: true,
                        text: 'Distribution of Response Times'
                      }
                    }
                  }} 
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-base-content/70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-center">Not enough data to analyze response times.</p>
              <p className="text-center text-sm mt-1">
                This requires applications that have progressed beyond the "Applied" stage.
              </p>
            </div>
          )}
        </div>
        
        {/* Application Sources Analysis */}
        <div className="bg-base-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Application Sources & Success Rates</h3>
          
          {filteredJobs.some(job => job.applicationSource) ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Applications</th>
                    <th>Interviews</th>
                    <th>Offers</th>
                    <th>Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const sources = {};
                    
                    // Group jobs by source
                    filteredJobs.forEach(job => {
                      const source = job.applicationSource || 'Not specified';
                      
                      if (!sources[source]) {
                        sources[source] = {
                          total: 0,
                          interviews: 0,
                          offers: 0
                        };
                      }
                      
                      sources[source].total++;
                      
                      if (['Phone Screen', 'Interview', 'Final Round', 'Offer', 'Accepted', 'Declined'].includes(job.status)) {
                        sources[source].interviews++;
                      }
                      
                      if (['Offer', 'Accepted', 'Declined'].includes(job.status)) {
                        sources[source].offers++;
                      }
                    });
                    
                    return Object.entries(sources).map(([source, stats]) => (
                      <tr key={source}>
                        <td>{source}</td>
                        <td>{stats.total}</td>
                        <td>{stats.interviews}</td>
                        <td>{stats.offers}</td>
                        <td>
                          {stats.total > 0 ? 
                            `${Math.round((stats.interviews / stats.total) * 100)}%` : 
                            '0%'
                          }
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-base-content/70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-center">No application source data available.</p>
              <p className="text-center text-sm mt-1">
                Add application sources to your job entries to see analytics here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;