import React from "react";
import ReactDOM from "react-dom";
import App from "../../src/App";

import Enzyme, { shallow, render, mount } from "enzyme";
import toJson from "enzyme-to-json";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

it("App render unit test", () => {
  const wrapper = shallow(<App />);

  expect(toJson(wrapper)).toMatchSnapshot();
});

// it('integration test', () => {
//   const wrapper = mount(<App />)

//   expect(toJson(wrapper)).toMatchSnapshot();
// });
