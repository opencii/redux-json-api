"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducer = exports.requireResource = exports.deleteResource = exports.updateResource = exports.readEndpoint = exports.createResource = exports.hydrateStore = exports.setAxiosConfig = exports.IS_UPDATING = exports.IS_DELETING = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _reduxActions = require("redux-actions");

var _objectPathImmutable = _interopRequireDefault(require("object-path-immutable"));

var _stateMutation = require("./state-mutation");

var _utils = require("./utils");

var _constants = require("./constants");

var _handleActions;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Resource isInvalidating values
var IS_DELETING = 'IS_DELETING';
exports.IS_DELETING = IS_DELETING;
var IS_UPDATING = 'IS_UPDATING'; // Action creators

exports.IS_UPDATING = IS_UPDATING;
var setAxiosConfig = (0, _reduxActions.createAction)(_constants.API_SET_AXIOS_CONFIG);
exports.setAxiosConfig = setAxiosConfig;
var hydrateStore = (0, _reduxActions.createAction)(_constants.API_HYDRATE);
exports.hydrateStore = hydrateStore;
var apiWillCreate = (0, _reduxActions.createAction)(_constants.API_WILL_CREATE);
var apiCreated = (0, _reduxActions.createAction)(_constants.API_CREATED);
var apiCreateFailed = (0, _reduxActions.createAction)(_constants.API_CREATE_FAILED);
var apiWillRead = (0, _reduxActions.createAction)(_constants.API_WILL_READ);
var apiRead = (0, _reduxActions.createAction)(_constants.API_READ);
var apiReadFailed = (0, _reduxActions.createAction)(_constants.API_READ_FAILED);
var apiWillUpdate = (0, _reduxActions.createAction)(_constants.API_WILL_UPDATE);
var apiUpdated = (0, _reduxActions.createAction)(_constants.API_UPDATED);
var apiUpdateFailed = (0, _reduxActions.createAction)(_constants.API_UPDATE_FAILED);
var apiWillDelete = (0, _reduxActions.createAction)(_constants.API_WILL_DELETE);
var apiDeleted = (0, _reduxActions.createAction)(_constants.API_DELETED);
var apiDeleteFailed = (0, _reduxActions.createAction)(_constants.API_DELETE_FAILED);

var createResource = function createResource(resource) {
  return function (dispatch, getState) {
    dispatch(apiWillCreate(resource));
    var axiosConfig = getState().api.endpoint.axiosConfig;

    var options = _objectSpread({}, axiosConfig, {
      method: 'POST',
      data: JSON.stringify({
        data: resource
      })
    });

    return new Promise(function (resolve, reject) {
      (0, _utils.apiRequest)(resource.type, options).then(function (json) {
        dispatch(apiCreated(json));
        resolve(json);
      })["catch"](function (error) {
        var err = error;
        err.resource = resource;
        dispatch(apiCreateFailed(err));
        reject(err);
      });
    });
  };
};

exports.createResource = createResource;

var ApiResponse = function ApiResponse(response, dispatch, nextUrl, prevUrl) {
  var _this = this;

  (0, _classCallCheck2["default"])(this, ApiResponse);
  (0, _defineProperty2["default"])(this, "loadNext", function () {
    return _this.dispatch(readEndpoint(_this.nextUrl));
  });
  (0, _defineProperty2["default"])(this, "loadPrev", function () {
    return _this.dispatch(readEndpoint(_this.prevUrl));
  });
  this.body = response;
  this.dispatch = dispatch;
  this.nextUrl = nextUrl;
  this.prevUrl = prevUrl;
}
/* eslint-disable */

/* eslint-enable */
;

var readEndpoint = function readEndpoint(endpoint) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$options = _ref.options,
      options = _ref$options === void 0 ? {
    indexLinks: undefined
  } : _ref$options;

  return function (dispatch, getState) {
    dispatch(apiWillRead(endpoint));
    var axiosConfig = getState().api.endpoint.axiosConfig;
    return new Promise(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, axiosConfig).then(function (json) {
        dispatch(apiRead(_objectSpread({
          endpoint: endpoint,
          options: options
        }, json)));
        var nextUrl = (0, _utils.getPaginationUrl)(json, 'next', axiosConfig.baseURL);
        var prevUrl = (0, _utils.getPaginationUrl)(json, 'prev', axiosConfig.baseURL);
        resolve(new ApiResponse(json, dispatch, nextUrl, prevUrl));
      })["catch"](function (error) {
        var err = error;
        err.endpoint = endpoint;
        dispatch(apiReadFailed(err));
        reject(err);
      });
    });
  };
};

exports.readEndpoint = readEndpoint;

var updateResource = function updateResource(resource) {
  return function (dispatch, getState) {
    dispatch(apiWillUpdate(resource));
    var axiosConfig = getState().api.endpoint.axiosConfig;
    var endpoint = "".concat(resource.type, "/").concat(resource.id);

    var options = _objectSpread({}, axiosConfig, {
      method: 'PATCH',
      data: {
        data: resource
      }
    });

    return new Promise(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, options).then(function (json) {
        dispatch(apiUpdated(json));
        resolve(json);
      })["catch"](function (error) {
        var err = error;
        err.resource = resource;
        dispatch(apiUpdateFailed(err));
        reject(err);
      });
    });
  };
};

exports.updateResource = updateResource;

