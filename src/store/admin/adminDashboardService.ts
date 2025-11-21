import axiosInstance from '@/axios-setup/axios-instance';
import { DASHBOARD } from '@/store/endpoints';

export interface UserIntegrationStatus {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: {
    name: string;
    display_name: string;
  };
  google_calendar_connected: boolean;
  last_login: string | null;
  created_at: string;
  is_active: boolean;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  googleIntegratedUsers: number;
  nonIntegratedUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  totalInterviews: number;
  scheduledInterviews: number;
  completedInterviews: number;
  pendingFeedback: number;
  usersByRole: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  googleIntegrationStatus: UserIntegrationStatus[];
  recentUserActivity: Array<{
    id: string;
    user_name: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
  systemHealth: {
    api_status: 'healthy' | 'degraded' | 'down';
    database_status: 'healthy' | 'degraded' | 'down';
    google_calendar_service: 'operational' | 'issues' | 'down';
    total_api_calls_today: number;
    error_rate: number;
  };
  weeklyUserActivity: Array<{
    date: string;
    new_users: number;
    active_users: number;
    google_integrations: number;
  }>;
}

export const adminDashboardService = {
  // Helper function to fetch all paginated data
  fetchAllPaginatedData: async (endpoint: string, maxPageSize: number = 100): Promise<any[]> => {
    let allData: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await axiosInstance.get(`${endpoint}?page=${page}&page_size=${maxPageSize}`);
        const responseData = response.data?.data;
        
        if (responseData) {
          // Handle the backend response structure: { result: [], total: number, page: number, page_size: number, total_pages: number }
          const data = responseData.result || responseData.data || responseData;
          const totalPages = responseData.total_pages;
          const currentPage = responseData.page;
          
          if (Array.isArray(data)) {
            allData = [...allData, ...data];
          }
          
          // Check if there are more pages
          if (totalPages && currentPage < totalPages) {
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching page ${page} for ${endpoint}:`, error);
        hasMore = false;
      }
    }

    return allData;
  },

  // Get comprehensive admin dashboard data
  getAdminDashboardData: async (): Promise<AdminDashboardData> => {
    try {
      // Fetch all required data in parallel with proper pagination
      const [
        users,
        jobs,
        candidates,
        interviews,
        dashboardAnalyticsResponse
      ] = await Promise.all([
        adminDashboardService.fetchAllPaginatedData('/api/v1/users'),
        adminDashboardService.fetchAllPaginatedData('/api/v1/jobs'),
        adminDashboardService.fetchAllPaginatedData('/api/v1/candidates'),
        adminDashboardService.fetchAllPaginatedData('/api/v1/interview-rounds'),
        axiosInstance.get(DASHBOARD.ANALYTICS).catch(() => ({ data: { data: null } }))
      ]);

      // Calculate user metrics
      const activeUsers = users.filter((user: any) => user.is_active).length;
      const inactiveUsers = users.length - activeUsers;

      // Get Google integration status from backend
      let googleIntegrationData;
      try {
        const googleIntegrationResponse = await axiosInstance.get(DASHBOARD.GOOGLE_INTEGRATION_STATUS);
        googleIntegrationData = googleIntegrationResponse.data?.data;
      } catch (error) {
        console.warn('Failed to fetch Google integration status, using fallback data:', error);
        googleIntegrationData = null;
      }

      const googleIntegrationStatus: UserIntegrationStatus[] = googleIntegrationData?.users || users.map((user: any) => ({
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        role: user.role || { name: 'user', display_name: 'User' },
        google_calendar_connected: Math.random() > 0.6, // Fallback simulation
        last_login: user.last_login || null,
        created_at: user.created_at,
        is_active: user.is_active
      }));

      const googleIntegratedUsers = googleIntegrationData?.summary?.connected_users || googleIntegrationStatus.filter(u => u.google_calendar_connected).length;
      const nonIntegratedUsers = googleIntegrationData?.summary?.not_connected_users || (googleIntegrationStatus.length - googleIntegratedUsers);

      // Calculate job metrics
      const activeJobs = jobs.filter((job: any) => job.status === 'active').length;

      // Calculate interview metrics
      const scheduledInterviews = interviews.filter((interview: any) => interview.status === 'scheduled').length;
      const completedInterviews = interviews.filter((interview: any) => interview.status === 'completed').length;
      const pendingFeedback = interviews.filter((interview: any) => interview.status === 'needs_feedback').length;

      // Calculate users by role
      const roleCounts = users.reduce((acc: any, user: any) => {
        const roleName = user.role?.display_name || user.role?.name || 'Unassigned';
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      }, {});

      const usersByRole = Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count: count as number,
        percentage: Math.round((count as number / users.length) * 100)
      }));

      // Generate recent user activity (mock data for now)
      const recentUserActivity = [
        {
          id: '1',
          user_name: 'John Doe',
          action: 'Connected Google Calendar',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: 'Successfully integrated Google Calendar for interview scheduling'
        },
        {
          id: '2',
          user_name: 'Jane Smith',
          action: 'Created new job posting',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          details: 'Senior React Developer position'
        },
        {
          id: '3',
          user_name: 'Mike Johnson',
          action: 'Scheduled interview',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          details: 'Technical round for Software Engineer role'
        },
        {
          id: '4',
          user_name: 'Sarah Wilson',
          action: 'Updated user permissions',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          details: 'Modified TA Executive role permissions'
        }
      ];

      // Generate weekly user activity
      const weeklyUserActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          new_users: Math.floor(Math.random() * 5) + 1,
          active_users: Math.floor(Math.random() * 20) + 10,
          google_integrations: Math.floor(Math.random() * 3) + 1
        };
      });

      // System health (mock data)
      const systemHealth = {
        api_status: 'healthy' as const,
        database_status: 'healthy' as const,
        google_calendar_service: 'operational' as const,
        total_api_calls_today: Math.floor(Math.random() * 1000) + 500,
        error_rate: Math.random() * 2 // 0-2% error rate
      };

      return {
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
        googleIntegratedUsers,
        nonIntegratedUsers,
        totalJobs: jobs.length,
        activeJobs,
        totalCandidates: candidates.length,
        totalInterviews: interviews.length,
        scheduledInterviews,
        completedInterviews,
        pendingFeedback,
        usersByRole,
        googleIntegrationStatus,
        recentUserActivity,
        systemHealth,
        weeklyUserActivity
      };

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw error;
    }
  },

  // Get detailed Google integration report
  getGoogleIntegrationReport: async () => {
    try {
      const users = await adminDashboardService.fetchAllPaginatedData('/api/v1/users');

      // For each user, check their Google integration status
      // In a real implementation, this would be a single backend endpoint
      const integrationReport = users.map((user: any) => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        role: user.role?.display_name || user.role?.name || 'User',
        google_connected: Math.random() > 0.5, // Mock data
        last_sync: Math.random() > 0.7 ? new Date().toISOString() : null,
        integration_date: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        status: Math.random() > 0.8 ? 'needs_reauth' : 'active'
      }));

      return integrationReport;
    } catch (error) {
      console.error('Error fetching Google integration report:', error);
      return [];
    }
  },

  // Get user activity analytics
  getUserActivityAnalytics: async (days: number = 30) => {
    try {
      // This would be a real endpoint in production
      const analytics = {
        totalLogins: Math.floor(Math.random() * 500) + 200,
        uniqueActiveUsers: Math.floor(Math.random() * 100) + 50,
        averageSessionDuration: Math.floor(Math.random() * 30) + 15, // minutes
        topActiveUsers: [
          { name: 'John Doe', sessions: 45, last_active: '2 hours ago' },
          { name: 'Jane Smith', sessions: 38, last_active: '1 hour ago' },
          { name: 'Mike Johnson', sessions: 32, last_active: '30 minutes ago' },
          { name: 'Sarah Wilson', sessions: 28, last_active: '4 hours ago' },
          { name: 'David Brown', sessions: 25, last_active: '1 day ago' }
        ],
        inactiveUsers: [
          { name: 'Alice Cooper', last_active: '7 days ago', role: 'TA Executive' },
          { name: 'Bob Wilson', last_active: '14 days ago', role: 'Interviewer' },
          { name: 'Carol Davis', last_active: '21 days ago', role: 'Hiring Manager' }
        ]
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching user activity analytics:', error);
      return null;
    }
  }
};
