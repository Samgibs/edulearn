import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('/api/auth/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    signup: '/auth/signup/',
    signin: '/auth/signin/',
    signout: '/auth/signout/',
    roleSelection: '/auth/role-selection/',
  },
  
  // Users
  users: {
    list: '/users/',
    profile: '/users/profile/',
    detail: (id: number) => `/users/${id}/`,
  },
  
  // Students
  students: {
    list: '/students/',
    detail: (id: string) => `/students/${id}/`,
    courses: (id: string) => `/students/${id}/courses/`,
    progress: (id: string) => `/students/${id}/progress/`,
    payments: (id: string) => `/students/${id}/payments/`,
  },
  
  // Teachers
  teachers: {
    list: '/teachers/',
    detail: (id: string) => `/teachers/${id}/`,
    courses: (id: string) => `/teachers/${id}/courses/`,
    students: (id: string) => `/teachers/${id}/students/`,
    salary: (id: string) => `/teachers/${id}/salary/`,
  },
  
  // Courses
  courses: {
    list: '/courses/',
    detail: (id: string) => `/courses/${id}/`,
    enroll: (id: string) => `/courses/${id}/enroll/`,
    students: (id: string) => `/courses/${id}/students/`,
    syllabus: (id: string) => `/courses/${id}/syllabus/`,
  },
  
  // Assignments
  assignments: {
    list: '/assignments/',
    detail: (id: number) => `/assignments/${id}/`,
    submit: (id: number) => `/assignments/${id}/submit/`,
    grade: (id: number) => `/assignments/${id}/grade/`,
  },
  
  // Messages
  messages: {
    list: '/messages/',
    detail: (id: number) => `/messages/${id}/`,
    conversations: '/messages/conversations/',
    conversation: (userId: number) => `/messages/conversations/${userId}/`,
  },
  
  // Analytics
  analytics: {
    studentProgress: '/analytics/student-progress/',
    teacherPerformance: '/analytics/teacher-performance/',
    courseStatistics: '/analytics/course-statistics/',
  },
  
  // Admin
  admin: {
    dashboard: '/admin/dashboard/',
    users: '/admin/users/',
    reports: '/admin/reports/',
  },
  
  // Files
  files: {
    upload: '/files/upload/',
    profilePicture: '/files/upload/profile-picture/',
    teacherCertification: (id: string) => `/files/upload/teacher-certification/${id}/`,
    assignmentFile: (id: number) => `/files/upload/assignment/${id}/`,
    delete: (path: string) => `/files/delete/${path}/`,
  },
};
