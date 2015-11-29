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


... TODO ... more documentation
===============================


### Mod 
```javascript
class ModRewrite {
   static factoryMethodName() {
      return 'rewriteRule';
   }
   
   static factoryMethod(swproxy) {
      return (...args) {
         let rule = new RewriteRule(arg...);
         swproxy.addFetchRule(rule);
      }
   }
}

// [...]

swproxy.registerMod(ModRewrite);

swproxy.rewriteRule('param1', 'param2', 'param3');
```

### Rule

```javascript
class RewriteRule {
   match: (event) => true,
   execute: (originalEvent, event) {
    return new Promise((resolve, reject) => {
       // execute the rule in this promise
    });
   }
}
```


## License

MIT © [Alexander Bartels](http://www.alexanderbartels.com)

[npm-image]: https://badge.fury.io/js/swproxy.svg
[npm-url]: https://npmjs.org/package/swproxy
[daviddm-image]: https://david-dm.org/alexanderbartels/swproxy.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/alexanderbartels/swproxy

