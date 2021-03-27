import React from 'react';
import ReactDOM from 'react-dom';
import Contact from '../../../src/components/Contact';

import Enzyme, { shallow, render, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

it('contact render component unit test', () => {
  const wrapper = shallow(<Contact />)
  
  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<Contact />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });