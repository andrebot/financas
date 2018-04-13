import sinon from 'sinon';
import reducer from './reducer.jsx';
import { changePage, CHANGE_PAGE } from './actions.jsx';

describe('Menu', function () {
  describe('Actions', function () {
    it('should create a action to change the page', function () {
      const action = changePage('test');

      action.should.exist;
      action.type.should.exist;
      action.type.should.be.eq(CHANGE_PAGE);
      action.page.should.exist;
      action.page.should.be.eq('test');
    });
  });

  describe('Reducer', function () {
    it('should return a initial state with activePage as `home`', function () {
      const state = reducer(undefined, { type: '' });

      state.should.not.be.empty;
      state.activePage.should.exist;
      state.activePage.should.be.eq('home');
    });

    it('should change the active page', function () {
      const state = reducer(undefined, changePage('test'));

      state.should.not.be.empty;
      state.activePage.should.exist;
      state.activePage.should.be.eq('test');
    });
  });
});
