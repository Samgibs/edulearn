import React, { useState, useEffect } from 'react';
import { api, endpoints } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      let response;
      if (user?.is_superuser) {
        response = await api.get(endpoints.analytics.courseStatistics);
      } else if (user?.role === 'teacher') {
        response = await api.get(endpoints.analytics.teacherPerformance);
      } else {
        response = await api.get(endpoints.analytics.studentProgress);
      }
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts
  const studentProgressData = [
    { name: 'Jan', completed: 12, total: 20 },
    { name: 'Feb', completed: 18, total: 25 },
    { name: 'Mar', completed: 22, total: 30 },
    { name: 'Apr', completed: 28, total: 35 },
    { name: 'May', completed: 32, total: 40 },
    { name: 'Jun', completed: 38, total: 45 },
  ];

  const courseDistributionData = [
    { name: 'Beginner', value: 35, color: '#3B82F6' },
    { name: 'Intermediate', value: 45, color: '#10B981' },
    { name: 'Advanced', value: 20, color: '#F59E0B' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
        <p className="text-secondary-600">Track performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Students</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {analytics?.total_students || 0}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                <span>+12%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Courses</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {analytics?.total_courses || 0}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                <span>+8%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {analytics?.completion_rate || 0}%
              </p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                <span>+5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Revenue</p>
              <p className="text-2xl font-semibold text-secondary-900">
                ${analytics?.total_revenue?.toLocaleString() || 0}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                <span>+15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Progress Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Student Progress</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#3B82F6" name="Completed" />
                <Bar dataKey="total" fill="#E5E7EB" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Course Distribution</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">Revenue Trend</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Top Performing Courses</h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Web Development Fundamentals', students: 156, rating: 4.9 },
              { name: 'Data Science with Python', students: 134, rating: 4.8 },
              { name: 'Mobile App Development', students: 98, rating: 4.7 },
              { name: 'Machine Learning Basics', students: 87, rating: 4.6 },
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-secondary-900">{course.name}</h4>
                  <p className="text-sm text-secondary-500">{course.students} students</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-secondary-900 mr-1">
                      {course.rating}
                    </span>
                    <span className="text-yellow-400">★</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {[
              { action: 'New student enrolled', course: 'Web Development', time: '2 hours ago' },
              { action: 'Assignment submitted', course: 'Data Science', time: '4 hours ago' },
              { action: 'Course completed', course: 'Mobile Development', time: '6 hours ago' },
              { action: 'New course published', course: 'Machine Learning', time: '1 day ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-900">{activity.action}</p>
                  <p className="text-xs text-secondary-500">{activity.course} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
