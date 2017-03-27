import axios from 'axios';
import createError from 'axios/lib/core/createError';
import Imm from 'immutable';

export const jsonContentTypes = [
  'application/json',
  'application/vnd.api+json'
];

const hasValidContentType = response => jsonContentTypes.some(
  contentType => response.headers['content-type'].indexOf(contentType) > -1
);

export const noop = () => {};

export const apiRequest = (url, options = {}) => {
  const allOptions = Imm.fromJS(options)
    .set('url', url)
    .setIn(['headers', 'Accept'], 'application/vnd.api+json')
    .setIn(['headers', 'Content-Type'], 'application/vnd.api+json')
    .toJS();

  return axios(allOptions)
    .then(res => {
      if (res.status === 204) {
        return res;
      }

      if (hasValidContentType(res) === false) {
        throw createError(
          'Invalid Content-Type in response',
          res.config,
          null,
          res
        );
      }

      return res.data;
    });
};

export const hasOwnProperties = (obj, propertyTree) => {
  if ((obj instanceof Object) === false) {
    return false;
  }
  const property = propertyTree[0];
  const hasProperty = obj.hasOwnProperty(property);
  if (hasProperty) {
    if (propertyTree.length === 1) {
      return hasProperty;
    }
    return hasOwnProperties(obj[property], propertyTree.slice(1));
  }
  return false;
};
