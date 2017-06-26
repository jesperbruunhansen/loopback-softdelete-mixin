'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt;
  var deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt;
  var _ref$scrub = _ref.scrub;
  var scrub = _ref$scrub === undefined ? false : _ref$scrub;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, scrub: scrub });

  var properties = Model.definition.properties;
  var idName = Model.dataSource.idName(Model.modelName);

  var scrubbed = {};
  if (scrub !== false) {
    var propertiesToScrub = scrub;
    if (!Array.isArray(propertiesToScrub)) {
      propertiesToScrub = (0, _keys2.default)(properties).filter(function (prop) {
        return !properties[prop][idName] && prop !== deletedAt;
      });
    }
    scrubbed = propertiesToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, { type: Date, required: false, default:null });

  Model.destroyAll = function softDestroyAll(where, cb) {
    return Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    return Model.updateAll((0, _defineProperty3.default)({}, idName, id), (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    var callback = cb === undefined && typeof options === 'function' ? options : cb;

    return this.updateAttributes((0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? callback(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? callback(error) : _promise2.default.reject(error);
    });
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = (0, _defineProperty3.default)({}, deletedAt, null);

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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TixHQUFlLE1BQU0sU0FBTixHQUFrQixTQUFTLGFBQVQsR0FBNEM7QUFBQSxRQUFyQixLQUFxQix5REFBYixFQUFhOztBQUMzRTtBQUNBLFFBQUksd0JBQUo7QUFDQSxRQUFJLENBQUMsS0FBRCxJQUFVLG9CQUFZLEtBQVosRUFBbUIsTUFBbkIsS0FBOEIsQ0FBNUMsRUFBK0M7QUFDN0Msd0JBQWtCLGVBQWxCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsd0JBQWtCLEVBQUUsS0FBSyxDQUFFLEtBQUYsRUFBUyxlQUFULENBQVAsRUFBbEI7QUFDRDs7QUFQMEUsdUNBQU4sSUFBTTtBQUFOLFVBQU07QUFBQTs7QUFRM0UsV0FBTyxRQUFRLElBQVIsaUJBQWEsS0FBYixFQUFvQixlQUFwQixTQUF3QyxJQUF4QyxFQUFQO0FBQ0QsR0FURDtBQVVELEMiLCJmaWxlIjoic29mdC1kZWxldGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgX2RlYnVnIGZyb20gJy4vZGVidWcnO1xuY29uc3QgZGVidWcgPSBfZGVidWcoKTtcblxuZXhwb3J0IGRlZmF1bHQgKE1vZGVsLCB7IGRlbGV0ZWRBdCA9ICdkZWxldGVkQXQnLCBzY3J1YiA9IGZhbHNlIH0pID0+IHtcbiAgZGVidWcoJ1NvZnREZWxldGUgbWl4aW4gZm9yIE1vZGVsICVzJywgTW9kZWwubW9kZWxOYW1lKTtcblxuICBkZWJ1Zygnb3B0aW9ucycsIHsgZGVsZXRlZEF0LCBzY3J1YiB9KTtcblxuICBjb25zdCBwcm9wZXJ0aWVzID0gTW9kZWwuZGVmaW5pdGlvbi5wcm9wZXJ0aWVzO1xuICBjb25zdCBpZE5hbWUgPSBNb2RlbC5kYXRhU291cmNlLmlkTmFtZShNb2RlbC5tb2RlbE5hbWUpO1xuXG4gIGxldCBzY3J1YmJlZCA9IHt9O1xuICBpZiAoc2NydWIgIT09IGZhbHNlKSB7XG4gICAgbGV0IHByb3BlcnRpZXNUb1NjcnViID0gc2NydWI7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb3BlcnRpZXNUb1NjcnViKSkge1xuICAgICAgcHJvcGVydGllc1RvU2NydWIgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKVxuICAgICAgICAuZmlsdGVyKHByb3AgPT4gIXByb3BlcnRpZXNbcHJvcF1baWROYW1lXSAmJiBwcm9wICE9PSBkZWxldGVkQXQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BlcnRpZXNUb1NjcnViLnJlZHVjZSgob2JqLCBwcm9wKSA9PiAoeyAuLi5vYmosIFtwcm9wXTogbnVsbCB9KSwge30pO1xuICB9XG5cbiAgTW9kZWwuZGVmaW5lUHJvcGVydHkoZGVsZXRlZEF0LCB7dHlwZTogRGF0ZSwgcmVxdWlyZWQ6IGZhbHNlfSk7XG5cbiAgTW9kZWwuZGVzdHJveUFsbCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QWxsKHdoZXJlLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwod2hlcmUsIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpIH0pXG4gICAgICAudGhlbihyZXN1bHQgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihudWxsLCByZXN1bHQpIDogcmVzdWx0KVxuICAgICAgLmNhdGNoKGVycm9yID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IoZXJyb3IpIDogUHJvbWlzZS5yZWplY3QoZXJyb3IpKTtcbiAgfTtcblxuICBNb2RlbC5yZW1vdmUgPSBNb2RlbC5kZXN0cm95QWxsO1xuICBNb2RlbC5kZWxldGVBbGwgPSBNb2RlbC5kZXN0cm95QWxsO1xuXG4gIE1vZGVsLmRlc3Ryb3lCeUlkID0gZnVuY3Rpb24gc29mdERlc3Ryb3lCeUlkKGlkLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwoeyBbaWROYW1lXTogaWQgfSwgeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCl9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuICBNb2RlbC5kZWxldGVCeUlkID0gTW9kZWwuZGVzdHJveUJ5SWQ7XG5cbiAgTW9kZWwucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBzb2Z0RGVzdHJveShvcHRpb25zLCBjYikge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKGNiID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpID8gb3B0aW9ucyA6IGNiO1xuXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQXR0cmlidXRlcyh7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2FsbGJhY2sobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuICBNb2RlbC5wcm90b3R5cGUuZGVsZXRlID0gTW9kZWwucHJvdG90eXBlLmRlc3Ryb3k7XG5cbiAgLy8gRW11bGF0ZSBkZWZhdWx0IHNjb3BlIGJ1dCB3aXRoIG1vcmUgZmxleGliaWxpdHkuXG4gIGNvbnN0IHF1ZXJ5Tm9uRGVsZXRlZCA9IHtbZGVsZXRlZEF0XTogbnVsbH07XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZE9yQ3JlYXRlLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfZmluZCA9IE1vZGVsLmZpbmQ7XG4gIE1vZGVsLmZpbmQgPSBmdW5jdGlvbiBmaW5kRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZC5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX2NvdW50ID0gTW9kZWwuY291bnQ7XG4gIE1vZGVsLmNvdW50ID0gZnVuY3Rpb24gY291bnREZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIGNvdW50IG9ubHkgcmVjZWl2ZXMgYSAnd2hlcmUnLCB0aGVyZSdzIG5vd2hlcmUgdG8gYXNrIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBsZXQgd2hlcmVOb3REZWxldGVkO1xuICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0gcXVlcnlOb25EZWxldGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICB9XG4gICAgcmV0dXJuIF9jb3VudC5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF91cGRhdGUgPSBNb2RlbC51cGRhdGU7XG4gIE1vZGVsLnVwZGF0ZSA9IE1vZGVsLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uIHVwZGF0ZURlbGV0ZWQod2hlcmUgPSB7fSwgLi4ucmVzdCkge1xuICAgIC8vIEJlY2F1c2UgdXBkYXRlL3VwZGF0ZUFsbCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdGhlcmUncyBub3doZXJlIHRvIGFzayBmb3IgdGhlIGRlbGV0ZWQgZW50aXRpZXMuXG4gICAgbGV0IHdoZXJlTm90RGVsZXRlZDtcbiAgICBpZiAoIXdoZXJlIHx8IE9iamVjdC5rZXlzKHdoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHdoZXJlTm90RGVsZXRlZCA9IHF1ZXJ5Tm9uRGVsZXRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0geyBhbmQ6IFsgd2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZCBdIH07XG4gICAgfVxuICAgIHJldHVybiBfdXBkYXRlLmNhbGwoTW9kZWwsIHdoZXJlTm90RGVsZXRlZCwgLi4ucmVzdCk7XG4gIH07XG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
