import chai from 'chai';
import sinonChai from 'sinon-chai';
import {
  connectToDatabase,
  createAdminUser,
  disconnectDatabase,
} from './connectDB';

chai.use(sinonChai);
chai.should();

before(async () => {
  await connectToDatabase();
  await createAdminUser();
  console.log('Database connected and admin user created.');
});

after(async () => {
  await disconnectDatabase();
  console.log('Database disconnected.');
});
