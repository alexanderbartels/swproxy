
import { assert } from 'chai';

import SwProxy from '../src/swproxy.js';


// create a mock mod
class MockMod {
  static factoryMethodName() {
    return 'fooBarRule';
  }

  static factoryMethod() {
    // should return the function to create the rule
    // to test the function call, only a simple String will returned
    return () => 'FooBarRule-ok';
  }
}

// create an invalid mock mod, with missing factory method
class InvalidMockMod {
  static factoryMethodName() {
    return 'invalidFooBarRule';
  }
}

describe('swproxy:app', function () {
  var proxy;

  before(function (done) {
    proxy = new SwProxy({
      addEventListener: function (/* eventName, listener*/) {

      }
    });

    done();
  });

  it('provides a function to regsiterMod', function () {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.registerMod, 'function');

    // register the mock mod
    assert.ok(proxy.registerMod(MockMod), 'Mod can registered for the first time');
    assert.equal(proxy.fooBarRule(), 'FooBarRule-ok', 'factory method was added to the Proxy');

    assert.notOk(proxy.registerMod(MockMod), 'Mod can only registered once');

    assert.notOk(proxy.registerMod(InvalidMockMod), 'Invalid Mod cannot be registered');
  });

  it('provides a function to register install rules', function () {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.addInstallRule, 'function');

    assert.equal(proxy.installRules.length, 0, 'no install rules are created at setup');

    proxy.addInstallRule(function () {});
    assert.equal(proxy.installRules.length, 1, 'install rules can be added');

    proxy.addInstallRule({});
    assert.equal(proxy.installRules.length, 1, 'install rules cannot be added if it is not a function');
  });

  it('provides a function to register activate rules', function () {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.addActivateRule, 'function');

    assert.equal(proxy.activateRules.length, 0, 'no activate rules are created at setup');

    proxy.addActivateRule(function () {});
    assert.equal(proxy.activateRules.length, 1, 'activate rules can be added');

    proxy.addActivateRule({});
    assert.equal(proxy.activateRules.length, 1, 'activate rules cannot be added if it is not a function');
  });

  it('provides a function to register fetch rules', function () {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.addFetchRule, 'function');

    assert.equal(proxy.fetchRules.length, 0, 'no fetch rules are created at setup');

    proxy.addFetchRule(function () {});
    assert.equal(proxy.fetchRules.length, 1, 'fetch rules can be added');

    proxy.addFetchRule({});
    assert.equal(proxy.fetchRules.length, 1, 'fetch rules cannot be added if it is not a function');
  });
});
