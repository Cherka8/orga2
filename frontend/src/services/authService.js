import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/';

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

const authService = {
  registerIndividual,
  registerCompany,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};

export default authService;
