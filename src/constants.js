// Format the elements
export default [
  'API_SET_AXIOS_CONFIG',
  'API_WILL_CREATE',
  'API_CREATED',
  'API_CREATE_FAILED',
  'API_WILL_READ',
  'API_READ',
  'API_READ_FAILED',
  'API_WILL_UPDATE',
  'API_UPDATED',
  'API_UPDATE_FAILED',
  'API_WILL_DELETE',
  'API_DELETED',
  'API_DELETE_FAILED'
].reduce(
  (actionTypes, action) => {
    actionTypes[action] = action;
    return actionTypes
  },
  {}
);
