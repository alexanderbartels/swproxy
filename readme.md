# swproxy 
[![NPM version][npm-image]][npm-url] [![wercker status](https://app.wercker.com/status/60a2d039560adbf52b7b1467b49fdc7a/m/master "wercker status")](https://app.wercker.com/project/bykey/60a2d039560adbf52b7b1467b49fdc7a)
[![Dependency Status][daviddm-image]][daviddm-url]

# currently a work in progress

with swproxy you can develop a service worker in a declarative way.


### Mod 
'''
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
'''

### Rule

'''
class RewriteRule {
   match: (event) => true,
   execute: (originalEvent, event) {
    return new Promise((resolve, reject) => {
       // execute the rule in this promise
    });
   }
}
'''


[npm-image]: https://badge.fury.io/js/swproxy.svg
[npm-url]: https://npmjs.org/package/swproxy
[daviddm-image]: https://david-dm.org/alexanderbartels/swproxy.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/alexanderbartels/swproxy

