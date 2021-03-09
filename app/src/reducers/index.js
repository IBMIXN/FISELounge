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
  SET_RECORDING: {
    type: "SET_IS_RECORDING",
    payload: true,
  },
  SET_NOT_RECORDING: {
    type: "SET_IS_RECORDING",
    payload: false,
  },
};
