import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AcademicCapIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    education_level: 'Primary',
    total_fees: 1000,
    experience_years: 1,
    teaching_level: 'Primary',
    payment_rate: 5000
  });
  
  const { selectRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setLoading(true);
    
    const success = await selectRole(selectedRole, formData);
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_fees' || name === 'experience_years' || name === 'payment_rate' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  if (showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-secondary-900">
              Complete Your {selectedRole === 'student' ? 'Student' : 'Teacher'} Profile
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Please provide the required information
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {selectedRole === 'student' && (
                <>
                  <div>
                    <label htmlFor="education_level" className="block text-sm font-medium text-secondary-700">
                      Education Level
                    </label>
                    <select
                      id="education_level"
                      name="education_level"
                      value={formData.education_level}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="Kindergarten">Kindergarten</option>
                      <option value="Primary">Primary</option>
                      <option value="High School">High School</option>
                      <option value="University">University</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="total_fees" className="block text-sm font-medium text-secondary-700">
                      Total Fees (KSH)
                    </label>
                    <input
                      type="number"
                      id="total_fees"
                      name="total_fees"
                      value={formData.total_fees}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </>
              )}
              
              {selectedRole === 'teacher' && (
                <>
                  <div>
                    <label htmlFor="experience_years" className="block text-sm font-medium text-secondary-700">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="experience_years"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="teaching_level" className="block text-sm font-medium text-secondary-700">
                      Teaching Level
                    </label>
                    <select
                      id="teaching_level"
                      name="teaching_level"
                      value={formData.teaching_level}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="Kindergarten">Kindergarten</option>
                      <option value="Primary">Primary</option>
                      <option value="High School">High School</option>
                      <option value="University">University</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="payment_rate" className="block text-sm font-medium text-secondary-700">
                      Payment Rate (KSH per month)
                    </label>
                    <input
                      type="number"
                      id="payment_rate"
                      name="payment_rate"
                      value={formData.payment_rate}
                      onChange={handleInputChange}
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 flex justify-center py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
