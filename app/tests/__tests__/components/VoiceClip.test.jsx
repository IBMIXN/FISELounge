import React from 'react';
import ReactDOM from 'react-dom';
import VoiceClip from '../../../src/components/VoiceClip';
import 'regenerator-runtime/runtime';

import Enzyme, { shallow, render, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

it('render unit test', () => {
  const wrapper = shallow(<VoiceClip/>)
  
  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<VoiceClip />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });