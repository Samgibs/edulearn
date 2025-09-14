import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AcademicCapIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { selectRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = async (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setLoading(true);
    
    const success = await selectRole(role);
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Choose Your Role
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Select how you'll be using EduLearn
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Role */}
          <div
            className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
              selectedRole === 'student'
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 bg-white hover:border-primary-300 hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('student')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary-100 p-3 mb-4">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                I'm a Student
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                I want to learn and take courses
              </p>
              <ul className="text-sm text-secondary-500 space-y-1">
                <li>• Access to courses and materials</li>
                <li>• Submit assignments and assessments</li>
                <li>• Track your progress</li>
                <li>• Participate in discussions</li>
                <li>• Connect with teachers and peers</li>
              </ul>
            </div>
          </div>

          {/* Teacher Role */}
          <div
            className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
              selectedRole === 'teacher'
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 bg-white hover:border-primary-300 hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary-100 p-3 mb-4">
                <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                I'm a Teacher
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                I want to teach and create courses
              </p>
              <ul className="text-sm text-secondary-500 space-y-1">
                <li>• Create and manage courses</li>
                <li>• Assign and grade work</li>
                <li>• Track student progress</li>
                <li>• Conduct live sessions</li>
                <li>• Access analytics and reports</li>
              </ul>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-primary-500 hover:bg-primary-400 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up your account...
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-secondary-500">
            You can change your role later in settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
