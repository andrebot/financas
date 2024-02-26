import sendNotification from '../../../src/server/utils/notification';

describe('notification helper', () => {
  it('should send a notification', () => {
    const result = sendNotification('test', 'test');
    result.should.be.true;
  });
});
