'use strict';

var expect = require('chai').expect;
var mocha = require('mocha');
var uber = require('../index');

mocha.describe('singletons', function () {
  mocha.it('should return the same instance every time', function () {
    var di = uber({
      singleton: function () {
        return {};
      }
    });

    expect(di.singleton).to.equal(di.singleton);
  });
});

mocha.describe('transients', function () {
  mocha.it('should return a different instance every time', function () {
    var di = uber({
      $transient: function () {
        return {};
      }
    });

    // Transients return functions, but we don't expect the function to be the
    // same everytime when accessing it.
    expect(di.transient).not.to.equal(di.transient);
    expect(di.transient()).not.to.equal(di.transient());
  });
});

mocha.describe('constructors', function () {
  mocha.it('should instantiate constructors', function () {
    function Ctor () {}

    var di = uber({
      Ctor1: Ctor,
      $Ctor2: Ctor
    });

    expect(di.ctor1).to.be.an.instanceof(Ctor);
    expect(di.ctor2()).to.be.an.instanceof(Ctor);
  });
});

mocha.describe('functions', function () {
  mocha.it('should call functions', function () {
    var di = uber({
      func1: function () { return true; },
      $func2: function () { return true; }
    });

    expect(di.func1).to.equal(true);
    expect(di.func2()).to.equal(true);
  });
});

mocha.describe('dependencies', function () {
  mocha.it('should resolve depenencies based on argument names', function () {
    var di = uber({
      dep1: function (dep2) {
        return dep2;
      },
      dep2: function () {
        return {};
      }
    });

    expect(di.dep1).to.equal(di.dep2);
  });

  mocha.it('should allow you pass named parameters', function () {
    var di = uber({
      $dep1: function (dep2, dep3) {
        return {
          dep2: dep2,
          dep3: dep3
        };
      },
      dep2: function () {
        return {};
      }
    });

    var dep3 = {};
    expect(di.dep1().dep2).to.equal(di.dep2);
    expect(di.dep1().dep3).to.equal(undefined);
    expect(di.dep1({ dep2: dep3 }).dep2).to.equal(dep3);
    expect(di.dep1({ dep2: dep3 }).dep3).to.equal(undefined);
    expect(di.dep1({ dep3: dep3 }).dep2).to.equal(di.dep2);
    expect(di.dep1({ dep3: dep3 }).dep3).to.equal(dep3);
    expect(di.dep1({ dep2: 2, dep3: 3}).dep2).to.equal(2);
    expect(di.dep1({ dep2: 2, dep3: 3}).dep3).to.equal(3);
  });
});
