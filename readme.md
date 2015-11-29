# swproxy 
[![NPM version][npm-image]][npm-url] [![wercker status](https://app.wercker.com/status/60a2d039560adbf52b7b1467b49fdc7a/m/master "wercker status")](https://app.wercker.com/project/bykey/60a2d039560adbf52b7b1467b49fdc7a)
[![Dependency Status][daviddm-image]][daviddm-url]

# currently a work in progress

with swproxy you can develop a service worker in a declarative way.


## Usage

install swproxy via npm:
```shell
npm install --save swproxy
```

load swproxy as dependency in your serviceworker.js file:
```javascript
importScripts('./js/swproxy.js'); // swproxy.js is located under node_modules/swproxy/dist/swproxy.js
```

To define rules for the swproxy, you need to load some swproxy-mods.
You can search for them on [npm](https://www.npmjs.com/search?q=swproxy) or via the [swproxy website](http://www.alexanderbartels.com/swproxy-www)
Mods have to be loaded like the swproxy itself:

```shell
// install a swproxy-mod via npm. e.g. swproxy-mod-rewrite
npm install --save swproxy-mod-rewrite
```

```javascript
// in your serviceworker.js
importScripts('./js/swproxy-mod-rewrite.js'); // swproxy-mod-rewrite.js is located under node_modules/swproxy-mod-rewrite/dist/swproxy-mod-rewrite.js
```


Based on the mods you're loading in your ServiceWorker, new methods are populated to the swproxy (the factory method).
```javascript
// in your serviceworker.js file ...

// load the swproxy stuff
importScripts('./js/swproxy.js');
importScripts('./js/swproxy-mod-rewrite.js'); 

// initiate the swproxy, you need to pass 'self' as the constructor argument, 
// so the proxy can add event listeners to the service worker.
var proxy = new SwProxy(self);

// next you need to register the Mods, you want to use (Make sure you have loaded them via 'importScripts(...)'
proxy.registerMod(ModRewrite);
 
// after registering a mod, new methods on your swproxy instance are available. e.g. 'rewriteRule(...)'
proxy.rewriteRule(new RegExp('.*/swproxy/mods$', ''), '/some/other/path', {});
```

### Modifier
Each rule should accept an Modifier Object as last argument.
Currently available global modifier:
```
 * {boolean} stopPropagation => following defined rules won't be executed
```

# writing your own swproxy mod

To make it easy to get started. You an use the [yeoman generator-swproxy-mod](https://www.npmjs.com/package/generator-swproxy-mod).

Your swproxy-mod must have the `swproxy-mod` keyword and a description in `package.json` to be listed on the swproxy website.
The generator will create two base Classes for you:
  * Mod< YOUR MOD NAME>  => e.g. ModRewrite 
  * Mod< YOUR MOD NAME>Rule => e.g. ModRewriteRule

### Mod

The Mod must implement two static methods. The `factoryMethodName` and `factoryMethod` functions.
Example (ModRewrite):
```javascript
// in your swproxy-mod-rewrite.js file

// [...]

/**
 * es6 class definition for the swproxy mod
 */
class ModRewrite {

  /**
   * @return {String} the name from the factory function, that will be populated at the swproxy isntance.
   */
   static factoryMethodName() {
      return 'rewriteRule';
   }
   
   /**
    * @return {function} factory function to create rules
    */
   static factoryMethod(swproxy) {
      return (srcUrl, destUrl, modifiers) {
         // create a new instance from your rule
         let rule = new RewriteRule(srcUrl, destUrl, modifiers);
         
         // add the rule, based on the rule type (fetch, install, activate) to the swproxy instance
         swproxy.addFetchRule(rule);
      }
   }
}

export default ModRewrite;
```

To use your Mod, it should be registered at the swproxy
Example:
```javascript
// in your service worker js file

// importScripts [...]

// initiate the swproxy
var swproxy = new SwProxy(self);

// register your mod
swproxy.registerMod(ModRewrite);

// after registering the mod, 
// the factory function with name from the `factoryMethodName` function can be used to define rules
swproxy.rewriteRule('param1', 'param2', 'param3');
```

### Rule
```javascript
// in your swproxy-mod-rewrite.js file
class RewriteRule {
   match: (event) => true,
   execute: (originalEvent, event) {
    return new Promise((resolve, reject) => {
       // execute the rule in this promise
       
       // originalEvent can't be modified and is the event that was originally fired by the service worker
        
       // event should be modified by the rules,
       // the modified event will be passed to the next rule
       // it will also used, to make the final fetch event.
        
       // modify header, url, etc. on the event object and pass it to the resolve function
        
       // if the reject function will be called, the event/request will be canceled with an Error 
       resolve(event);
    });
   }
}

// Mod Rewrite definition [...]

export {
   ModRewrite as default,
   RewriteRule
};
```

## License

MIT © [Alexander Bartels](http://www.alexanderbartels.com)

[npm-image]: https://badge.fury.io/js/swproxy.svg
[npm-url]: https://npmjs.org/package/swproxy
[daviddm-image]: https://david-dm.org/alexanderbartels/swproxy.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/alexanderbartels/swproxy

