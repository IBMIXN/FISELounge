import recorderReducer from "./recorderReducer";

export { recorderReducer };
export const RecorderActions = {
  BLOCK_RECORDER: {
    type: "SET_IS_BLOCKED",
    payload: true,
  },
  UNBLOCK_RECORDER: {
    type: "SET_IS_BLOCKED",
    payload: false,
  },
  SET_IS_RECORDING_COMMAND: {
    type: "SET_IS_RECORDING_COMMAND",
    payload: true,
  },
  SET_NOT_RECORDING_COMMAND: {
    type: "SET_IS_RECORDING_COMMAND",
    payload: false,
  },
  SET_IS_LOADING_COMMAND: {
    type: "SET_IS_LOADING_COMMAND",
    payload: true,
  },
  SET_NOT_LOADING_COMMAND: {
    type: "SET_IS_LOADING_COMMAND",
    payload: false,
  },
  SET_IS_RECORDING_CLIP: {
    type: "SET_IS_RECORDING_CLIP",
    payload: true,
  },
  SET_NOT_RECORDING_CLIP: {
    type: "SET_IS_RECORDING_CLIP",
    payload: false,
  },
  SET_IS_LOADING_CLIP: {
    type: "SET_IS_LOADING_CLIP",
    payload: true,
  },
  SET_NOT_LOADING_CLIP: {
    type: "SET_IS_LOADING_CLIP",
    payload: false,
  },
};