var deleteResource = function deleteResource(resource) {
  return function (dispatch, getState) {
    dispatch(apiWillDelete(resource));
    var axiosConfig = getState().api.endpoint.axiosConfig;
    var endpoint = "".concat(resource.type, "/").concat(resource.id);

    var options = _objectSpread({}, axiosConfig, {
      method: 'DELETE'
    });

    return new Promise(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, options).then(function () {
        dispatch(apiDeleted(resource));
        resolve();
      })["catch"](function (error) {
        var err = error;
        err.resource = resource;
        dispatch(apiDeleteFailed(err));
        reject(err);
      });
    });
  };
};

exports.deleteResource = deleteResource;

var requireResource = function requireResource(resourceType) {
  var endpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : resourceType;
  return function (dispatch, getState) {
    return new Promise(function (resolve, reject) {
      var _getState = getState(),
          api = _getState.api;

      if (api.hasOwnProperty(resourceType)) {
        resolve();
      }

      dispatch(readEndpoint(endpoint)).then(resolve)["catch"](reject);
    });
  };
}; // Reducers


exports.requireResource = requireResource;
var reducer = (0, _reduxActions.handleActions)((_handleActions = {}, (0, _defineProperty2["default"])(_handleActions, _constants.API_SET_AXIOS_CONFIG, function (state, _ref2) {
  var axiosConfig = _ref2.payload;
  return (0, _objectPathImmutable["default"])(state).set(['endpoint', 'axiosConfig'], axiosConfig).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_HYDRATE, function (state, _ref3) {
  var resources = _ref3.payload;
  var entities = Array.isArray(resources.data) ? resources.data : [resources.data];
  var newState = (0, _stateMutation.updateOrInsertResourcesIntoState)(state, entities.concat(resources.included || []));
  return (0, _objectPathImmutable["default"])(newState).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_WILL_CREATE, function (state) {
  return (0, _objectPathImmutable["default"])(state).set(['isCreating'], state.isCreating + 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_CREATED, function (state, _ref4) {
  var resources = _ref4.payload;
  var entities = Array.isArray(resources.data) ? resources.data : [resources.data];
  var newState = (0, _stateMutation.updateOrInsertResourcesIntoState)(state, entities.concat(resources.included || []));
  return (0, _objectPathImmutable["default"])(newState).set('isCreating', state.isCreating - 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_CREATE_FAILED, function (state) {
  return (0, _objectPathImmutable["default"])(state).set(['isCreating'], state.isCreating - 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_WILL_READ, function (state) {
  return (0, _objectPathImmutable["default"])(state).set(['isReading'], state.isReading + 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_READ, function (state, _ref5) {
  var payload = _ref5.payload;
  var resources = (Array.isArray(payload.data) ? payload.data : [payload.data]).concat(payload.included || []);
  var newState = (0, _stateMutation.updateOrInsertResourcesIntoState)(state, resources);
  var finalState = (0, _stateMutation.addLinksToState)(newState, payload.links, payload.options);
  return (0, _objectPathImmutable["default"])(finalState).set('isReading', state.isReading - 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_READ_FAILED, function (state) {
  return (0, _objectPathImmutable["default"])(state).set(['isReading'], state.isReading - 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_WILL_UPDATE, function (state, _ref6) {
  var resource = _ref6.payload;
  var type = resource.type,
      id = resource.id;
  var newState = (0, _stateMutation.ensureResourceTypeInState)(state, type);
  return (0, _stateMutation.setIsInvalidatingForExistingResource)(newState, {
    type: type,
    id: id
  }, IS_UPDATING).set('isUpdating', state.isUpdating + 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_UPDATED, function (state, _ref7) {
  var resources = _ref7.payload;
  var entities = Array.isArray(resources.data) ? resources.data : [resources.data];
  var newState = (0, _stateMutation.updateOrInsertResourcesIntoState)(state, entities.concat(resources.included || []));
  return (0, _objectPathImmutable["default"])(newState).set('isUpdating', state.isUpdating - 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_UPDATE_FAILED, function (state, _ref8) {
  var resource = _ref8.payload.resource;
  var type = resource.type,
      id = resource.id;
  return (0, _stateMutation.setIsInvalidatingForExistingResource)(state, {
    type: type,
    id: id
  }, IS_UPDATING).set('isUpdating', state.isUpdating - 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_WILL_DELETE, function (state, _ref9) {
  var resource = _ref9.payload;
  var type = resource.type,
      id = resource.id;
  return (0, _stateMutation.setIsInvalidatingForExistingResource)(state, {
    type: type,
    id: id
  }, IS_DELETING).set('isDeleting', state.isDeleting + 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_DELETED, function (state, _ref10) {
  var resource = _ref10.payload;
  return (0, _stateMutation.removeResourceFromState)(state, resource).set('isDeleting', state.isDeleting - 1).value();
}), (0, _defineProperty2["default"])(_handleActions, _constants.API_DELETE_FAILED, function (state, _ref11) {
  var resource = _ref11.payload.resource;
  var type = resource.type,
      id = resource.id;
  return (0, _stateMutation.setIsInvalidatingForExistingResource)(state, {
    type: type,
    id: id
  }, IS_DELETING).set('isDeleting', state.isDeleting - 1).value();
}), _handleActions), {
  isCreating: 0,
  isReading: 0,
  isUpdating: 0,
  isDeleting: 0,
  endpoint: {
    axiosConfig: {}
  }
});
exports.reducer = reducer;