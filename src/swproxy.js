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
   * @param {function} the rule to be executed.
   */
  addInstallRule(rule) {
    this.installRules.push(rule);
  }

  /**
   * adds a new rule, that will be executed, if the activate event gets fired.
   * The rule should return a Promise.
   *
   * @param {function} the rule to be executed.
   */
  addActivateRule(rule) {
    if (typeof rule === 'function') {
      this.activateRules.push(rule);
    }
  }

  /**
   * adds a new rule, that will be executed, if the fetch event gets fired.
   * The rule should return a Promise.
   *
   * @param {function} the rule to be executed.
   */
  addFetchRule(rule) {
    if (typeof rule === 'function') {
      this.fetchRules.push(rule);
    }
  }

  /**
   * called if the install event from the service worker is fired
   */
  onInstall(event) {
    if (this.installRules.length === 0) {
      return;
    }

    let request = event.request.clone();
    console.log('install event fired: ', event);

    // execute all install rules in sync, like here => https://github.com/DukeyToo/es6-promise-patterns
    let rules = this.filterRules(this.installRules, request);
    event.waitUntil(rules.reduce((prev, curr) => {
      return prev.then((result) => {
        return curr.execute(event, result);
      });
    }, new Promise((resolve) => resolve({}))).then((result) => {
      console.log('result', result);
      return new Promise((resolve) => resolve());
    }));
  }

  /**
   * called if the activate event from the service worker is fired
   */
  onActivate(event) {
    console.log('activate event fired: ', event);
  }

  /**
   * called if the fetch event from the service worker is fired
   */
  onFetch(event) {
    console.log('fetch event fired: ', event);
  }

  /**
   * filters the given rules to match the given route
   *
   * @param rules {Array} array with rules. Each rule should provide a function #match(request).
   * @param route the route to check
   * @returns {Array} with all rules that should be executed for the given request
   */
  filterRules(rules, request) {
    return rules.filter(r => r.match && r.match(request) && r);
  }
}
/*eslint-enable no-console */

export default SwProxy;
