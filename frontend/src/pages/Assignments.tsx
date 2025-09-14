import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'draft' | 'published' | 'graded';
  course: {
    title: string;
    id: string;
  };
  teacher: {
    username: string;
    full_name: string;
  };
  max_score: number;
  submissions?: any[];
}

const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get(endpoints.assignments.list);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'draft':
        return <ExclamationCircleIcon className="w-4 h-4" />;
      case 'graded':
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Assignments</h1>
          <p className="text-secondary-600">Manage and track your assignments</p>
        </div>
        {user?.role === 'teacher' && (
          <Link to="/assignments/create" className="btn-primary flex items-center space-x-2">
            <PlusIcon className="w-5 h-5" />
            <span>Create Assignment</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    {assignment.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                    {getStatusIcon(assignment.status)}
                    <span className="ml-1 capitalize">{assignment.status}</span>
                  </span>
                </div>
                
                <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                  {assignment.description}
                </p>

                <div className="flex items-center space-x-6 text-sm text-secondary-500">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    <span>Max Score: {assignment.max_score}</span>
                  </div>
                  <div className="flex items-center">
                    <span>Course: {assignment.course.title}</span>
                  </div>
                </div>

                {user?.role === 'student' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-500">
                        {assignment.submissions?.length || 0} submissions
                      </span>
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="btn-primary"
                      >
                        {assignment.submissions?.length ? 'View Submission' : 'Submit Assignment'}
                      </Link>
                    </div>
                  </div>
                )}

                {user?.role === 'teacher' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-500">
                        {assignment.submissions?.length || 0} submissions
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          to={`/assignments/${assignment.id}/edit`}
                          className="btn-outline"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/assignments/${assignment.id}`}
                          className="btn-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No assignments found</h3>
          <p className="text-secondary-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No assignments available at the moment'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Assignments;
