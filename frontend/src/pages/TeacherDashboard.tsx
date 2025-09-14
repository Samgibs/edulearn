import React, { useState, useEffect } from 'react';
import { api, endpoints } from '../services/api';
import {
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface TeacherStats {
  total_courses: number;
  total_students: number;
  total_assignments: number;
  recent_courses: any[];
  recent_assignments: any[];
}

const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      // Fetch teacher courses
      const coursesResponse = await api.get(endpoints.teachers.meCourses);
      const courses = coursesResponse.data || [];
      
      // Fetch assignments
      const assignmentsResponse = await api.get(endpoints.assignments.list);
      const assignments = assignmentsResponse.data || [];
      
      // Calculate stats
      const totalStudents = courses.reduce((acc: number, course: any) => {
        return acc + (course.enrollments?.length || 0);
      }, 0);
      
      setStats({
        total_courses: courses.length,
        total_students: totalStudents,
        total_assignments: assignments.length,
        recent_courses: courses.slice(0, 5),
        recent_assignments: assignments.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      // Set default empty stats on error
      setStats({
        total_courses: 0,
        total_students: 0,
        total_assignments: 0,
        recent_courses: [],
        recent_assignments: [],
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
      name: 'My Courses',
      value: stats?.total_courses || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Total Students',
      value: stats?.total_students || 0,
      icon: UserGroupIcon,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Assignments',
      value: stats?.total_assignments || 0,
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Analytics',
      value: 'View',
      icon: ChartBarIcon,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Teacher Dashboard</h1>
          <p className="text-secondary-600">Manage your courses and students</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Create Course</span>
        </button>
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">My Courses</h3>
          </div>
          <div className="space-y-4">
            {stats?.recent_courses?.map((course, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-b-0">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-secondary-900">{course.title}</h4>
                  <p className="text-xs text-secondary-500 mt-1">{course.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs text-secondary-500">
                      {course.enrollments?.length || 0} students
                    </span>
                    <span className="text-xs text-secondary-500">
                      ${course.price}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-secondary-400 hover:text-primary-600">
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            )) || (
              <p className="text-sm text-secondary-500 text-center py-4">No courses yet</p>
            )}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Assignments</h3>
          </div>
          <div className="space-y-4">
            {stats?.recent_assignments?.map((assignment, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-b-0">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-secondary-900">{assignment.title}</h4>
                  <p className="text-xs text-secondary-500 mt-1">{assignment.course?.title}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs text-secondary-500">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-secondary-500">
                      {assignment.submissions?.length || 0} submissions
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    assignment.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-sm text-secondary-500 text-center py-4">No assignments yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary text-center">
            Create Course
          </button>
          <button className="btn-outline text-center">
            Add Assignment
          </button>
          <button className="btn-outline text-center">
            View Students
          </button>
          <button className="btn-outline text-center">
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
