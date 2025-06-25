import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth/';

const registerIndividual = (userData) => {
  return axios.post(API_URL + 'register/individual', userData);
};

const registerCompany = (companyData) => {
  return axios.post(API_URL + 'register/company', companyData);
};

const login = (email, password, rememberMe) => {
  return axios
    .post(API_URL + 'login', {
      email,
      password,
      rememberMe,
    })
    .then((response) => {
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const forgotPassword = (email) => {
  return axios.post(API_URL + 'forgot-password', { email });
};

const resetPassword = (token, password, confirmPassword) => {
  return axios.post(API_URL + 'reset-password', {
    token,
    password,
    confirmPassword,
  });
};

const verifyEmail = (token) => {
    return axios.get(API_URL + `verify-email?token=${token}`);
};

const resendVerificationEmail = (email) => {
    return axios.post(API_URL + 'resend-verification-email', { email });
};

const getProfile = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  
  return axios.get(API_URL + 'profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => {
    console.log('Profile data from API:', response.data);
    return response.data;
  });
};

const updateProfile = (profileData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  
  return axios.put(API_URL + 'profile', profileData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((response) => {
    return response.data;
  });
};

const authService = {
  registerIndividual,
  registerCompany,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getProfile,
  updateProfile,
};

export default authService;
