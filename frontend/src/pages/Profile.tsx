import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, endpoints } from '../services/api';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  profile_picture?: string;
  role?: string;
  student?: {
    full_name: string;
    fees_paid: number;
    total_fees: number;
  };
  teacher?: {
    full_name: string;
    expertise_area: string[];
    qualifications: string[];
    payment_rate: number;
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(endpoints.users.profile);
      const userData = response.data;
      
      // Try to fetch role-specific data
      let roleData = null;
      if (user?.role === 'student') {
        try {
          const studentResponse = await api.get(endpoints.students.me);
          roleData = { student: studentResponse.data };
        } catch (error) {
          console.log('No student profile found');
        }
      } else if (user?.role === 'teacher') {
        try {
          const teacherResponse = await api.get(endpoints.teachers.me);
          roleData = { teacher: teacherResponse.data };
        } catch (error) {
          console.log('No teacher profile found');
        }
      }
      
      setProfile({ ...userData, ...roleData });
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(endpoints.users.profile, formData);
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
    });
    setEditing(false);
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
          <h1 className="text-2xl font-bold text-secondary-900">Profile</h1>
          <p className="text-secondary-600">Manage your account information</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="btn-outline flex items-center space-x-2"
        >
          <PencilIcon className="w-4 h-4" />
          <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-12 h-12 text-primary-600" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700">
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-secondary-900 mb-1">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-secondary-500 mb-2">@{profile?.username}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {profile?.role || 'User'}
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">Personal Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    First Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-secondary-900">{profile?.first_name || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Last Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-secondary-900">{profile?.last_name || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <p className="text-secondary-900">{profile?.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Username
                </label>
                <p className="text-secondary-900">@{profile?.username}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Member Since
                </label>
                <p className="text-secondary-900">
                  {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-secondary-200">
                <button onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-specific Information */}
      {profile?.student && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Student Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpenIcon className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-secondary-900">Enrolled Courses</h4>
              <p className="text-2xl font-bold text-secondary-900">5</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-secondary-900">Progress</h4>
              <p className="text-2xl font-bold text-secondary-900">75%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <AcademicCapIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-secondary-900">Certificates</h4>
              <p className="text-2xl font-bold text-secondary-900">2</p>
            </div>
          </div>
        </div>
      )}

      {profile?.teacher && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Teacher Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpenIcon className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-secondary-900">Courses Created</h4>
              <p className="text-2xl font-bold text-secondary-900">8</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-secondary-900">Total Students</h4>
              <p className="text-2xl font-bold text-secondary-900">156</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <AcademicCapIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-secondary-900">Rating</h4>
              <p className="text-2xl font-bold text-secondary-900">4.9</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
