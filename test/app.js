
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
    assert.equal(proxy.installRules.length, 2, 'install rules can be added if it is not a function');
  });

  it('provides a function to register activate rules', function () {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.addActivateRule, 'function');

    assert.equal(proxy.activateRules.length, 0, 'no activate rules are created at setup');

    proxy.addActivateRule(function () {});
    assert.equal(proxy.activateRules.length, 1, 'activate rules can be added');

    proxy.addActivateRule({});
    assert.equal(proxy.activateRules.length, 2, 'activate rules can be added if it is not a function');
  });

  it('provides a function to register fetch rules', function () {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.addFetchRule, 'function');

    assert.equal(proxy.fetchRules.length, 0, 'no fetch rules are created at setup');

    proxy.addFetchRule(function () {});
    assert.equal(proxy.fetchRules.length, 1, 'fetch rules can be added');

    proxy.addFetchRule({});
    assert.equal(proxy.fetchRules.length, 2, 'fetch rules can be added if it is not a function');
  });

  it('provides a function to filter rules by request', function () {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.filterRules, 'function');

    let matchingRule = {
      match: () => true
    };

    let differentRule = {
      match: () => false
    };

    assert.equal(proxy.filterRules([matchingRule, differentRule], 'dummyRequest').length, 1, 'filter returns the rules that matches the given request');
    assert.deepEqual(proxy.filterRules([matchingRule]), [matchingRule], 'filter returns the rules that matches the given request');

  });

  it('should executes install rules on install event', function (done) {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.onInstall, 'function');

    let matchingRule = {
      match: () => true,
      execute: function () {
        return new Promise(function (resolve) {
          resolve('install-event');
        });
      }
    };

    proxy.addInstallRule(matchingRule);

    proxy.onInstall({
      waitUntil: (promise) => {
        promise.then((result) => {
          assert.equal('install-event', result, 'every rule executed once');
          done();
        });
      }
    });
  });

  it('should executes activate rules on activate event', function (done) {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.onActivate, 'function');

    let matchingRule = {
      match: () => true,
      execute: function (input) {
        return new Promise(function (resolve) {
          if (!input.value) {
            input.value = '';
          }
          input.value = input.value + 'activate-input ';
          resolve(input);
        });
      }
    };

    proxy.addActivateRule(matchingRule);
    proxy.addActivateRule(matchingRule);
    proxy.addActivateRule(matchingRule);

    proxy.onActivate({
      waitUntil: (promise) => {
        promise.then((result) => {
          assert.equal('activate-input activate-input activate-input ', result.value, 'every rule executed once');
          done();
        });
      }
    });
  });

  it('should executes fetch rules on fetch event', function (done) {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.onFetch, 'function');

    let matchingRule = {
      match: () => true,
      execute: function (input) {
        return new Promise(function (resolve) {
          if (!input.value) {
            input.value = '';
          }
          input.value = input.value + 'fetch-input ';
          resolve(input);
        });
      }
    };

    proxy.addFetchRule(matchingRule);
    proxy.addFetchRule(matchingRule);

    proxy.onFetch({
      respondWith: (promise) => {
        promise.then((result) => {
          assert.equal('fetch-input fetch-input ', result.value, 'every rule executed once');
          done();
        });
      }
    });
  });

  it('should executes a promise chain for all given rules', function (done) {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.callPromiseChain, 'function');

    let i = 0;
    let matchingRule = {
      match: () => true,
      execute: function (input) {
        return new Promise(function (resolve) {
          i = i + 1;
          var output = (input || '') + i + ' ';
          resolve(output);
        });
      }
    };

    let resultPromise = proxy.callPromiseChain({
      waitUntil: () => {}
    }, [matchingRule, matchingRule, matchingRule, matchingRule, matchingRule]);

    assert.ok(resultPromise);
    resultPromise.then(() => done());
  });

  it('should executes a promise chain and return a failing promise if one rule failed', function (done) {
    assert.typeOf(proxy, 'object');
    assert.typeOf(proxy.callPromiseChain, 'function');

    let i = 0;
    let failingRule = {
      match: () => true,
      execute: function () {
        return new Promise(function (resolve, reject) {
          reject('An unexpected error occurred.');
        });
      }
    };

    let matchingRule = {
      match: () => true,
      execute: function (input) {
        return new Promise(function (resolve) {
          i = i + 1;
          var output = (input || '') + i + ' ';
          resolve(output);
        });
      }
    };

    let resultPromise = proxy.callPromiseChain({
      waitUntil: (promise) => {
        promise.then(() => done());
      }
    }, [matchingRule, matchingRule, failingRule, matchingRule, matchingRule]);

    assert.ok(resultPromise);
    resultPromise.catch(() => done());
  });
});
