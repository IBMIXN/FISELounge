import React from 'react';
import ReactDOM from 'react-dom';
import JitsiComponent from '../../../src/components/JitsiComponent';

import Enzyme, { shallow, render, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

it('Jitsi component render unit test', () => {
  const wrapper = shallow(<JitsiComponent/>)
  
  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<JitsiComponent />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });