/**
 * The Proxy for service workers
 */
/*eslint-disable no-alert, no-console */
class SwProxy {
  constructor(serviceWorker) {
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
    console.log('activate event fired: ', event);
  }
}
/*eslint-enable no-alert, no-console */

export default SwProxy;
