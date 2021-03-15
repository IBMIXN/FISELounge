import React from "react";
import ReactDOM from "react-dom";
import VoiceCommand from "../../../src/components/VoiceCommand";

import Enzyme, { shallow, render, mount } from "enzyme";
import toJson from "enzyme-to-json";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });


it("render unit test", () => {
  const wrapper = shallow(
    <VoiceCommand
      commands={{
        changeScene: () => {},
        makeCall: () => {},
        customResponse: () => {},
      }}
      onError={{showTast: () => {}}}
    />
  );

  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<VoiceCommand />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });
