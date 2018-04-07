import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Chai from 'chai';
import Sinon from 'sinon-chai';
import 'jsdom-global/register';

Enzyme.configure({ adapter: new Adapter() });
Chai.should();
Chai.use(Sinon);
