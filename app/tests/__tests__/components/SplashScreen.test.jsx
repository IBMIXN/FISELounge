import React from 'react';
import ReactDOM from 'react-dom';
import SplashScreen from '../../../src/components/SplashScreen';

import Enzyme, { shallow, render, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

it('render unit test', () => {
  const wrapper = shallow(<SplashScreen/>)
  
  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<SplashScreen />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });