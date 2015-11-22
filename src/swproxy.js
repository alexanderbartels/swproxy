/**
 * The Proxy for service workers
 */
/*eslint-disable no-alert, no-console */
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
    if (typeof rule === 'function') {
      this.installRules.push(rule);
    }
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
    console.log('install event fired: ', event);
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
}
/*eslint-enable no-alert, no-console */

export default SwProxy;
