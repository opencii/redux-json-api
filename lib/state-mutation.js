"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ensureResourceTypeInState = exports.setIsInvalidatingForExistingResource = exports.updateOrInsertResourcesIntoState = exports.removeResourceFromState = exports.updateOrInsertResource = exports.addLinksToState = exports.makeUpdateReverseRelationship = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectPathImmutable = _interopRequireDefault(require("object-path-immutable"));

var _pluralize = _interopRequireDefault(require("pluralize"));

var _utils = require("./utils");

var _deepEqual = _interopRequireDefault(require("deep-equal"));

var makeUpdateReverseRelationship = function makeUpdateReverseRelationship(resource, relationship) {
  var newRelation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    type: resource.type,
    id: resource.id
  };
  return function (foreignResources) {
    var idx = foreignResources.findIndex(function (item) {
      return item.id === relationship.data.id;
    });

    if (idx === -1) {
      return foreignResources;
    }

    var _map = [1, 2].map(function (i) {
      return (0, _pluralize["default"])(resource.type, i);
    }),
        _map2 = (0, _slicedToArray2["default"])(_map, 2),
        singular = _map2[0],
        plural = _map2[1];

    var relCase = [singular, plural].find(function (r) {
      return (0, _utils.hasOwnProperties)(foreignResources[idx], ['relationships', r]);
    });

    if (!relCase) {
      return foreignResources;
    }

    var relPath = ['relationships', relCase, 'data'];
    var idxRelPath = [idx].concat(relPath);
    var immutableForeingResources = (0, _objectPathImmutable["default"])(foreignResources);

    if (!(0, _utils.hasOwnProperties)(foreignResources[idx], relPath)) {
      return immutableForeingResources.push(idxRelPath, newRelation).value();
    }

    var foreignResourceRel = foreignResources[idx].relationships[relCase].data;

    if (newRelation && Array.isArray(foreignResourceRel) && ~foreignResourceRel.findIndex(function (rel) {
      return rel.id === newRelation.id && rel.type === newRelation.type;
    }) || newRelation && foreignResourceRel && foreignResourceRel.id === newRelation.id && foreignResourceRel.type === newRelation.type) {
      return foreignResources;
    } else if (Array.isArray(foreignResourceRel) && !newRelation) {
      var relIdx = foreignResourceRel.findIndex(function (item) {
        return item.id === resource.id;
      });

      if (foreignResourceRel[relIdx]) {
        var deletePath = [idx, 'relationships', singular, 'data', relIdx];
        return (0, _objectPathImmutable["default"])(foreignResources).del(deletePath).value();
      }

      return foreignResources;
    }

    if (relCase === singular) {
      return immutableForeingResources.set(idxRelPath, newRelation).value();
    }

    return immutableForeingResources.push(idxRelPath, newRelation).value();
  };
};

exports.makeUpdateReverseRelationship = makeUpdateReverseRelationship;

var stateContainsResource = function stateContainsResource(state, resource) {
  var updatePath = [resource.type, 'data'];

  if ((0, _utils.hasOwnProperties)(state, updatePath)) {
    return state[resource.type].data.findIndex(function (item) {
      return item.id === resource.id;
    }) > -1;
  }

  return false;
};

var addLinksToState = function addLinksToState(state, links, options) {
  if (options === undefined || options.indexLinks === undefined) {
    return state;
  }

  var indexLinkName = options.indexLinks;

  var newState = _objectPathImmutable["default"].set(state, "links.".concat(indexLinkName), links);

  return newState;
};

exports.addLinksToState = addLinksToState;

var updateOrInsertResource = function updateOrInsertResource(state, resource) {
  if ((0, _typeof2["default"])(resource) !== 'object') {
    return state;
  }

  var newState = state;
  var updatePath = [resource.type, 'data'];

  if (stateContainsResource(state, resource)) {
    var resources = state[resource.type].data;
    var idx = resources.findIndex(function (item) {
      return item.id === resource.id;
    });
    var relationships = {};

    for (var relationship in resources[idx].relationships) {
      if (!(0, _utils.hasOwnProperties)(resource, ['relationships', relationship, 'data'])) {
        relationships[relationship] = resources[idx].relationships[relationship];
      }
    }

    if (!resource.hasOwnProperty('relationships')) {
      Object.assign(resource, {
        relationships: relationships
      });
    } else {
      Object.assign(resource.relationships, relationships);
    }

    if (!(0, _deepEqual["default"])(resources[idx], resource)) {
      newState = _objectPathImmutable["default"].set(newState, updatePath.concat(idx), resource);
    }
  } else {
    newState = _objectPathImmutable["default"].push(newState, updatePath, resource);
  }

  var rels = resource.relationships;

  if (!rels) {
    return newState;
  }

  Object.keys(rels).forEach(function (relKey) {
    if (!(0, _utils.hasOwnProperties)(rels[relKey], ['data', 'type'])) {
      return;
    }

    var entityPath = [rels[relKey].data.type, 'data'];

    if (!(0, _utils.hasOwnProperties)(newState, entityPath)) {
      return;
    }

    var updateReverseRelationship = makeUpdateReverseRelationship(resource, rels[relKey]);
    newState = _objectPathImmutable["default"].set(newState, entityPath, updateReverseRelationship(newState[rels[relKey].data.type].data));
  });
  return newState;
};

exports.updateOrInsertResource = updateOrInsertResource;

var removeResourceFromState = function removeResourceFromState(state, resource) {
  var index = state[resource.type].data.findIndex(function (e) {
    return e.id === resource.id;
  });
  var path = [resource.type, 'data', index];
  var entityRelationships = resource.relationships || {};
  return Object.keys(entityRelationships).reduce(function (newState, key) {
    if (!resource.relationships[key].data) {
      return newState;
    }

    var entityPath = [resource.relationships[key].data.type, 'data'];

    if ((0, _utils.hasOwnProperties)(state, entityPath)) {
      var updateReverseRelationship = makeUpdateReverseRelationship(resource, resource.relationships[key], null);
      return newState.set(entityPath, updateReverseRelationship(state[resource.relationships[key].data.type].data));
    }

    return newState;
  }, (0, _objectPathImmutable["default"])(state).del(path));
};

exports.removeResourceFromState = removeResourceFromState;

var updateOrInsertResourcesIntoState = function updateOrInsertResourcesIntoState(state, resources) {
  return resources.reduce(updateOrInsertResource, state);
};

exports.updateOrInsertResourcesIntoState = updateOrInsertResourcesIntoState;

var setIsInvalidatingForExistingResource = function setIsInvalidatingForExistingResource(state, _ref) {
  var type = _ref.type,
      id = _ref.id;
  var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var idx = state[type].data.findIndex(function (e) {
    return e.id === id && e.type === type;
  });
  var updatePath = [type, 'data', idx, 'isInvalidating'];
  return value === null ? (0, _objectPathImmutable["default"])(state).del(updatePath) : (0, _objectPathImmutable["default"])(state).set(updatePath, value);
};

exports.setIsInvalidatingForExistingResource = setIsInvalidatingForExistingResource;

var ensureResourceTypeInState = function ensureResourceTypeInState(state, type) {
  var path = [type, 'data'];
  return (0, _utils.hasOwnProperties)(state, [type]) ? state : (0, _objectPathImmutable["default"])(state).set(path, []).value();
};

exports.ensureResourceTypeInState = ensureResourceTypeInState;