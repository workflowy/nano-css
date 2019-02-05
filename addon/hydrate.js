'use strict';

exports.addon = function (renderer) {
    if (process.env.NODE_ENV !== 'production') {
        require('./__dev__/warnOnMissingDependencies')('hydrate', renderer, ['put']);
    }

    var hydrated = {};

    renderer.hydrate = function (sh) {
        var cssRules = sh.cssRules || sh.sheet.cssRules;

        var test = new RegExp(`^\\.${renderer.pfx}\\w+$`);
        for (var i = 0; i < cssRules.length; i++) {
            // Only hydrate rules that are generated classnames
            if (test.test(cssRules[i].selectorText)) {
                hydrated[cssRules[i].selectorText] = 1;
            }
        }
    };

    if (renderer.client) {
        if (renderer.sh) renderer.hydrate(renderer.sh);

        var put = renderer.put;

        renderer.put = function (selector, css, atrule) {
            if (selector in hydrated) {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line
                    console.info('Hydrated selector: ' + selector);
                }

                return;
            }

            put(selector, css, atrule);
        };

        renderer.putSemiRaw = function (selector, rawDecl, atrule) {
            if (selector in hydrated) {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line
                    console.info('Hydrated selector: ' + selector);
                }

                return;
            }

            var str = selector + '{' + rawDecl + '}';

            if (atrule) {
                str = atrule + '{' + str + '}';
            }

            renderer.putRaw(str);
        };
    }
};
