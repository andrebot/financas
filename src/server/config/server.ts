import exportConfig from 'export-config';

const SERVER = {
  default: {
    PORT: process.env.PORT || 3000,
  },
};

export default exportConfig(SERVER);
