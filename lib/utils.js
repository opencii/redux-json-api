"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPaginationUrl = exports.hasOwnProperties = exports.apiRequest = exports.noop = exports.jsonContentTypes = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _createError = _interopRequireDefault(require("axios/lib/core/createError"));

var _objectPathImmutable = _interopRequireDefault(require("object-path-immutable"));

var jsonContentTypes = ['application/json', 'application/vnd.api+json'];
exports.jsonContentTypes = jsonContentTypes;

var hasValidContentType = function hasValidContentType(response) {
  return jsonContentTypes.some(function (contentType) {
    return response.headers['content-type'].indexOf(contentType) > -1;
  });
};

var noop = function noop() {};

exports.noop = noop;

var apiRequest = function apiRequest(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var allOptions = (0, _objectPathImmutable["default"])(options).set('url', url).set(['headers', 'Accept'], 'application/vnd.api+json').set(['headers', 'Content-Type'], 'application/vnd.api+json').value();
  return (0, _axios["default"])(allOptions).then(function (res) {
    if (res.status === 204) {
      return res;
    }

    if (hasValidContentType(res) === false) {
      throw (0, _createError["default"])('Invalid Content-Type in response', res.config, null, res);
    }

    return res.data;
  });
};

exports.apiRequest = apiRequest;

var hasOwnProperties = function hasOwnProperties(obj, propertyTree) {
  if (obj instanceof Object === false) {
    return false;
  }

  var property = propertyTree[0];
  var hasProperty = obj.hasOwnProperty(property);

  if (hasProperty) {
    if (propertyTree.length === 1) {
      return hasProperty;
    }

    return hasOwnProperties(obj[property], propertyTree.slice(1));
  }

  return false;
};

exports.hasOwnProperties = hasOwnProperties;

var getPaginationUrl = function getPaginationUrl(response, direction, path) {
  if (!response.links || !hasOwnProperties(response, ['links', direction]) || !response.links[direction]) {
    return null;
  }

  var paginationUrl = response.links[direction];

  if (!paginationUrl) {
    return null;
  }

  return paginationUrl.replace("".concat(path, "/"), '');
};

exports.getPaginationUrl = getPaginationUrl;