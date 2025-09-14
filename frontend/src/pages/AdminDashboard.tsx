import React, { useState, useEffect } from 'react';
import { api, endpoints } from '../services/api';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue: number;
  recent_enrollments: any[];
  recent_payments: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get(endpoints.admin.dashboard);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.total_users || 0,
      icon: UserGroupIcon,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Students',
      value: stats?.total_students || 0,
      icon: UserGroupIcon,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Teachers',
      value: stats?.total_teachers || 0,
      icon: AcademicCapIcon,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      name: 'Courses',
      value: stats?.total_courses || 0,
      icon: BookOpenIcon,
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      name: 'Enrollments',
      value: stats?.total_enrollments || 0,
      icon: ChartBarIcon,
      change: '+22%',
      changeType: 'positive' as const,
    },
    {
      name: 'Revenue',
      value: `$${stats?.total_revenue?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      change: '+18%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600">Overview of your learning management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
              </div>
              <div className="flex items-center">
                {stat.changeType === 'positive' ? (
                  <ArrowUpIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Enrollments</h3>
          </div>
          <div className="space-y-4">
            {stats?.recent_enrollments?.map((enrollment, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    {enrollment.student?.full_name || 'Unknown Student'}
                  </p>
                  <p className="text-xs text-secondary-500">
                    Enrolled in {enrollment.course?.title || 'Unknown Course'}
                  </p>
                </div>
                <span className="text-xs text-secondary-500">
                  {new Date(enrollment.enrollment_date).toLocaleDateString()}
                </span>
              </div>
            )) || (
              <p className="text-sm text-secondary-500 text-center py-4">No recent enrollments</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Payments</h3>
          </div>
          <div className="space-y-4">
            {stats?.recent_payments?.map((payment, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    {payment.student?.full_name || 'Unknown Student'}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {payment.payment_method} • {payment.course?.title || 'Unknown Course'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    ${payment.amount_paid}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-secondary-500 text-center py-4">No recent payments</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary text-center">
            Add New Course
          </button>
          <button className="btn-outline text-center">
            Manage Users
          </button>
          <button className="btn-outline text-center">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
