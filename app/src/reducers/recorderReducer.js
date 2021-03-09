const recorderReducer = (state, action) => {
  switch (action.type) {
    case "SET_IS_BLOCKED":
      return {
        ...state,
        isBlocked: action.payload,
      };
    case "SET_IS_RECORDING":
      return {
        ...state,
        isMicrophoneRecording: action.payload,
      };
    default:
      return state;
  }
};

export default recorderReducer;
