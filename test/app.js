
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
});
