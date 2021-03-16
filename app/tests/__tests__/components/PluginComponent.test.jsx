import React from 'react';
import ReactDOM from 'react-dom';
import PluginComponent from '../../../src/components/PluginComponent';

import Enzyme, { shallow, render, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

it('render plugin component unit test', () => {
  const wrapper = shallow(<PluginComponent/>)
  
  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<PluginComponent />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });