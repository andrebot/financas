import exportConfig from 'export-config';

const mongo = {
  default: {
    DB_URL: process.env.DB_URL || 'mongodb://127.0.0.1:27017/financas',
  },
};

export default exportConfig(mongo);
