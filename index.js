'use strict';

var regexArgComments = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var regexArgNames = /([^\s,]+)/g;
var regexCtor = /^\$?[A-Z]/;
var regexTransient = /^\$/;

function parseArgsFromFunc (func) {
  var fnStr = func
    .toString()
    .replace(regexArgComments, '');

  var result = fnStr
    .slice(fnStr.indexOf('(')+1, fnStr.indexOf(')'))
    .match(regexArgNames);

  if (result === null) {
    result = [];
  }

  return result;
}

function parseDepsFromFunc (func) {
  var index = 0;
  return parseArgsFromFunc(func).map(function (arg) {
    return arg[0] === '$' ? arg.substring(1) : index++;
  });
}

function applyCtor (Ctor, args) {
  function NewCtor() {
    return Ctor.apply(this, args) || this;
  }
  NewCtor.prototype = Ctor.prototype;
  return new NewCtor();
}

function register (that, name, func) {
  var cache;
  var deps;
  var isCtor;
  var isTransient;

  // If the function to passed in is not a function, it is wrapped in a
  // function that returns the value. This allows any value other than a
  // function to be passed as a dependency and everything behaves normally.
  function ensureFunc (funcToCheck) {
    if (typeof funcToCheck !== 'function') {
      return function () {
        return funcToCheck;
      };
    }

    return funcToCheck;
  }

  // Returns the dependencies of the current dependency and merges in any
  // supplied, named arguments. Arguments take precedence over dependencies
  // in the container.
  function resolveDeps (args) {
    return deps.map(function (dep) {
      if (args && args.length && typeof dep === 'number') {
        return args[dep];
      }

      dep = that[dep];

      if (dep) {
        return dep;
      }
    });
  }

  // Returns a dependency. It checks to see if it's a constructor function
  // or a regular function and calls it accordingly.
  function getInst (bind, args) {
    args = resolveDeps(args);
    return isCtor ? applyCtor(func, args) : func.apply(bind, args);
  }

  // Resolves the dependency based on if it's a singleton or transient
  // dependency. Both forms allow arguments. If it's a singleton, then no
  // arguments are allowed. If it's transient, named arguments are allowed.
  function resolveInst (bind, args) {
    return isTransient ? getInst(bind, args) : cache || (cache = getInst(bind));
  }

  // Initialises or re-initialises the state of the dependency.
  function init (func) {
    func = ensureFunc(func);
    cache = undefined;
    deps = parseDepsFromFunc(func);
  }

  // Initialse variables for the dependency.
  init(func);

  // Name semantics.
  isCtor = regexCtor.test(name);
  isTransient = regexTransient.test(name);

  // Removes the $ from the beginning of the name.
  name = isTransient ? name.substring(1) : name;

  // Ensure if it is labelled as a constructor to make the first character
  // lowercase because it will be called like a function or accessed like
  // a property.
  name = name[0].toLowerCase() + name.substring(1);

  // Defines a property that returns the dependency or if it's transient, a
  // function that returns the dependency and allows you to pass named
  // arguments. If setting, then it overwrites the dependency and reinitialises
  // everything to reconfigure it for the new dependency.
  Object.defineProperty(that, name, {
    enumerable: true,

    get: function () {
      return isTransient ? function () {
        return resolveInst(this, arguments);
      } : resolveInst();
    },

    set: init
  });
}

module.exports = function (that, registry) {
  if (registry === undefined) {
    registry = that;
    that = {};
  }

  for (var name in registry) {
    if (Object.prototype.hasOwnProperty.call(registry, name)) {
      register(that, name, registry[name]);
    }
  }

  return that;
};
