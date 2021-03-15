import React from 'react';
import ReactDOM from 'react-dom';
import Footer from '../../../src/components/Footer';

import Enzyme, { shallow, render, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

it('footer render component unit test', () => {
  const wrapper = shallow(<Footer/>)
  
  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<Footer />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });