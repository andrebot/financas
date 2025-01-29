const serverUrl = '/api/v1';

export default {
  root: serverUrl,
  api: {
    user: `${serverUrl}/user`,
  },
  user: {
    loginPage: '/login',
    logout: '/logout',
  },
};
