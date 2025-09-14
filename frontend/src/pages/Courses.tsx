import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  teacher: {
    username: string;
    full_name: string;
  };
  subjects: any[];
  start_date: string;
  end_date: string;
  enrollments?: any[];
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get(endpoints.courses.list);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'price':
        return a.price - b.price;
      case 'date':
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      default:
        return 0;
    }
  });

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
          <h1 className="text-2xl font-bold text-secondary-900">Courses</h1>
          <p className="text-secondary-600">Discover and enroll in courses</p>
        </div>
        {user?.role === 'teacher' && (
          <Link to="/courses/create" className="btn-primary flex items-center space-x-2">
            <PlusIcon className="w-5 h-5" />
            <span>Create Course</span>
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
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Level Filter */}
          <div className="md:w-48">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="input-field"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Sort */}
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="title">Sort by Title</option>
              <option value="price">Sort by Price</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCourses.map((course) => (
          <div key={course.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="w-6 h-6 text-primary-600" />
                <span className="text-sm font-medium text-primary-600 capitalize">
                  {course.level}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-secondary-600">4.8</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2">
              {course.title}
            </h3>
            
            <p className="text-sm text-secondary-600 mb-4 line-clamp-3">
              {course.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-secondary-500">
                <UserGroupIcon className="w-4 h-4 mr-2" />
                <span>{course.enrollments?.length || 0} students</span>
              </div>
              <div className="flex items-center text-sm text-secondary-500">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span>{course.teacher.full_name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-secondary-900">
                  ${course.price}
                </span>
                <span className="text-sm text-secondary-500">/course</span>
              </div>
              <Link
                to={`/courses/${course.id}`}
                className="btn-primary"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {sortedCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No courses found</h3>
          <p className="text-secondary-500">
            {searchTerm || filterLevel !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No courses available at the moment'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
