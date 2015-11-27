/**
 * The Proxy for service workers
 */
/*eslint-disable no-console */
class SwProxy {
  constructor(serviceWorker) {
    this.installRules = [];
    this.activateRules = [];
    this.fetchRules = [];
    this.serviceWorker = serviceWorker;

    this.serviceWorker.addEventListener('install', (event) => this.onInstall(event));
    this.serviceWorker.addEventListener('activate', (event) => this.onActivate(event));
    this.serviceWorker.addEventListener('fetch', (event) => this.onFetch(event));
  }

  /**
   * registers a mod
   *
   * @param mod should be from the type swproxy-mod
   *
   * return true if registration was successful, otherwise false
   */
  registerMod(mod) {
    let factoryMethodName = mod.factoryMethodName();

    //mod already registered?
    if (typeof this[factoryMethodName] === 'function') {
      return false;
    }

    if (typeof mod.factoryMethod === 'function') {
      this[factoryMethodName] = mod.factoryMethod(this);
      return true;
    }

    return false;
  }

  /**
   * adds a new rule, that will be executed, if the install event gets fired.
   * The rule should return a Promise.
   *
   * @param {object} the rule to be executed.
   */
  addInstallRule(rule) {
    this.installRules.push(rule);
  }

  /**
   * adds a new rule, that will be executed, if the activate event gets fired.
   * The rule should return a Promise.
   *
   * @param {object} the rule to be executed.
   */
  addActivateRule(rule) {
    this.activateRules.push(rule);
  }

  /**
   * adds a new rule, that will be executed, if the fetch event gets fired.
   * The rule should return a Promise.
   *
   * @param {object} the rule to be executed.
   */
  addFetchRule(rule) {
    this.fetchRules.push(rule);
  }

  /**
   * called if the install event from the service worker is fired
   */
  onInstall(event) {
    if (this.installRules.length === 0) {
      return;
    }

    console.log('install event fired: ', event);

    let rules = this.filterRules(this.installRules, event);
    event.waitUntil(this.callPromiseChain(event, rules));
  }

  /**
   * called if the activate event from the service worker is fired
   */
  onActivate(event) {
    // This happens when the old version is gone.
    // Here you can make changes that would have broken the old version,
    // such as deleting old caches and migrating data.

    // Fetch (and other) events will be delayed until this promise settles.
    // This may delay the load of a page & resources,
    // so use install for anything that can be done while an old version is still in control.
    if (this.activateRules.length === 0) {
      return;
    }

    console.log('activate event fired: ', event);

    let rules = this.filterRules(this.activateRules, event);
    event.waitUntil(this.callPromiseChain(event, rules));
  }

  /**
   * called if the fetch event from the service worker is fired
   */
  onFetch(event) {
    if (this.fetchRules.length === 0) {
      return;
    }

    console.log('fetch event fired: ', event);

    let rules = this.filterRules(this.fetchRules, event);
    event.respondWith(this.callPromiseChain(event, rules));
  }

  /**
   * calls the promise from every given rule in a sync loop.
   *
   * @param request the service worker request
   * @param rules rules withe the promise to execute
   *
   * @return Prmoise returned by the promise chain
   */
  callPromiseChain(event, rules) {
    let modifiableEvent = this.copyEvent(event);
    // execute all rules in sync, like here => https://github.com/DukeyToo/es6-promise-patterns
    return rules.reduceRight((prev, curr) => {
      return prev.then((result) => {
        return curr.execute(event, result);
      });
    }, new Promise((resolve) => resolve(modifiableEvent))).then((result) => {
      return new Promise((resolve) => resolve(result));
    });
  }

  /**
   * create a modifiable copy from the given ServiceWorker event
   *
   * @param event event to copy
   * @returns {{}} object with the data from the given event
     */
  copyEvent(event) {
    let eventPropsToCopy = ['timeStamp', 'type', 'returnValue', 'request', 'path',
      'isReload', 'eventPhase', 'defaultPrevented'];

    let copyEvent = {};
    eventPropsToCopy.forEach((prop) => {
      copyEvent[prop] = event[prop] && typeof event[prop].clone === 'function' ? event[prop].clone() : event[prop];
    });

    // the request property is not available on all events
    if (copyEvent.request) {
      let requestPropsToCopy = ['bodyUsed', 'credentials', 'integrity', 'method', 'mode', 'redirect', 'referrer', 'url'];
      let requestToCopy = copyEvent.request;

      copyEvent.request = {};
      requestPropsToCopy.forEach((prop) => {
        copyEvent.request[prop] = requestToCopy[prop] && typeof requestToCopy[prop].clone === 'function' ?
          requestToCopy[prop].clone() : requestToCopy[prop];
      });

      copyEvent.request.headers = {};
    }

    return copyEvent;
  }

  /**
   * filters the given rules to match the given route
   *
   * @param rules {Array} array with rules. Each rule should provide a function #match(request || event).
   * @param filterObject the route or event to check
   * @returns {Array} with all rules that should be executed for the given filterObject
   */
  filterRules(rules, filterObject) {
    return rules.filter(r => r.match && r.match(filterObject) && r);
  }
}
/*eslint-enable no-console */

export default SwProxy;
