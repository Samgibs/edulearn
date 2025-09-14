import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  PlayIcon,
  CheckCircleIcon,
  LockClosedIcon,
  CalendarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface CourseDetail {
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
  syllabus_structure: string;
  syllabus_content: string;
  enrollments?: any[];
  modules?: any[];
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(endpoints.courses.detail(id!));
      setCourse(response.data);
      
      // Check if user is enrolled
      if (user?.role === 'student') {
        // Check enrollment status
        setEnrolled(false); // This would be determined by API response
      }
    } catch (error) {
      console.error('Error fetching course detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await api.post(endpoints.courses.enroll(id!));
      setEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Course not found</h3>
        <p className="text-secondary-500">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                {course.level}
              </span>
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-secondary-600">4.8 (124 reviews)</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              {course.title}
            </h1>
            
            <p className="text-lg text-secondary-600 mb-6">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
              <div className="flex items-center">
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                <span>Instructor: {course.teacher.full_name}</span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                <span>{course.enrollments?.length || 0} students</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>Starts {new Date(course.start_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="lg:w-80">
            <div className="bg-secondary-50 rounded-lg p-6">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-secondary-900">
                  ${course.price}
                </span>
                <span className="text-secondary-500">/course</span>
              </div>

              {user?.role === 'student' ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolled}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    enrolled
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {enrolled ? 'Enrolled' : 'Enroll Now'}
                </button>
              ) : (
                <div className="space-y-3">
                  <button className="w-full btn-primary">
                    Edit Course
                  </button>
                  <button className="w-full btn-outline">
                    View Students
                  </button>
                </div>
              )}

              <div className="mt-6 text-sm text-secondary-500">
                <p>✓ 30-day money-back guarantee</p>
                <p>✓ Lifetime access</p>
                <p>✓ Certificate of completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Curriculum */}
          <div className="card">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Course Curriculum</h2>
            <div className="space-y-4">
              {course.modules?.map((module, index) => (
                <div key={index} className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-secondary-900">{module.title}</h3>
                        <p className="text-sm text-secondary-500">{module.lessons?.length || 0} lessons</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm text-secondary-500">{module.duration || '30 min'}</span>
                    </div>
                  </div>
                  
                  {module.lessons?.map((lesson: any, lessonIndex: number) => (
                    <div key={lessonIndex} className="ml-11 mt-3 flex items-center space-x-3">
                      <div className="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center">
                        {lesson.completed ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <PlayIcon className="w-4 h-4 text-secondary-400" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        lesson.completed ? 'text-green-600' : 'text-secondary-600'
                      }`}>
                        {lesson.title}
                      </span>
                      <span className="text-xs text-secondary-400">
                        {lesson.duration || '10 min'}
                      </span>
                    </div>
                  ))}
                </div>
              )) || (
                <div className="text-center py-8">
                  <BookOpenIcon className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-500">Course curriculum will be available soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Description */}
          <div className="card">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">About This Course</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-secondary-600 leading-relaxed">
                {course.syllabus_content || course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Instructor</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-secondary-900">{course.teacher.full_name}</h4>
                <p className="text-sm text-secondary-500">Course Instructor</p>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Course Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Level</span>
                <span className="text-sm font-medium text-secondary-900 capitalize">
                  {course.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Duration</span>
                <span className="text-sm font-medium text-secondary-900">8 weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Students</span>
                <span className="text-sm font-medium text-secondary-900">
                  {course.enrollments?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Language</span>
                <span className="text-sm font-medium text-secondary-900">English</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
