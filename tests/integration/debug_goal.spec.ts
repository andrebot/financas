import request from 'supertest';
import server from '../../src/server/server';
import { adminUser, account1, goal1 } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';

describe('Debug', () => {
  it('transaction create error', async () => {
    const accessToken = createAccessToken(adminUser.email, 'admin', adminUser.firstName, adminUser.lastName, adminUser.id);
    const newTransaction = {
      name: 'New Transaction',
      accountId: account1.id,
      type: 'deposit',
      date: new Date(),
      value: '100.00',
      userId: adminUser.id,
    };
    const response = await request(server)
      .post('/api/v1/accountant')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newTransaction);
    console.log('Transaction create - Status:', response.status, 'Body:', JSON.stringify(response.body));
  });

  it('budget create error', async () => {
    const accessToken = createAccessToken(adminUser.email, 'admin', adminUser.firstName, adminUser.lastName, adminUser.id);
    const newBudget = {
      name: 'New Budget',
      value: '200.00',
      type: 'monthly',
      startDate: new Date(),
      endDate: new Date(),
      userId: adminUser.id,
    };
    const response = await request(server)
      .post('/api/v1/budget')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newBudget);
    console.log('Budget create - Status:', response.status, 'Body:', JSON.stringify(response.body));
  });
});
