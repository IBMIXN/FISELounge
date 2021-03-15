import React from 'react';
import ReactDOM from 'react-dom';
import CommandButton from '../../../src/components/CommandButton';

import Enzyme, { shallow, render, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

it('render unit test', () => {
  const wrapper = shallow(<CommandButton/>)
  
  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<CommandButton />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });