const recorderReducer = (state, action) => {
  switch (action.type) {
    case "SET_IS_BLOCKED":
      return {
        ...state,
        recorderIsBlocked: action.payload,
      };
    case "SET_IS_RECORDING_COMMAND":
      return {
        ...state,
        commandIsRecording: action.payload,
      };
    case "SET_IS_LOADING_COMMAND":
      return {
        ...state,
        commandIsLoading: action.payload,
      };
    case "SET_IS_RECORDING_CLIP":
      return {
        ...state,
        clipIsRecording: action.payload,
      };
    case "SET_IS_LOADING_CLIP":
      return {
        ...state,
        clipIsLoading: action.payload,
      };
    default:
      return state;
  }
};

export default recorderReducer;
