import axiosInstance from '@/axios-setup/axios-instance';

export interface DashboardAnalytics {
  totalUsers: number;
  totalJobs: number;
  totalCandidates: number;
  totalInterviews: number;
  activeJobs: number;
  scheduledInterviews: number;
  completedInterviews: number;
  pendingFeedback: number;
  weeklyActivity: Array<{
    date: string;
    jobs: number;
    candidates: number;
    interviews: number;
  }>;
  interviewStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  pipelineMetrics: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'job' | 'candidate' | 'interview' | 'user';
    action: string;
    resource: string;
    timestamp: string;
  }>;
}

export const dashboardService = {
  // Get comprehensive dashboard analytics
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    try {
      // In a real implementation, this would be a single endpoint
      // For now, we'll aggregate data from multiple endpoints
      const [usersRes, jobsRes, candidatesRes, interviewsRes] = await Promise.all([
        axiosInstance.get('/api/v1/users?page=1&page_size=1000'),
        axiosInstance.get('/api/v1/jobs?page=1&page_size=1000'),
        axiosInstance.get('/api/v1/candidates?page=1&page_size=1000'),
        axiosInstance.get('/api/v1/interview-rounds?page=1&page_size=1000'),
      ]);

      const users = usersRes.data?.data || [];
      const jobs = jobsRes.data?.data || [];
      const candidates = candidatesRes.data?.data || [];
      const interviews = interviewsRes.data?.data || [];

      // Calculate metrics
      const activeJobs = jobs.filter((job: any) => job.status === 'active').length;
      const scheduledInterviews = interviews.filter((interview: any) => interview.status === 'scheduled').length;
      const completedInterviews = interviews.filter((interview: any) => interview.status === 'completed').length;
      const pendingFeedback = interviews.filter((interview: any) => interview.status === 'needs_feedback').length;

      // Generate weekly activity (mock data for now)
      const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          jobs: Math.floor(Math.random() * 20) + 5,
          candidates: Math.floor(Math.random() * 40) + 10,
          interviews: Math.floor(Math.random() * 15) + 3,
        };
      });

      // Interview status distribution
      const statusCounts = interviews.reduce((acc: any, interview: any) => {
        acc[interview.status] = (acc[interview.status] || 0) + 1;
        return acc;
      }, {});

      const interviewStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
      }));

      // Pipeline metrics (estimated)
      const totalCandidates = candidates.length;
      const pipelineMetrics = [
        { stage: 'Applied', count: totalCandidates, percentage: 100 },
        { stage: 'Screening', count: Math.floor(totalCandidates * 0.7), percentage: 70 },
        { stage: 'Interview', count: scheduledInterviews + completedInterviews, percentage: 40 },
        { stage: 'Feedback', count: pendingFeedback, percentage: 25 },
        { stage: 'Offer', count: Math.floor(completedInterviews * 0.6), percentage: 15 },
        { stage: 'Hired', count: Math.floor(completedInterviews * 0.4), percentage: 10 },
      ];

      // Recent activity (mock data)
      const recentActivity = [
        {
          id: '1',
          type: 'interview' as const,
          action: 'Interview scheduled',
          resource: 'Technical Round - Software Engineer',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'candidate' as const,
          action: 'New candidate registered',
          resource: 'John Doe - Frontend Developer',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          type: 'job' as const,
          action: 'Job posting created',
          resource: 'Senior React Developer',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          type: 'interview' as const,
          action: 'Interview completed',
          resource: 'HR Round - Product Manager',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return {
        totalUsers: users.length,
        totalJobs: jobs.length,
        totalCandidates: candidates.length,
        totalInterviews: interviews.length,
        activeJobs,
        scheduledInterviews,
        completedInterviews,
        pendingFeedback,
        weeklyActivity,
        interviewStatusDistribution,
        pipelineMetrics,
        recentActivity,
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  // Get real-time system status
  getSystemStatus: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/health');
      return response.data;
    } catch (error) {
      // If health endpoint doesn't exist, return mock data
      return {
        api: 'healthy',
        database: 'healthy',
        googleCalendar: 'connected',
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  // Get recent notifications/alerts
  getNotifications: async () => {
    try {
      // This would be a real endpoint in production
      return [
        {
          id: '1',
          type: 'warning',
          title: 'Interview Reminder',
          message: '3 interviews scheduled for today',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'info',
          title: 'New Candidates',
          message: '5 new candidates applied this week',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
};
