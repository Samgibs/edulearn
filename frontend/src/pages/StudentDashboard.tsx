import React, { useState, useEffect } from 'react';
import { api, endpoints } from '../services/api';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface StudentStats {
  enrolled_courses: number;
  completed_assignments: number;
  pending_assignments: number;
  recent_courses: any[];
  upcoming_assignments: any[];
  progress_data: any[];
}

const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Fetch student courses
      const coursesResponse = await api.get(endpoints.students.meCourses);
      const courses = coursesResponse.data || [];
      
      // Fetch assignments
      const assignmentsResponse = await api.get(endpoints.assignments.list);
      const assignments = assignmentsResponse.data || [];
      
      // Fetch progress
      const progressResponse = await api.get(endpoints.progress.list);
      const progress = progressResponse.data || [];
      
      // Calculate stats
      const completedAssignments = assignments.filter((a: any) => a.status === 'submitted').length;
      const pendingAssignments = assignments.filter((a: any) => a.status === 'assigned').length;
      
      setStats({
        enrolled_courses: courses.length,
        completed_assignments: completedAssignments,
        pending_assignments: pendingAssignments,
        recent_courses: courses.slice(0, 4),
        upcoming_assignments: assignments
          .filter((a: any) => a.due_date && new Date(a.due_date) > new Date())
          .slice(0, 5),
        progress_data: progress,
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Set default empty stats on error
      setStats({
        enrolled_courses: 0,
        completed_assignments: 0,
        pending_assignments: 0,
        recent_courses: [],
        upcoming_assignments: [],
        progress_data: [],
      });
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
      name: 'Enrolled Courses',
      value: stats?.enrolled_courses || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Completed Assignments',
      value: stats?.completed_assignments || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Pending Assignments',
      value: stats?.pending_assignments || 0,
      icon: ExclamationCircleIcon,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      name: 'Progress',
      value: 'View',
      icon: ChartBarIcon,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Student Dashboard</h1>
        <p className="text-secondary-600">Track your learning progress and assignments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">My Courses</h3>
            </div>
            <div className="space-y-4">
              {stats?.recent_courses?.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-secondary-900">{course.title}</h4>
                    <p className="text-xs text-secondary-500 mt-1">{course.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-secondary-500">
                        Teacher: {course.teacher?.username}
                      </span>
                      <span className="text-xs text-secondary-500">
                        Level: {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-secondary-500">75%</span>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-secondary-500 text-center py-8">No courses enrolled yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">Upcoming Assignments</h3>
            </div>
            <div className="space-y-4">
              {stats?.upcoming_assignments?.map((assignment, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-secondary-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-secondary-900 truncate">
                      {assignment.title}
                    </h4>
                    <p className="text-xs text-secondary-500 mt-1">
                      {assignment.course?.title}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-secondary-500 text-center py-4">No upcoming assignments</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">Learning Progress</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats?.progress_data?.map((progress, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-secondary-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${progress.modules_completed}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-secondary-900">
                    {Math.round((progress.modules_completed / progress.total_modules) * 100)}%
                  </span>
                </div>
              </div>
              <h4 className="text-sm font-medium text-secondary-900">{progress.course?.title}</h4>
              <p className="text-xs text-secondary-500">
                {progress.modules_completed} of {progress.total_modules} modules
              </p>
            </div>
          )) || (
            <p className="text-sm text-secondary-500 text-center py-8 col-span-3">No progress data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
