

(function() {
/*!
 * @overview  Ember - JavaScript Application Framework
 * @copyright Copyright 2011-2018 Tilde Inc. and contributors
 *            Portions Copyright 2006-2011 Strobe Inc.
 *            Portions Copyright 2008-2011 Apple Inc. All rights reserved.
 * @license   Licensed under MIT license
 *            See https://raw.github.com/emberjs/ember.js/master/LICENSE
 * @version   3.0.0
 */

/*globals process */
var enifed, requireModule, Ember;

// Used in ember-environment/lib/global.js
mainContext = this; // eslint-disable-line no-undef

(function() {
    function missingModule(name, referrerName) {
      if (referrerName) {
        throw new Error('Could not find module ' + name + ' required by: ' + referrerName);
      } else {
        throw new Error('Could not find module ' + name);
      }
    }

    function internalRequire(_name, referrerName) {
      var name = _name;
      var mod = registry[name];

      if (!mod) {
        name = name + '/index';
        mod = registry[name];
      }

      var exports = seen[name];

      if (exports !== undefined) {
        return exports;
      }

      exports = seen[name] = {};

      if (!mod) {
        missingModule(_name, referrerName);
      }

      var deps = mod.deps;
      var callback = mod.callback;
      var reified = new Array(deps.length);

      for (var i = 0; i < deps.length; i++) {
        if (deps[i] === 'exports') {
          reified[i] = exports;
        } else if (deps[i] === 'require') {
          reified[i] = requireModule;
        } else {
          reified[i] = internalRequire(deps[i], name);
        }
      }

      callback.apply(this, reified);

      return exports;
    }

  var isNode = typeof window === 'undefined' &&
    typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  if (!isNode) {
    Ember = this.Ember = this.Ember || {};
  }

  if (typeof Ember === 'undefined') { Ember = {}; }

  if (typeof Ember.__loader === 'undefined') {
    var registry = {};
    var seen = {};

    enifed = function(name, deps, callback) {
      var value = { };

      if (!callback) {
        value.deps = [];
        value.callback = deps;
      } else {
        value.deps = deps;
        value.callback = callback;
      }

      registry[name] = value;
    };

    requireModule = function(name) {
      return internalRequire(name, null);
    };

    // setup `require` module
    requireModule['default'] = requireModule;

    requireModule.has = function registryHas(moduleName) {
      return !!registry[moduleName] || !!registry[moduleName + '/index'];
    };

    requireModule._eak_seen = registry;

    Ember.__loader = {
      define: enifed,
      require: requireModule,
      registry: registry
    };
  } else {
    enifed = Ember.__loader.define;
    requireModule = Ember.__loader.require;
  }
})();

enifed('ember-babel', ['exports'], function (exports) {
  'use strict';

  exports.classCallCheck = classCallCheck;
  exports.inherits = inherits;
  exports.taggedTemplateLiteralLoose = taggedTemplateLiteralLoose;
  exports.createClass = createClass;
  exports.defaults = defaults;
  function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }

  function inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
      throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : defaults(subClass, superClass);
  }

  function taggedTemplateLiteralLoose(strings, raw) {
    strings.raw = raw;
    return strings;
  }

  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function createClass(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = Object.getOwnPropertyDescriptor(defaults, key);
      if (value && value.configurable && obj[key] === undefined) {
        Object.defineProperty(obj, key, value);
      }
    }
    return obj;
  }

  var possibleConstructorReturn = exports.possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError('this hasn\'t been initialized - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
  };

  var slice = exports.slice = Array.prototype.slice;
});
enifed('ember-debug/deprecate', ['exports', 'ember-debug/error', 'ember-console', 'ember-environment', 'ember-debug/index', 'ember-debug/handlers'], function (exports, _error, _emberConsole, _emberEnvironment, _index, _handlers) {
  'use strict';

  exports.missingOptionsUntilDeprecation = exports.missingOptionsIdDeprecation = exports.missingOptionsDeprecation = exports.registerHandler = undefined;

  /**
   @module @ember/debug
   @public
  */
  /**
    Allows for runtime registration of handler functions that override the default deprecation behavior.
    Deprecations are invoked by calls to [@ember/application/deprecations/deprecate](https://emberjs.com/api/ember/release/classes/@ember%2Fapplication%2Fdeprecations/methods/deprecate?anchor=deprecate).
    The following example demonstrates its usage by registering a handler that throws an error if the
    message contains the word "should", otherwise defers to the default handler.
  
    ```javascript
    import { registerDeprecationHandler } from '@ember/debug';
  
    registerDeprecationHandler((message, options, next) => {
      if (message.indexOf('should') !== -1) {
        throw new Error(`Deprecation message with should: ${message}`);
      } else {
        // defer to whatever handler was registered before this one
        next(message, options);
      }
    });
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the deprecation call.</li>
      <li> <code>options</code> - An object passed in with the deprecation call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the deprecation in the form of <code>package-name.specific-deprecation</code>.</li>
          <li> <code>until</code> - The Ember version number the feature and deprecation will be removed in.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerDeprecationHandler
    @for @ember/debug
    @param handler {Function} A function to handle deprecation calls.
    @since 2.1.0
  */
  /*global __fail__*/
  var registerHandler = function () {};
  var missingOptionsDeprecation = void 0,
      missingOptionsIdDeprecation = void 0,
      missingOptionsUntilDeprecation = void 0,
      deprecate = void 0;

  if (true) {
    exports.registerHandler = registerHandler = function registerHandler(handler) {
      (0, _handlers.registerHandler)('deprecate', handler);
    };

    var formatMessage = function formatMessage(_message, options) {
      var message = _message;

      if (options && options.id) {
        message = message + (' [deprecation id: ' + options.id + ']');
      }

      if (options && options.url) {
        message += ' See ' + options.url + ' for more details.';
      }

      return message;
    };

    registerHandler(function logDeprecationToConsole(message, options) {
      var updatedMessage = formatMessage(message, options);

      _emberConsole.default.warn('DEPRECATION: ' + updatedMessage);
    });

    var captureErrorForStack = void 0;

    if (new Error().stack) {
      captureErrorForStack = function () {
        return new Error();
      };
    } else {
      captureErrorForStack = function () {
        try {
          __fail__.fail();
        } catch (e) {
          return e;
        }
      };
    }

    registerHandler(function logDeprecationStackTrace(message, options, next) {
      if (_emberEnvironment.ENV.LOG_STACKTRACE_ON_DEPRECATION) {
        var stackStr = '';
        var error = captureErrorForStack();
        var stack = void 0;

        if (error.stack) {
          if (error['arguments']) {
            // Chrome
            stack = error.stack.replace(/^\s+at\s+/gm, '').replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
            stack.shift();
          } else {
            // Firefox
            stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
          }

          stackStr = '\n    ' + stack.slice(2).join('\n    ');
        }

        var updatedMessage = formatMessage(message, options);

        _emberConsole.default.warn('DEPRECATION: ' + updatedMessage + stackStr);
      } else {
        next.apply(undefined, arguments);
      }
    });

    registerHandler(function raiseOnDeprecation(message, options, next) {
      if (_emberEnvironment.ENV.RAISE_ON_DEPRECATION) {
        var updatedMessage = formatMessage(message);

        throw new _error.default(updatedMessage);
      } else {
        next.apply(undefined, arguments);
      }
    });

    exports.missingOptionsDeprecation = missingOptionsDeprecation = 'When calling `deprecate` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include `id` and `until` properties.';
    exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation = 'When calling `deprecate` you must provide `id` in options.';
    exports.missingOptionsUntilDeprecation = missingOptionsUntilDeprecation = 'When calling `deprecate` you must provide `until` in options.';
    /**
     @module @ember/application
     @public
     */
    /**
      Display a deprecation warning with the provided message and a stack trace
      (Chrome and Firefox only).
       * In a production build, this method is defined as an empty function (NOP).
      Uses of this method in Ember itself are stripped from the ember.prod.js build.
       @method deprecate
      @for @ember/application/deprecations
      @param {String} message A description of the deprecation.
      @param {Boolean} test A boolean. If falsy, the deprecation will be displayed.
      @param {Object} options
      @param {String} options.id A unique id for this deprecation. The id can be
        used by Ember debugging tools to change the behavior (raise, log or silence)
        for that specific deprecation. The id should be namespaced by dots, e.g.
        "view.helper.select".
      @param {string} options.until The version of Ember when this deprecation
        warning will be removed.
      @param {String} [options.url] An optional url to the transition guide on the
        emberjs.com website.
      @static
      @public
      @since 1.0.0
    */
    deprecate = function deprecate(message, test, options) {
      if (_emberEnvironment.ENV._ENABLE_DEPRECATION_OPTIONS_SUPPORT !== true) {
        (0, _index.assert)(missingOptionsDeprecation, options && (options.id || options.until));
        (0, _index.assert)(missingOptionsIdDeprecation, options.id);
        (0, _index.assert)(missingOptionsUntilDeprecation, options.until);
      }

      if ((!options || !options.id && !options.until) && _emberEnvironment.ENV._ENABLE_DEPRECATION_OPTIONS_SUPPORT === true) {
        deprecate(missingOptionsDeprecation, false, {
          id: 'ember-debug.deprecate-options-missing',
          until: '3.0.0',
          url: 'https://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
        });
      }

      if (options && !options.id && _emberEnvironment.ENV._ENABLE_DEPRECATION_OPTIONS_SUPPORT === true) {
        deprecate(missingOptionsIdDeprecation, false, {
          id: 'ember-debug.deprecate-id-missing',
          until: '3.0.0',
          url: 'https://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
        });
      }

      if (options && !options.until && _emberEnvironment.ENV._ENABLE_DEPRECATION_OPTIONS_SUPPORT === true) {
        deprecate(missingOptionsUntilDeprecation, options && options.until, {
          id: 'ember-debug.deprecate-until-missing',
          until: '3.0.0',
          url: 'https://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
        });
      }

      _handlers.invoke.apply(undefined, ['deprecate'].concat(Array.prototype.slice.call(arguments)));
    };
  }

  exports.default = deprecate;
  exports.registerHandler = registerHandler;
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  exports.missingOptionsUntilDeprecation = missingOptionsUntilDeprecation;
});
enifed("ember-debug/error", ["exports", "ember-babel"], function (exports, _emberBabel) {
  "use strict";

  /**
   @module @ember/error
  */
  function ExtendBuiltin(klass) {
    function ExtendableBuiltin() {
      klass.apply(this, arguments);
    }

    ExtendableBuiltin.prototype = Object.create(klass.prototype);
    ExtendableBuiltin.prototype.constructor = ExtendableBuiltin;
    return ExtendableBuiltin;
  }

  /**
    A subclass of the JavaScript Error object for use in Ember.
  
    @class EmberError
    @extends Error
    @constructor
    @public
  */

  var EmberError = function (_ExtendBuiltin) {
    (0, _emberBabel.inherits)(EmberError, _ExtendBuiltin);

    function EmberError(message) {
      (0, _emberBabel.classCallCheck)(this, EmberError);

      var _this = (0, _emberBabel.possibleConstructorReturn)(this, _ExtendBuiltin.call(this));

      if (!(_this instanceof EmberError)) {
        var _ret;

        return _ret = new EmberError(message), (0, _emberBabel.possibleConstructorReturn)(_this, _ret);
      }

      var error = Error.call(_this, message);
      _this.stack = error.stack;
      _this.description = error.description;
      _this.fileName = error.fileName;
      _this.lineNumber = error.lineNumber;
      _this.message = error.message;
      _this.name = error.name;
      _this.number = error.number;
      _this.code = error.code;
      return _this;
    }

    return EmberError;
  }(ExtendBuiltin(Error));

  exports.default = EmberError;
});
enifed('ember-debug/features', ['exports', 'ember-environment', 'ember/features'], function (exports, _emberEnvironment, _features) {
  'use strict';

  exports.default = isEnabled;
  var FEATURES = _features.FEATURES;


  /**
   @module ember
  */

  /**
    The hash of enabled Canary features. Add to this, any canary features
    before creating your application.
  
    Alternatively (and recommended), you can also define `EmberENV.FEATURES`
    if you need to enable features flagged at runtime.
  
    @class FEATURES
    @namespace Ember
    @static
    @since 1.1.0
    @public
  */

  // Auto-generated

  /**
    Determine whether the specified `feature` is enabled. Used by Ember's
    build tools to exclude experimental features from beta/stable builds.
  
    You can define the following configuration options:
  
    * `EmberENV.ENABLE_OPTIONAL_FEATURES` - enable any features that have not been explicitly
      enabled/disabled.
  
    @method isEnabled
    @param {String} feature The feature to check
    @return {Boolean}
    @for Ember.FEATURES
    @since 1.1.0
    @public
  */
  function isEnabled(feature) {
    var featureValue = FEATURES[feature];

    if (featureValue === true || featureValue === false || featureValue === undefined) {
      return featureValue;
    } else if (_emberEnvironment.ENV.ENABLE_OPTIONAL_FEATURES) {
      return true;
    } else {
      return false;
    }
  }
});
enifed('ember-debug/handlers', ['exports'], function (exports) {
  'use strict';

  var HANDLERS = exports.HANDLERS = {};

  var registerHandler = function () {};
  var invoke = function () {};

  if (true) {
    exports.registerHandler = registerHandler = function registerHandler(type, callback) {
      var nextHandler = HANDLERS[type] || function () {};

      HANDLERS[type] = function (message, options) {
        callback(message, options, nextHandler);
      };
    };

    exports.invoke = invoke = function invoke(type, message, test, options) {
      if (test) {
        return;
      }

      var handlerForType = HANDLERS[type];

      if (handlerForType) {
        handlerForType(message, options);
      }
    };
  }

  exports.registerHandler = registerHandler;
  exports.invoke = invoke;
});
enifed('ember-debug/index', ['exports', 'ember-debug/warn', 'ember-debug/deprecate', 'ember-debug/features', 'ember-debug/error', 'ember-debug/testing', 'ember-environment', 'ember-console', 'ember/features'], function (exports, _warn2, _deprecate2, _features, _error, _testing, _emberEnvironment, _emberConsole, _features2) {
  'use strict';

  exports._warnIfUsingStrippedFeatureFlags = exports.getDebugFunction = exports.setDebugFunction = exports.deprecateFunc = exports.runInDebug = exports.debugFreeze = exports.debugSeal = exports.deprecate = exports.debug = exports.warn = exports.info = exports.assert = exports.setTesting = exports.isTesting = exports.Error = exports.isFeatureEnabled = exports.registerDeprecationHandler = exports.registerWarnHandler = undefined;
  Object.defineProperty(exports, 'registerWarnHandler', {
    enumerable: true,
    get: function () {
      return _warn2.registerHandler;
    }
  });
  Object.defineProperty(exports, 'registerDeprecationHandler', {
    enumerable: true,
    get: function () {
      return _deprecate2.registerHandler;
    }
  });
  Object.defineProperty(exports, 'isFeatureEnabled', {
    enumerable: true,
    get: function () {
      return _features.default;
    }
  });
  Object.defineProperty(exports, 'Error', {
    enumerable: true,
    get: function () {
      return _error.default;
    }
  });
  Object.defineProperty(exports, 'isTesting', {
    enumerable: true,
    get: function () {
      return _testing.isTesting;
    }
  });
  Object.defineProperty(exports, 'setTesting', {
    enumerable: true,
    get: function () {
      return _testing.setTesting;
    }
  });
  var DEFAULT_FEATURES = _features2.DEFAULT_FEATURES,
      FEATURES = _features2.FEATURES;


  // These are the default production build versions:
  var noop = function () {};

  var assert = noop;
  var info = noop;
  var warn = noop;
  var debug = noop;
  var deprecate = noop;
  var debugSeal = noop;
  var debugFreeze = noop;
  var runInDebug = noop;
  var setDebugFunction = noop;
  var getDebugFunction = noop;

  var deprecateFunc = function () {
    return arguments[arguments.length - 1];
  };

  if (true) {
    exports.setDebugFunction = setDebugFunction = function (type, callback) {
      switch (type) {
        case 'assert':
          return exports.assert = assert = callback;
        case 'info':
          return exports.info = info = callback;
        case 'warn':
          return exports.warn = warn = callback;
        case 'debug':
          return exports.debug = debug = callback;
        case 'deprecate':
          return exports.deprecate = deprecate = callback;
        case 'debugSeal':
          return exports.debugSeal = debugSeal = callback;
        case 'debugFreeze':
          return exports.debugFreeze = debugFreeze = callback;
        case 'runInDebug':
          return exports.runInDebug = runInDebug = callback;
        case 'deprecateFunc':
          return exports.deprecateFunc = deprecateFunc = callback;
      }
    };

    exports.getDebugFunction = getDebugFunction = function (type) {
      switch (type) {
        case 'assert':
          return assert;
        case 'info':
          return info;
        case 'warn':
          return warn;
        case 'debug':
          return debug;
        case 'deprecate':
          return deprecate;
        case 'debugSeal':
          return debugSeal;
        case 'debugFreeze':
          return debugFreeze;
        case 'runInDebug':
          return runInDebug;
        case 'deprecateFunc':
          return deprecateFunc;
      }
    };
  }

  /**
  @module @ember/debug
  */

  if (true) {
    /**
      Define an assertion that will throw an exception if the condition is not met.
       * In a production build, this method is defined as an empty function (NOP).
      Uses of this method in Ember itself are stripped from the ember.prod.js build.
       ```javascript
      import { assert } from '@ember/debug';
       // Test for truthiness
      assert('Must pass a valid object', obj);
       // Fail unconditionally
      assert('This code path should never be run');
      ```
       @method assert
      @static
      @for @ember/debug
      @param {String} desc A description of the assertion. This will become
        the text of the Error thrown if the assertion fails.
      @param {Boolean} test Must be truthy for the assertion to pass. If
        falsy, an exception will be thrown.
      @public
      @since 1.0.0
    */
    setDebugFunction('assert', function assert(desc, test) {
      if (!test) {
        throw new _error.default('Assertion Failed: ' + desc);
      }
    });

    /**
      Display a debug notice.
       * In a production build, this method is defined as an empty function (NOP).
      Uses of this method in Ember itself are stripped from the ember.prod.js build.
       ```javascript
      import { debug } from '@ember/debug';
       debug('I\'m a debug notice!');
      ```
       @method debug
      @for @ember/debug
      @static
      @param {String} message A debug message to display.
      @public
    */
    setDebugFunction('debug', function debug(message) {
      _emberConsole.default.debug('DEBUG: ' + message);
    });

    /**
      Display an info notice.
       * In a production build, this method is defined as an empty function (NOP).
      Uses of this method in Ember itself are stripped from the ember.prod.js build.
       @method info
      @private
    */
    setDebugFunction('info', function info() {
      _emberConsole.default.info.apply(undefined, arguments);
    });

    /**
     @module @ember/application
     @public
    */

    /**
      Alias an old, deprecated method with its new counterpart.
       Display a deprecation warning with the provided message and a stack trace
      (Chrome and Firefox only) when the assigned method is called.
       * In a production build, this method is defined as an empty function (NOP).
       ```javascript
      import { deprecateFunc } from '@ember/application/deprecations';
       Ember.oldMethod = deprecateFunc('Please use the new, updated method', options, Ember.newMethod);
      ```
       @method deprecateFunc
      @static
      @for @ember/application/deprecations
      @param {String} message A description of the deprecation.
      @param {Object} [options] The options object for `deprecate`.
      @param {Function} func The new function called to replace its deprecated counterpart.
      @return {Function} A new function that wraps the original function with a deprecation warning
      @private
    */
    setDebugFunction('deprecateFunc', function deprecateFunc() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length === 3) {
        var message = args[0],
            options = args[1],
            func = args[2];

        return function () {
          deprecate(message, false, options);
          return func.apply(this, arguments);
        };
      } else {
        var _message = args[0],
            _func = args[1];

        return function () {
          deprecate(_message);
          return _func.apply(this, arguments);
        };
      }
    });

    /**
     @module @ember/debug
     @public
    */
    /**
      Run a function meant for debugging.
       * In a production build, this method is defined as an empty function (NOP).
      Uses of this method in Ember itself are stripped from the ember.prod.js build.
       ```javascript
      import Component from '@ember/component';
      import { runInDebug } from '@ember/debug';
       runInDebug(() => {
        Component.reopen({
          didInsertElement() {
            console.log("I'm happy");
          }
        });
      });
      ```
       @method runInDebug
      @for @ember/debug
      @static
      @param {Function} func The function to be executed.
      @since 1.5.0
      @public
    */
    setDebugFunction('runInDebug', function runInDebug(func) {
      func();
    });

    setDebugFunction('debugSeal', function debugSeal(obj) {
      Object.seal(obj);
    });

    setDebugFunction('debugFreeze', function debugFreeze(obj) {
      Object.freeze(obj);
    });

    setDebugFunction('deprecate', _deprecate2.default);

    setDebugFunction('warn', _warn2.default);
  }

  var _warnIfUsingStrippedFeatureFlags = void 0;

  if (true && !(0, _testing.isTesting)()) {
    /**
       Will call `warn()` if ENABLE_OPTIONAL_FEATURES or
       any specific FEATURES flag is truthy.
        This method is called automatically in debug canary builds.
        @private
       @method _warnIfUsingStrippedFeatureFlags
       @return {void}
    */
    exports._warnIfUsingStrippedFeatureFlags = _warnIfUsingStrippedFeatureFlags = function _warnIfUsingStrippedFeatureFlags(FEATURES, knownFeatures, featuresWereStripped) {
      if (featuresWereStripped) {
        warn('Ember.ENV.ENABLE_OPTIONAL_FEATURES is only available in canary builds.', !_emberEnvironment.ENV.ENABLE_OPTIONAL_FEATURES, { id: 'ember-debug.feature-flag-with-features-stripped' });

        var keys = Object.keys(FEATURES || {});
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (key === 'isEnabled' || !(key in knownFeatures)) {
            continue;
          }

          warn('FEATURE["' + key + '"] is set as enabled, but FEATURE flags are only available in canary builds.', !FEATURES[key], { id: 'ember-debug.feature-flag-with-features-stripped' });
        }
      }
    };

    // Complain if they're using FEATURE flags in builds other than canary
    FEATURES['features-stripped-test'] = true;
    var featuresWereStripped = true;

    if ((0, _features.default)('features-stripped-test')) {
      featuresWereStripped = false;
    }

    delete FEATURES['features-stripped-test'];
    _warnIfUsingStrippedFeatureFlags(_emberEnvironment.ENV.FEATURES, DEFAULT_FEATURES, featuresWereStripped);

    // Inform the developer about the Ember Inspector if not installed.
    var isFirefox = _emberEnvironment.environment.isFirefox;
    var isChrome = _emberEnvironment.environment.isChrome;

    if (typeof window !== 'undefined' && (isFirefox || isChrome) && window.addEventListener) {
      window.addEventListener('load', function () {
        if (document.documentElement && document.documentElement.dataset && !document.documentElement.dataset.emberExtension) {
          var downloadURL = void 0;

          if (isChrome) {
            downloadURL = 'https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi';
          } else if (isFirefox) {
            downloadURL = 'https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/';
          }

          debug('For more advanced debugging, install the Ember Inspector from ' + downloadURL);
        }
      }, false);
    }
  }

  exports.assert = assert;
  exports.info = info;
  exports.warn = warn;
  exports.debug = debug;
  exports.deprecate = deprecate;
  exports.debugSeal = debugSeal;
  exports.debugFreeze = debugFreeze;
  exports.runInDebug = runInDebug;
  exports.deprecateFunc = deprecateFunc;
  exports.setDebugFunction = setDebugFunction;
  exports.getDebugFunction = getDebugFunction;
  exports._warnIfUsingStrippedFeatureFlags = _warnIfUsingStrippedFeatureFlags;
});
enifed("ember-debug/testing", ["exports"], function (exports) {
  "use strict";

  exports.isTesting = isTesting;
  exports.setTesting = setTesting;
  var testing = false;

  function isTesting() {
    return testing;
  }

  function setTesting(value) {
    testing = !!value;
  }
});
enifed('ember-debug/warn', ['exports', 'ember-environment', 'ember-console', 'ember-debug/deprecate', 'ember-debug/index', 'ember-debug/handlers'], function (exports, _emberEnvironment, _emberConsole, _deprecate, _index, _handlers) {
  'use strict';

  exports.missingOptionsDeprecation = exports.missingOptionsIdDeprecation = exports.registerHandler = undefined;


  var registerHandler = function () {};
  var warn = function () {};
  var missingOptionsDeprecation = void 0,
      missingOptionsIdDeprecation = void 0;

  /**
  @module @ember/debug
  */

  if (true) {
    /**
      Allows for runtime registration of handler functions that override the default warning behavior.
      Warnings are invoked by calls made to [@ember/debug/warn](https://emberjs.com/api/ember/release/classes/@ember%2Fdebug/methods/warn?anchor=warn).
      The following example demonstrates its usage by registering a handler that does nothing overriding Ember's
      default warning behavior.
       ```javascript
      import { registerWarnHandler } from '@ember/debug';
       // next is not called, so no warnings get the default behavior
      registerWarnHandler(() => {});
      ```
       The handler function takes the following arguments:
       <ul>
        <li> <code>message</code> - The message received from the warn call. </li>
        <li> <code>options</code> - An object passed in with the warn call containing additional information including:</li>
          <ul>
            <li> <code>id</code> - An id of the warning in the form of <code>package-name.specific-warning</code>.</li>
          </ul>
        <li> <code>next</code> - A function that calls into the previously registered handler.</li>
      </ul>
       @public
      @static
      @method registerWarnHandler
      @for @ember/debug
      @param handler {Function} A function to handle warnings.
      @since 2.1.0
    */
    exports.registerHandler = registerHandler = function registerHandler(handler) {
      (0, _handlers.registerHandler)('warn', handler);
    };

    registerHandler(function logWarning(message) {
      _emberConsole.default.warn('WARNING: ' + message);
      if ('trace' in _emberConsole.default) {
        _emberConsole.default.trace();
      }
    });

    exports.missingOptionsDeprecation = missingOptionsDeprecation = 'When calling `warn` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include an `id` property.';
    exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation = 'When calling `warn` you must provide `id` in options.';

    /**
      Display a warning with the provided message.
       * In a production build, this method is defined as an empty function (NOP).
      Uses of this method in Ember itself are stripped from the ember.prod.js build.
       @method warn
      @for @ember/debug
      @static
      @param {String} message A warning to display.
      @param {Boolean} test An optional boolean. If falsy, the warning
        will be displayed.
      @param {Object} options An object that can be used to pass a unique
        `id` for this warning.  The `id` can be used by Ember debugging tools
        to change the behavior (raise, log, or silence) for that specific warning.
        The `id` should be namespaced by dots, e.g. "ember-debug.feature-flag-with-features-stripped"
      @public
      @since 1.0.0
    */
    warn = function warn(message, test, options) {
      if (arguments.length === 2 && typeof test === 'object') {
        options = test;
        test = false;
      }

      if (_emberEnvironment.ENV._ENABLE_WARN_OPTIONS_SUPPORT !== true) {
        (0, _index.assert)(missingOptionsDeprecation, options);
        (0, _index.assert)(missingOptionsIdDeprecation, options && options.id);
      }

      if (!options && _emberEnvironment.ENV._ENABLE_WARN_OPTIONS_SUPPORT === true) {
        (0, _deprecate.default)(missingOptionsDeprecation, false, {
          id: 'ember-debug.warn-options-missing',
          until: '3.0.0',
          url: 'https://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
        });
      }

      if (options && !options.id && _emberEnvironment.ENV._ENABLE_WARN_OPTIONS_SUPPORT === true) {
        (0, _deprecate.default)(missingOptionsIdDeprecation, false, {
          id: 'ember-debug.warn-id-missing',
          until: '3.0.0',
          url: 'https://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
        });
      }

      (0, _handlers.invoke)('warn', message, test, options);
    };
  }

  exports.default = warn;
  exports.registerHandler = registerHandler;
  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
});
enifed('ember-testing/adapters/adapter', ['exports', 'ember-runtime'], function (exports, _emberRuntime) {
  'use strict';

  function K() {
    return this;
  }

  /**
   @module @ember/test
  */

  /**
    The primary purpose of this class is to create hooks that can be implemented
    by an adapter for various test frameworks.
  
    @class TestAdapter
    @public
  */
  exports.default = _emberRuntime.Object.extend({
    /**
      This callback will be called whenever an async operation is about to start.
       Override this to call your framework's methods that handle async
      operations.
       @public
      @method asyncStart
    */
    asyncStart: K,

    /**
      This callback will be called whenever an async operation has completed.
       @public
      @method asyncEnd
    */
    asyncEnd: K,

    /**
      Override this method with your testing framework's false assertion.
      This function is called whenever an exception occurs causing the testing
      promise to fail.
       QUnit example:
       ```javascript
        exception: function(error) {
          ok(false, error);
        };
      ```
       @public
      @method exception
      @param {String} error The exception to be raised.
    */
    exception: function (error) {
      throw error;
    }
  });
});
enifed('ember-testing/adapters/qunit', ['exports', 'ember-utils', 'ember-testing/adapters/adapter'], function (exports, _emberUtils, _adapter) {
  'use strict';

  exports.default = _adapter.default.extend({
    asyncStart: function () {
      QUnit.stop();
    },
    asyncEnd: function () {
      QUnit.start();
    },
    exception: function (error) {
      QUnit.config.current.assert.ok(false, (0, _emberUtils.inspect)(error));
    }
  });
});
enifed('ember-testing/events', ['exports', 'ember-views', 'ember-metal'], function (exports, _emberViews, _emberMetal) {
  'use strict';

  exports.focus = focus;
  exports.fireEvent = fireEvent;


  var DEFAULT_EVENT_OPTIONS = { canBubble: true, cancelable: true };
  var KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];
  var MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];

  function focus(el) {
    if (!el) {
      return;
    }
    var $el = (0, _emberViews.jQuery)(el);
    if ($el.is(':input, [contenteditable=true]')) {
      var type = $el.prop('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
        (0, _emberMetal.run)(null, function () {
          // Firefox does not trigger the `focusin` event if the window
          // does not have focus. If the document doesn't have focus just
          // use trigger('focusin') instead.

          if (!document.hasFocus || document.hasFocus()) {
            el.focus();
          } else {
            $el.trigger('focusin');
          }
        });
      }
    }
  }

  function fireEvent(element, type) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!element) {
      return;
    }
    var event = void 0;
    if (KEYBOARD_EVENT_TYPES.indexOf(type) > -1) {
      event = buildKeyboardEvent(type, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(type) > -1) {
      var rect = element.getBoundingClientRect();
      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5,
        screenY: y + 95,
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(type, _emberViews.jQuery.extend(simulatedCoordinates, options));
    } else {
      event = buildBasicEvent(type, options);
    }
    element.dispatchEvent(event);
  }

  function buildBasicEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = document.createEvent('Events');
    event.initEvent(type, true, true);
    _emberViews.jQuery.extend(event, options);
    return event;
  }

  function buildMouseEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = void 0;
    try {
      event = document.createEvent('MouseEvents');
      var eventOpts = _emberViews.jQuery.extend({}, DEFAULT_EVENT_OPTIONS, options);
      event.initMouseEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }

  function buildKeyboardEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = void 0;
    try {
      event = document.createEvent('KeyEvents');
      var eventOpts = _emberViews.jQuery.extend({}, DEFAULT_EVENT_OPTIONS, options);
      event.initKeyEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }
});
enifed('ember-testing/ext/application', ['ember-application', 'ember-testing/setup_for_testing', 'ember-testing/test/helpers', 'ember-testing/test/promise', 'ember-testing/test/run', 'ember-testing/test/on_inject_helpers', 'ember-testing/test/adapter'], function (_emberApplication, _setup_for_testing, _helpers, _promise, _run, _on_inject_helpers, _adapter) {
  'use strict';

  _emberApplication.Application.reopen({
    /**
     This property contains the testing helpers for the current application. These
     are created once you call `injectTestHelpers` on your `Application`
     instance. The included helpers are also available on the `window` object by
     default, but can be used from this object on the individual application also.
       @property testHelpers
      @type {Object}
      @default {}
      @public
    */
    testHelpers: {},

    /**
     This property will contain the original methods that were registered
     on the `helperContainer` before `injectTestHelpers` is called.
      When `removeTestHelpers` is called, these methods are restored to the
     `helperContainer`.
       @property originalMethods
      @type {Object}
      @default {}
      @private
      @since 1.3.0
    */
    originalMethods: {},

    /**
    This property indicates whether or not this application is currently in
    testing mode. This is set when `setupForTesting` is called on the current
    application.
     @property testing
    @type {Boolean}
    @default false
    @since 1.3.0
    @public
    */
    testing: false,

    setupForTesting: function () {
      (0, _setup_for_testing.default)();

      this.testing = true;

      this.resolveRegistration('router:main').reopen({
        location: 'none'
      });
    },


    /**
      This will be used as the container to inject the test helpers into. By
      default the helpers are injected into `window`.
       @property helperContainer
      @type {Object} The object to be used for test helpers.
      @default window
      @since 1.2.0
      @private
    */
    helperContainer: null,

    injectTestHelpers: function (helperContainer) {
      if (helperContainer) {
        this.helperContainer = helperContainer;
      } else {
        this.helperContainer = window;
      }

      this.reopen({
        willDestroy: function () {
          this._super.apply(this, arguments);
          this.removeTestHelpers();
        }
      });

      this.testHelpers = {};
      for (var name in _helpers.helpers) {
        this.originalMethods[name] = this.helperContainer[name];
        this.testHelpers[name] = this.helperContainer[name] = helper(this, name);
        protoWrap(_promise.default.prototype, name, helper(this, name), _helpers.helpers[name].meta.wait);
      }

      (0, _on_inject_helpers.invokeInjectHelpersCallbacks)(this);
    },
    removeTestHelpers: function () {
      if (!this.helperContainer) {
        return;
      }

      for (var name in _helpers.helpers) {
        this.helperContainer[name] = this.originalMethods[name];
        delete _promise.default.prototype[name];
        delete this.testHelpers[name];
        delete this.originalMethods[name];
      }
    }
  });

  // This method is no longer needed
  // But still here for backwards compatibility
  // of helper chaining
  function protoWrap(proto, name, callback, isAsync) {
    proto[name] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (isAsync) {
        return callback.apply(this, args);
      } else {
        return this.then(function () {
          return callback.apply(this, args);
        });
      }
    };
  }

  function helper(app, name) {
    var fn = _helpers.helpers[name].method;
    var meta = _helpers.helpers[name].meta;
    if (!meta.wait) {
      return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return fn.apply(app, [app].concat(args));
      };
    }

    return function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var lastPromise = (0, _run.default)(function () {
        return (0, _promise.resolve)((0, _promise.getLastPromise)());
      });

      // wait for last helper's promise to resolve and then
      // execute. To be safe, we need to tell the adapter we're going
      // asynchronous here, because fn may not be invoked before we
      // return.
      (0, _adapter.asyncStart)();
      return lastPromise.then(function () {
        return fn.apply(app, [app].concat(args));
      }).finally(_adapter.asyncEnd);
    };
  }
});
enifed('ember-testing/ext/rsvp', ['exports', 'ember-runtime', 'ember-metal', 'ember-debug', 'ember-testing/test/adapter'], function (exports, _emberRuntime, _emberMetal, _emberDebug, _adapter) {
  'use strict';

  _emberRuntime.RSVP.configure('async', function (callback, promise) {
    // if schedule will cause autorun, we need to inform adapter
    if ((0, _emberDebug.isTesting)() && !_emberMetal.run.backburner.currentInstance) {
      (0, _adapter.asyncStart)();
      _emberMetal.run.backburner.schedule('actions', function () {
        (0, _adapter.asyncEnd)();
        callback(promise);
      });
    } else {
      _emberMetal.run.backburner.schedule('actions', function () {
        return callback(promise);
      });
    }
  });

  exports.default = _emberRuntime.RSVP;
});
enifed('ember-testing/helpers', ['ember-testing/test/helpers', 'ember-testing/helpers/and_then', 'ember-testing/helpers/click', 'ember-testing/helpers/current_path', 'ember-testing/helpers/current_route_name', 'ember-testing/helpers/current_url', 'ember-testing/helpers/fill_in', 'ember-testing/helpers/find', 'ember-testing/helpers/find_with_assert', 'ember-testing/helpers/key_event', 'ember-testing/helpers/pause_test', 'ember-testing/helpers/trigger_event', 'ember-testing/helpers/visit', 'ember-testing/helpers/wait'], function (_helpers, _and_then, _click, _current_path, _current_route_name, _current_url, _fill_in, _find, _find_with_assert, _key_event, _pause_test, _trigger_event, _visit, _wait) {
  'use strict';

  (0, _helpers.registerAsyncHelper)('visit', _visit.default);
  (0, _helpers.registerAsyncHelper)('click', _click.default);
  (0, _helpers.registerAsyncHelper)('keyEvent', _key_event.default);
  (0, _helpers.registerAsyncHelper)('fillIn', _fill_in.default);
  (0, _helpers.registerAsyncHelper)('wait', _wait.default);
  (0, _helpers.registerAsyncHelper)('andThen', _and_then.default);
  (0, _helpers.registerAsyncHelper)('pauseTest', _pause_test.pauseTest);
  (0, _helpers.registerAsyncHelper)('triggerEvent', _trigger_event.default);

  (0, _helpers.registerHelper)('find', _find.default);
  (0, _helpers.registerHelper)('findWithAssert', _find_with_assert.default);
  (0, _helpers.registerHelper)('currentRouteName', _current_route_name.default);
  (0, _helpers.registerHelper)('currentPath', _current_path.default);
  (0, _helpers.registerHelper)('currentURL', _current_url.default);
  (0, _helpers.registerHelper)('resumeTest', _pause_test.resumeTest);
});
enifed("ember-testing/helpers/and_then", ["exports"], function (exports) {
  "use strict";

  exports.default = andThen;
  function andThen(app, callback) {
    return app.testHelpers.wait(callback(app));
  }
});
enifed('ember-testing/helpers/click', ['exports', 'ember-testing/events'], function (exports, _events) {
  'use strict';

  exports.default = click;


  /**
    Clicks an element and triggers any actions triggered by the element's `click`
    event.
  
    Example:
  
    ```javascript
    click('.some-jQuery-selector').then(function() {
      // assert something
    });
    ```
  
    @method click
    @param {String} selector jQuery selector for finding element on the DOM
    @param {Object} context A DOM Element, Document, or jQuery to use as context
    @return {RSVP.Promise<undefined>}
    @public
  */
  function click(app, selector, context) {
    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    (0, _events.fireEvent)(el, 'mousedown');

    (0, _events.focus)(el);

    (0, _events.fireEvent)(el, 'mouseup');
    (0, _events.fireEvent)(el, 'click');

    return app.testHelpers.wait();
  } /**
    @module ember
    */
});
enifed('ember-testing/helpers/current_path', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.default = currentPath;


  /**
    Returns the current path.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentPath(), 'some.path.index', "correct path was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentPath
  @return {Object} The currently active path.
  @since 1.5.0
  @public
  */
  function currentPath(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return (0, _emberMetal.get)(routingService, 'currentPath');
  } /**
    @module ember
    */
});
enifed('ember-testing/helpers/current_route_name', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.default = currentRouteName;

  /**
    Returns the currently active route name.
  
  Example:
  
  ```javascript
  function validateRouteName() {
    equal(currentRouteName(), 'some.path', "correct route was transitioned into.");
  }
  visit('/some/path').then(validateRouteName)
  ```
  
  @method currentRouteName
  @return {Object} The name of the currently active route.
  @since 1.5.0
  @public
  */
  function currentRouteName(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return (0, _emberMetal.get)(routingService, 'currentRouteName');
  } /**
    @module ember
    */
});
enifed('ember-testing/helpers/current_url', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.default = currentURL;


  /**
    Returns the current URL.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentURL(), '/some/path', "correct URL was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentURL
  @return {Object} The currently active URL.
  @since 1.5.0
  @public
  */
  function currentURL(app) {
    var router = app.__container__.lookup('router:main');
    return (0, _emberMetal.get)(router, 'location').getURL();
  } /**
    @module ember
    */
});
enifed('ember-testing/helpers/fill_in', ['exports', 'ember-testing/events'], function (exports, _events) {
  'use strict';

  exports.default = fillIn;


  /**
    Fills in an input element with some text.
  
    Example:
  
    ```javascript
    fillIn('#email', 'you@example.com').then(function() {
      // assert something
    });
    ```
  
    @method fillIn
    @param {String} selector jQuery selector finding an input element on the DOM
    to fill text with
    @param {String} text text to place inside the input element
    @return {RSVP.Promise<undefined>}
    @public
  */
  function fillIn(app, selector, contextOrText, text) {
    var $el = void 0,
        el = void 0,
        context = void 0;
    if (text === undefined) {
      text = contextOrText;
    } else {
      context = contextOrText;
    }
    $el = app.testHelpers.findWithAssert(selector, context);
    el = $el[0];
    (0, _events.focus)(el);

    $el.eq(0).val(text);
    (0, _events.fireEvent)(el, 'input');
    (0, _events.fireEvent)(el, 'change');

    return app.testHelpers.wait();
  } /**
    @module ember
    */
});
enifed('ember-testing/helpers/find', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.default = find;


  /**
    Finds an element in the context of the app's container element. A simple alias
    for `app.$(selector)`.
  
    Example:
  
    ```javascript
    var $el = find('.my-selector');
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = find('.my-selector', '.parent-element-class');
    ```
  
    @method find
    @param {String} selector jQuery string selector for element lookup
    @param {String} [context] (optional) jQuery selector that will limit the selector
                              argument to find only within the context's children
    @return {Object} jQuery object representing the results of the query
    @public
  */
  function find(app, selector, context) {
    var $el = void 0;
    context = context || (0, _emberMetal.get)(app, 'rootElement');
    $el = app.$(selector, context);
    return $el;
  } /**
    @module ember
    */
});
enifed('ember-testing/helpers/find_with_assert', ['exports'], function (exports) {
  'use strict';

  exports.default = findWithAssert;
  /**
  @module ember
  */
  /**
    Like `find`, but throws an error if the element selector returns no results.
  
    Example:
  
    ```javascript
    var $el = findWithAssert('.doesnt-exist'); // throws error
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = findWithAssert('.selector-id', '.parent-element-class'); // assert will pass
    ```
  
    @method findWithAssert
    @param {String} selector jQuery selector string for finding an element within
    the DOM
    @param {String} [context] (optional) jQuery selector that will limit the
    selector argument to find only within the context's children
    @return {Object} jQuery object representing the results of the query
    @throws {Error} throws error if jQuery object returned has a length of 0
    @public
  */
  function findWithAssert(app, selector, context) {
    var $el = app.testHelpers.find(selector, context);
    if ($el.length === 0) {
      throw new Error('Element ' + selector + ' not found.');
    }
    return $el;
  }
});
enifed("ember-testing/helpers/key_event", ["exports"], function (exports) {
  "use strict";

  exports.default = keyEvent;
  /**
  @module ember
  */
  /**
    Simulates a key event, e.g. `keypress`, `keydown`, `keyup` with the desired keyCode
    Example:
    ```javascript
    keyEvent('.some-jQuery-selector', 'keypress', 13).then(function() {
     // assert something
    });
    ```
    @method keyEvent
    @param {String} selector jQuery selector for finding element on the DOM
    @param {String} type the type of key event, e.g. `keypress`, `keydown`, `keyup`
    @param {Number} keyCode the keyCode of the simulated key event
    @return {RSVP.Promise<undefined>}
    @since 1.5.0
    @public
  */
  function keyEvent(app, selector, contextOrType, typeOrKeyCode, keyCode) {
    var context = void 0,
        type = void 0;

    if (keyCode === undefined) {
      context = null;
      keyCode = typeOrKeyCode;
      type = contextOrType;
    } else {
      context = contextOrType;
      type = typeOrKeyCode;
    }

    return app.testHelpers.triggerEvent(selector, context, type, { keyCode: keyCode, which: keyCode });
  }
});
enifed('ember-testing/helpers/pause_test', ['exports', 'ember-runtime', 'ember-console', 'ember-debug'], function (exports, _emberRuntime, _emberConsole, _emberDebug) {
  'use strict';

  exports.resumeTest = resumeTest;
  exports.pauseTest = pauseTest;


  var resume = void 0;

  /**
   Resumes a test paused by `pauseTest`.
  
   @method resumeTest
   @return {void}
   @public
  */
  /**
  @module ember
  */
  function resumeTest() {
    (true && !(resume) && (0, _emberDebug.assert)('Testing has not been paused. There is nothing to resume.', resume));

    resume();
    resume = undefined;
  }

  /**
   Pauses the current test - this is useful for debugging while testing or for test-driving.
   It allows you to inspect the state of your application at any point.
   Example (The test will pause before clicking the button):
  
   ```javascript
   visit('/')
   return pauseTest();
   click('.btn');
   ```
  
   You may want to turn off the timeout before pausing.
  
   qunit (as of 2.4.0):
  
   ```
   visit('/');
   assert.timeout(0);
   return pauseTest();
   click('.btn');
   ```
  
   mocha:
  
   ```
   visit('/');
   this.timeout(0);
   return pauseTest();
   click('.btn');
   ```
  
  
   @since 1.9.0
   @method pauseTest
   @return {Object} A promise that will never resolve
   @public
  */
  function pauseTest() {
    _emberConsole.default.info('Testing paused. Use `resumeTest()` to continue.');

    return new _emberRuntime.RSVP.Promise(function (resolve) {
      resume = resolve;
    }, 'TestAdapter paused promise');
  }
});
enifed('ember-testing/helpers/trigger_event', ['exports', 'ember-testing/events'], function (exports, _events) {
  'use strict';

  exports.default = triggerEvent;

  /**
    Triggers the given DOM event on the element identified by the provided selector.
    Example:
    ```javascript
    triggerEvent('#some-elem-id', 'blur');
    ```
    This is actually used internally by the `keyEvent` helper like so:
    ```javascript
    triggerEvent('#some-elem-id', 'keypress', { keyCode: 13 });
    ```
   @method triggerEvent
   @param {String} selector jQuery selector for finding element on the DOM
   @param {String} [context] jQuery selector that will limit the selector
                             argument to find only within the context's children
   @param {String} type The event type to be triggered.
   @param {Object} [options] The options to be passed to jQuery.Event.
   @return {RSVP.Promise<undefined>}
   @since 1.5.0
   @public
  */
  function triggerEvent(app, selector, contextOrType, typeOrOptions, possibleOptions) {
    var arity = arguments.length;
    var context = void 0,
        type = void 0,
        options = void 0;

    if (arity === 3) {
      // context and options are optional, so this is
      // app, selector, type
      context = null;
      type = contextOrType;
      options = {};
    } else if (arity === 4) {
      // context and options are optional, so this is
      if (typeof typeOrOptions === 'object') {
        // either
        // app, selector, type, options
        context = null;
        type = contextOrType;
        options = typeOrOptions;
      } else {
        // or
        // app, selector, context, type
        context = contextOrType;
        type = typeOrOptions;
        options = {};
      }
    } else {
      context = contextOrType;
      type = typeOrOptions;
      options = possibleOptions;
    }

    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    (0, _events.fireEvent)(el, type, options);

    return app.testHelpers.wait();
  } /**
    @module ember
    */
});
enifed('ember-testing/helpers/visit', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.default = visit;


  /**
    Loads a route, sets up any controllers, and renders any templates associated
    with the route as though a real user had triggered the route change while
    using your app.
  
    Example:
  
    ```javascript
    visit('posts/index').then(function() {
      // assert something
    });
    ```
  
    @method visit
    @param {String} url the name of the route
    @return {RSVP.Promise<undefined>}
    @public
  */
  function visit(app, url) {
    var router = app.__container__.lookup('router:main');
    var shouldHandleURL = false;

    app.boot().then(function () {
      router.location.setURL(url);

      if (shouldHandleURL) {
        (0, _emberMetal.run)(app.__deprecatedInstance__, 'handleURL', url);
      }
    });

    if (app._readinessDeferrals > 0) {
      router['initialURL'] = url;
      (0, _emberMetal.run)(app, 'advanceReadiness');
      delete router['initialURL'];
    } else {
      shouldHandleURL = true;
    }

    return app.testHelpers.wait();
  } /**
    @module ember
    */
});
enifed('ember-testing/helpers/wait', ['exports', 'ember-testing/test/waiters', 'ember-runtime', 'ember-metal', 'ember-testing/test/pending_requests'], function (exports, _waiters, _emberRuntime, _emberMetal, _pending_requests) {
  'use strict';

  exports.default = wait;


  /**
    Causes the run loop to process any pending events. This is used to ensure that
    any async operations from other helpers (or your assertions) have been processed.
  
    This is most often used as the return value for the helper functions (see 'click',
    'fillIn','visit',etc). However, there is a method to register a test helper which
    utilizes this method without the need to actually call `wait()` in your helpers.
  
    The `wait` helper is built into `registerAsyncHelper` by default. You will not need
    to `return app.testHelpers.wait();` - the wait behavior is provided for you.
  
    Example:
  
    ```javascript
    import { registerAsyncHelper } from '@ember/test';
  
    registerAsyncHelper('loginUser', function(app, username, password) {
      visit('secured/path/here')
        .fillIn('#username', username)
        .fillIn('#password', password)
        .click('.submit');
    });
    ```
  
    @method wait
    @param {Object} value The value to be returned.
    @return {RSVP.Promise<any>} Promise that resolves to the passed value.
    @public
    @since 1.0.0
  */
  /**
  @module ember
  */
  function wait(app, value) {
    return new _emberRuntime.RSVP.Promise(function (resolve) {
      var router = app.__container__.lookup('router:main');

      // Every 10ms, poll for the async thing to have finished
      var watcher = setInterval(function () {
        // 1. If the router is loading, keep polling
        var routerIsLoading = router._routerMicrolib && !!router._routerMicrolib.activeTransition;
        if (routerIsLoading) {
          return;
        }

        // 2. If there are pending Ajax requests, keep polling
        if ((0, _pending_requests.pendingRequests)()) {
          return;
        }

        // 3. If there are scheduled timers or we are inside of a run loop, keep polling
        if (_emberMetal.run.hasScheduledTimers() || _emberMetal.run.currentRunLoop) {
          return;
        }

        if ((0, _waiters.checkWaiters)()) {
          return;
        }

        // Stop polling
        clearInterval(watcher);

        // Synchronously resolve the promise
        (0, _emberMetal.run)(null, resolve, value);
      }, 10);
    });
  }
});
enifed('ember-testing/index', ['exports', 'ember-testing/test', 'ember-testing/adapters/adapter', 'ember-testing/setup_for_testing', 'ember-testing/adapters/qunit', 'ember-testing/support', 'ember-testing/ext/application', 'ember-testing/ext/rsvp', 'ember-testing/helpers', 'ember-testing/initializers'], function (exports, _test, _adapter, _setup_for_testing, _qunit) {
  'use strict';

  exports.QUnitAdapter = exports.setupForTesting = exports.Adapter = exports.Test = undefined;
  Object.defineProperty(exports, 'Test', {
    enumerable: true,
    get: function () {
      return _test.default;
    }
  });
  Object.defineProperty(exports, 'Adapter', {
    enumerable: true,
    get: function () {
      return _adapter.default;
    }
  });
  Object.defineProperty(exports, 'setupForTesting', {
    enumerable: true,
    get: function () {
      return _setup_for_testing.default;
    }
  });
  Object.defineProperty(exports, 'QUnitAdapter', {
    enumerable: true,
    get: function () {
      return _qunit.default;
    }
  });
});
enifed('ember-testing/initializers', ['ember-runtime'], function (_emberRuntime) {
  'use strict';

  var name = 'deferReadiness in `testing` mode';

  (0, _emberRuntime.onLoad)('Ember.Application', function (Application) {
    if (!Application.initializers[name]) {
      Application.initializer({
        name: name,

        initialize: function (application) {
          if (application.testing) {
            application.deferReadiness();
          }
        }
      });
    }
  });
});
enifed('ember-testing/setup_for_testing', ['exports', 'ember-debug', 'ember-views', 'ember-testing/test/adapter', 'ember-testing/test/pending_requests', 'ember-testing/adapters/adapter', 'ember-testing/adapters/qunit'], function (exports, _emberDebug, _emberViews, _adapter, _pending_requests, _adapter2, _qunit) {
  'use strict';

  exports.default = setupForTesting;


  /**
    Sets Ember up for testing. This is useful to perform
    basic setup steps in order to unit test.
  
    Use `App.setupForTesting` to perform integration tests (full
    application testing).
  
    @method setupForTesting
    @namespace Ember
    @since 1.5.0
    @private
  */
  /* global self */

  function setupForTesting() {
    (0, _emberDebug.setTesting)(true);

    var adapter = (0, _adapter.getAdapter)();
    // if adapter is not manually set default to QUnit
    if (!adapter) {
      (0, _adapter.setAdapter)(typeof self.QUnit === 'undefined' ? new _adapter2.default() : new _qunit.default());
    }

    if (_emberViews.jQuery) {
      (0, _emberViews.jQuery)(document).off('ajaxSend', _pending_requests.incrementPendingRequests);
      (0, _emberViews.jQuery)(document).off('ajaxComplete', _pending_requests.decrementPendingRequests);

      (0, _pending_requests.clearPendingRequests)();

      (0, _emberViews.jQuery)(document).on('ajaxSend', _pending_requests.incrementPendingRequests);
      (0, _emberViews.jQuery)(document).on('ajaxComplete', _pending_requests.decrementPendingRequests);
    }
  }
});
enifed('ember-testing/support', ['ember-debug', 'ember-views', 'ember-environment'], function (_emberDebug, _emberViews, _emberEnvironment) {
  'use strict';

  /**
    @module ember
  */

  var $ = _emberViews.jQuery;

  /**
    This method creates a checkbox and triggers the click event to fire the
    passed in handler. It is used to correct for a bug in older versions
    of jQuery (e.g 1.8.3).
  
    @private
    @method testCheckboxClick
  */
  function testCheckboxClick(handler) {
    var input = document.createElement('input');
    $(input).attr('type', 'checkbox').css({ position: 'absolute', left: '-1000px', top: '-1000px' }).appendTo('body').on('click', handler).trigger('click').remove();
  }

  if (_emberEnvironment.environment.hasDOM && typeof $ === 'function') {
    $(function () {
      /*
        Determine whether a checkbox checked using jQuery's "click" method will have
        the correct value for its checked property.
         If we determine that the current jQuery version exhibits this behavior,
        patch it to work correctly as in the commit for the actual fix:
        https://github.com/jquery/jquery/commit/1fb2f92.
      */
      testCheckboxClick(function () {
        if (!this.checked && !$.event.special.click) {
          $.event.special.click = {
            trigger: function () {
              if ($.nodeName(this, 'input') && this.type === 'checkbox' && this.click) {
                this.click();
                return false;
              }
            }
          };
        }
      });

      // Try again to verify that the patch took effect or blow up.
      testCheckboxClick(function () {
        (true && (0, _emberDebug.warn)('clicked checkboxes should be checked! the jQuery patch didn\'t work', this.checked, { id: 'ember-testing.test-checkbox-click' }));
      });
    });
  }
});
enifed('ember-testing/test', ['exports', 'ember-testing/test/helpers', 'ember-testing/test/on_inject_helpers', 'ember-testing/test/promise', 'ember-testing/test/waiters', 'ember-testing/test/adapter'], function (exports, _helpers, _on_inject_helpers, _promise, _waiters, _adapter) {
  'use strict';

  /**
    This is a container for an assortment of testing related functionality:
  
    * Choose your default test adapter (for your framework of choice).
    * Register/Unregister additional test helpers.
    * Setup callbacks to be fired when the test helpers are injected into
      your application.
  
    @class Test
    @namespace Ember
    @public
  */
  var Test = {
    /**
      Hash containing all known test helpers.
       @property _helpers
      @private
      @since 1.7.0
    */
    _helpers: _helpers.helpers,

    registerHelper: _helpers.registerHelper,
    registerAsyncHelper: _helpers.registerAsyncHelper,
    unregisterHelper: _helpers.unregisterHelper,
    onInjectHelpers: _on_inject_helpers.onInjectHelpers,
    Promise: _promise.default,
    promise: _promise.promise,
    resolve: _promise.resolve,
    registerWaiter: _waiters.registerWaiter,
    unregisterWaiter: _waiters.unregisterWaiter,
    checkWaiters: _waiters.checkWaiters
  };

  /**
   Used to allow ember-testing to communicate with a specific testing
   framework.
  
   You can manually set it before calling `App.setupForTesting()`.
  
   Example:
  
   ```javascript
   Ember.Test.adapter = MyCustomAdapter.create()
   ```
  
   If you do not set it, ember-testing will default to `Ember.Test.QUnitAdapter`.
  
   @public
   @for Ember.Test
   @property adapter
   @type {Class} The adapter to be used.
   @default Ember.Test.QUnitAdapter
  */
  /**
    @module ember
  */
  Object.defineProperty(Test, 'adapter', {
    get: _adapter.getAdapter,
    set: _adapter.setAdapter
  });

  exports.default = Test;
});
enifed('ember-testing/test/adapter', ['exports', 'ember-console', 'ember-metal'], function (exports, _emberConsole, _emberMetal) {
  'use strict';

  exports.getAdapter = getAdapter;
  exports.setAdapter = setAdapter;
  exports.asyncStart = asyncStart;
  exports.asyncEnd = asyncEnd;


  var adapter = void 0;
  function getAdapter() {
    return adapter;
  }

  function setAdapter(value) {
    adapter = value;
    if (value && typeof value.exception === 'function') {
      (0, _emberMetal.setDispatchOverride)(adapterDispatch);
    } else {
      (0, _emberMetal.setDispatchOverride)(null);
    }
  }

  function asyncStart() {
    if (adapter) {
      adapter.asyncStart();
    }
  }

  function asyncEnd() {
    if (adapter) {
      adapter.asyncEnd();
    }
  }

  function adapterDispatch(error) {
    adapter.exception(error);
    _emberConsole.default.error(error.stack);
  }
});
enifed('ember-testing/test/helpers', ['exports', 'ember-testing/test/promise'], function (exports, _promise) {
  'use strict';

  exports.helpers = undefined;
  exports.registerHelper = registerHelper;
  exports.registerAsyncHelper = registerAsyncHelper;
  exports.unregisterHelper = unregisterHelper;
  var helpers = exports.helpers = {};
  /**
   @module @ember/test
  */

  /**
    `registerHelper` is used to register a test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    import { registerHelper } from '@ember/test';
    import { run } from '@ember/runloop';
  
    registerHelper('boot', function(app) {
      run(app, app.advanceReadiness);
    });
    ```
  
    This helper can later be called without arguments because it will be
    called with `app` as the first parameter.
  
    ```javascript
    import Application from '@ember/application';
  
    App = Application.create();
    App.injectTestHelpers();
    boot();
    ```
  
    @public
    @for @ember/test
    @static
    @method registerHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @param options {Object}
  */
  function registerHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: { wait: false }
    };
  }

  /**
    `registerAsyncHelper` is used to register an async test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    import { registerAsyncHelper } from '@ember/test';
    import { run } from '@ember/runloop';
  
    registerAsyncHelper('boot', function(app) {
      run(app, app.advanceReadiness);
    });
    ```
  
    The advantage of an async helper is that it will not run
    until the last async helper has completed.  All async helpers
    after it will wait for it complete before running.
  
  
    For example:
  
    ```javascript
    import { registerAsyncHelper } from '@ember/test';
  
    registerAsyncHelper('deletePost', function(app, postId) {
      click('.delete-' + postId);
    });
  
    // ... in your test
    visit('/post/2');
    deletePost(2);
    visit('/post/3');
    deletePost(3);
    ```
  
    @public
    @for @ember/test
    @method registerAsyncHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @since 1.2.0
  */
  function registerAsyncHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: { wait: true }
    };
  }

  /**
    Remove a previously added helper method.
  
    Example:
  
    ```javascript
    import { unregisterHelper } from '@ember/test';
  
    unregisterHelper('wait');
    ```
  
    @public
    @method unregisterHelper
    @static
    @for @ember/test
    @param {String} name The helper to remove.
  */
  function unregisterHelper(name) {
    delete helpers[name];
    delete _promise.default.prototype[name];
  }
});
enifed("ember-testing/test/on_inject_helpers", ["exports"], function (exports) {
  "use strict";

  exports.onInjectHelpers = onInjectHelpers;
  exports.invokeInjectHelpersCallbacks = invokeInjectHelpersCallbacks;
  var callbacks = exports.callbacks = [];

  /**
    Used to register callbacks to be fired whenever `App.injectTestHelpers`
    is called.
  
    The callback will receive the current application as an argument.
  
    Example:
  
    ```javascript
    import $ from 'jquery';
  
    Ember.Test.onInjectHelpers(function() {
      $(document).ajaxSend(function() {
        Test.pendingRequests++;
      });
  
      $(document).ajaxComplete(function() {
        Test.pendingRequests--;
      });
    });
    ```
  
    @public
    @for Ember.Test
    @method onInjectHelpers
    @param {Function} callback The function to be called.
  */
  function onInjectHelpers(callback) {
    callbacks.push(callback);
  }

  function invokeInjectHelpersCallbacks(app) {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i](app);
    }
  }
});
enifed("ember-testing/test/pending_requests", ["exports"], function (exports) {
  "use strict";

  exports.pendingRequests = pendingRequests;
  exports.clearPendingRequests = clearPendingRequests;
  exports.incrementPendingRequests = incrementPendingRequests;
  exports.decrementPendingRequests = decrementPendingRequests;
  var requests = [];

  function pendingRequests() {
    return requests.length;
  }

  function clearPendingRequests() {
    requests.length = 0;
  }

  function incrementPendingRequests(_, xhr) {
    requests.push(xhr);
  }

  function decrementPendingRequests(_, xhr) {
    for (var i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
        break;
      }
    }
  }
});
enifed('ember-testing/test/promise', ['exports', 'ember-babel', 'ember-runtime', 'ember-testing/test/run'], function (exports, _emberBabel, _emberRuntime, _run) {
  'use strict';

  exports.promise = promise;
  exports.resolve = resolve;
  exports.getLastPromise = getLastPromise;


  var lastPromise = void 0;

  var TestPromise = function (_RSVP$Promise) {
    (0, _emberBabel.inherits)(TestPromise, _RSVP$Promise);

    function TestPromise() {
      (0, _emberBabel.classCallCheck)(this, TestPromise);

      var _this = (0, _emberBabel.possibleConstructorReturn)(this, _RSVP$Promise.apply(this, arguments));

      lastPromise = _this;
      return _this;
    }

    TestPromise.prototype.then = function then(_onFulfillment) {
      var _RSVP$Promise$prototy;

      var onFulfillment = typeof _onFulfillment === 'function' ? function (result) {
        return isolate(_onFulfillment, result);
      } : undefined;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return (_RSVP$Promise$prototy = _RSVP$Promise.prototype.then).call.apply(_RSVP$Promise$prototy, [this, onFulfillment].concat(args));
    };

    return TestPromise;
  }(_emberRuntime.RSVP.Promise);

  exports.default = TestPromise;


  /**
    This returns a thenable tailored for testing.  It catches failed
    `onSuccess` callbacks and invokes the `Ember.Test.adapter.exception`
    callback in the last chained then.
  
    This method should be returned by async helpers such as `wait`.
  
    @public
    @for Ember.Test
    @method promise
    @param {Function} resolver The function used to resolve the promise.
    @param {String} label An optional string for identifying the promise.
  */
  function promise(resolver, label) {
    var fullLabel = 'Ember.Test.promise: ' + (label || '<Unknown Promise>');
    return new TestPromise(resolver, fullLabel);
  }

  /**
    Replacement for `Ember.RSVP.resolve`
    The only difference is this uses
    an instance of `Ember.Test.Promise`
  
    @public
    @for Ember.Test
    @method resolve
    @param {Mixed} The value to resolve
    @since 1.2.0
  */
  function resolve(result, label) {
    return TestPromise.resolve(result, label);
  }

  function getLastPromise() {
    return lastPromise;
  }

  // This method isolates nested async methods
  // so that they don't conflict with other last promises.
  //
  // 1. Set `Ember.Test.lastPromise` to null
  // 2. Invoke method
  // 3. Return the last promise created during method
  function isolate(onFulfillment, result) {
    // Reset lastPromise for nested helpers
    lastPromise = null;

    var value = onFulfillment(result);

    var promise = lastPromise;
    lastPromise = null;

    // If the method returned a promise
    // return that promise. If not,
    // return the last async helper's promise
    if (value && value instanceof TestPromise || !promise) {
      return value;
    } else {
      return (0, _run.default)(function () {
        return resolve(promise).then(function () {
          return value;
        });
      });
    }
  }
});
enifed('ember-testing/test/run', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.default = run;
  function run(fn) {
    if (!_emberMetal.run.currentRunLoop) {
      return (0, _emberMetal.run)(fn);
    } else {
      return fn();
    }
  }
});
enifed("ember-testing/test/waiters", ["exports"], function (exports) {
  "use strict";

  exports.registerWaiter = registerWaiter;
  exports.unregisterWaiter = unregisterWaiter;
  exports.checkWaiters = checkWaiters;
  /**
   @module @ember/test
  */
  var contexts = [];
  var callbacks = [];

  /**
     This allows ember-testing to play nicely with other asynchronous
     events, such as an application that is waiting for a CSS3
     transition or an IndexDB transaction. The waiter runs periodically
     after each async helper (i.e. `click`, `andThen`, `visit`, etc) has executed,
     until the returning result is truthy. After the waiters finish, the next async helper
     is executed and the process repeats.
  
     For example:
  
     ```javascript
     import { registerWaiter } from '@ember/test';
  
     registerWaiter(function() {
       return myPendingTransactions() == 0;
     });
     ```
     The `context` argument allows you to optionally specify the `this`
     with which your callback will be invoked.
  
     For example:
  
     ```javascript
     import { registerWaiter } from '@ember/test';
  
     registerWaiter(MyDB, MyDB.hasPendingTransactions);
     ```
  
     @public
     @for @ember/test
     @static
     @method registerWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */
  function registerWaiter(context, callback) {
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    if (indexOf(context, callback) > -1) {
      return;
    }
    contexts.push(context);
    callbacks.push(callback);
  }

  /**
     `unregisterWaiter` is used to unregister a callback that was
     registered with `registerWaiter`.
  
     @public
     @for @ember/test
     @static
     @method unregisterWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */
  function unregisterWaiter(context, callback) {
    if (!callbacks.length) {
      return;
    }
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    var i = indexOf(context, callback);
    if (i === -1) {
      return;
    }
    contexts.splice(i, 1);
    callbacks.splice(i, 1);
  }

  /**
    Iterates through each registered test waiter, and invokes
    its callback. If any waiter returns false, this method will return
    true indicating that the waiters have not settled yet.
  
    This is generally used internally from the acceptance/integration test
    infrastructure.
  
    @public
    @for @ember/test
    @static
    @method checkWaiters
  */
  function checkWaiters() {
    if (!callbacks.length) {
      return false;
    }
    for (var i = 0; i < callbacks.length; i++) {
      var context = contexts[i];
      var callback = callbacks[i];
      if (!callback.call(context)) {
        return true;
      }
    }
    return false;
  }

  function indexOf(context, callback) {
    for (var i = 0; i < callbacks.length; i++) {
      if (callbacks[i] === callback && contexts[i] === context) {
        return i;
      }
    }
    return -1;
  }
});
/*global enifed */
enifed('node-module', ['exports'], function(_exports) {
  var IS_NODE = typeof module === 'object' && typeof module.require === 'function';
  if (IS_NODE) {
    _exports.require = module.require;
    _exports.module = module;
    _exports.IS_NODE = IS_NODE;
  } else {
    _exports.require = null;
    _exports.module = null;
    _exports.IS_NODE = IS_NODE;
  }
});
var testing = requireModule('ember-testing');
Ember.Test = testing.Test;
Ember.Test.Adapter = testing.Adapter;
Ember.Test.QUnitAdapter = testing.QUnitAdapter;
Ember.setupForTesting = testing.setupForTesting;
}());

/* globals require, Ember, jQuery */

(function () {
  if (typeof jQuery !== 'undefined') {
    var _Ember = void 0;
    if (typeof Ember !== 'undefined') {
      _Ember = Ember;
    } else {
      _Ember = require('ember').default;
    }

    var pendingRequests = void 0;
    if (Ember.__loader.registry['ember-testing/test/pending_requests']) {
      // Ember <= 3.1
      pendingRequests = Ember.__loader.require('ember-testing/test/pending_requests');
    } else if (Ember.__loader.registry['ember-testing/lib/test/pending_requests']) {
      // Ember >= 3.2
      pendingRequests = Ember.__loader.require('ember-testing/lib/test/pending_requests');
    }

    if (pendingRequests) {
      // This exists to ensure that the AJAX listeners setup by Ember itself
      // (which as of 2.17 are not properly torn down) get cleared and released
      // when the application is destroyed. Without this, any AJAX requests
      // that happen _between_ acceptance tests will always share
      // `pendingRequests`.
      _Ember.Application.reopen({
        willDestroy: function willDestroy() {
          jQuery(document).off('ajaxSend', pendingRequests.incrementPendingRequests);
          jQuery(document).off('ajaxComplete', pendingRequests.decrementPendingRequests);

          pendingRequests.clearPendingRequests();

          this._super.apply(this, arguments);
        }
      });
    }
  }
})();
/*!
 * QUnit 2.6.2
 * https://qunitjs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2018-08-19T19:37Z
 */
(function (global$1) {
  'use strict';

  global$1 = global$1 && global$1.hasOwnProperty('default') ? global$1['default'] : global$1;

  var window = global$1.window;
  var self$1 = global$1.self;
  var console = global$1.console;
  var setTimeout = global$1.setTimeout;
  var clearTimeout = global$1.clearTimeout;

  var document = window && window.document;
  var navigator = window && window.navigator;

  var localSessionStorage = function () {
  	var x = "qunit-test-string";
  	try {
  		global$1.sessionStorage.setItem(x, x);
  		global$1.sessionStorage.removeItem(x);
  		return global$1.sessionStorage;
  	} catch (e) {
  		return undefined;
  	}
  }();

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };











  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();









































  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  var toString = Object.prototype.toString;
  var hasOwn = Object.prototype.hasOwnProperty;
  var now = Date.now || function () {
  	return new Date().getTime();
  };

  var defined = {
  	document: window && window.document !== undefined,
  	setTimeout: setTimeout !== undefined
  };

  // Returns a new Array with the elements that are in a but not in b
  function diff(a, b) {
  	var i,
  	    j,
  	    result = a.slice();

  	for (i = 0; i < result.length; i++) {
  		for (j = 0; j < b.length; j++) {
  			if (result[i] === b[j]) {
  				result.splice(i, 1);
  				i--;
  				break;
  			}
  		}
  	}
  	return result;
  }

  /**
   * Determines whether an element exists in a given array or not.
   *
   * @method inArray
   * @param {Any} elem
   * @param {Array} array
   * @return {Boolean}
   */
  function inArray(elem, array) {
  	return array.indexOf(elem) !== -1;
  }

  /**
   * Makes a clone of an object using only Array or Object as base,
   * and copies over the own enumerable properties.
   *
   * @param {Object} obj
   * @return {Object} New object with only the own properties (recursively).
   */
  function objectValues(obj) {
  	var key,
  	    val,
  	    vals = is("array", obj) ? [] : {};
  	for (key in obj) {
  		if (hasOwn.call(obj, key)) {
  			val = obj[key];
  			vals[key] = val === Object(val) ? objectValues(val) : val;
  		}
  	}
  	return vals;
  }

  function extend(a, b, undefOnly) {
  	for (var prop in b) {
  		if (hasOwn.call(b, prop)) {
  			if (b[prop] === undefined) {
  				delete a[prop];
  			} else if (!(undefOnly && typeof a[prop] !== "undefined")) {
  				a[prop] = b[prop];
  			}
  		}
  	}

  	return a;
  }

  function objectType(obj) {
  	if (typeof obj === "undefined") {
  		return "undefined";
  	}

  	// Consider: typeof null === object
  	if (obj === null) {
  		return "null";
  	}

  	var match = toString.call(obj).match(/^\[object\s(.*)\]$/),
  	    type = match && match[1];

  	switch (type) {
  		case "Number":
  			if (isNaN(obj)) {
  				return "nan";
  			}
  			return "number";
  		case "String":
  		case "Boolean":
  		case "Array":
  		case "Set":
  		case "Map":
  		case "Date":
  		case "RegExp":
  		case "Function":
  		case "Symbol":
  			return type.toLowerCase();
  		default:
  			return typeof obj === "undefined" ? "undefined" : _typeof(obj);
  	}
  }

  // Safe object type checking
  function is(type, obj) {
  	return objectType(obj) === type;
  }

  // Based on Java's String.hashCode, a simple but not
  // rigorously collision resistant hashing function
  function generateHash(module, testName) {
  	var str = module + "\x1C" + testName;
  	var hash = 0;

  	for (var i = 0; i < str.length; i++) {
  		hash = (hash << 5) - hash + str.charCodeAt(i);
  		hash |= 0;
  	}

  	// Convert the possibly negative integer hash code into an 8 character hex string, which isn't
  	// strictly necessary but increases user understanding that the id is a SHA-like hash
  	var hex = (0x100000000 + hash).toString(16);
  	if (hex.length < 8) {
  		hex = "0000000" + hex;
  	}

  	return hex.slice(-8);
  }

  // Test for equality any JavaScript type.
  // Authors: Philippe Rathé <prathe@gmail.com>, David Chan <david@troi.org>
  var equiv = (function () {

  	// Value pairs queued for comparison. Used for breadth-first processing order, recursion
  	// detection and avoiding repeated comparison (see below for details).
  	// Elements are { a: val, b: val }.
  	var pairs = [];

  	var getProto = Object.getPrototypeOf || function (obj) {
  		return obj.__proto__;
  	};

  	function useStrictEquality(a, b) {

  		// This only gets called if a and b are not strict equal, and is used to compare on
  		// the primitive values inside object wrappers. For example:
  		// `var i = 1;`
  		// `var j = new Number(1);`
  		// Neither a nor b can be null, as a !== b and they have the same type.
  		if ((typeof a === "undefined" ? "undefined" : _typeof(a)) === "object") {
  			a = a.valueOf();
  		}
  		if ((typeof b === "undefined" ? "undefined" : _typeof(b)) === "object") {
  			b = b.valueOf();
  		}

  		return a === b;
  	}

  	function compareConstructors(a, b) {
  		var protoA = getProto(a);
  		var protoB = getProto(b);

  		// Comparing constructors is more strict than using `instanceof`
  		if (a.constructor === b.constructor) {
  			return true;
  		}

  		// Ref #851
  		// If the obj prototype descends from a null constructor, treat it
  		// as a null prototype.
  		if (protoA && protoA.constructor === null) {
  			protoA = null;
  		}
  		if (protoB && protoB.constructor === null) {
  			protoB = null;
  		}

  		// Allow objects with no prototype to be equivalent to
  		// objects with Object as their constructor.
  		if (protoA === null && protoB === Object.prototype || protoB === null && protoA === Object.prototype) {
  			return true;
  		}

  		return false;
  	}

  	function getRegExpFlags(regexp) {
  		return "flags" in regexp ? regexp.flags : regexp.toString().match(/[gimuy]*$/)[0];
  	}

  	function isContainer(val) {
  		return ["object", "array", "map", "set"].indexOf(objectType(val)) !== -1;
  	}

  	function breadthFirstCompareChild(a, b) {

  		// If a is a container not reference-equal to b, postpone the comparison to the
  		// end of the pairs queue -- unless (a, b) has been seen before, in which case skip
  		// over the pair.
  		if (a === b) {
  			return true;
  		}
  		if (!isContainer(a)) {
  			return typeEquiv(a, b);
  		}
  		if (pairs.every(function (pair) {
  			return pair.a !== a || pair.b !== b;
  		})) {

  			// Not yet started comparing this pair
  			pairs.push({ a: a, b: b });
  		}
  		return true;
  	}

  	var callbacks = {
  		"string": useStrictEquality,
  		"boolean": useStrictEquality,
  		"number": useStrictEquality,
  		"null": useStrictEquality,
  		"undefined": useStrictEquality,
  		"symbol": useStrictEquality,
  		"date": useStrictEquality,

  		"nan": function nan() {
  			return true;
  		},

  		"regexp": function regexp(a, b) {
  			return a.source === b.source &&

  			// Include flags in the comparison
  			getRegExpFlags(a) === getRegExpFlags(b);
  		},

  		// abort (identical references / instance methods were skipped earlier)
  		"function": function _function() {
  			return false;
  		},

  		"array": function array(a, b) {
  			var i, len;

  			len = a.length;
  			if (len !== b.length) {

  				// Safe and faster
  				return false;
  			}

  			for (i = 0; i < len; i++) {

  				// Compare non-containers; queue non-reference-equal containers
  				if (!breadthFirstCompareChild(a[i], b[i])) {
  					return false;
  				}
  			}
  			return true;
  		},

  		// Define sets a and b to be equivalent if for each element aVal in a, there
  		// is some element bVal in b such that aVal and bVal are equivalent. Element
  		// repetitions are not counted, so these are equivalent:
  		// a = new Set( [ {}, [], [] ] );
  		// b = new Set( [ {}, {}, [] ] );
  		"set": function set$$1(a, b) {
  			var innerEq,
  			    outerEq = true;

  			if (a.size !== b.size) {

  				// This optimization has certain quirks because of the lack of
  				// repetition counting. For instance, adding the same
  				// (reference-identical) element to two equivalent sets can
  				// make them non-equivalent.
  				return false;
  			}

  			a.forEach(function (aVal) {

  				// Short-circuit if the result is already known. (Using for...of
  				// with a break clause would be cleaner here, but it would cause
  				// a syntax error on older Javascript implementations even if
  				// Set is unused)
  				if (!outerEq) {
  					return;
  				}

  				innerEq = false;

  				b.forEach(function (bVal) {
  					var parentPairs;

  					// Likewise, short-circuit if the result is already known
  					if (innerEq) {
  						return;
  					}

  					// Swap out the global pairs list, as the nested call to
  					// innerEquiv will clobber its contents
  					parentPairs = pairs;
  					if (innerEquiv(bVal, aVal)) {
  						innerEq = true;
  					}

  					// Replace the global pairs list
  					pairs = parentPairs;
  				});

  				if (!innerEq) {
  					outerEq = false;
  				}
  			});

  			return outerEq;
  		},

  		// Define maps a and b to be equivalent if for each key-value pair (aKey, aVal)
  		// in a, there is some key-value pair (bKey, bVal) in b such that
  		// [ aKey, aVal ] and [ bKey, bVal ] are equivalent. Key repetitions are not
  		// counted, so these are equivalent:
  		// a = new Map( [ [ {}, 1 ], [ {}, 1 ], [ [], 1 ] ] );
  		// b = new Map( [ [ {}, 1 ], [ [], 1 ], [ [], 1 ] ] );
  		"map": function map(a, b) {
  			var innerEq,
  			    outerEq = true;

  			if (a.size !== b.size) {

  				// This optimization has certain quirks because of the lack of
  				// repetition counting. For instance, adding the same
  				// (reference-identical) key-value pair to two equivalent maps
  				// can make them non-equivalent.
  				return false;
  			}

  			a.forEach(function (aVal, aKey) {

  				// Short-circuit if the result is already known. (Using for...of
  				// with a break clause would be cleaner here, but it would cause
  				// a syntax error on older Javascript implementations even if
  				// Map is unused)
  				if (!outerEq) {
  					return;
  				}

  				innerEq = false;

  				b.forEach(function (bVal, bKey) {
  					var parentPairs;

  					// Likewise, short-circuit if the result is already known
  					if (innerEq) {
  						return;
  					}

  					// Swap out the global pairs list, as the nested call to
  					// innerEquiv will clobber its contents
  					parentPairs = pairs;
  					if (innerEquiv([bVal, bKey], [aVal, aKey])) {
  						innerEq = true;
  					}

  					// Replace the global pairs list
  					pairs = parentPairs;
  				});

  				if (!innerEq) {
  					outerEq = false;
  				}
  			});

  			return outerEq;
  		},

  		"object": function object(a, b) {
  			var i,
  			    aProperties = [],
  			    bProperties = [];

  			if (compareConstructors(a, b) === false) {
  				return false;
  			}

  			// Be strict: don't ensure hasOwnProperty and go deep
  			for (i in a) {

  				// Collect a's properties
  				aProperties.push(i);

  				// Skip OOP methods that look the same
  				if (a.constructor !== Object && typeof a.constructor !== "undefined" && typeof a[i] === "function" && typeof b[i] === "function" && a[i].toString() === b[i].toString()) {
  					continue;
  				}

  				// Compare non-containers; queue non-reference-equal containers
  				if (!breadthFirstCompareChild(a[i], b[i])) {
  					return false;
  				}
  			}

  			for (i in b) {

  				// Collect b's properties
  				bProperties.push(i);
  			}

  			// Ensures identical properties name
  			return typeEquiv(aProperties.sort(), bProperties.sort());
  		}
  	};

  	function typeEquiv(a, b) {
  		var type = objectType(a);

  		// Callbacks for containers will append to the pairs queue to achieve breadth-first
  		// search order. The pairs queue is also used to avoid reprocessing any pair of
  		// containers that are reference-equal to a previously visited pair (a special case
  		// this being recursion detection).
  		//
  		// Because of this approach, once typeEquiv returns a false value, it should not be
  		// called again without clearing the pair queue else it may wrongly report a visited
  		// pair as being equivalent.
  		return objectType(b) === type && callbacks[type](a, b);
  	}

  	function innerEquiv(a, b) {
  		var i, pair;

  		// We're done when there's nothing more to compare
  		if (arguments.length < 2) {
  			return true;
  		}

  		// Clear the global pair queue and add the top-level values being compared
  		pairs = [{ a: a, b: b }];

  		for (i = 0; i < pairs.length; i++) {
  			pair = pairs[i];

  			// Perform type-specific comparison on any pairs that are not strictly
  			// equal. For container types, that comparison will postpone comparison
  			// of any sub-container pair to the end of the pair queue. This gives
  			// breadth-first search order. It also avoids the reprocessing of
  			// reference-equal siblings, cousins etc, which can have a significant speed
  			// impact when comparing a container of small objects each of which has a
  			// reference to the same (singleton) large object.
  			if (pair.a !== pair.b && !typeEquiv(pair.a, pair.b)) {
  				return false;
  			}
  		}

  		// ...across all consecutive argument pairs
  		return arguments.length === 2 || innerEquiv.apply(this, [].slice.call(arguments, 1));
  	}

  	return function () {
  		var result = innerEquiv.apply(undefined, arguments);

  		// Release any retained objects
  		pairs.length = 0;
  		return result;
  	};
  })();

  /**
   * Config object: Maintain internal state
   * Later exposed as QUnit.config
   * `config` initialized at top of scope
   */
  var config = {

  	// The queue of tests to run
  	queue: [],

  	// Block until document ready
  	blocking: true,

  	// By default, run previously failed tests first
  	// very useful in combination with "Hide passed tests" checked
  	reorder: true,

  	// By default, modify document.title when suite is done
  	altertitle: true,

  	// HTML Reporter: collapse every test except the first failing test
  	// If false, all failing tests will be expanded
  	collapse: true,

  	// By default, scroll to top of the page when suite is done
  	scrolltop: true,

  	// Depth up-to which object will be dumped
  	maxDepth: 5,

  	// When enabled, all tests must call expect()
  	requireExpects: false,

  	// Placeholder for user-configurable form-exposed URL parameters
  	urlConfig: [],

  	// Set of all modules.
  	modules: [],

  	// The first unnamed module
  	currentModule: {
  		name: "",
  		tests: [],
  		childModules: [],
  		testsRun: 0,
  		unskippedTestsRun: 0,
  		hooks: {
  			before: [],
  			beforeEach: [],
  			afterEach: [],
  			after: []
  		}
  	},

  	callbacks: {},

  	// The storage module to use for reordering tests
  	storage: localSessionStorage
  };

  // take a predefined QUnit.config and extend the defaults
  var globalConfig = window && window.QUnit && window.QUnit.config;

  // only extend the global config if there is no QUnit overload
  if (window && window.QUnit && !window.QUnit.version) {
  	extend(config, globalConfig);
  }

  // Push a loose unnamed module to the modules collection
  config.modules.push(config.currentModule);

  // Based on jsDump by Ariel Flesler
  // http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html
  var dump = (function () {
  	function quote(str) {
  		return "\"" + str.toString().replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
  	}
  	function literal(o) {
  		return o + "";
  	}
  	function join(pre, arr, post) {
  		var s = dump.separator(),
  		    base = dump.indent(),
  		    inner = dump.indent(1);
  		if (arr.join) {
  			arr = arr.join("," + s + inner);
  		}
  		if (!arr) {
  			return pre + post;
  		}
  		return [pre, inner + arr, base + post].join(s);
  	}
  	function array(arr, stack) {
  		var i = arr.length,
  		    ret = new Array(i);

  		if (dump.maxDepth && dump.depth > dump.maxDepth) {
  			return "[object Array]";
  		}

  		this.up();
  		while (i--) {
  			ret[i] = this.parse(arr[i], undefined, stack);
  		}
  		this.down();
  		return join("[", ret, "]");
  	}

  	function isArray(obj) {
  		return (

  			//Native Arrays
  			toString.call(obj) === "[object Array]" ||

  			// NodeList objects
  			typeof obj.length === "number" && obj.item !== undefined && (obj.length ? obj.item(0) === obj[0] : obj.item(0) === null && obj[0] === undefined)
  		);
  	}

  	var reName = /^function (\w+)/,
  	    dump = {

  		// The objType is used mostly internally, you can fix a (custom) type in advance
  		parse: function parse(obj, objType, stack) {
  			stack = stack || [];
  			var res,
  			    parser,
  			    parserType,
  			    objIndex = stack.indexOf(obj);

  			if (objIndex !== -1) {
  				return "recursion(" + (objIndex - stack.length) + ")";
  			}

  			objType = objType || this.typeOf(obj);
  			parser = this.parsers[objType];
  			parserType = typeof parser === "undefined" ? "undefined" : _typeof(parser);

  			if (parserType === "function") {
  				stack.push(obj);
  				res = parser.call(this, obj, stack);
  				stack.pop();
  				return res;
  			}
  			return parserType === "string" ? parser : this.parsers.error;
  		},
  		typeOf: function typeOf(obj) {
  			var type;

  			if (obj === null) {
  				type = "null";
  			} else if (typeof obj === "undefined") {
  				type = "undefined";
  			} else if (is("regexp", obj)) {
  				type = "regexp";
  			} else if (is("date", obj)) {
  				type = "date";
  			} else if (is("function", obj)) {
  				type = "function";
  			} else if (obj.setInterval !== undefined && obj.document !== undefined && obj.nodeType === undefined) {
  				type = "window";
  			} else if (obj.nodeType === 9) {
  				type = "document";
  			} else if (obj.nodeType) {
  				type = "node";
  			} else if (isArray(obj)) {
  				type = "array";
  			} else if (obj.constructor === Error.prototype.constructor) {
  				type = "error";
  			} else {
  				type = typeof obj === "undefined" ? "undefined" : _typeof(obj);
  			}
  			return type;
  		},

  		separator: function separator() {
  			if (this.multiline) {
  				return this.HTML ? "<br />" : "\n";
  			} else {
  				return this.HTML ? "&#160;" : " ";
  			}
  		},

  		// Extra can be a number, shortcut for increasing-calling-decreasing
  		indent: function indent(extra) {
  			if (!this.multiline) {
  				return "";
  			}
  			var chr = this.indentChar;
  			if (this.HTML) {
  				chr = chr.replace(/\t/g, "   ").replace(/ /g, "&#160;");
  			}
  			return new Array(this.depth + (extra || 0)).join(chr);
  		},
  		up: function up(a) {
  			this.depth += a || 1;
  		},
  		down: function down(a) {
  			this.depth -= a || 1;
  		},
  		setParser: function setParser(name, parser) {
  			this.parsers[name] = parser;
  		},

  		// The next 3 are exposed so you can use them
  		quote: quote,
  		literal: literal,
  		join: join,
  		depth: 1,
  		maxDepth: config.maxDepth,

  		// This is the list of parsers, to modify them, use dump.setParser
  		parsers: {
  			window: "[Window]",
  			document: "[Document]",
  			error: function error(_error) {
  				return "Error(\"" + _error.message + "\")";
  			},
  			unknown: "[Unknown]",
  			"null": "null",
  			"undefined": "undefined",
  			"function": function _function(fn) {
  				var ret = "function",


  				// Functions never have name in IE
  				name = "name" in fn ? fn.name : (reName.exec(fn) || [])[1];

  				if (name) {
  					ret += " " + name;
  				}
  				ret += "(";

  				ret = [ret, dump.parse(fn, "functionArgs"), "){"].join("");
  				return join(ret, dump.parse(fn, "functionCode"), "}");
  			},
  			array: array,
  			nodelist: array,
  			"arguments": array,
  			object: function object(map, stack) {
  				var keys,
  				    key,
  				    val,
  				    i,
  				    nonEnumerableProperties,
  				    ret = [];

  				if (dump.maxDepth && dump.depth > dump.maxDepth) {
  					return "[object Object]";
  				}

  				dump.up();
  				keys = [];
  				for (key in map) {
  					keys.push(key);
  				}

  				// Some properties are not always enumerable on Error objects.
  				nonEnumerableProperties = ["message", "name"];
  				for (i in nonEnumerableProperties) {
  					key = nonEnumerableProperties[i];
  					if (key in map && !inArray(key, keys)) {
  						keys.push(key);
  					}
  				}
  				keys.sort();
  				for (i = 0; i < keys.length; i++) {
  					key = keys[i];
  					val = map[key];
  					ret.push(dump.parse(key, "key") + ": " + dump.parse(val, undefined, stack));
  				}
  				dump.down();
  				return join("{", ret, "}");
  			},
  			node: function node(_node) {
  				var len,
  				    i,
  				    val,
  				    open = dump.HTML ? "&lt;" : "<",
  				    close = dump.HTML ? "&gt;" : ">",
  				    tag = _node.nodeName.toLowerCase(),
  				    ret = open + tag,
  				    attrs = _node.attributes;

  				if (attrs) {
  					for (i = 0, len = attrs.length; i < len; i++) {
  						val = attrs[i].nodeValue;

  						// IE6 includes all attributes in .attributes, even ones not explicitly
  						// set. Those have values like undefined, null, 0, false, "" or
  						// "inherit".
  						if (val && val !== "inherit") {
  							ret += " " + attrs[i].nodeName + "=" + dump.parse(val, "attribute");
  						}
  					}
  				}
  				ret += close;

  				// Show content of TextNode or CDATASection
  				if (_node.nodeType === 3 || _node.nodeType === 4) {
  					ret += _node.nodeValue;
  				}

  				return ret + open + "/" + tag + close;
  			},

  			// Function calls it internally, it's the arguments part of the function
  			functionArgs: function functionArgs(fn) {
  				var args,
  				    l = fn.length;

  				if (!l) {
  					return "";
  				}

  				args = new Array(l);
  				while (l--) {

  					// 97 is 'a'
  					args[l] = String.fromCharCode(97 + l);
  				}
  				return " " + args.join(", ") + " ";
  			},

  			// Object calls it internally, the key part of an item in a map
  			key: quote,

  			// Function calls it internally, it's the content of the function
  			functionCode: "[code]",

  			// Node calls it internally, it's a html attribute value
  			attribute: quote,
  			string: quote,
  			date: quote,
  			regexp: literal,
  			number: literal,
  			"boolean": literal,
  			symbol: function symbol(sym) {
  				return sym.toString();
  			}
  		},

  		// If true, entities are escaped ( <, >, \t, space and \n )
  		HTML: false,

  		// Indentation unit
  		indentChar: "  ",

  		// If true, items in a collection, are separated by a \n, else just a space.
  		multiline: true
  	};

  	return dump;
  })();

  var SuiteReport = function () {
  	function SuiteReport(name, parentSuite) {
  		classCallCheck(this, SuiteReport);

  		this.name = name;
  		this.fullName = parentSuite ? parentSuite.fullName.concat(name) : [];

  		this.tests = [];
  		this.childSuites = [];

  		if (parentSuite) {
  			parentSuite.pushChildSuite(this);
  		}
  	}

  	createClass(SuiteReport, [{
  		key: "start",
  		value: function start(recordTime) {
  			if (recordTime) {
  				this._startTime = Date.now();
  			}

  			return {
  				name: this.name,
  				fullName: this.fullName.slice(),
  				tests: this.tests.map(function (test) {
  					return test.start();
  				}),
  				childSuites: this.childSuites.map(function (suite) {
  					return suite.start();
  				}),
  				testCounts: {
  					total: this.getTestCounts().total
  				}
  			};
  		}
  	}, {
  		key: "end",
  		value: function end(recordTime) {
  			if (recordTime) {
  				this._endTime = Date.now();
  			}

  			return {
  				name: this.name,
  				fullName: this.fullName.slice(),
  				tests: this.tests.map(function (test) {
  					return test.end();
  				}),
  				childSuites: this.childSuites.map(function (suite) {
  					return suite.end();
  				}),
  				testCounts: this.getTestCounts(),
  				runtime: this.getRuntime(),
  				status: this.getStatus()
  			};
  		}
  	}, {
  		key: "pushChildSuite",
  		value: function pushChildSuite(suite) {
  			this.childSuites.push(suite);
  		}
  	}, {
  		key: "pushTest",
  		value: function pushTest(test) {
  			this.tests.push(test);
  		}
  	}, {
  		key: "getRuntime",
  		value: function getRuntime() {
  			return this._endTime - this._startTime;
  		}
  	}, {
  		key: "getTestCounts",
  		value: function getTestCounts() {
  			var counts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { passed: 0, failed: 0, skipped: 0, todo: 0, total: 0 };

  			counts = this.tests.reduce(function (counts, test) {
  				if (test.valid) {
  					counts[test.getStatus()]++;
  					counts.total++;
  				}

  				return counts;
  			}, counts);

  			return this.childSuites.reduce(function (counts, suite) {
  				return suite.getTestCounts(counts);
  			}, counts);
  		}
  	}, {
  		key: "getStatus",
  		value: function getStatus() {
  			var _getTestCounts = this.getTestCounts(),
  			    total = _getTestCounts.total,
  			    failed = _getTestCounts.failed,
  			    skipped = _getTestCounts.skipped,
  			    todo = _getTestCounts.todo;

  			if (failed) {
  				return "failed";
  			} else {
  				if (skipped === total) {
  					return "skipped";
  				} else if (todo === total) {
  					return "todo";
  				} else {
  					return "passed";
  				}
  			}
  		}
  	}]);
  	return SuiteReport;
  }();

  var focused = false;

  var moduleStack = [];

  function createModule(name, testEnvironment, modifiers) {
  	var parentModule = moduleStack.length ? moduleStack.slice(-1)[0] : null;
  	var moduleName = parentModule !== null ? [parentModule.name, name].join(" > ") : name;
  	var parentSuite = parentModule ? parentModule.suiteReport : globalSuite;

  	var skip = parentModule !== null && parentModule.skip || modifiers.skip;
  	var todo = parentModule !== null && parentModule.todo || modifiers.todo;

  	var module = {
  		name: moduleName,
  		parentModule: parentModule,
  		tests: [],
  		moduleId: generateHash(moduleName),
  		testsRun: 0,
  		unskippedTestsRun: 0,
  		childModules: [],
  		suiteReport: new SuiteReport(name, parentSuite),

  		// Pass along `skip` and `todo` properties from parent module, in case
  		// there is one, to childs. And use own otherwise.
  		// This property will be used to mark own tests and tests of child suites
  		// as either `skipped` or `todo`.
  		skip: skip,
  		todo: skip ? false : todo
  	};

  	var env = {};
  	if (parentModule) {
  		parentModule.childModules.push(module);
  		extend(env, parentModule.testEnvironment);
  	}
  	extend(env, testEnvironment);
  	module.testEnvironment = env;

  	config.modules.push(module);
  	return module;
  }

  function processModule(name, options, executeNow) {
  	var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  	if (objectType(options) === "function") {
  		executeNow = options;
  		options = undefined;
  	}

  	var module = createModule(name, options, modifiers);

  	// Move any hooks to a 'hooks' object
  	var testEnvironment = module.testEnvironment;
  	var hooks = module.hooks = {};

  	setHookFromEnvironment(hooks, testEnvironment, "before");
  	setHookFromEnvironment(hooks, testEnvironment, "beforeEach");
  	setHookFromEnvironment(hooks, testEnvironment, "afterEach");
  	setHookFromEnvironment(hooks, testEnvironment, "after");

  	var moduleFns = {
  		before: setHookFunction(module, "before"),
  		beforeEach: setHookFunction(module, "beforeEach"),
  		afterEach: setHookFunction(module, "afterEach"),
  		after: setHookFunction(module, "after")
  	};

  	var currentModule = config.currentModule;
  	if (objectType(executeNow) === "function") {
  		moduleStack.push(module);
  		config.currentModule = module;
  		executeNow.call(module.testEnvironment, moduleFns);
  		moduleStack.pop();
  		module = module.parentModule || currentModule;
  	}

  	config.currentModule = module;

  	function setHookFromEnvironment(hooks, environment, name) {
  		var potentialHook = environment[name];
  		hooks[name] = typeof potentialHook === "function" ? [potentialHook] : [];
  		delete environment[name];
  	}

  	function setHookFunction(module, hookName) {
  		return function setHook(callback) {
  			module.hooks[hookName].push(callback);
  		};
  	}
  }

  function module$1(name, options, executeNow) {
  	if (focused) {
  		return;
  	}

  	processModule(name, options, executeNow);
  }

  module$1.only = function () {
  	if (focused) {
  		return;
  	}

  	config.modules.length = 0;
  	config.queue.length = 0;

  	module$1.apply(undefined, arguments);

  	focused = true;
  };

  module$1.skip = function (name, options, executeNow) {
  	if (focused) {
  		return;
  	}

  	processModule(name, options, executeNow, { skip: true });
  };

  module$1.todo = function (name, options, executeNow) {
  	if (focused) {
  		return;
  	}

  	processModule(name, options, executeNow, { todo: true });
  };

  var LISTENERS = Object.create(null);
  var SUPPORTED_EVENTS = ["runStart", "suiteStart", "testStart", "assertion", "testEnd", "suiteEnd", "runEnd"];

  /**
   * Emits an event with the specified data to all currently registered listeners.
   * Callbacks will fire in the order in which they are registered (FIFO). This
   * function is not exposed publicly; it is used by QUnit internals to emit
   * logging events.
   *
   * @private
   * @method emit
   * @param {String} eventName
   * @param {Object} data
   * @return {Void}
   */
  function emit(eventName, data) {
  	if (objectType(eventName) !== "string") {
  		throw new TypeError("eventName must be a string when emitting an event");
  	}

  	// Clone the callbacks in case one of them registers a new callback
  	var originalCallbacks = LISTENERS[eventName];
  	var callbacks = originalCallbacks ? [].concat(toConsumableArray(originalCallbacks)) : [];

  	for (var i = 0; i < callbacks.length; i++) {
  		callbacks[i](data);
  	}
  }

  /**
   * Registers a callback as a listener to the specified event.
   *
   * @public
   * @method on
   * @param {String} eventName
   * @param {Function} callback
   * @return {Void}
   */
  function on(eventName, callback) {
  	if (objectType(eventName) !== "string") {
  		throw new TypeError("eventName must be a string when registering a listener");
  	} else if (!inArray(eventName, SUPPORTED_EVENTS)) {
  		var events = SUPPORTED_EVENTS.join(", ");
  		throw new Error("\"" + eventName + "\" is not a valid event; must be one of: " + events + ".");
  	} else if (objectType(callback) !== "function") {
  		throw new TypeError("callback must be a function when registering a listener");
  	}

  	if (!LISTENERS[eventName]) {
  		LISTENERS[eventName] = [];
  	}

  	// Don't register the same callback more than once
  	if (!inArray(callback, LISTENERS[eventName])) {
  		LISTENERS[eventName].push(callback);
  	}
  }

  // Register logging callbacks
  function registerLoggingCallbacks(obj) {
  	var i,
  	    l,
  	    key,
  	    callbackNames = ["begin", "done", "log", "testStart", "testDone", "moduleStart", "moduleDone"];

  	function registerLoggingCallback(key) {
  		var loggingCallback = function loggingCallback(callback) {
  			if (objectType(callback) !== "function") {
  				throw new Error("QUnit logging methods require a callback function as their first parameters.");
  			}

  			config.callbacks[key].push(callback);
  		};

  		return loggingCallback;
  	}

  	for (i = 0, l = callbackNames.length; i < l; i++) {
  		key = callbackNames[i];

  		// Initialize key collection of logging callback
  		if (objectType(config.callbacks[key]) === "undefined") {
  			config.callbacks[key] = [];
  		}

  		obj[key] = registerLoggingCallback(key);
  	}
  }

  function runLoggingCallbacks(key, args) {
  	var i, l, callbacks;

  	callbacks = config.callbacks[key];
  	for (i = 0, l = callbacks.length; i < l; i++) {
  		callbacks[i](args);
  	}
  }

  // Doesn't support IE9, it will return undefined on these browsers
  // See also https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/Stack
  var fileName = (sourceFromStacktrace(0) || "").replace(/(:\d+)+\)?/, "").replace(/.+\//, "");

  function extractStacktrace(e, offset) {
  	offset = offset === undefined ? 4 : offset;

  	var stack, include, i;

  	if (e && e.stack) {
  		stack = e.stack.split("\n");
  		if (/^error$/i.test(stack[0])) {
  			stack.shift();
  		}
  		if (fileName) {
  			include = [];
  			for (i = offset; i < stack.length; i++) {
  				if (stack[i].indexOf(fileName) !== -1) {
  					break;
  				}
  				include.push(stack[i]);
  			}
  			if (include.length) {
  				return include.join("\n");
  			}
  		}
  		return stack[offset];
  	}
  }

  function sourceFromStacktrace(offset) {
  	var error = new Error();

  	// Support: Safari <=7 only, IE <=10 - 11 only
  	// Not all browsers generate the `stack` property for `new Error()`, see also #636
  	if (!error.stack) {
  		try {
  			throw error;
  		} catch (err) {
  			error = err;
  		}
  	}

  	return extractStacktrace(error, offset);
  }

  var priorityCount = 0;
  var unitSampler = void 0;

  // This is a queue of functions that are tasks within a single test.
  // After tests are dequeued from config.queue they are expanded into
  // a set of tasks in this queue.
  var taskQueue = [];

  /**
   * Advances the taskQueue to the next task. If the taskQueue is empty,
   * process the testQueue
   */
  function advance() {
  	advanceTaskQueue();

  	if (!taskQueue.length) {
  		advanceTestQueue();
  	}
  }

  /**
   * Advances the taskQueue to the next task if it is ready and not empty.
   */
  function advanceTaskQueue() {
  	var start = now();
  	config.depth = (config.depth || 0) + 1;

  	while (taskQueue.length && !config.blocking) {
  		var elapsedTime = now() - start;

  		if (!defined.setTimeout || config.updateRate <= 0 || elapsedTime < config.updateRate) {
  			var task = taskQueue.shift();
  			task();
  		} else {
  			setTimeout(advance);
  			break;
  		}
  	}

  	config.depth--;
  }

  /**
   * Advance the testQueue to the next test to process. Call done() if testQueue completes.
   */
  function advanceTestQueue() {
  	if (!config.blocking && !config.queue.length && config.depth === 0) {
  		done();
  		return;
  	}

  	var testTasks = config.queue.shift();
  	addToTaskQueue(testTasks());

  	if (priorityCount > 0) {
  		priorityCount--;
  	}

  	advance();
  }

  /**
   * Enqueue the tasks for a test into the task queue.
   * @param {Array} tasksArray
   */
  function addToTaskQueue(tasksArray) {
  	taskQueue.push.apply(taskQueue, toConsumableArray(tasksArray));
  }

  /**
   * Return the number of tasks remaining in the task queue to be processed.
   * @return {Number}
   */
  function taskQueueLength() {
  	return taskQueue.length;
  }

  /**
   * Adds a test to the TestQueue for execution.
   * @param {Function} testTasksFunc
   * @param {Boolean} prioritize
   * @param {String} seed
   */
  function addToTestQueue(testTasksFunc, prioritize, seed) {
  	if (prioritize) {
  		config.queue.splice(priorityCount++, 0, testTasksFunc);
  	} else if (seed) {
  		if (!unitSampler) {
  			unitSampler = unitSamplerGenerator(seed);
  		}

  		// Insert into a random position after all prioritized items
  		var index = Math.floor(unitSampler() * (config.queue.length - priorityCount + 1));
  		config.queue.splice(priorityCount + index, 0, testTasksFunc);
  	} else {
  		config.queue.push(testTasksFunc);
  	}
  }

  /**
   * Creates a seeded "sample" generator which is used for randomizing tests.
   */
  function unitSamplerGenerator(seed) {

  	// 32-bit xorshift, requires only a nonzero seed
  	// http://excamera.com/sphinx/article-xorshift.html
  	var sample = parseInt(generateHash(seed), 16) || -1;
  	return function () {
  		sample ^= sample << 13;
  		sample ^= sample >>> 17;
  		sample ^= sample << 5;

  		// ECMAScript has no unsigned number type
  		if (sample < 0) {
  			sample += 0x100000000;
  		}

  		return sample / 0x100000000;
  	};
  }

  /**
   * This function is called when the ProcessingQueue is done processing all
   * items. It handles emitting the final run events.
   */
  function done() {
  	var storage = config.storage;

  	ProcessingQueue.finished = true;

  	var runtime = now() - config.started;
  	var passed = config.stats.all - config.stats.bad;

  	if (config.stats.all === 0) {

  		if (config.filter && config.filter.length) {
  			throw new Error("No tests matched the filter \"" + config.filter + "\".");
  		}

  		if (config.module && config.module.length) {
  			throw new Error("No tests matched the module \"" + config.module + "\".");
  		}

  		if (config.moduleId && config.moduleId.length) {
  			throw new Error("No tests matched the moduleId \"" + config.moduleId + "\".");
  		}

  		if (config.testId && config.testId.length) {
  			throw new Error("No tests matched the testId \"" + config.testId + "\".");
  		}

  		throw new Error("No tests were run.");
  	}

  	emit("runEnd", globalSuite.end(true));
  	runLoggingCallbacks("done", {
  		passed: passed,
  		failed: config.stats.bad,
  		total: config.stats.all,
  		runtime: runtime
  	});

  	// Clear own storage items if all tests passed
  	if (storage && config.stats.bad === 0) {
  		for (var i = storage.length - 1; i >= 0; i--) {
  			var key = storage.key(i);

  			if (key.indexOf("qunit-test-") === 0) {
  				storage.removeItem(key);
  			}
  		}
  	}
  }

  var ProcessingQueue = {
  	finished: false,
  	add: addToTestQueue,
  	advance: advance,
  	taskCount: taskQueueLength
  };

  var TestReport = function () {
  	function TestReport(name, suite, options) {
  		classCallCheck(this, TestReport);

  		this.name = name;
  		this.suiteName = suite.name;
  		this.fullName = suite.fullName.concat(name);
  		this.runtime = 0;
  		this.assertions = [];

  		this.skipped = !!options.skip;
  		this.todo = !!options.todo;

  		this.valid = options.valid;

  		this._startTime = 0;
  		this._endTime = 0;

  		suite.pushTest(this);
  	}

  	createClass(TestReport, [{
  		key: "start",
  		value: function start(recordTime) {
  			if (recordTime) {
  				this._startTime = Date.now();
  			}

  			return {
  				name: this.name,
  				suiteName: this.suiteName,
  				fullName: this.fullName.slice()
  			};
  		}
  	}, {
  		key: "end",
  		value: function end(recordTime) {
  			if (recordTime) {
  				this._endTime = Date.now();
  			}

  			return extend(this.start(), {
  				runtime: this.getRuntime(),
  				status: this.getStatus(),
  				errors: this.getFailedAssertions(),
  				assertions: this.getAssertions()
  			});
  		}
  	}, {
  		key: "pushAssertion",
  		value: function pushAssertion(assertion) {
  			this.assertions.push(assertion);
  		}
  	}, {
  		key: "getRuntime",
  		value: function getRuntime() {
  			return this._endTime - this._startTime;
  		}
  	}, {
  		key: "getStatus",
  		value: function getStatus() {
  			if (this.skipped) {
  				return "skipped";
  			}

  			var testPassed = this.getFailedAssertions().length > 0 ? this.todo : !this.todo;

  			if (!testPassed) {
  				return "failed";
  			} else if (this.todo) {
  				return "todo";
  			} else {
  				return "passed";
  			}
  		}
  	}, {
  		key: "getFailedAssertions",
  		value: function getFailedAssertions() {
  			return this.assertions.filter(function (assertion) {
  				return !assertion.passed;
  			});
  		}
  	}, {
  		key: "getAssertions",
  		value: function getAssertions() {
  			return this.assertions.slice();
  		}

  		// Remove actual and expected values from assertions. This is to prevent
  		// leaking memory throughout a test suite.

  	}, {
  		key: "slimAssertions",
  		value: function slimAssertions() {
  			this.assertions = this.assertions.map(function (assertion) {
  				delete assertion.actual;
  				delete assertion.expected;
  				return assertion;
  			});
  		}
  	}]);
  	return TestReport;
  }();

  var focused$1 = false;

  function Test(settings) {
  	var i, l;

  	++Test.count;

  	this.expected = null;
  	this.assertions = [];
  	this.semaphore = 0;
  	this.module = config.currentModule;
  	this.stack = sourceFromStacktrace(3);
  	this.steps = [];
  	this.timeout = undefined;

  	// If a module is skipped, all its tests and the tests of the child suites
  	// should be treated as skipped even if they are defined as `only` or `todo`.
  	// As for `todo` module, all its tests will be treated as `todo` except for
  	// tests defined as `skip` which will be left intact.
  	//
  	// So, if a test is defined as `todo` and is inside a skipped module, we should
  	// then treat that test as if was defined as `skip`.
  	if (this.module.skip) {
  		settings.skip = true;
  		settings.todo = false;

  		// Skipped tests should be left intact
  	} else if (this.module.todo && !settings.skip) {
  		settings.todo = true;
  	}

  	extend(this, settings);

  	this.testReport = new TestReport(settings.testName, this.module.suiteReport, {
  		todo: settings.todo,
  		skip: settings.skip,
  		valid: this.valid()
  	});

  	// Register unique strings
  	for (i = 0, l = this.module.tests; i < l.length; i++) {
  		if (this.module.tests[i].name === this.testName) {
  			this.testName += " ";
  		}
  	}

  	this.testId = generateHash(this.module.name, this.testName);

  	this.module.tests.push({
  		name: this.testName,
  		testId: this.testId,
  		skip: !!settings.skip
  	});

  	if (settings.skip) {

  		// Skipped tests will fully ignore any sent callback
  		this.callback = function () {};
  		this.async = false;
  		this.expected = 0;
  	} else {
  		if (typeof this.callback !== "function") {
  			var method = this.todo ? "todo" : "test";

  			// eslint-disable-next-line max-len
  			throw new TypeError("You must provide a function as a test callback to QUnit." + method + "(\"" + settings.testName + "\")");
  		}

  		this.assert = new Assert(this);
  	}
  }

  Test.count = 0;

  function getNotStartedModules(startModule) {
  	var module = startModule,
  	    modules = [];

  	while (module && module.testsRun === 0) {
  		modules.push(module);
  		module = module.parentModule;
  	}

  	return modules;
  }

  Test.prototype = {
  	before: function before() {
  		var i,
  		    startModule,
  		    module = this.module,
  		    notStartedModules = getNotStartedModules(module);

  		for (i = notStartedModules.length - 1; i >= 0; i--) {
  			startModule = notStartedModules[i];
  			startModule.stats = { all: 0, bad: 0, started: now() };
  			emit("suiteStart", startModule.suiteReport.start(true));
  			runLoggingCallbacks("moduleStart", {
  				name: startModule.name,
  				tests: startModule.tests
  			});
  		}

  		config.current = this;

  		this.testEnvironment = extend({}, module.testEnvironment);

  		this.started = now();
  		emit("testStart", this.testReport.start(true));
  		runLoggingCallbacks("testStart", {
  			name: this.testName,
  			module: module.name,
  			testId: this.testId,
  			previousFailure: this.previousFailure
  		});

  		if (!config.pollution) {
  			saveGlobal();
  		}
  	},

  	run: function run() {
  		var promise;

  		config.current = this;

  		this.callbackStarted = now();

  		if (config.notrycatch) {
  			runTest(this);
  			return;
  		}

  		try {
  			runTest(this);
  		} catch (e) {
  			this.pushFailure("Died on test #" + (this.assertions.length + 1) + " " + this.stack + ": " + (e.message || e), extractStacktrace(e, 0));

  			// Else next test will carry the responsibility
  			saveGlobal();

  			// Restart the tests if they're blocking
  			if (config.blocking) {
  				internalRecover(this);
  			}
  		}

  		function runTest(test) {
  			promise = test.callback.call(test.testEnvironment, test.assert);
  			test.resolvePromise(promise);

  			// If the test has a "lock" on it, but the timeout is 0, then we push a
  			// failure as the test should be synchronous.
  			if (test.timeout === 0 && test.semaphore !== 0) {
  				pushFailure("Test did not finish synchronously even though assert.timeout( 0 ) was used.", sourceFromStacktrace(2));
  			}
  		}
  	},

  	after: function after() {
  		checkPollution();
  	},

  	queueHook: function queueHook(hook, hookName, hookOwner) {
  		var _this = this;

  		var callHook = function callHook() {
  			var promise = hook.call(_this.testEnvironment, _this.assert);
  			_this.resolvePromise(promise, hookName);
  		};

  		var runHook = function runHook() {
  			if (hookName === "before") {
  				if (hookOwner.unskippedTestsRun !== 0) {
  					return;
  				}

  				_this.preserveEnvironment = true;
  			}

  			// The 'after' hook should only execute when there are not tests left and
  			// when the 'after' and 'finish' tasks are the only tasks left to process
  			if (hookName === "after" && hookOwner.unskippedTestsRun !== numberOfUnskippedTests(hookOwner) - 1 && (config.queue.length > 0 || ProcessingQueue.taskCount() > 2)) {
  				return;
  			}

  			config.current = _this;
  			if (config.notrycatch) {
  				callHook();
  				return;
  			}
  			try {
  				callHook();
  			} catch (error) {
  				_this.pushFailure(hookName + " failed on " + _this.testName + ": " + (error.message || error), extractStacktrace(error, 0));
  			}
  		};

  		return runHook;
  	},


  	// Currently only used for module level hooks, can be used to add global level ones
  	hooks: function hooks(handler) {
  		var hooks = [];

  		function processHooks(test, module) {
  			if (module.parentModule) {
  				processHooks(test, module.parentModule);
  			}

  			if (module.hooks[handler].length) {
  				for (var i = 0; i < module.hooks[handler].length; i++) {
  					hooks.push(test.queueHook(module.hooks[handler][i], handler, module));
  				}
  			}
  		}

  		// Hooks are ignored on skipped tests
  		if (!this.skip) {
  			processHooks(this, this.module);
  		}

  		return hooks;
  	},


  	finish: function finish() {
  		config.current = this;

  		// Release the test callback to ensure that anything referenced has been
  		// released to be garbage collected.
  		this.callback = undefined;

  		if (this.steps.length) {
  			var stepsList = this.steps.join(", ");
  			this.pushFailure("Expected assert.verifySteps() to be called before end of test " + ("after using assert.step(). Unverified steps: " + stepsList), this.stack);
  		}

  		if (config.requireExpects && this.expected === null) {
  			this.pushFailure("Expected number of assertions to be defined, but expect() was " + "not called.", this.stack);
  		} else if (this.expected !== null && this.expected !== this.assertions.length) {
  			this.pushFailure("Expected " + this.expected + " assertions, but " + this.assertions.length + " were run", this.stack);
  		} else if (this.expected === null && !this.assertions.length) {
  			this.pushFailure("Expected at least one assertion, but none were run - call " + "expect(0) to accept zero assertions.", this.stack);
  		}

  		var i,
  		    module = this.module,
  		    moduleName = module.name,
  		    testName = this.testName,
  		    skipped = !!this.skip,
  		    todo = !!this.todo,
  		    bad = 0,
  		    storage = config.storage;

  		this.runtime = now() - this.started;

  		config.stats.all += this.assertions.length;
  		module.stats.all += this.assertions.length;

  		for (i = 0; i < this.assertions.length; i++) {
  			if (!this.assertions[i].result) {
  				bad++;
  				config.stats.bad++;
  				module.stats.bad++;
  			}
  		}

  		notifyTestsRan(module, skipped);

  		// Store result when possible
  		if (storage) {
  			if (bad) {
  				storage.setItem("qunit-test-" + moduleName + "-" + testName, bad);
  			} else {
  				storage.removeItem("qunit-test-" + moduleName + "-" + testName);
  			}
  		}

  		// After emitting the js-reporters event we cleanup the assertion data to
  		// avoid leaking it. It is not used by the legacy testDone callbacks.
  		emit("testEnd", this.testReport.end(true));
  		this.testReport.slimAssertions();

  		runLoggingCallbacks("testDone", {
  			name: testName,
  			module: moduleName,
  			skipped: skipped,
  			todo: todo,
  			failed: bad,
  			passed: this.assertions.length - bad,
  			total: this.assertions.length,
  			runtime: skipped ? 0 : this.runtime,

  			// HTML Reporter use
  			assertions: this.assertions,
  			testId: this.testId,

  			// Source of Test
  			source: this.stack
  		});

  		if (module.testsRun === numberOfTests(module)) {
  			logSuiteEnd(module);

  			// Check if the parent modules, iteratively, are done. If that the case,
  			// we emit the `suiteEnd` event and trigger `moduleDone` callback.
  			var parent = module.parentModule;
  			while (parent && parent.testsRun === numberOfTests(parent)) {
  				logSuiteEnd(parent);
  				parent = parent.parentModule;
  			}
  		}

  		config.current = undefined;

  		function logSuiteEnd(module) {

  			// Reset `module.hooks` to ensure that anything referenced in these hooks
  			// has been released to be garbage collected.
  			module.hooks = {};

  			emit("suiteEnd", module.suiteReport.end(true));
  			runLoggingCallbacks("moduleDone", {
  				name: module.name,
  				tests: module.tests,
  				failed: module.stats.bad,
  				passed: module.stats.all - module.stats.bad,
  				total: module.stats.all,
  				runtime: now() - module.stats.started
  			});
  		}
  	},

  	preserveTestEnvironment: function preserveTestEnvironment() {
  		if (this.preserveEnvironment) {
  			this.module.testEnvironment = this.testEnvironment;
  			this.testEnvironment = extend({}, this.module.testEnvironment);
  		}
  	},

  	queue: function queue() {
  		var test = this;

  		if (!this.valid()) {
  			return;
  		}

  		function runTest() {
  			return [function () {
  				test.before();
  			}].concat(toConsumableArray(test.hooks("before")), [function () {
  				test.preserveTestEnvironment();
  			}], toConsumableArray(test.hooks("beforeEach")), [function () {
  				test.run();
  			}], toConsumableArray(test.hooks("afterEach").reverse()), toConsumableArray(test.hooks("after").reverse()), [function () {
  				test.after();
  			}, function () {
  				test.finish();
  			}]);
  		}

  		var previousFailCount = config.storage && +config.storage.getItem("qunit-test-" + this.module.name + "-" + this.testName);

  		// Prioritize previously failed tests, detected from storage
  		var prioritize = config.reorder && !!previousFailCount;

  		this.previousFailure = !!previousFailCount;

  		ProcessingQueue.add(runTest, prioritize, config.seed);

  		// If the queue has already finished, we manually process the new test
  		if (ProcessingQueue.finished) {
  			ProcessingQueue.advance();
  		}
  	},


  	pushResult: function pushResult(resultInfo) {
  		if (this !== config.current) {
  			throw new Error("Assertion occurred after test had finished.");
  		}

  		// Destructure of resultInfo = { result, actual, expected, message, negative }
  		var source,
  		    details = {
  			module: this.module.name,
  			name: this.testName,
  			result: resultInfo.result,
  			message: resultInfo.message,
  			actual: resultInfo.actual,
  			testId: this.testId,
  			negative: resultInfo.negative || false,
  			runtime: now() - this.started,
  			todo: !!this.todo
  		};

  		if (hasOwn.call(resultInfo, "expected")) {
  			details.expected = resultInfo.expected;
  		}

  		if (!resultInfo.result) {
  			source = resultInfo.source || sourceFromStacktrace();

  			if (source) {
  				details.source = source;
  			}
  		}

  		this.logAssertion(details);

  		this.assertions.push({
  			result: !!resultInfo.result,
  			message: resultInfo.message
  		});
  	},

  	pushFailure: function pushFailure(message, source, actual) {
  		if (!(this instanceof Test)) {
  			throw new Error("pushFailure() assertion outside test context, was " + sourceFromStacktrace(2));
  		}

  		this.pushResult({
  			result: false,
  			message: message || "error",
  			actual: actual || null,
  			source: source
  		});
  	},

  	/**
    * Log assertion details using both the old QUnit.log interface and
    * QUnit.on( "assertion" ) interface.
    *
    * @private
    */
  	logAssertion: function logAssertion(details) {
  		runLoggingCallbacks("log", details);

  		var assertion = {
  			passed: details.result,
  			actual: details.actual,
  			expected: details.expected,
  			message: details.message,
  			stack: details.source,
  			todo: details.todo
  		};
  		this.testReport.pushAssertion(assertion);
  		emit("assertion", assertion);
  	},


  	resolvePromise: function resolvePromise(promise, phase) {
  		var then,
  		    resume,
  		    message,
  		    test = this;
  		if (promise != null) {
  			then = promise.then;
  			if (objectType(then) === "function") {
  				resume = internalStop(test);
  				if (config.notrycatch) {
  					then.call(promise, function () {
  						resume();
  					});
  				} else {
  					then.call(promise, function () {
  						resume();
  					}, function (error) {
  						message = "Promise rejected " + (!phase ? "during" : phase.replace(/Each$/, "")) + " \"" + test.testName + "\": " + (error && error.message || error);
  						test.pushFailure(message, extractStacktrace(error, 0));

  						// Else next test will carry the responsibility
  						saveGlobal();

  						// Unblock
  						internalRecover(test);
  					});
  				}
  			}
  		}
  	},

  	valid: function valid() {
  		var filter = config.filter,
  		    regexFilter = /^(!?)\/([\w\W]*)\/(i?$)/.exec(filter),
  		    module = config.module && config.module.toLowerCase(),
  		    fullName = this.module.name + ": " + this.testName;

  		function moduleChainNameMatch(testModule) {
  			var testModuleName = testModule.name ? testModule.name.toLowerCase() : null;
  			if (testModuleName === module) {
  				return true;
  			} else if (testModule.parentModule) {
  				return moduleChainNameMatch(testModule.parentModule);
  			} else {
  				return false;
  			}
  		}

  		function moduleChainIdMatch(testModule) {
  			return inArray(testModule.moduleId, config.moduleId) || testModule.parentModule && moduleChainIdMatch(testModule.parentModule);
  		}

  		// Internally-generated tests are always valid
  		if (this.callback && this.callback.validTest) {
  			return true;
  		}

  		if (config.moduleId && config.moduleId.length > 0 && !moduleChainIdMatch(this.module)) {

  			return false;
  		}

  		if (config.testId && config.testId.length > 0 && !inArray(this.testId, config.testId)) {

  			return false;
  		}

  		if (module && !moduleChainNameMatch(this.module)) {
  			return false;
  		}

  		if (!filter) {
  			return true;
  		}

  		return regexFilter ? this.regexFilter(!!regexFilter[1], regexFilter[2], regexFilter[3], fullName) : this.stringFilter(filter, fullName);
  	},

  	regexFilter: function regexFilter(exclude, pattern, flags, fullName) {
  		var regex = new RegExp(pattern, flags);
  		var match = regex.test(fullName);

  		return match !== exclude;
  	},

  	stringFilter: function stringFilter(filter, fullName) {
  		filter = filter.toLowerCase();
  		fullName = fullName.toLowerCase();

  		var include = filter.charAt(0) !== "!";
  		if (!include) {
  			filter = filter.slice(1);
  		}

  		// If the filter matches, we need to honour include
  		if (fullName.indexOf(filter) !== -1) {
  			return include;
  		}

  		// Otherwise, do the opposite
  		return !include;
  	}
  };

  function pushFailure() {
  	if (!config.current) {
  		throw new Error("pushFailure() assertion outside test context, in " + sourceFromStacktrace(2));
  	}

  	// Gets current test obj
  	var currentTest = config.current;

  	return currentTest.pushFailure.apply(currentTest, arguments);
  }

  function saveGlobal() {
  	config.pollution = [];

  	if (config.noglobals) {
  		for (var key in global$1) {
  			if (hasOwn.call(global$1, key)) {

  				// In Opera sometimes DOM element ids show up here, ignore them
  				if (/^qunit-test-output/.test(key)) {
  					continue;
  				}
  				config.pollution.push(key);
  			}
  		}
  	}
  }

  function checkPollution() {
  	var newGlobals,
  	    deletedGlobals,
  	    old = config.pollution;

  	saveGlobal();

  	newGlobals = diff(config.pollution, old);
  	if (newGlobals.length > 0) {
  		pushFailure("Introduced global variable(s): " + newGlobals.join(", "));
  	}

  	deletedGlobals = diff(old, config.pollution);
  	if (deletedGlobals.length > 0) {
  		pushFailure("Deleted global variable(s): " + deletedGlobals.join(", "));
  	}
  }

  // Will be exposed as QUnit.test
  function test(testName, callback) {
  	if (focused$1) {
  		return;
  	}

  	var newTest = new Test({
  		testName: testName,
  		callback: callback
  	});

  	newTest.queue();
  }

  function todo(testName, callback) {
  	if (focused$1) {
  		return;
  	}

  	var newTest = new Test({
  		testName: testName,
  		callback: callback,
  		todo: true
  	});

  	newTest.queue();
  }

  // Will be exposed as QUnit.skip
  function skip(testName) {
  	if (focused$1) {
  		return;
  	}

  	var test = new Test({
  		testName: testName,
  		skip: true
  	});

  	test.queue();
  }

  // Will be exposed as QUnit.only
  function only(testName, callback) {
  	if (focused$1) {
  		return;
  	}

  	config.queue.length = 0;
  	focused$1 = true;

  	var newTest = new Test({
  		testName: testName,
  		callback: callback
  	});

  	newTest.queue();
  }

  // Put a hold on processing and return a function that will release it.
  function internalStop(test) {
  	test.semaphore += 1;
  	config.blocking = true;

  	// Set a recovery timeout, if so configured.
  	if (defined.setTimeout) {
  		var timeoutDuration = void 0;

  		if (typeof test.timeout === "number") {
  			timeoutDuration = test.timeout;
  		} else if (typeof config.testTimeout === "number") {
  			timeoutDuration = config.testTimeout;
  		}

  		if (typeof timeoutDuration === "number" && timeoutDuration > 0) {
  			clearTimeout(config.timeout);
  			config.timeout = setTimeout(function () {
  				pushFailure("Test took longer than " + timeoutDuration + "ms; test timed out.", sourceFromStacktrace(2));
  				internalRecover(test);
  			}, timeoutDuration);
  		}
  	}

  	var released = false;
  	return function resume() {
  		if (released) {
  			return;
  		}

  		released = true;
  		test.semaphore -= 1;
  		internalStart(test);
  	};
  }

  // Forcefully release all processing holds.
  function internalRecover(test) {
  	test.semaphore = 0;
  	internalStart(test);
  }

  // Release a processing hold, scheduling a resumption attempt if no holds remain.
  function internalStart(test) {

  	// If semaphore is non-numeric, throw error
  	if (isNaN(test.semaphore)) {
  		test.semaphore = 0;

  		pushFailure("Invalid value on test.semaphore", sourceFromStacktrace(2));
  		return;
  	}

  	// Don't start until equal number of stop-calls
  	if (test.semaphore > 0) {
  		return;
  	}

  	// Throw an Error if start is called more often than stop
  	if (test.semaphore < 0) {
  		test.semaphore = 0;

  		pushFailure("Tried to restart test while already started (test's semaphore was 0 already)", sourceFromStacktrace(2));
  		return;
  	}

  	// Add a slight delay to allow more assertions etc.
  	if (defined.setTimeout) {
  		if (config.timeout) {
  			clearTimeout(config.timeout);
  		}
  		config.timeout = setTimeout(function () {
  			if (test.semaphore > 0) {
  				return;
  			}

  			if (config.timeout) {
  				clearTimeout(config.timeout);
  			}

  			begin();
  		});
  	} else {
  		begin();
  	}
  }

  function collectTests(module) {
  	var tests = [].concat(module.tests);
  	var modules = [].concat(toConsumableArray(module.childModules));

  	// Do a breadth-first traversal of the child modules
  	while (modules.length) {
  		var nextModule = modules.shift();
  		tests.push.apply(tests, nextModule.tests);
  		modules.push.apply(modules, toConsumableArray(nextModule.childModules));
  	}

  	return tests;
  }

  function numberOfTests(module) {
  	return collectTests(module).length;
  }

  function numberOfUnskippedTests(module) {
  	return collectTests(module).filter(function (test) {
  		return !test.skip;
  	}).length;
  }

  function notifyTestsRan(module, skipped) {
  	module.testsRun++;
  	if (!skipped) {
  		module.unskippedTestsRun++;
  	}
  	while (module = module.parentModule) {
  		module.testsRun++;
  		if (!skipped) {
  			module.unskippedTestsRun++;
  		}
  	}
  }

  /**
   * Returns a function that proxies to the given method name on the globals
   * console object. The proxy will also detect if the console doesn't exist and
   * will appropriately no-op. This allows support for IE9, which doesn't have a
   * console if the developer tools are not open.
   */
  function consoleProxy(method) {
  	return function () {
  		if (console) {
  			console[method].apply(console, arguments);
  		}
  	};
  }

  var Logger = {
  	warn: consoleProxy("warn")
  };

  var Assert = function () {
  	function Assert(testContext) {
  		classCallCheck(this, Assert);

  		this.test = testContext;
  	}

  	// Assert helpers

  	createClass(Assert, [{
  		key: "timeout",
  		value: function timeout(duration) {
  			if (typeof duration !== "number") {
  				throw new Error("You must pass a number as the duration to assert.timeout");
  			}

  			this.test.timeout = duration;
  		}

  		// Documents a "step", which is a string value, in a test as a passing assertion

  	}, {
  		key: "step",
  		value: function step(message) {
  			var assertionMessage = message;
  			var result = !!message;

  			this.test.steps.push(message);

  			if (objectType(message) === "undefined" || message === "") {
  				assertionMessage = "You must provide a message to assert.step";
  			} else if (objectType(message) !== "string") {
  				assertionMessage = "You must provide a string value to assert.step";
  				result = false;
  			}

  			this.pushResult({
  				result: result,
  				message: assertionMessage
  			});
  		}

  		// Verifies the steps in a test match a given array of string values

  	}, {
  		key: "verifySteps",
  		value: function verifySteps(steps, message) {

  			// Since the steps array is just string values, we can clone with slice
  			var actualStepsClone = this.test.steps.slice();
  			this.deepEqual(actualStepsClone, steps, message);
  			this.test.steps.length = 0;
  		}

  		// Specify the number of expected assertions to guarantee that failed test
  		// (no assertions are run at all) don't slip through.

  	}, {
  		key: "expect",
  		value: function expect(asserts) {
  			if (arguments.length === 1) {
  				this.test.expected = asserts;
  			} else {
  				return this.test.expected;
  			}
  		}

  		// Put a hold on processing and return a function that will release it a maximum of once.

  	}, {
  		key: "async",
  		value: function async(count) {
  			var test$$1 = this.test;

  			var popped = false,
  			    acceptCallCount = count;

  			if (typeof acceptCallCount === "undefined") {
  				acceptCallCount = 1;
  			}

  			var resume = internalStop(test$$1);

  			return function done() {
  				if (config.current !== test$$1) {
  					throw Error("assert.async callback called after test finished.");
  				}

  				if (popped) {
  					test$$1.pushFailure("Too many calls to the `assert.async` callback", sourceFromStacktrace(2));
  					return;
  				}

  				acceptCallCount -= 1;
  				if (acceptCallCount > 0) {
  					return;
  				}

  				popped = true;
  				resume();
  			};
  		}

  		// Exports test.push() to the user API
  		// Alias of pushResult.

  	}, {
  		key: "push",
  		value: function push(result, actual, expected, message, negative) {
  			Logger.warn("assert.push is deprecated and will be removed in QUnit 3.0." + " Please use assert.pushResult instead (https://api.qunitjs.com/assert/pushResult).");

  			var currentAssert = this instanceof Assert ? this : config.current.assert;
  			return currentAssert.pushResult({
  				result: result,
  				actual: actual,
  				expected: expected,
  				message: message,
  				negative: negative
  			});
  		}
  	}, {
  		key: "pushResult",
  		value: function pushResult(resultInfo) {

  			// Destructure of resultInfo = { result, actual, expected, message, negative }
  			var assert = this;
  			var currentTest = assert instanceof Assert && assert.test || config.current;

  			// Backwards compatibility fix.
  			// Allows the direct use of global exported assertions and QUnit.assert.*
  			// Although, it's use is not recommended as it can leak assertions
  			// to other tests from async tests, because we only get a reference to the current test,
  			// not exactly the test where assertion were intended to be called.
  			if (!currentTest) {
  				throw new Error("assertion outside test context, in " + sourceFromStacktrace(2));
  			}

  			if (!(assert instanceof Assert)) {
  				assert = currentTest.assert;
  			}

  			return assert.test.pushResult(resultInfo);
  		}
  	}, {
  		key: "ok",
  		value: function ok(result, message) {
  			if (!message) {
  				message = result ? "okay" : "failed, expected argument to be truthy, was: " + dump.parse(result);
  			}

  			this.pushResult({
  				result: !!result,
  				actual: result,
  				expected: true,
  				message: message
  			});
  		}
  	}, {
  		key: "notOk",
  		value: function notOk(result, message) {
  			if (!message) {
  				message = !result ? "okay" : "failed, expected argument to be falsy, was: " + dump.parse(result);
  			}

  			this.pushResult({
  				result: !result,
  				actual: result,
  				expected: false,
  				message: message
  			});
  		}
  	}, {
  		key: "equal",
  		value: function equal(actual, expected, message) {

  			// eslint-disable-next-line eqeqeq
  			var result = expected == actual;

  			this.pushResult({
  				result: result,
  				actual: actual,
  				expected: expected,
  				message: message
  			});
  		}
  	}, {
  		key: "notEqual",
  		value: function notEqual(actual, expected, message) {

  			// eslint-disable-next-line eqeqeq
  			var result = expected != actual;

  			this.pushResult({
  				result: result,
  				actual: actual,
  				expected: expected,
  				message: message,
  				negative: true
  			});
  		}
  	}, {
  		key: "propEqual",
  		value: function propEqual(actual, expected, message) {
  			actual = objectValues(actual);
  			expected = objectValues(expected);

  			this.pushResult({
  				result: equiv(actual, expected),
  				actual: actual,
  				expected: expected,
  				message: message
  			});
  		}
  	}, {
  		key: "notPropEqual",
  		value: function notPropEqual(actual, expected, message) {
  			actual = objectValues(actual);
  			expected = objectValues(expected);

  			this.pushResult({
  				result: !equiv(actual, expected),
  				actual: actual,
  				expected: expected,
  				message: message,
  				negative: true
  			});
  		}
  	}, {
  		key: "deepEqual",
  		value: function deepEqual(actual, expected, message) {
  			this.pushResult({
  				result: equiv(actual, expected),
  				actual: actual,
  				expected: expected,
  				message: message
  			});
  		}
  	}, {
  		key: "notDeepEqual",
  		value: function notDeepEqual(actual, expected, message) {
  			this.pushResult({
  				result: !equiv(actual, expected),
  				actual: actual,
  				expected: expected,
  				message: message,
  				negative: true
  			});
  		}
  	}, {
  		key: "strictEqual",
  		value: function strictEqual(actual, expected, message) {
  			this.pushResult({
  				result: expected === actual,
  				actual: actual,
  				expected: expected,
  				message: message
  			});
  		}
  	}, {
  		key: "notStrictEqual",
  		value: function notStrictEqual(actual, expected, message) {
  			this.pushResult({
  				result: expected !== actual,
  				actual: actual,
  				expected: expected,
  				message: message,
  				negative: true
  			});
  		}
  	}, {
  		key: "throws",
  		value: function throws(block, expected, message) {
  			var actual = void 0,
  			    result = false;

  			var currentTest = this instanceof Assert && this.test || config.current;

  			// 'expected' is optional unless doing string comparison
  			if (objectType(expected) === "string") {
  				if (message == null) {
  					message = expected;
  					expected = null;
  				} else {
  					throw new Error("throws/raises does not accept a string value for the expected argument.\n" + "Use a non-string object value (e.g. regExp) instead if it's necessary.");
  				}
  			}

  			currentTest.ignoreGlobalErrors = true;
  			try {
  				block.call(currentTest.testEnvironment);
  			} catch (e) {
  				actual = e;
  			}
  			currentTest.ignoreGlobalErrors = false;

  			if (actual) {
  				var expectedType = objectType(expected);

  				// We don't want to validate thrown error
  				if (!expected) {
  					result = true;
  					expected = null;

  					// Expected is a regexp
  				} else if (expectedType === "regexp") {
  					result = expected.test(errorString(actual));

  					// Expected is a constructor, maybe an Error constructor
  				} else if (expectedType === "function" && actual instanceof expected) {
  					result = true;

  					// Expected is an Error object
  				} else if (expectedType === "object") {
  					result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message;

  					// Expected is a validation function which returns true if validation passed
  				} else if (expectedType === "function" && expected.call({}, actual) === true) {
  					expected = null;
  					result = true;
  				}
  			}

  			currentTest.assert.pushResult({
  				result: result,
  				actual: actual,
  				expected: expected,
  				message: message
  			});
  		}
  	}, {
  		key: "rejects",
  		value: function rejects(promise, expected, message) {
  			var result = false;

  			var currentTest = this instanceof Assert && this.test || config.current;

  			// 'expected' is optional unless doing string comparison
  			if (objectType(expected) === "string") {
  				if (message === undefined) {
  					message = expected;
  					expected = undefined;
  				} else {
  					message = "assert.rejects does not accept a string value for the expected " + "argument.\nUse a non-string object value (e.g. validator function) instead " + "if necessary.";

  					currentTest.assert.pushResult({
  						result: false,
  						message: message
  					});

  					return;
  				}
  			}

  			var then = promise && promise.then;
  			if (objectType(then) !== "function") {
  				var _message = "The value provided to `assert.rejects` in " + "\"" + currentTest.testName + "\" was not a promise.";

  				currentTest.assert.pushResult({
  					result: false,
  					message: _message,
  					actual: promise
  				});

  				return;
  			}

  			var done = this.async();

  			return then.call(promise, function handleFulfillment() {
  				var message = "The promise returned by the `assert.rejects` callback in " + "\"" + currentTest.testName + "\" did not reject.";

  				currentTest.assert.pushResult({
  					result: false,
  					message: message,
  					actual: promise
  				});

  				done();
  			}, function handleRejection(actual) {
  				var expectedType = objectType(expected);

  				// We don't want to validate
  				if (expected === undefined) {
  					result = true;
  					expected = actual;

  					// Expected is a regexp
  				} else if (expectedType === "regexp") {
  					result = expected.test(errorString(actual));

  					// Expected is a constructor, maybe an Error constructor
  				} else if (expectedType === "function" && actual instanceof expected) {
  					result = true;

  					// Expected is an Error object
  				} else if (expectedType === "object") {
  					result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message;

  					// Expected is a validation function which returns true if validation passed
  				} else {
  					if (expectedType === "function") {
  						result = expected.call({}, actual) === true;
  						expected = null;

  						// Expected is some other invalid type
  					} else {
  						result = false;
  						message = "invalid expected value provided to `assert.rejects` " + "callback in \"" + currentTest.testName + "\": " + expectedType + ".";
  					}
  				}

  				currentTest.assert.pushResult({
  					result: result,
  					actual: actual,
  					expected: expected,
  					message: message
  				});

  				done();
  			});
  		}
  	}]);
  	return Assert;
  }();

  // Provide an alternative to assert.throws(), for environments that consider throws a reserved word
  // Known to us are: Closure Compiler, Narwhal
  // eslint-disable-next-line dot-notation


  Assert.prototype.raises = Assert.prototype["throws"];

  /**
   * Converts an error into a simple string for comparisons.
   *
   * @param {Error} error
   * @return {String}
   */
  function errorString(error) {
  	var resultErrorString = error.toString();

  	if (resultErrorString.substring(0, 7) === "[object") {
  		var name = error.name ? error.name.toString() : "Error";
  		var message = error.message ? error.message.toString() : "";

  		if (name && message) {
  			return name + ": " + message;
  		} else if (name) {
  			return name;
  		} else if (message) {
  			return message;
  		} else {
  			return "Error";
  		}
  	} else {
  		return resultErrorString;
  	}
  }

  /* global module, exports, define */
  function exportQUnit(QUnit) {

  	if (defined.document) {

  		// QUnit may be defined when it is preconfigured but then only QUnit and QUnit.config may be defined.
  		if (window.QUnit && window.QUnit.version) {
  			throw new Error("QUnit has already been defined.");
  		}

  		window.QUnit = QUnit;
  	}

  	// For nodejs
  	if (typeof module !== "undefined" && module && module.exports) {
  		module.exports = QUnit;

  		// For consistency with CommonJS environments' exports
  		module.exports.QUnit = QUnit;
  	}

  	// For CommonJS with exports, but without module.exports, like Rhino
  	if (typeof exports !== "undefined" && exports) {
  		exports.QUnit = QUnit;
  	}

  	if (typeof define === "function" && define.amd) {
  		define(function () {
  			return QUnit;
  		});
  		QUnit.config.autostart = false;
  	}

  	// For Web/Service Workers
  	if (self$1 && self$1.WorkerGlobalScope && self$1 instanceof self$1.WorkerGlobalScope) {
  		self$1.QUnit = QUnit;
  	}
  }

  // Handle an unhandled exception. By convention, returns true if further
  // error handling should be suppressed and false otherwise.
  // In this case, we will only suppress further error handling if the
  // "ignoreGlobalErrors" configuration option is enabled.
  function onError(error) {
  	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
  		args[_key - 1] = arguments[_key];
  	}

  	if (config.current) {
  		if (config.current.ignoreGlobalErrors) {
  			return true;
  		}
  		pushFailure.apply(undefined, [error.message, error.fileName + ":" + error.lineNumber].concat(args));
  	} else {
  		test("global failure", extend(function () {
  			pushFailure.apply(undefined, [error.message, error.fileName + ":" + error.lineNumber].concat(args));
  		}, { validTest: true }));
  	}

  	return false;
  }

  // Handle an unhandled rejection
  function onUnhandledRejection(reason) {
  	var resultInfo = {
  		result: false,
  		message: reason.message || "error",
  		actual: reason,
  		source: reason.stack || sourceFromStacktrace(3)
  	};

  	var currentTest = config.current;
  	if (currentTest) {
  		currentTest.assert.pushResult(resultInfo);
  	} else {
  		test("global failure", extend(function (assert) {
  			assert.pushResult(resultInfo);
  		}, { validTest: true }));
  	}
  }

  var QUnit = {};
  var globalSuite = new SuiteReport();

  // The initial "currentModule" represents the global (or top-level) module that
  // is not explicitly defined by the user, therefore we add the "globalSuite" to
  // it since each module has a suiteReport associated with it.
  config.currentModule.suiteReport = globalSuite;

  var globalStartCalled = false;
  var runStarted = false;

  // Figure out if we're running the tests from a server or not
  QUnit.isLocal = !(defined.document && window.location.protocol !== "file:");

  // Expose the current QUnit version
  QUnit.version = "2.6.2";

  extend(QUnit, {
  	on: on,

  	module: module$1,

  	test: test,

  	todo: todo,

  	skip: skip,

  	only: only,

  	start: function start(count) {
  		var globalStartAlreadyCalled = globalStartCalled;

  		if (!config.current) {
  			globalStartCalled = true;

  			if (runStarted) {
  				throw new Error("Called start() while test already started running");
  			} else if (globalStartAlreadyCalled || count > 1) {
  				throw new Error("Called start() outside of a test context too many times");
  			} else if (config.autostart) {
  				throw new Error("Called start() outside of a test context when " + "QUnit.config.autostart was true");
  			} else if (!config.pageLoaded) {

  				// The page isn't completely loaded yet, so we set autostart and then
  				// load if we're in Node or wait for the browser's load event.
  				config.autostart = true;

  				// Starts from Node even if .load was not previously called. We still return
  				// early otherwise we'll wind up "beginning" twice.
  				if (!defined.document) {
  					QUnit.load();
  				}

  				return;
  			}
  		} else {
  			throw new Error("QUnit.start cannot be called inside a test context.");
  		}

  		scheduleBegin();
  	},

  	config: config,

  	is: is,

  	objectType: objectType,

  	extend: extend,

  	load: function load() {
  		config.pageLoaded = true;

  		// Initialize the configuration options
  		extend(config, {
  			stats: { all: 0, bad: 0 },
  			started: 0,
  			updateRate: 1000,
  			autostart: true,
  			filter: ""
  		}, true);

  		if (!runStarted) {
  			config.blocking = false;

  			if (config.autostart) {
  				scheduleBegin();
  			}
  		}
  	},

  	stack: function stack(offset) {
  		offset = (offset || 0) + 2;
  		return sourceFromStacktrace(offset);
  	},

  	onError: onError,

  	onUnhandledRejection: onUnhandledRejection
  });

  QUnit.pushFailure = pushFailure;
  QUnit.assert = Assert.prototype;
  QUnit.equiv = equiv;
  QUnit.dump = dump;

  registerLoggingCallbacks(QUnit);

  function scheduleBegin() {

  	runStarted = true;

  	// Add a slight delay to allow definition of more modules and tests.
  	if (defined.setTimeout) {
  		setTimeout(function () {
  			begin();
  		});
  	} else {
  		begin();
  	}
  }

  function begin() {
  	var i,
  	    l,
  	    modulesLog = [];

  	// If the test run hasn't officially begun yet
  	if (!config.started) {

  		// Record the time of the test run's beginning
  		config.started = now();

  		// Delete the loose unnamed module if unused.
  		if (config.modules[0].name === "" && config.modules[0].tests.length === 0) {
  			config.modules.shift();
  		}

  		// Avoid unnecessary information by not logging modules' test environments
  		for (i = 0, l = config.modules.length; i < l; i++) {
  			modulesLog.push({
  				name: config.modules[i].name,
  				tests: config.modules[i].tests
  			});
  		}

  		// The test run is officially beginning now
  		emit("runStart", globalSuite.start(true));
  		runLoggingCallbacks("begin", {
  			totalTests: Test.count,
  			modules: modulesLog
  		});
  	}

  	config.blocking = false;
  	ProcessingQueue.advance();
  }

  exportQUnit(QUnit);

  (function () {

  	if (typeof window === "undefined" || typeof document === "undefined") {
  		return;
  	}

  	var config = QUnit.config,
  	    hasOwn = Object.prototype.hasOwnProperty;

  	// Stores fixture HTML for resetting later
  	function storeFixture() {

  		// Avoid overwriting user-defined values
  		if (hasOwn.call(config, "fixture")) {
  			return;
  		}

  		var fixture = document.getElementById("qunit-fixture");
  		if (fixture) {
  			config.fixture = fixture.cloneNode(true);
  		}
  	}

  	QUnit.begin(storeFixture);

  	// Resets the fixture DOM element if available.
  	function resetFixture() {
  		if (config.fixture == null) {
  			return;
  		}

  		var fixture = document.getElementById("qunit-fixture");
  		var resetFixtureType = _typeof(config.fixture);
  		if (resetFixtureType === "string") {

  			// support user defined values for `config.fixture`
  			var newFixture = document.createElement("div");
  			newFixture.setAttribute("id", "qunit-fixture");
  			newFixture.innerHTML = config.fixture;
  			fixture.parentNode.replaceChild(newFixture, fixture);
  		} else {
  			var clonedFixture = config.fixture.cloneNode(true);
  			fixture.parentNode.replaceChild(clonedFixture, fixture);
  		}
  	}

  	QUnit.testStart(resetFixture);
  })();

  (function () {

  	// Only interact with URLs via window.location
  	var location = typeof window !== "undefined" && window.location;
  	if (!location) {
  		return;
  	}

  	var urlParams = getUrlParams();

  	QUnit.urlParams = urlParams;

  	// Match module/test by inclusion in an array
  	QUnit.config.moduleId = [].concat(urlParams.moduleId || []);
  	QUnit.config.testId = [].concat(urlParams.testId || []);

  	// Exact case-insensitive match of the module name
  	QUnit.config.module = urlParams.module;

  	// Regular expression or case-insenstive substring match against "moduleName: testName"
  	QUnit.config.filter = urlParams.filter;

  	// Test order randomization
  	if (urlParams.seed === true) {

  		// Generate a random seed if the option is specified without a value
  		QUnit.config.seed = Math.random().toString(36).slice(2);
  	} else if (urlParams.seed) {
  		QUnit.config.seed = urlParams.seed;
  	}

  	// Add URL-parameter-mapped config values with UI form rendering data
  	QUnit.config.urlConfig.push({
  		id: "hidepassed",
  		label: "Hide passed tests",
  		tooltip: "Only show tests and assertions that fail. Stored as query-strings."
  	}, {
  		id: "noglobals",
  		label: "Check for Globals",
  		tooltip: "Enabling this will test if any test introduces new properties on the " + "global object (`window` in Browsers). Stored as query-strings."
  	}, {
  		id: "notrycatch",
  		label: "No try-catch",
  		tooltip: "Enabling this will run tests outside of a try-catch block. Makes debugging " + "exceptions in IE reasonable. Stored as query-strings."
  	});

  	QUnit.begin(function () {
  		var i,
  		    option,
  		    urlConfig = QUnit.config.urlConfig;

  		for (i = 0; i < urlConfig.length; i++) {

  			// Options can be either strings or objects with nonempty "id" properties
  			option = QUnit.config.urlConfig[i];
  			if (typeof option !== "string") {
  				option = option.id;
  			}

  			if (QUnit.config[option] === undefined) {
  				QUnit.config[option] = urlParams[option];
  			}
  		}
  	});

  	function getUrlParams() {
  		var i, param, name, value;
  		var urlParams = Object.create(null);
  		var params = location.search.slice(1).split("&");
  		var length = params.length;

  		for (i = 0; i < length; i++) {
  			if (params[i]) {
  				param = params[i].split("=");
  				name = decodeQueryParam(param[0]);

  				// Allow just a key to turn on a flag, e.g., test.html?noglobals
  				value = param.length === 1 || decodeQueryParam(param.slice(1).join("="));
  				if (name in urlParams) {
  					urlParams[name] = [].concat(urlParams[name], value);
  				} else {
  					urlParams[name] = value;
  				}
  			}
  		}

  		return urlParams;
  	}

  	function decodeQueryParam(param) {
  		return decodeURIComponent(param.replace(/\+/g, "%20"));
  	}
  })();

  var stats = {
  	passedTests: 0,
  	failedTests: 0,
  	skippedTests: 0,
  	todoTests: 0
  };

  // Escape text for attribute or text content.
  function escapeText(s) {
  	if (!s) {
  		return "";
  	}
  	s = s + "";

  	// Both single quotes and double quotes (for attributes)
  	return s.replace(/['"<>&]/g, function (s) {
  		switch (s) {
  			case "'":
  				return "&#039;";
  			case "\"":
  				return "&quot;";
  			case "<":
  				return "&lt;";
  			case ">":
  				return "&gt;";
  			case "&":
  				return "&amp;";
  		}
  	});
  }

  (function () {

  	// Don't load the HTML Reporter on non-browser environments
  	if (typeof window === "undefined" || !window.document) {
  		return;
  	}

  	var config = QUnit.config,
  	    document$$1 = window.document,
  	    collapseNext = false,
  	    hasOwn = Object.prototype.hasOwnProperty,
  	    unfilteredUrl = setUrl({ filter: undefined, module: undefined,
  		moduleId: undefined, testId: undefined }),
  	    modulesList = [];

  	function addEvent(elem, type, fn) {
  		elem.addEventListener(type, fn, false);
  	}

  	function removeEvent(elem, type, fn) {
  		elem.removeEventListener(type, fn, false);
  	}

  	function addEvents(elems, type, fn) {
  		var i = elems.length;
  		while (i--) {
  			addEvent(elems[i], type, fn);
  		}
  	}

  	function hasClass(elem, name) {
  		return (" " + elem.className + " ").indexOf(" " + name + " ") >= 0;
  	}

  	function addClass(elem, name) {
  		if (!hasClass(elem, name)) {
  			elem.className += (elem.className ? " " : "") + name;
  		}
  	}

  	function toggleClass(elem, name, force) {
  		if (force || typeof force === "undefined" && !hasClass(elem, name)) {
  			addClass(elem, name);
  		} else {
  			removeClass(elem, name);
  		}
  	}

  	function removeClass(elem, name) {
  		var set = " " + elem.className + " ";

  		// Class name may appear multiple times
  		while (set.indexOf(" " + name + " ") >= 0) {
  			set = set.replace(" " + name + " ", " ");
  		}

  		// Trim for prettiness
  		elem.className = typeof set.trim === "function" ? set.trim() : set.replace(/^\s+|\s+$/g, "");
  	}

  	function id(name) {
  		return document$$1.getElementById && document$$1.getElementById(name);
  	}

  	function abortTests() {
  		var abortButton = id("qunit-abort-tests-button");
  		if (abortButton) {
  			abortButton.disabled = true;
  			abortButton.innerHTML = "Aborting...";
  		}
  		QUnit.config.queue.length = 0;
  		return false;
  	}

  	function interceptNavigation(ev) {
  		applyUrlParams();

  		if (ev && ev.preventDefault) {
  			ev.preventDefault();
  		}

  		return false;
  	}

  	function getUrlConfigHtml() {
  		var i,
  		    j,
  		    val,
  		    escaped,
  		    escapedTooltip,
  		    selection = false,
  		    urlConfig = config.urlConfig,
  		    urlConfigHtml = "";

  		for (i = 0; i < urlConfig.length; i++) {

  			// Options can be either strings or objects with nonempty "id" properties
  			val = config.urlConfig[i];
  			if (typeof val === "string") {
  				val = {
  					id: val,
  					label: val
  				};
  			}

  			escaped = escapeText(val.id);
  			escapedTooltip = escapeText(val.tooltip);

  			if (!val.value || typeof val.value === "string") {
  				urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'><input id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' type='checkbox'" + (val.value ? " value='" + escapeText(val.value) + "'" : "") + (config[val.id] ? " checked='checked'" : "") + " title='" + escapedTooltip + "' />" + escapeText(val.label) + "</label>";
  			} else {
  				urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'>" + val.label + ": </label><select id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' title='" + escapedTooltip + "'><option></option>";

  				if (QUnit.is("array", val.value)) {
  					for (j = 0; j < val.value.length; j++) {
  						escaped = escapeText(val.value[j]);
  						urlConfigHtml += "<option value='" + escaped + "'" + (config[val.id] === val.value[j] ? (selection = true) && " selected='selected'" : "") + ">" + escaped + "</option>";
  					}
  				} else {
  					for (j in val.value) {
  						if (hasOwn.call(val.value, j)) {
  							urlConfigHtml += "<option value='" + escapeText(j) + "'" + (config[val.id] === j ? (selection = true) && " selected='selected'" : "") + ">" + escapeText(val.value[j]) + "</option>";
  						}
  					}
  				}
  				if (config[val.id] && !selection) {
  					escaped = escapeText(config[val.id]);
  					urlConfigHtml += "<option value='" + escaped + "' selected='selected' disabled='disabled'>" + escaped + "</option>";
  				}
  				urlConfigHtml += "</select>";
  			}
  		}

  		return urlConfigHtml;
  	}

  	// Handle "click" events on toolbar checkboxes and "change" for select menus.
  	// Updates the URL with the new state of `config.urlConfig` values.
  	function toolbarChanged() {
  		var updatedUrl,
  		    value,
  		    tests,
  		    field = this,
  		    params = {};

  		// Detect if field is a select menu or a checkbox
  		if ("selectedIndex" in field) {
  			value = field.options[field.selectedIndex].value || undefined;
  		} else {
  			value = field.checked ? field.defaultValue || true : undefined;
  		}

  		params[field.name] = value;
  		updatedUrl = setUrl(params);

  		// Check if we can apply the change without a page refresh
  		if ("hidepassed" === field.name && "replaceState" in window.history) {
  			QUnit.urlParams[field.name] = value;
  			config[field.name] = value || false;
  			tests = id("qunit-tests");
  			if (tests) {
  				toggleClass(tests, "hidepass", value || false);
  			}
  			window.history.replaceState(null, "", updatedUrl);
  		} else {
  			window.location = updatedUrl;
  		}
  	}

  	function setUrl(params) {
  		var key,
  		    arrValue,
  		    i,
  		    querystring = "?",
  		    location = window.location;

  		params = QUnit.extend(QUnit.extend({}, QUnit.urlParams), params);

  		for (key in params) {

  			// Skip inherited or undefined properties
  			if (hasOwn.call(params, key) && params[key] !== undefined) {

  				// Output a parameter for each value of this key
  				// (but usually just one)
  				arrValue = [].concat(params[key]);
  				for (i = 0; i < arrValue.length; i++) {
  					querystring += encodeURIComponent(key);
  					if (arrValue[i] !== true) {
  						querystring += "=" + encodeURIComponent(arrValue[i]);
  					}
  					querystring += "&";
  				}
  			}
  		}
  		return location.protocol + "//" + location.host + location.pathname + querystring.slice(0, -1);
  	}

  	function applyUrlParams() {
  		var i,
  		    selectedModules = [],
  		    modulesList = id("qunit-modulefilter-dropdown-list").getElementsByTagName("input"),
  		    filter = id("qunit-filter-input").value;

  		for (i = 0; i < modulesList.length; i++) {
  			if (modulesList[i].checked) {
  				selectedModules.push(modulesList[i].value);
  			}
  		}

  		window.location = setUrl({
  			filter: filter === "" ? undefined : filter,
  			moduleId: selectedModules.length === 0 ? undefined : selectedModules,

  			// Remove module and testId filter
  			module: undefined,
  			testId: undefined
  		});
  	}

  	function toolbarUrlConfigContainer() {
  		var urlConfigContainer = document$$1.createElement("span");

  		urlConfigContainer.innerHTML = getUrlConfigHtml();
  		addClass(urlConfigContainer, "qunit-url-config");

  		addEvents(urlConfigContainer.getElementsByTagName("input"), "change", toolbarChanged);
  		addEvents(urlConfigContainer.getElementsByTagName("select"), "change", toolbarChanged);

  		return urlConfigContainer;
  	}

  	function abortTestsButton() {
  		var button = document$$1.createElement("button");
  		button.id = "qunit-abort-tests-button";
  		button.innerHTML = "Abort";
  		addEvent(button, "click", abortTests);
  		return button;
  	}

  	function toolbarLooseFilter() {
  		var filter = document$$1.createElement("form"),
  		    label = document$$1.createElement("label"),
  		    input = document$$1.createElement("input"),
  		    button = document$$1.createElement("button");

  		addClass(filter, "qunit-filter");

  		label.innerHTML = "Filter: ";

  		input.type = "text";
  		input.value = config.filter || "";
  		input.name = "filter";
  		input.id = "qunit-filter-input";

  		button.innerHTML = "Go";

  		label.appendChild(input);

  		filter.appendChild(label);
  		filter.appendChild(document$$1.createTextNode(" "));
  		filter.appendChild(button);
  		addEvent(filter, "submit", interceptNavigation);

  		return filter;
  	}

  	function moduleListHtml() {
  		var i,
  		    checked,
  		    html = "";

  		for (i = 0; i < config.modules.length; i++) {
  			if (config.modules[i].name !== "") {
  				checked = config.moduleId.indexOf(config.modules[i].moduleId) > -1;
  				html += "<li><label class='clickable" + (checked ? " checked" : "") + "'><input type='checkbox' " + "value='" + config.modules[i].moduleId + "'" + (checked ? " checked='checked'" : "") + " />" + escapeText(config.modules[i].name) + "</label></li>";
  			}
  		}

  		return html;
  	}

  	function toolbarModuleFilter() {
  		var allCheckbox,
  		    commit,
  		    reset,
  		    moduleFilter = document$$1.createElement("form"),
  		    label = document$$1.createElement("label"),
  		    moduleSearch = document$$1.createElement("input"),
  		    dropDown = document$$1.createElement("div"),
  		    actions = document$$1.createElement("span"),
  		    dropDownList = document$$1.createElement("ul"),
  		    dirty = false;

  		moduleSearch.id = "qunit-modulefilter-search";
  		moduleSearch.autocomplete = "off";
  		addEvent(moduleSearch, "input", searchInput);
  		addEvent(moduleSearch, "input", searchFocus);
  		addEvent(moduleSearch, "focus", searchFocus);
  		addEvent(moduleSearch, "click", searchFocus);

  		label.id = "qunit-modulefilter-search-container";
  		label.innerHTML = "Module: ";
  		label.appendChild(moduleSearch);

  		actions.id = "qunit-modulefilter-actions";
  		actions.innerHTML = "<button style='display:none'>Apply</button>" + "<button type='reset' style='display:none'>Reset</button>" + "<label class='clickable" + (config.moduleId.length ? "" : " checked") + "'><input type='checkbox'" + (config.moduleId.length ? "" : " checked='checked'") + ">All modules</label>";
  		allCheckbox = actions.lastChild.firstChild;
  		commit = actions.firstChild;
  		reset = commit.nextSibling;
  		addEvent(commit, "click", applyUrlParams);

  		dropDownList.id = "qunit-modulefilter-dropdown-list";
  		dropDownList.innerHTML = moduleListHtml();

  		dropDown.id = "qunit-modulefilter-dropdown";
  		dropDown.style.display = "none";
  		dropDown.appendChild(actions);
  		dropDown.appendChild(dropDownList);
  		addEvent(dropDown, "change", selectionChange);
  		selectionChange();

  		moduleFilter.id = "qunit-modulefilter";
  		moduleFilter.appendChild(label);
  		moduleFilter.appendChild(dropDown);
  		addEvent(moduleFilter, "submit", interceptNavigation);
  		addEvent(moduleFilter, "reset", function () {

  			// Let the reset happen, then update styles
  			window.setTimeout(selectionChange);
  		});

  		// Enables show/hide for the dropdown
  		function searchFocus() {
  			if (dropDown.style.display !== "none") {
  				return;
  			}

  			dropDown.style.display = "block";
  			addEvent(document$$1, "click", hideHandler);
  			addEvent(document$$1, "keydown", hideHandler);

  			// Hide on Escape keydown or outside-container click
  			function hideHandler(e) {
  				var inContainer = moduleFilter.contains(e.target);

  				if (e.keyCode === 27 || !inContainer) {
  					if (e.keyCode === 27 && inContainer) {
  						moduleSearch.focus();
  					}
  					dropDown.style.display = "none";
  					removeEvent(document$$1, "click", hideHandler);
  					removeEvent(document$$1, "keydown", hideHandler);
  					moduleSearch.value = "";
  					searchInput();
  				}
  			}
  		}

  		// Processes module search box input
  		function searchInput() {
  			var i,
  			    item,
  			    searchText = moduleSearch.value.toLowerCase(),
  			    listItems = dropDownList.children;

  			for (i = 0; i < listItems.length; i++) {
  				item = listItems[i];
  				if (!searchText || item.textContent.toLowerCase().indexOf(searchText) > -1) {
  					item.style.display = "";
  				} else {
  					item.style.display = "none";
  				}
  			}
  		}

  		// Processes selection changes
  		function selectionChange(evt) {
  			var i,
  			    item,
  			    checkbox = evt && evt.target || allCheckbox,
  			    modulesList = dropDownList.getElementsByTagName("input"),
  			    selectedNames = [];

  			toggleClass(checkbox.parentNode, "checked", checkbox.checked);

  			dirty = false;
  			if (checkbox.checked && checkbox !== allCheckbox) {
  				allCheckbox.checked = false;
  				removeClass(allCheckbox.parentNode, "checked");
  			}
  			for (i = 0; i < modulesList.length; i++) {
  				item = modulesList[i];
  				if (!evt) {
  					toggleClass(item.parentNode, "checked", item.checked);
  				} else if (checkbox === allCheckbox && checkbox.checked) {
  					item.checked = false;
  					removeClass(item.parentNode, "checked");
  				}
  				dirty = dirty || item.checked !== item.defaultChecked;
  				if (item.checked) {
  					selectedNames.push(item.parentNode.textContent);
  				}
  			}

  			commit.style.display = reset.style.display = dirty ? "" : "none";
  			moduleSearch.placeholder = selectedNames.join(", ") || allCheckbox.parentNode.textContent;
  			moduleSearch.title = "Type to filter list. Current selection:\n" + (selectedNames.join("\n") || allCheckbox.parentNode.textContent);
  		}

  		return moduleFilter;
  	}

  	function appendToolbar() {
  		var toolbar = id("qunit-testrunner-toolbar");

  		if (toolbar) {
  			toolbar.appendChild(toolbarUrlConfigContainer());
  			toolbar.appendChild(toolbarModuleFilter());
  			toolbar.appendChild(toolbarLooseFilter());
  			toolbar.appendChild(document$$1.createElement("div")).className = "clearfix";
  		}
  	}

  	function appendHeader() {
  		var header = id("qunit-header");

  		if (header) {
  			header.innerHTML = "<a href='" + escapeText(unfilteredUrl) + "'>" + header.innerHTML + "</a> ";
  		}
  	}

  	function appendBanner() {
  		var banner = id("qunit-banner");

  		if (banner) {
  			banner.className = "";
  		}
  	}

  	function appendTestResults() {
  		var tests = id("qunit-tests"),
  		    result = id("qunit-testresult"),
  		    controls;

  		if (result) {
  			result.parentNode.removeChild(result);
  		}

  		if (tests) {
  			tests.innerHTML = "";
  			result = document$$1.createElement("p");
  			result.id = "qunit-testresult";
  			result.className = "result";
  			tests.parentNode.insertBefore(result, tests);
  			result.innerHTML = "<div id=\"qunit-testresult-display\">Running...<br />&#160;</div>" + "<div id=\"qunit-testresult-controls\"></div>" + "<div class=\"clearfix\"></div>";
  			controls = id("qunit-testresult-controls");
  		}

  		if (controls) {
  			controls.appendChild(abortTestsButton());
  		}
  	}

  	function appendFilteredTest() {
  		var testId = QUnit.config.testId;
  		if (!testId || testId.length <= 0) {
  			return "";
  		}
  		return "<div id='qunit-filteredTest'>Rerunning selected tests: " + escapeText(testId.join(", ")) + " <a id='qunit-clearFilter' href='" + escapeText(unfilteredUrl) + "'>Run all tests</a></div>";
  	}

  	function appendUserAgent() {
  		var userAgent = id("qunit-userAgent");

  		if (userAgent) {
  			userAgent.innerHTML = "";
  			userAgent.appendChild(document$$1.createTextNode("QUnit " + QUnit.version + "; " + navigator.userAgent));
  		}
  	}

  	function appendInterface() {
  		var qunit = id("qunit");

  		if (qunit) {
  			qunit.innerHTML = "<h1 id='qunit-header'>" + escapeText(document$$1.title) + "</h1>" + "<h2 id='qunit-banner'></h2>" + "<div id='qunit-testrunner-toolbar'></div>" + appendFilteredTest() + "<h2 id='qunit-userAgent'></h2>" + "<ol id='qunit-tests'></ol>";
  		}

  		appendHeader();
  		appendBanner();
  		appendTestResults();
  		appendUserAgent();
  		appendToolbar();
  	}

  	function appendTestsList(modules) {
  		var i, l, x, z, test, moduleObj;

  		for (i = 0, l = modules.length; i < l; i++) {
  			moduleObj = modules[i];

  			for (x = 0, z = moduleObj.tests.length; x < z; x++) {
  				test = moduleObj.tests[x];

  				appendTest(test.name, test.testId, moduleObj.name);
  			}
  		}
  	}

  	function appendTest(name, testId, moduleName) {
  		var title,
  		    rerunTrigger,
  		    testBlock,
  		    assertList,
  		    tests = id("qunit-tests");

  		if (!tests) {
  			return;
  		}

  		title = document$$1.createElement("strong");
  		title.innerHTML = getNameHtml(name, moduleName);

  		rerunTrigger = document$$1.createElement("a");
  		rerunTrigger.innerHTML = "Rerun";
  		rerunTrigger.href = setUrl({ testId: testId });

  		testBlock = document$$1.createElement("li");
  		testBlock.appendChild(title);
  		testBlock.appendChild(rerunTrigger);
  		testBlock.id = "qunit-test-output-" + testId;

  		assertList = document$$1.createElement("ol");
  		assertList.className = "qunit-assert-list";

  		testBlock.appendChild(assertList);

  		tests.appendChild(testBlock);
  	}

  	// HTML Reporter initialization and load
  	QUnit.begin(function (details) {
  		var i, moduleObj, tests;

  		// Sort modules by name for the picker
  		for (i = 0; i < details.modules.length; i++) {
  			moduleObj = details.modules[i];
  			if (moduleObj.name) {
  				modulesList.push(moduleObj.name);
  			}
  		}
  		modulesList.sort(function (a, b) {
  			return a.localeCompare(b);
  		});

  		// Initialize QUnit elements
  		appendInterface();
  		appendTestsList(details.modules);
  		tests = id("qunit-tests");
  		if (tests && config.hidepassed) {
  			addClass(tests, "hidepass");
  		}
  	});

  	QUnit.done(function (details) {
  		var banner = id("qunit-banner"),
  		    tests = id("qunit-tests"),
  		    abortButton = id("qunit-abort-tests-button"),
  		    totalTests = stats.passedTests + stats.skippedTests + stats.todoTests + stats.failedTests,
  		    html = [totalTests, " tests completed in ", details.runtime, " milliseconds, with ", stats.failedTests, " failed, ", stats.skippedTests, " skipped, and ", stats.todoTests, " todo.<br />", "<span class='passed'>", details.passed, "</span> assertions of <span class='total'>", details.total, "</span> passed, <span class='failed'>", details.failed, "</span> failed."].join(""),
  		    test,
  		    assertLi,
  		    assertList;

  		// Update remaing tests to aborted
  		if (abortButton && abortButton.disabled) {
  			html = "Tests aborted after " + details.runtime + " milliseconds.";

  			for (var i = 0; i < tests.children.length; i++) {
  				test = tests.children[i];
  				if (test.className === "" || test.className === "running") {
  					test.className = "aborted";
  					assertList = test.getElementsByTagName("ol")[0];
  					assertLi = document$$1.createElement("li");
  					assertLi.className = "fail";
  					assertLi.innerHTML = "Test aborted.";
  					assertList.appendChild(assertLi);
  				}
  			}
  		}

  		if (banner && (!abortButton || abortButton.disabled === false)) {
  			banner.className = stats.failedTests ? "qunit-fail" : "qunit-pass";
  		}

  		if (abortButton) {
  			abortButton.parentNode.removeChild(abortButton);
  		}

  		if (tests) {
  			id("qunit-testresult-display").innerHTML = html;
  		}

  		if (config.altertitle && document$$1.title) {

  			// Show ✖ for good, ✔ for bad suite result in title
  			// use escape sequences in case file gets loaded with non-utf-8
  			// charset
  			document$$1.title = [stats.failedTests ? "\u2716" : "\u2714", document$$1.title.replace(/^[\u2714\u2716] /i, "")].join(" ");
  		}

  		// Scroll back to top to show results
  		if (config.scrolltop && window.scrollTo) {
  			window.scrollTo(0, 0);
  		}
  	});

  	function getNameHtml(name, module) {
  		var nameHtml = "";

  		if (module) {
  			nameHtml = "<span class='module-name'>" + escapeText(module) + "</span>: ";
  		}

  		nameHtml += "<span class='test-name'>" + escapeText(name) + "</span>";

  		return nameHtml;
  	}

  	QUnit.testStart(function (details) {
  		var running, testBlock, bad;

  		testBlock = id("qunit-test-output-" + details.testId);
  		if (testBlock) {
  			testBlock.className = "running";
  		} else {

  			// Report later registered tests
  			appendTest(details.name, details.testId, details.module);
  		}

  		running = id("qunit-testresult-display");
  		if (running) {
  			bad = QUnit.config.reorder && details.previousFailure;

  			running.innerHTML = [bad ? "Rerunning previously failed test: <br />" : "Running: <br />", getNameHtml(details.name, details.module)].join("");
  		}
  	});

  	function stripHtml(string) {

  		// Strip tags, html entity and whitespaces
  		return string.replace(/<\/?[^>]+(>|$)/g, "").replace(/&quot;/g, "").replace(/\s+/g, "");
  	}

  	QUnit.log(function (details) {
  		var assertList,
  		    assertLi,
  		    message,
  		    expected,
  		    actual,
  		    diff,
  		    showDiff = false,
  		    testItem = id("qunit-test-output-" + details.testId);

  		if (!testItem) {
  			return;
  		}

  		message = escapeText(details.message) || (details.result ? "okay" : "failed");
  		message = "<span class='test-message'>" + message + "</span>";
  		message += "<span class='runtime'>@ " + details.runtime + " ms</span>";

  		// The pushFailure doesn't provide details.expected
  		// when it calls, it's implicit to also not show expected and diff stuff
  		// Also, we need to check details.expected existence, as it can exist and be undefined
  		if (!details.result && hasOwn.call(details, "expected")) {
  			if (details.negative) {
  				expected = "NOT " + QUnit.dump.parse(details.expected);
  			} else {
  				expected = QUnit.dump.parse(details.expected);
  			}

  			actual = QUnit.dump.parse(details.actual);
  			message += "<table><tr class='test-expected'><th>Expected: </th><td><pre>" + escapeText(expected) + "</pre></td></tr>";

  			if (actual !== expected) {

  				message += "<tr class='test-actual'><th>Result: </th><td><pre>" + escapeText(actual) + "</pre></td></tr>";

  				if (typeof details.actual === "number" && typeof details.expected === "number") {
  					if (!isNaN(details.actual) && !isNaN(details.expected)) {
  						showDiff = true;
  						diff = details.actual - details.expected;
  						diff = (diff > 0 ? "+" : "") + diff;
  					}
  				} else if (typeof details.actual !== "boolean" && typeof details.expected !== "boolean") {
  					diff = QUnit.diff(expected, actual);

  					// don't show diff if there is zero overlap
  					showDiff = stripHtml(diff).length !== stripHtml(expected).length + stripHtml(actual).length;
  				}

  				if (showDiff) {
  					message += "<tr class='test-diff'><th>Diff: </th><td><pre>" + diff + "</pre></td></tr>";
  				}
  			} else if (expected.indexOf("[object Array]") !== -1 || expected.indexOf("[object Object]") !== -1) {
  				message += "<tr class='test-message'><th>Message: </th><td>" + "Diff suppressed as the depth of object is more than current max depth (" + QUnit.config.maxDepth + ").<p>Hint: Use <code>QUnit.dump.maxDepth</code> to " + " run with a higher max depth or <a href='" + escapeText(setUrl({ maxDepth: -1 })) + "'>" + "Rerun</a> without max depth.</p></td></tr>";
  			} else {
  				message += "<tr class='test-message'><th>Message: </th><td>" + "Diff suppressed as the expected and actual results have an equivalent" + " serialization</td></tr>";
  			}

  			if (details.source) {
  				message += "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + "</pre></td></tr>";
  			}

  			message += "</table>";

  			// This occurs when pushFailure is set and we have an extracted stack trace
  		} else if (!details.result && details.source) {
  			message += "<table>" + "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + "</pre></td></tr>" + "</table>";
  		}

  		assertList = testItem.getElementsByTagName("ol")[0];

  		assertLi = document$$1.createElement("li");
  		assertLi.className = details.result ? "pass" : "fail";
  		assertLi.innerHTML = message;
  		assertList.appendChild(assertLi);
  	});

  	QUnit.testDone(function (details) {
  		var testTitle,
  		    time,
  		    testItem,
  		    assertList,
  		    good,
  		    bad,
  		    testCounts,
  		    skipped,
  		    sourceName,
  		    tests = id("qunit-tests");

  		if (!tests) {
  			return;
  		}

  		testItem = id("qunit-test-output-" + details.testId);

  		assertList = testItem.getElementsByTagName("ol")[0];

  		good = details.passed;
  		bad = details.failed;

  		// This test passed if it has no unexpected failed assertions
  		var testPassed = details.failed > 0 ? details.todo : !details.todo;

  		if (testPassed) {

  			// Collapse the passing tests
  			addClass(assertList, "qunit-collapsed");
  		} else if (config.collapse) {
  			if (!collapseNext) {

  				// Skip collapsing the first failing test
  				collapseNext = true;
  			} else {

  				// Collapse remaining tests
  				addClass(assertList, "qunit-collapsed");
  			}
  		}

  		// The testItem.firstChild is the test name
  		testTitle = testItem.firstChild;

  		testCounts = bad ? "<b class='failed'>" + bad + "</b>, " + "<b class='passed'>" + good + "</b>, " : "";

  		testTitle.innerHTML += " <b class='counts'>(" + testCounts + details.assertions.length + ")</b>";

  		if (details.skipped) {
  			stats.skippedTests++;

  			testItem.className = "skipped";
  			skipped = document$$1.createElement("em");
  			skipped.className = "qunit-skipped-label";
  			skipped.innerHTML = "skipped";
  			testItem.insertBefore(skipped, testTitle);
  		} else {
  			addEvent(testTitle, "click", function () {
  				toggleClass(assertList, "qunit-collapsed");
  			});

  			testItem.className = testPassed ? "pass" : "fail";

  			if (details.todo) {
  				var todoLabel = document$$1.createElement("em");
  				todoLabel.className = "qunit-todo-label";
  				todoLabel.innerHTML = "todo";
  				testItem.className += " todo";
  				testItem.insertBefore(todoLabel, testTitle);
  			}

  			time = document$$1.createElement("span");
  			time.className = "runtime";
  			time.innerHTML = details.runtime + " ms";
  			testItem.insertBefore(time, assertList);

  			if (!testPassed) {
  				stats.failedTests++;
  			} else if (details.todo) {
  				stats.todoTests++;
  			} else {
  				stats.passedTests++;
  			}
  		}

  		// Show the source of the test when showing assertions
  		if (details.source) {
  			sourceName = document$$1.createElement("p");
  			sourceName.innerHTML = "<strong>Source: </strong>" + details.source;
  			addClass(sourceName, "qunit-source");
  			if (testPassed) {
  				addClass(sourceName, "qunit-collapsed");
  			}
  			addEvent(testTitle, "click", function () {
  				toggleClass(sourceName, "qunit-collapsed");
  			});
  			testItem.appendChild(sourceName);
  		}
  	});

  	// Avoid readyState issue with phantomjs
  	// Ref: #818
  	var notPhantom = function (p) {
  		return !(p && p.version && p.version.major > 0);
  	}(window.phantom);

  	if (notPhantom && document$$1.readyState === "complete") {
  		QUnit.load();
  	} else {
  		addEvent(window, "load", QUnit.load);
  	}

  	// Wrap window.onerror. We will call the original window.onerror to see if
  	// the existing handler fully handles the error; if not, we will call the
  	// QUnit.onError function.
  	var originalWindowOnError = window.onerror;

  	// Cover uncaught exceptions
  	// Returning true will suppress the default browser handler,
  	// returning false will let it run.
  	window.onerror = function (message, fileName, lineNumber) {
  		var ret = false;
  		if (originalWindowOnError) {
  			for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
  				args[_key - 3] = arguments[_key];
  			}

  			ret = originalWindowOnError.call.apply(originalWindowOnError, [this, message, fileName, lineNumber].concat(args));
  		}

  		// Treat return value as window.onerror itself does,
  		// Only do our handling if not suppressed.
  		if (ret !== true) {
  			var error = {
  				message: message,
  				fileName: fileName,
  				lineNumber: lineNumber
  			};

  			ret = QUnit.onError(error);
  		}

  		return ret;
  	};

  	// Listen for unhandled rejections, and call QUnit.onUnhandledRejection
  	window.addEventListener("unhandledrejection", function (event) {
  		QUnit.onUnhandledRejection(event.reason);
  	});
  })();

  /*
   * This file is a modified version of google-diff-match-patch's JavaScript implementation
   * (https://code.google.com/p/google-diff-match-patch/source/browse/trunk/javascript/diff_match_patch_uncompressed.js),
   * modifications are licensed as more fully set forth in LICENSE.txt.
   *
   * The original source of google-diff-match-patch is attributable and licensed as follows:
   *
   * Copyright 2006 Google Inc.
   * https://code.google.com/p/google-diff-match-patch/
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * https://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * More Info:
   *  https://code.google.com/p/google-diff-match-patch/
   *
   * Usage: QUnit.diff(expected, actual)
   *
   */
  QUnit.diff = function () {
  	function DiffMatchPatch() {}

  	//  DIFF FUNCTIONS

  	/**
    * The data structure representing a diff is an array of tuples:
    * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
    * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
    */
  	var DIFF_DELETE = -1,
  	    DIFF_INSERT = 1,
  	    DIFF_EQUAL = 0;

  	/**
    * Find the differences between two texts.  Simplifies the problem by stripping
    * any common prefix or suffix off the texts before diffing.
    * @param {string} text1 Old string to be diffed.
    * @param {string} text2 New string to be diffed.
    * @param {boolean=} optChecklines Optional speedup flag. If present and false,
    *     then don't run a line-level diff first to identify the changed areas.
    *     Defaults to true, which does a faster, slightly less optimal diff.
    * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
    */
  	DiffMatchPatch.prototype.DiffMain = function (text1, text2, optChecklines) {
  		var deadline, checklines, commonlength, commonprefix, commonsuffix, diffs;

  		// The diff must be complete in up to 1 second.
  		deadline = new Date().getTime() + 1000;

  		// Check for null inputs.
  		if (text1 === null || text2 === null) {
  			throw new Error("Null input. (DiffMain)");
  		}

  		// Check for equality (speedup).
  		if (text1 === text2) {
  			if (text1) {
  				return [[DIFF_EQUAL, text1]];
  			}
  			return [];
  		}

  		if (typeof optChecklines === "undefined") {
  			optChecklines = true;
  		}

  		checklines = optChecklines;

  		// Trim off common prefix (speedup).
  		commonlength = this.diffCommonPrefix(text1, text2);
  		commonprefix = text1.substring(0, commonlength);
  		text1 = text1.substring(commonlength);
  		text2 = text2.substring(commonlength);

  		// Trim off common suffix (speedup).
  		commonlength = this.diffCommonSuffix(text1, text2);
  		commonsuffix = text1.substring(text1.length - commonlength);
  		text1 = text1.substring(0, text1.length - commonlength);
  		text2 = text2.substring(0, text2.length - commonlength);

  		// Compute the diff on the middle block.
  		diffs = this.diffCompute(text1, text2, checklines, deadline);

  		// Restore the prefix and suffix.
  		if (commonprefix) {
  			diffs.unshift([DIFF_EQUAL, commonprefix]);
  		}
  		if (commonsuffix) {
  			diffs.push([DIFF_EQUAL, commonsuffix]);
  		}
  		this.diffCleanupMerge(diffs);
  		return diffs;
  	};

  	/**
    * Reduce the number of edits by eliminating operationally trivial equalities.
    * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
    */
  	DiffMatchPatch.prototype.diffCleanupEfficiency = function (diffs) {
  		var changes, equalities, equalitiesLength, lastequality, pointer, preIns, preDel, postIns, postDel;
  		changes = false;
  		equalities = []; // Stack of indices where equalities are found.
  		equalitiesLength = 0; // Keeping our own length var is faster in JS.
  		/** @type {?string} */
  		lastequality = null;

  		// Always equal to diffs[equalities[equalitiesLength - 1]][1]
  		pointer = 0; // Index of current position.

  		// Is there an insertion operation before the last equality.
  		preIns = false;

  		// Is there a deletion operation before the last equality.
  		preDel = false;

  		// Is there an insertion operation after the last equality.
  		postIns = false;

  		// Is there a deletion operation after the last equality.
  		postDel = false;
  		while (pointer < diffs.length) {

  			// Equality found.
  			if (diffs[pointer][0] === DIFF_EQUAL) {
  				if (diffs[pointer][1].length < 4 && (postIns || postDel)) {

  					// Candidate found.
  					equalities[equalitiesLength++] = pointer;
  					preIns = postIns;
  					preDel = postDel;
  					lastequality = diffs[pointer][1];
  				} else {

  					// Not a candidate, and can never become one.
  					equalitiesLength = 0;
  					lastequality = null;
  				}
  				postIns = postDel = false;

  				// An insertion or deletion.
  			} else {

  				if (diffs[pointer][0] === DIFF_DELETE) {
  					postDel = true;
  				} else {
  					postIns = true;
  				}

  				/*
       * Five types to be split:
       * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
       * <ins>A</ins>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<ins>C</ins>
       * <ins>A</del>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<del>C</del>
       */
  				if (lastequality && (preIns && preDel && postIns && postDel || lastequality.length < 2 && preIns + preDel + postIns + postDel === 3)) {

  					// Duplicate record.
  					diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);

  					// Change second copy to insert.
  					diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
  					equalitiesLength--; // Throw away the equality we just deleted;
  					lastequality = null;
  					if (preIns && preDel) {

  						// No changes made which could affect previous entry, keep going.
  						postIns = postDel = true;
  						equalitiesLength = 0;
  					} else {
  						equalitiesLength--; // Throw away the previous equality.
  						pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
  						postIns = postDel = false;
  					}
  					changes = true;
  				}
  			}
  			pointer++;
  		}

  		if (changes) {
  			this.diffCleanupMerge(diffs);
  		}
  	};

  	/**
    * Convert a diff array into a pretty HTML report.
    * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
    * @param {integer} string to be beautified.
    * @return {string} HTML representation.
    */
  	DiffMatchPatch.prototype.diffPrettyHtml = function (diffs) {
  		var op,
  		    data,
  		    x,
  		    html = [];
  		for (x = 0; x < diffs.length; x++) {
  			op = diffs[x][0]; // Operation (insert, delete, equal)
  			data = diffs[x][1]; // Text of change.
  			switch (op) {
  				case DIFF_INSERT:
  					html[x] = "<ins>" + escapeText(data) + "</ins>";
  					break;
  				case DIFF_DELETE:
  					html[x] = "<del>" + escapeText(data) + "</del>";
  					break;
  				case DIFF_EQUAL:
  					html[x] = "<span>" + escapeText(data) + "</span>";
  					break;
  			}
  		}
  		return html.join("");
  	};

  	/**
    * Determine the common prefix of two strings.
    * @param {string} text1 First string.
    * @param {string} text2 Second string.
    * @return {number} The number of characters common to the start of each
    *     string.
    */
  	DiffMatchPatch.prototype.diffCommonPrefix = function (text1, text2) {
  		var pointermid, pointermax, pointermin, pointerstart;

  		// Quick check for common null cases.
  		if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
  			return 0;
  		}

  		// Binary search.
  		// Performance analysis: https://neil.fraser.name/news/2007/10/09/
  		pointermin = 0;
  		pointermax = Math.min(text1.length, text2.length);
  		pointermid = pointermax;
  		pointerstart = 0;
  		while (pointermin < pointermid) {
  			if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
  				pointermin = pointermid;
  				pointerstart = pointermin;
  			} else {
  				pointermax = pointermid;
  			}
  			pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  		}
  		return pointermid;
  	};

  	/**
    * Determine the common suffix of two strings.
    * @param {string} text1 First string.
    * @param {string} text2 Second string.
    * @return {number} The number of characters common to the end of each string.
    */
  	DiffMatchPatch.prototype.diffCommonSuffix = function (text1, text2) {
  		var pointermid, pointermax, pointermin, pointerend;

  		// Quick check for common null cases.
  		if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {
  			return 0;
  		}

  		// Binary search.
  		// Performance analysis: https://neil.fraser.name/news/2007/10/09/
  		pointermin = 0;
  		pointermax = Math.min(text1.length, text2.length);
  		pointermid = pointermax;
  		pointerend = 0;
  		while (pointermin < pointermid) {
  			if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
  				pointermin = pointermid;
  				pointerend = pointermin;
  			} else {
  				pointermax = pointermid;
  			}
  			pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  		}
  		return pointermid;
  	};

  	/**
    * Find the differences between two texts.  Assumes that the texts do not
    * have any common prefix or suffix.
    * @param {string} text1 Old string to be diffed.
    * @param {string} text2 New string to be diffed.
    * @param {boolean} checklines Speedup flag.  If false, then don't run a
    *     line-level diff first to identify the changed areas.
    *     If true, then run a faster, slightly less optimal diff.
    * @param {number} deadline Time when the diff should be complete by.
    * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
    * @private
    */
  	DiffMatchPatch.prototype.diffCompute = function (text1, text2, checklines, deadline) {
  		var diffs, longtext, shorttext, i, hm, text1A, text2A, text1B, text2B, midCommon, diffsA, diffsB;

  		if (!text1) {

  			// Just add some text (speedup).
  			return [[DIFF_INSERT, text2]];
  		}

  		if (!text2) {

  			// Just delete some text (speedup).
  			return [[DIFF_DELETE, text1]];
  		}

  		longtext = text1.length > text2.length ? text1 : text2;
  		shorttext = text1.length > text2.length ? text2 : text1;
  		i = longtext.indexOf(shorttext);
  		if (i !== -1) {

  			// Shorter text is inside the longer text (speedup).
  			diffs = [[DIFF_INSERT, longtext.substring(0, i)], [DIFF_EQUAL, shorttext], [DIFF_INSERT, longtext.substring(i + shorttext.length)]];

  			// Swap insertions for deletions if diff is reversed.
  			if (text1.length > text2.length) {
  				diffs[0][0] = diffs[2][0] = DIFF_DELETE;
  			}
  			return diffs;
  		}

  		if (shorttext.length === 1) {

  			// Single character string.
  			// After the previous speedup, the character can't be an equality.
  			return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  		}

  		// Check to see if the problem can be split in two.
  		hm = this.diffHalfMatch(text1, text2);
  		if (hm) {

  			// A half-match was found, sort out the return data.
  			text1A = hm[0];
  			text1B = hm[1];
  			text2A = hm[2];
  			text2B = hm[3];
  			midCommon = hm[4];

  			// Send both pairs off for separate processing.
  			diffsA = this.DiffMain(text1A, text2A, checklines, deadline);
  			diffsB = this.DiffMain(text1B, text2B, checklines, deadline);

  			// Merge the results.
  			return diffsA.concat([[DIFF_EQUAL, midCommon]], diffsB);
  		}

  		if (checklines && text1.length > 100 && text2.length > 100) {
  			return this.diffLineMode(text1, text2, deadline);
  		}

  		return this.diffBisect(text1, text2, deadline);
  	};

  	/**
    * Do the two texts share a substring which is at least half the length of the
    * longer text?
    * This speedup can produce non-minimal diffs.
    * @param {string} text1 First string.
    * @param {string} text2 Second string.
    * @return {Array.<string>} Five element Array, containing the prefix of
    *     text1, the suffix of text1, the prefix of text2, the suffix of
    *     text2 and the common middle.  Or null if there was no match.
    * @private
    */
  	DiffMatchPatch.prototype.diffHalfMatch = function (text1, text2) {
  		var longtext, shorttext, dmp, text1A, text2B, text2A, text1B, midCommon, hm1, hm2, hm;

  		longtext = text1.length > text2.length ? text1 : text2;
  		shorttext = text1.length > text2.length ? text2 : text1;
  		if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
  			return null; // Pointless.
  		}
  		dmp = this; // 'this' becomes 'window' in a closure.

  		/**
     * Does a substring of shorttext exist within longtext such that the substring
     * is at least half the length of longtext?
     * Closure, but does not reference any external variables.
     * @param {string} longtext Longer string.
     * @param {string} shorttext Shorter string.
     * @param {number} i Start index of quarter length substring within longtext.
     * @return {Array.<string>} Five element Array, containing the prefix of
     *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
     *     of shorttext and the common middle.  Or null if there was no match.
     * @private
     */
  		function diffHalfMatchI(longtext, shorttext, i) {
  			var seed, j, bestCommon, prefixLength, suffixLength, bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB;

  			// Start with a 1/4 length substring at position i as a seed.
  			seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
  			j = -1;
  			bestCommon = "";
  			while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
  				prefixLength = dmp.diffCommonPrefix(longtext.substring(i), shorttext.substring(j));
  				suffixLength = dmp.diffCommonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
  				if (bestCommon.length < suffixLength + prefixLength) {
  					bestCommon = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
  					bestLongtextA = longtext.substring(0, i - suffixLength);
  					bestLongtextB = longtext.substring(i + prefixLength);
  					bestShorttextA = shorttext.substring(0, j - suffixLength);
  					bestShorttextB = shorttext.substring(j + prefixLength);
  				}
  			}
  			if (bestCommon.length * 2 >= longtext.length) {
  				return [bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB, bestCommon];
  			} else {
  				return null;
  			}
  		}

  		// First check if the second quarter is the seed for a half-match.
  		hm1 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 4));

  		// Check again based on the third quarter.
  		hm2 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 2));
  		if (!hm1 && !hm2) {
  			return null;
  		} else if (!hm2) {
  			hm = hm1;
  		} else if (!hm1) {
  			hm = hm2;
  		} else {

  			// Both matched.  Select the longest.
  			hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  		}

  		// A half-match was found, sort out the return data.
  		if (text1.length > text2.length) {
  			text1A = hm[0];
  			text1B = hm[1];
  			text2A = hm[2];
  			text2B = hm[3];
  		} else {
  			text2A = hm[0];
  			text2B = hm[1];
  			text1A = hm[2];
  			text1B = hm[3];
  		}
  		midCommon = hm[4];
  		return [text1A, text1B, text2A, text2B, midCommon];
  	};

  	/**
    * Do a quick line-level diff on both strings, then rediff the parts for
    * greater accuracy.
    * This speedup can produce non-minimal diffs.
    * @param {string} text1 Old string to be diffed.
    * @param {string} text2 New string to be diffed.
    * @param {number} deadline Time when the diff should be complete by.
    * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
    * @private
    */
  	DiffMatchPatch.prototype.diffLineMode = function (text1, text2, deadline) {
  		var a, diffs, linearray, pointer, countInsert, countDelete, textInsert, textDelete, j;

  		// Scan the text on a line-by-line basis first.
  		a = this.diffLinesToChars(text1, text2);
  		text1 = a.chars1;
  		text2 = a.chars2;
  		linearray = a.lineArray;

  		diffs = this.DiffMain(text1, text2, false, deadline);

  		// Convert the diff back to original text.
  		this.diffCharsToLines(diffs, linearray);

  		// Eliminate freak matches (e.g. blank lines)
  		this.diffCleanupSemantic(diffs);

  		// Rediff any replacement blocks, this time character-by-character.
  		// Add a dummy entry at the end.
  		diffs.push([DIFF_EQUAL, ""]);
  		pointer = 0;
  		countDelete = 0;
  		countInsert = 0;
  		textDelete = "";
  		textInsert = "";
  		while (pointer < diffs.length) {
  			switch (diffs[pointer][0]) {
  				case DIFF_INSERT:
  					countInsert++;
  					textInsert += diffs[pointer][1];
  					break;
  				case DIFF_DELETE:
  					countDelete++;
  					textDelete += diffs[pointer][1];
  					break;
  				case DIFF_EQUAL:

  					// Upon reaching an equality, check for prior redundancies.
  					if (countDelete >= 1 && countInsert >= 1) {

  						// Delete the offending records and add the merged ones.
  						diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert);
  						pointer = pointer - countDelete - countInsert;
  						a = this.DiffMain(textDelete, textInsert, false, deadline);
  						for (j = a.length - 1; j >= 0; j--) {
  							diffs.splice(pointer, 0, a[j]);
  						}
  						pointer = pointer + a.length;
  					}
  					countInsert = 0;
  					countDelete = 0;
  					textDelete = "";
  					textInsert = "";
  					break;
  			}
  			pointer++;
  		}
  		diffs.pop(); // Remove the dummy entry at the end.

  		return diffs;
  	};

  	/**
    * Find the 'middle snake' of a diff, split the problem in two
    * and return the recursively constructed diff.
    * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
    * @param {string} text1 Old string to be diffed.
    * @param {string} text2 New string to be diffed.
    * @param {number} deadline Time at which to bail if not yet complete.
    * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
    * @private
    */
  	DiffMatchPatch.prototype.diffBisect = function (text1, text2, deadline) {
  		var text1Length, text2Length, maxD, vOffset, vLength, v1, v2, x, delta, front, k1start, k1end, k2start, k2end, k2Offset, k1Offset, x1, x2, y1, y2, d, k1, k2;

  		// Cache the text lengths to prevent multiple calls.
  		text1Length = text1.length;
  		text2Length = text2.length;
  		maxD = Math.ceil((text1Length + text2Length) / 2);
  		vOffset = maxD;
  		vLength = 2 * maxD;
  		v1 = new Array(vLength);
  		v2 = new Array(vLength);

  		// Setting all elements to -1 is faster in Chrome & Firefox than mixing
  		// integers and undefined.
  		for (x = 0; x < vLength; x++) {
  			v1[x] = -1;
  			v2[x] = -1;
  		}
  		v1[vOffset + 1] = 0;
  		v2[vOffset + 1] = 0;
  		delta = text1Length - text2Length;

  		// If the total number of characters is odd, then the front path will collide
  		// with the reverse path.
  		front = delta % 2 !== 0;

  		// Offsets for start and end of k loop.
  		// Prevents mapping of space beyond the grid.
  		k1start = 0;
  		k1end = 0;
  		k2start = 0;
  		k2end = 0;
  		for (d = 0; d < maxD; d++) {

  			// Bail out if deadline is reached.
  			if (new Date().getTime() > deadline) {
  				break;
  			}

  			// Walk the front path one step.
  			for (k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
  				k1Offset = vOffset + k1;
  				if (k1 === -d || k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1]) {
  					x1 = v1[k1Offset + 1];
  				} else {
  					x1 = v1[k1Offset - 1] + 1;
  				}
  				y1 = x1 - k1;
  				while (x1 < text1Length && y1 < text2Length && text1.charAt(x1) === text2.charAt(y1)) {
  					x1++;
  					y1++;
  				}
  				v1[k1Offset] = x1;
  				if (x1 > text1Length) {

  					// Ran off the right of the graph.
  					k1end += 2;
  				} else if (y1 > text2Length) {

  					// Ran off the bottom of the graph.
  					k1start += 2;
  				} else if (front) {
  					k2Offset = vOffset + delta - k1;
  					if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {

  						// Mirror x2 onto top-left coordinate system.
  						x2 = text1Length - v2[k2Offset];
  						if (x1 >= x2) {

  							// Overlap detected.
  							return this.diffBisectSplit(text1, text2, x1, y1, deadline);
  						}
  					}
  				}
  			}

  			// Walk the reverse path one step.
  			for (k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
  				k2Offset = vOffset + k2;
  				if (k2 === -d || k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1]) {
  					x2 = v2[k2Offset + 1];
  				} else {
  					x2 = v2[k2Offset - 1] + 1;
  				}
  				y2 = x2 - k2;
  				while (x2 < text1Length && y2 < text2Length && text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)) {
  					x2++;
  					y2++;
  				}
  				v2[k2Offset] = x2;
  				if (x2 > text1Length) {

  					// Ran off the left of the graph.
  					k2end += 2;
  				} else if (y2 > text2Length) {

  					// Ran off the top of the graph.
  					k2start += 2;
  				} else if (!front) {
  					k1Offset = vOffset + delta - k2;
  					if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] !== -1) {
  						x1 = v1[k1Offset];
  						y1 = vOffset + x1 - k1Offset;

  						// Mirror x2 onto top-left coordinate system.
  						x2 = text1Length - x2;
  						if (x1 >= x2) {

  							// Overlap detected.
  							return this.diffBisectSplit(text1, text2, x1, y1, deadline);
  						}
  					}
  				}
  			}
  		}

  		// Diff took too long and hit the deadline or
  		// number of diffs equals number of characters, no commonality at all.
  		return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  	};

  	/**
    * Given the location of the 'middle snake', split the diff in two parts
    * and recurse.
    * @param {string} text1 Old string to be diffed.
    * @param {string} text2 New string to be diffed.
    * @param {number} x Index of split point in text1.
    * @param {number} y Index of split point in text2.
    * @param {number} deadline Time at which to bail if not yet complete.
    * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
    * @private
    */
  	DiffMatchPatch.prototype.diffBisectSplit = function (text1, text2, x, y, deadline) {
  		var text1a, text1b, text2a, text2b, diffs, diffsb;
  		text1a = text1.substring(0, x);
  		text2a = text2.substring(0, y);
  		text1b = text1.substring(x);
  		text2b = text2.substring(y);

  		// Compute both diffs serially.
  		diffs = this.DiffMain(text1a, text2a, false, deadline);
  		diffsb = this.DiffMain(text1b, text2b, false, deadline);

  		return diffs.concat(diffsb);
  	};

  	/**
    * Reduce the number of edits by eliminating semantically trivial equalities.
    * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
    */
  	DiffMatchPatch.prototype.diffCleanupSemantic = function (diffs) {
  		var changes, equalities, equalitiesLength, lastequality, pointer, lengthInsertions2, lengthDeletions2, lengthInsertions1, lengthDeletions1, deletion, insertion, overlapLength1, overlapLength2;
  		changes = false;
  		equalities = []; // Stack of indices where equalities are found.
  		equalitiesLength = 0; // Keeping our own length var is faster in JS.
  		/** @type {?string} */
  		lastequality = null;

  		// Always equal to diffs[equalities[equalitiesLength - 1]][1]
  		pointer = 0; // Index of current position.

  		// Number of characters that changed prior to the equality.
  		lengthInsertions1 = 0;
  		lengthDeletions1 = 0;

  		// Number of characters that changed after the equality.
  		lengthInsertions2 = 0;
  		lengthDeletions2 = 0;
  		while (pointer < diffs.length) {
  			if (diffs[pointer][0] === DIFF_EQUAL) {
  				// Equality found.
  				equalities[equalitiesLength++] = pointer;
  				lengthInsertions1 = lengthInsertions2;
  				lengthDeletions1 = lengthDeletions2;
  				lengthInsertions2 = 0;
  				lengthDeletions2 = 0;
  				lastequality = diffs[pointer][1];
  			} else {
  				// An insertion or deletion.
  				if (diffs[pointer][0] === DIFF_INSERT) {
  					lengthInsertions2 += diffs[pointer][1].length;
  				} else {
  					lengthDeletions2 += diffs[pointer][1].length;
  				}

  				// Eliminate an equality that is smaller or equal to the edits on both
  				// sides of it.
  				if (lastequality && lastequality.length <= Math.max(lengthInsertions1, lengthDeletions1) && lastequality.length <= Math.max(lengthInsertions2, lengthDeletions2)) {

  					// Duplicate record.
  					diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);

  					// Change second copy to insert.
  					diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;

  					// Throw away the equality we just deleted.
  					equalitiesLength--;

  					// Throw away the previous equality (it needs to be reevaluated).
  					equalitiesLength--;
  					pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;

  					// Reset the counters.
  					lengthInsertions1 = 0;
  					lengthDeletions1 = 0;
  					lengthInsertions2 = 0;
  					lengthDeletions2 = 0;
  					lastequality = null;
  					changes = true;
  				}
  			}
  			pointer++;
  		}

  		// Normalize the diff.
  		if (changes) {
  			this.diffCleanupMerge(diffs);
  		}

  		// Find any overlaps between deletions and insertions.
  		// e.g: <del>abcxxx</del><ins>xxxdef</ins>
  		//   -> <del>abc</del>xxx<ins>def</ins>
  		// e.g: <del>xxxabc</del><ins>defxxx</ins>
  		//   -> <ins>def</ins>xxx<del>abc</del>
  		// Only extract an overlap if it is as big as the edit ahead or behind it.
  		pointer = 1;
  		while (pointer < diffs.length) {
  			if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {
  				deletion = diffs[pointer - 1][1];
  				insertion = diffs[pointer][1];
  				overlapLength1 = this.diffCommonOverlap(deletion, insertion);
  				overlapLength2 = this.diffCommonOverlap(insertion, deletion);
  				if (overlapLength1 >= overlapLength2) {
  					if (overlapLength1 >= deletion.length / 2 || overlapLength1 >= insertion.length / 2) {

  						// Overlap found.  Insert an equality and trim the surrounding edits.
  						diffs.splice(pointer, 0, [DIFF_EQUAL, insertion.substring(0, overlapLength1)]);
  						diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlapLength1);
  						diffs[pointer + 1][1] = insertion.substring(overlapLength1);
  						pointer++;
  					}
  				} else {
  					if (overlapLength2 >= deletion.length / 2 || overlapLength2 >= insertion.length / 2) {

  						// Reverse overlap found.
  						// Insert an equality and swap and trim the surrounding edits.
  						diffs.splice(pointer, 0, [DIFF_EQUAL, deletion.substring(0, overlapLength2)]);

  						diffs[pointer - 1][0] = DIFF_INSERT;
  						diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlapLength2);
  						diffs[pointer + 1][0] = DIFF_DELETE;
  						diffs[pointer + 1][1] = deletion.substring(overlapLength2);
  						pointer++;
  					}
  				}
  				pointer++;
  			}
  			pointer++;
  		}
  	};

  	/**
    * Determine if the suffix of one string is the prefix of another.
    * @param {string} text1 First string.
    * @param {string} text2 Second string.
    * @return {number} The number of characters common to the end of the first
    *     string and the start of the second string.
    * @private
    */
  	DiffMatchPatch.prototype.diffCommonOverlap = function (text1, text2) {
  		var text1Length, text2Length, textLength, best, length, pattern, found;

  		// Cache the text lengths to prevent multiple calls.
  		text1Length = text1.length;
  		text2Length = text2.length;

  		// Eliminate the null case.
  		if (text1Length === 0 || text2Length === 0) {
  			return 0;
  		}

  		// Truncate the longer string.
  		if (text1Length > text2Length) {
  			text1 = text1.substring(text1Length - text2Length);
  		} else if (text1Length < text2Length) {
  			text2 = text2.substring(0, text1Length);
  		}
  		textLength = Math.min(text1Length, text2Length);

  		// Quick check for the worst case.
  		if (text1 === text2) {
  			return textLength;
  		}

  		// Start by looking for a single character match
  		// and increase length until no match is found.
  		// Performance analysis: https://neil.fraser.name/news/2010/11/04/
  		best = 0;
  		length = 1;
  		while (true) {
  			pattern = text1.substring(textLength - length);
  			found = text2.indexOf(pattern);
  			if (found === -1) {
  				return best;
  			}
  			length += found;
  			if (found === 0 || text1.substring(textLength - length) === text2.substring(0, length)) {
  				best = length;
  				length++;
  			}
  		}
  	};

  	/**
    * Split two texts into an array of strings.  Reduce the texts to a string of
    * hashes where each Unicode character represents one line.
    * @param {string} text1 First string.
    * @param {string} text2 Second string.
    * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
    *     An object containing the encoded text1, the encoded text2 and
    *     the array of unique strings.
    *     The zeroth element of the array of unique strings is intentionally blank.
    * @private
    */
  	DiffMatchPatch.prototype.diffLinesToChars = function (text1, text2) {
  		var lineArray, lineHash, chars1, chars2;
  		lineArray = []; // E.g. lineArray[4] === 'Hello\n'
  		lineHash = {}; // E.g. lineHash['Hello\n'] === 4

  		// '\x00' is a valid character, but various debuggers don't like it.
  		// So we'll insert a junk entry to avoid generating a null character.
  		lineArray[0] = "";

  		/**
     * Split a text into an array of strings.  Reduce the texts to a string of
     * hashes where each Unicode character represents one line.
     * Modifies linearray and linehash through being a closure.
     * @param {string} text String to encode.
     * @return {string} Encoded string.
     * @private
     */
  		function diffLinesToCharsMunge(text) {
  			var chars, lineStart, lineEnd, lineArrayLength, line;
  			chars = "";

  			// Walk the text, pulling out a substring for each line.
  			// text.split('\n') would would temporarily double our memory footprint.
  			// Modifying text would create many large strings to garbage collect.
  			lineStart = 0;
  			lineEnd = -1;

  			// Keeping our own length variable is faster than looking it up.
  			lineArrayLength = lineArray.length;
  			while (lineEnd < text.length - 1) {
  				lineEnd = text.indexOf("\n", lineStart);
  				if (lineEnd === -1) {
  					lineEnd = text.length - 1;
  				}
  				line = text.substring(lineStart, lineEnd + 1);
  				lineStart = lineEnd + 1;

  				var lineHashExists = lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) : lineHash[line] !== undefined;

  				if (lineHashExists) {
  					chars += String.fromCharCode(lineHash[line]);
  				} else {
  					chars += String.fromCharCode(lineArrayLength);
  					lineHash[line] = lineArrayLength;
  					lineArray[lineArrayLength++] = line;
  				}
  			}
  			return chars;
  		}

  		chars1 = diffLinesToCharsMunge(text1);
  		chars2 = diffLinesToCharsMunge(text2);
  		return {
  			chars1: chars1,
  			chars2: chars2,
  			lineArray: lineArray
  		};
  	};

  	/**
    * Rehydrate the text in a diff from a string of line hashes to real lines of
    * text.
    * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
    * @param {!Array.<string>} lineArray Array of unique strings.
    * @private
    */
  	DiffMatchPatch.prototype.diffCharsToLines = function (diffs, lineArray) {
  		var x, chars, text, y;
  		for (x = 0; x < diffs.length; x++) {
  			chars = diffs[x][1];
  			text = [];
  			for (y = 0; y < chars.length; y++) {
  				text[y] = lineArray[chars.charCodeAt(y)];
  			}
  			diffs[x][1] = text.join("");
  		}
  	};

  	/**
    * Reorder and merge like edit sections.  Merge equalities.
    * Any edit section can move as long as it doesn't cross an equality.
    * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
    */
  	DiffMatchPatch.prototype.diffCleanupMerge = function (diffs) {
  		var pointer, countDelete, countInsert, textInsert, textDelete, commonlength, changes, diffPointer, position;
  		diffs.push([DIFF_EQUAL, ""]); // Add a dummy entry at the end.
  		pointer = 0;
  		countDelete = 0;
  		countInsert = 0;
  		textDelete = "";
  		textInsert = "";

  		while (pointer < diffs.length) {
  			switch (diffs[pointer][0]) {
  				case DIFF_INSERT:
  					countInsert++;
  					textInsert += diffs[pointer][1];
  					pointer++;
  					break;
  				case DIFF_DELETE:
  					countDelete++;
  					textDelete += diffs[pointer][1];
  					pointer++;
  					break;
  				case DIFF_EQUAL:

  					// Upon reaching an equality, check for prior redundancies.
  					if (countDelete + countInsert > 1) {
  						if (countDelete !== 0 && countInsert !== 0) {

  							// Factor out any common prefixes.
  							commonlength = this.diffCommonPrefix(textInsert, textDelete);
  							if (commonlength !== 0) {
  								if (pointer - countDelete - countInsert > 0 && diffs[pointer - countDelete - countInsert - 1][0] === DIFF_EQUAL) {
  									diffs[pointer - countDelete - countInsert - 1][1] += textInsert.substring(0, commonlength);
  								} else {
  									diffs.splice(0, 0, [DIFF_EQUAL, textInsert.substring(0, commonlength)]);
  									pointer++;
  								}
  								textInsert = textInsert.substring(commonlength);
  								textDelete = textDelete.substring(commonlength);
  							}

  							// Factor out any common suffixies.
  							commonlength = this.diffCommonSuffix(textInsert, textDelete);
  							if (commonlength !== 0) {
  								diffs[pointer][1] = textInsert.substring(textInsert.length - commonlength) + diffs[pointer][1];
  								textInsert = textInsert.substring(0, textInsert.length - commonlength);
  								textDelete = textDelete.substring(0, textDelete.length - commonlength);
  							}
  						}

  						// Delete the offending records and add the merged ones.
  						if (countDelete === 0) {
  							diffs.splice(pointer - countInsert, countDelete + countInsert, [DIFF_INSERT, textInsert]);
  						} else if (countInsert === 0) {
  							diffs.splice(pointer - countDelete, countDelete + countInsert, [DIFF_DELETE, textDelete]);
  						} else {
  							diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert, [DIFF_DELETE, textDelete], [DIFF_INSERT, textInsert]);
  						}
  						pointer = pointer - countDelete - countInsert + (countDelete ? 1 : 0) + (countInsert ? 1 : 0) + 1;
  					} else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {

  						// Merge this equality with the previous one.
  						diffs[pointer - 1][1] += diffs[pointer][1];
  						diffs.splice(pointer, 1);
  					} else {
  						pointer++;
  					}
  					countInsert = 0;
  					countDelete = 0;
  					textDelete = "";
  					textInsert = "";
  					break;
  			}
  		}
  		if (diffs[diffs.length - 1][1] === "") {
  			diffs.pop(); // Remove the dummy entry at the end.
  		}

  		// Second pass: look for single edits surrounded on both sides by equalities
  		// which can be shifted sideways to eliminate an equality.
  		// e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  		changes = false;
  		pointer = 1;

  		// Intentionally ignore the first and last element (don't need checking).
  		while (pointer < diffs.length - 1) {
  			if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {

  				diffPointer = diffs[pointer][1];
  				position = diffPointer.substring(diffPointer.length - diffs[pointer - 1][1].length);

  				// This is a single edit surrounded by equalities.
  				if (position === diffs[pointer - 1][1]) {

  					// Shift the edit over the previous equality.
  					diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
  					diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
  					diffs.splice(pointer - 1, 1);
  					changes = true;
  				} else if (diffPointer.substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {

  					// Shift the edit over the next equality.
  					diffs[pointer - 1][1] += diffs[pointer + 1][1];
  					diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
  					diffs.splice(pointer + 1, 1);
  					changes = true;
  				}
  			}
  			pointer++;
  		}

  		// If shifts were made, the diff needs reordering and another shift sweep.
  		if (changes) {
  			this.diffCleanupMerge(diffs);
  		}
  	};

  	return function (o, n) {
  		var diff, output, text;
  		diff = new DiffMatchPatch();
  		output = diff.DiffMain(o, n);
  		diff.diffCleanupEfficiency(output);
  		text = diff.diffPrettyHtml(output);

  		return text;
  	};
  }();

}((function() { return this; }())));

/* globals QUnit */

(function() {
  QUnit.config.autostart = false;
  QUnit.config.urlConfig.push({ id: 'nocontainer', label: 'Hide container' });
  QUnit.config.urlConfig.push({ id: 'nolint', label: 'Disable Linting' });
  QUnit.config.urlConfig.push({ id: 'dockcontainer', label: 'Dock container' });
  QUnit.config.urlConfig.push({ id: 'devmode', label: 'Development mode' });

  QUnit.config.testTimeout = QUnit.urlParams.devmode ? null : 60000; //Default Test Timeout 60 Seconds
})();

!function() {
  function merge() {
    var target = arguments[0];
    var sources = Array.prototype.slice.call(arguments, 1);
    var source;

    for(var i = 0; i < sources.length; i++) {
      source = sources[i];

      if (!source) {
        continue;
      }

      for(var attr in source) {
        if (typeof source[attr] !== 'undefined') {
          target[attr] = source[attr];
        }
      }
    }

    return target;
  }

  /**
   * Extends typeof to add the type 'descriptor'
   *
   */
  function typeOf(item) {
    if (item && item.isDescriptor) {
      return 'descriptor';
    }

    if (item === null) {
      return 'null';
    }

    return typeof(item);
  }

  function defineProperty(target, keyName, value, getter) {
    var options = {
      configurable: true,
      enumerable: true,
    };

    if (typeOf(getter) !== 'undefined') {
      options.get = getter;
    } else {
      options.writable = false;
      options.value = value;
    }

    Object.defineProperty(target, keyName, options);
  }

  /**
   * Default `Descriptor` builder
   *
   * @param {TreeNode} node - parent node
   * @param {String} blueprintKey - key to build
   * @param {Descriptor} descriptor - descriptor to build
   * @param {Function} defaultBuilder - default function to build this type of node
   *
   * @return undefined
   */
  function buildDescriptor(node, blueprintKey, descriptor /*, descriptorBuilder*/) {
    if (typeof descriptor.setup === 'function') {
      descriptor.setup(node, blueprintKey);
    }

    if (descriptor.value) {
      defineProperty(node, blueprintKey, descriptor.value);
    } else {
      defineProperty(node, blueprintKey, undefined, function() {
        return descriptor.get.call(this, blueprintKey);
      });
    }
  }

  /**
   * Default `Object` builder
   *
   * @param {TreeNode} node - parent node
   * @param {String} blueprintKey - key to build
   * @param {Object} blueprint - blueprint to build
   * @param {Function} defaultBuilder - default function to build this type of node
   *
   * @return {Array} [node, blueprint] to build
   */
  function buildObject(node, blueprintKey, blueprint /*, defaultBuilder*/) {
    var value = {};

    // Create child component
    defineProperty(node, blueprintKey, value);

    // Set meta to object
    setMeta(value, blueprintKey);

    return [value, blueprint];
  }

  /**
   * Default builder
   *
   * @param {TreeNode} node - parent node
   * @param {String} blueprintKey - key to build
   * @param {Any} value - value to build
   * @param {Function} defaultBuilder - default function to build this type of node
   *
   * @return undefined
   */
  function buildDefault(node, blueprintKey, value /*, defaultBuilder*/) {
    defineProperty(node, blueprintKey, value);
  }

  function setParent(target, parentTree) {
    // We want to delete the parent node if we set null or undefine. Also, this
    // workarounds an issue in phantomjs where we cannot use defineProperty to
    // redefine a property.
    // See. https://github.com/ariya/phantomjs/issues/11856
    delete target['__parentTreeNode'];

    if (parentTree) {
      Object.defineProperty(target, '__parentTreeNode', { value: parentTree, configurable: true, enumerable: false });
    }
  }

  function parent(object) {
    // Be carefull: typeof(null) === 'object'
    if (typeof object === 'object' && object !== null) {
      return object['__parentTreeNode'];
    }
  }

  function setMeta(target, key) {
    Object.defineProperty(target, '__meta', {
      value: {
        key: key,
        type: 'node'
      },
      configurable: false,
      enumerable: false
    });
  }

  function meta(object) {
    // Be carefull: typeof(null) === 'object'
    if (typeof object === 'object' && object !== null) {
      return object['__meta'];
    }
  }

  function TreeBuilder(blueprint, builders) {
    this.blueprint = blueprint;
    this.builders = builders;
  }

  TreeBuilder.prototype = {
    builderFor: function(value) {
      return this.builders[typeOf(value)] || this.builders['default'];
    },

    build: function(parentTree) {
      var root = {},
        node;

      this.processNode({ root: this.blueprint }, root);

      node = root['root'];
      setParent(node, parentTree);

      return node;
    },

    processNode: function(blueprintNode, target, parent) {
      var keys = Object.keys(blueprintNode),
          that = this;

      keys.forEach(function(key) {
        var blueprintAttribute = blueprintNode[key],
            builder,
            defaultBuilder,
            result;

        builder = that.builderFor(blueprintAttribute);
        defaultBuilder = builderFor(blueprintAttribute);

        if (result = builder(target, key, blueprintAttribute, defaultBuilder)) {
          that.processNode(result[1], result[0], target);
        }
      });

      setParent(target, parent);

      return target;
    }
  };

  function builderFor(value) {
    return DEFAULT_BUILDERS[typeOf(value)] || DEFAULT_BUILDERS['default'];
  }

  var DEFAULT_BUILDERS = {
    descriptor: buildDescriptor,
    object: buildObject,
    default: buildDefault
  };

  var Ceibo = {
    defineProperty: defineProperty,

    create: function(blueprint, options) {
      options = options || {};

      var builder = merge({}, DEFAULT_BUILDERS, options.builder);

      return new TreeBuilder(blueprint, builder).build(options.parent);
    },

    parent: function(node) {
      return parent(node);
    },

    meta: function(node) {
      return meta(node);
    }
  };

  if (typeof define === 'function') {
    define('ceibo', ['exports'], function(__exports__) {
      'use strict';
      __exports__.Ceibo = Ceibo;
      __exports__.default = Ceibo;
    });
  } else {
    window.Ceibo = Ceibo;
  }
}();

// Map `jquery` from the app to an amd module called `-jquery` for internal usage
(function() {
  function vendorModule() {
    'use strict';

    var jq = self.jQuery;
    if (!jq) {
      throw new Error('Unable to find jQuery');
    }

    return { 'default': jq };
  }

  define('-jquery', [], vendorModule);
})();

(function() {
  var key = '_embroider_macros_runtime_config';
  if (!window[key]) {
    window[key] = [];
  }
  window[key].push(function(m) {
    m.setGlobalConfig(
      '@embroider/macros',
      Object.assign({}, m.getGlobalConfig()['@embroider/macros'], { isTesting: true })
    );
  });
})();

define('@ember/test-helpers/-utils', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.nextTickPromise = nextTickPromise;
  exports.runDestroyablesFor = runDestroyablesFor;
  exports.isNumeric = isNumeric;
  var nextTick = exports.nextTick = setTimeout;
  var futureTick = exports.futureTick = setTimeout;

  /**
   @private
   @returns {Promise<void>} promise which resolves on the next turn of the event loop
  */
  function nextTickPromise() {
    return new Ember.RSVP.Promise(function (resolve) {
      nextTick(resolve);
    });
  }

  /**
   Retrieves an array of destroyables from the specified property on the object
   provided, iterates that array invoking each function, then deleting the
   property (clearing the array).
  
   @private
   @param {Object} object an object to search for the destroyable array within
   @param {string} property the property on the object that contains the destroyable array
  */
  function runDestroyablesFor(object, property) {
    var destroyables = object[property];

    if (!destroyables) {
      return;
    }

    for (var i = 0; i < destroyables.length; i++) {
      destroyables[i]();
    }

    delete object[property];
  }

  /**
   Returns whether the passed in string consists only of numeric characters.
  
   @private
   @param {string} n input string
   @returns {boolean} whether the input string consists only of numeric characters
   */
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
});
define('@ember/test-helpers/application', ['exports', '@ember/test-helpers/resolver'], function (exports, _resolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setApplication = setApplication;
  exports.getApplication = getApplication;


  var __application__;

  /**
    Stores the provided application instance so that tests being ran will be aware of the application under test.
  
    - Required by `setupApplicationContext` method.
    - Used by `setupContext` and `setupRenderingContext` when present.
  
    @public
    @param {Ember.Application} application the application that will be tested
  */
  function setApplication(application) {
    __application__ = application;

    if (!(0, _resolver.getResolver)()) {
      var Resolver = application.Resolver;
      var resolver = Resolver.create({ namespace: application });

      (0, _resolver.setResolver)(resolver);
    }
  }

  /**
    Retrieve the application instance stored by `setApplication`.
  
    @public
    @returns {Ember.Application} the previously stored application instance under test
  */
  function getApplication() {
    return __application__;
  }
});
define('@ember/test-helpers/build-owner', ['exports', 'ember-test-helpers/legacy-0-6-x/build-registry'], function (exports, _buildRegistry) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = buildOwner;


  /**
    Creates an "owner" (an object that either _is_ or duck-types like an
    `Ember.ApplicationInstance`) from the provided options.
  
    If `options.application` is present (e.g. setup by an earlier call to
    `setApplication`) an `Ember.ApplicationInstance` is built via
    `application.buildInstance()`.
  
    If `options.application` is not present, we fall back to using
    `options.resolver` instead (setup via `setResolver`). This creates a mock
    "owner" by using a custom created combination of `Ember.Registry`,
    `Ember.Container`, `Ember._ContainerProxyMixin`, and
    `Ember._RegistryProxyMixin`.
  
    @private
    @param {Ember.Application} [application] the Ember.Application to build an instance from
    @param {Ember.Resolver} [resolver] the resolver to use to back a "mock owner"
    @returns {Promise<Ember.ApplicationInstance>} a promise resolving to the generated "owner"
  */
  function buildOwner(application, resolver) {
    if (application) {
      return application.boot().then(function (app) {
        return app.buildInstance().boot();
      });
    }

    if (!resolver) {
      throw new Error('You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.');
    }

    var _legacyBuildRegistry = (0, _buildRegistry.default)(resolver),
        owner = _legacyBuildRegistry.owner;

    return Ember.RSVP.Promise.resolve(owner);
  }
});
define('@ember/test-helpers/dom/-get-element', ['exports', '@ember/test-helpers/dom/get-root-element'], function (exports, _getRootElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getElement;


  /**
    Used internally by the DOM interaction helpers to find one element.
  
    @private
    @param {string|Element} target the element or selector to retrieve
    @returns {Element} the target or selector
  */
  function getElement(target) {
    if (target.nodeType === Node.ELEMENT_NODE || target.nodeType === Node.DOCUMENT_NODE || target instanceof Window) {
      return target;
    } else if (typeof target === 'string') {
      var rootElement = (0, _getRootElement.default)();

      return rootElement.querySelector(target);
    } else {
      throw new Error('Must use an element or a selector string');
    }
  }
});
define('@ember/test-helpers/dom/-get-elements', ['exports', '@ember/test-helpers/dom/get-root-element'], function (exports, _getRootElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getElements;


  /**
    Used internally by the DOM interaction helpers to find multiple elements.
  
    @private
    @param {string} target the selector to retrieve
    @returns {NodeList} the matched elements
  */
  function getElements(target) {
    if (typeof target === 'string') {
      var rootElement = (0, _getRootElement.default)();

      return rootElement.querySelectorAll(target);
    } else {
      throw new Error('Must use a selector string');
    }
  }
});
define('@ember/test-helpers/dom/-is-focusable', ['exports', '@ember/test-helpers/dom/-is-form-control'], function (exports, _isFormControl) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isFocusable;


  var FOCUSABLE_TAGS = ['A'];

  /**
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is focusable, `false` otherwise
  */
  function isFocusable(element) {
    if ((0, _isFormControl.default)(element) || element.isContentEditable || FOCUSABLE_TAGS.indexOf(element.tagName) > -1) {
      return true;
    }

    return element.hasAttribute('tabindex');
  }
});
define('@ember/test-helpers/dom/-is-form-control', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isFormControl;
  var FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];

  /**
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is a form control, `false` otherwise
  */
  function isFormControl(element) {
    var tagName = element.tagName,
        type = element.type;


    if (type === 'hidden') {
      return false;
    }

    return FORM_CONTROL_TAGS.indexOf(tagName) > -1;
  }
});
define("@ember/test-helpers/dom/-to-array", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = toArray;
  /**
    @private
    @param {NodeList} nodelist the nodelist to convert to an array
    @returns {Array} an array
  */
  function toArray(nodelist) {
    var array = new Array(nodelist.length);
    for (var i = 0; i < nodelist.length; i++) {
      array[i] = nodelist[i];
    }

    return array;
  }
});
define('@ember/test-helpers/dom/blur', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/settled', '@ember/test-helpers/dom/-is-focusable', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _settled, _isFocusable, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.__blur__ = __blur__;
  exports.default = blur;


  /**
    @private
    @param {Element} element the element to trigger events on
  */
  function __blur__(element) {
    var browserIsNotFocused = document.hasFocus && !document.hasFocus();

    // makes `document.activeElement` be `body`.
    // If the browser is focused, it also fires a blur event
    element.blur();

    // Chrome/Firefox does not trigger the `blur` event if the window
    // does not have focus. If the document does not have focus then
    // fire `blur` event via native event.
    if (browserIsNotFocused) {
      (0, _fireEvent.default)(element, 'blur', { bubbles: false });
      (0, _fireEvent.default)(element, 'focusout');
    }
  }

  /**
    Unfocus the specified target.
  
    Sends a number of events intending to simulate a "real" user unfocusing an
    element.
  
    The following events are triggered (in order):
  
    - `blur`
    - `focusout`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle unfocusing a given element.
  
    @public
    @param {string|Element} [target=document.activeElement] the element or selector to unfocus
    @return {Promise<void>} resolves when settled
  */
  function blur() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.activeElement;

    return (0, _utils.nextTickPromise)().then(function () {
      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `blur(\'' + target + '\')`.');
      }

      if (!(0, _isFocusable.default)(element)) {
        throw new Error(target + ' is not focusable');
      }

      __blur__(element);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/click', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/dom/focus', '@ember/test-helpers/settled', '@ember/test-helpers/dom/-is-focusable', '@ember/test-helpers/-utils', '@ember/test-helpers/dom/-is-form-control'], function (exports, _getElement, _fireEvent, _focus, _settled, _isFocusable, _utils, _isFormControl) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.__click__ = __click__;
  exports.default = click;


  /**
    @private
    @param {Element} element the element to click on
    @param {Object} options the options to be merged into the mouse events
  */
  function __click__(element, options) {
    (0, _fireEvent.default)(element, 'mousedown', options);

    if ((0, _isFocusable.default)(element)) {
      (0, _focus.__focus__)(element);
    }

    (0, _fireEvent.default)(element, 'mouseup', options);
    (0, _fireEvent.default)(element, 'click', options);
  }

  /**
    Clicks on the specified target.
  
    Sends a number of events intending to simulate a "real" user clicking on an
    element.
  
    For non-focusable elements the following events are triggered (in order):
  
    - `mousedown`
    - `mouseup`
    - `click`
  
    For focusable (e.g. form control) elements the following events are triggered
    (in order):
  
    - `mousedown`
    - `focus`
    - `focusin`
    - `mouseup`
    - `click`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle clicking a given element.
  
    Use the `options` hash to change the parameters of the MouseEvents. 
  
    @public
    @param {string|Element} target the element or selector to click on
    @param {Object} options the options to be merged into the mouse events
    @return {Promise<void>} resolves when settled
  */
  function click(target) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `click`.');
      }

      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `click(\'' + target + '\')`.');
      }

      var isDisabledFormControl = (0, _isFormControl.default)(element) && element.disabled === true;

      if (!isDisabledFormControl) {
        __click__(element, options);
      }

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/double-click', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/dom/focus', '@ember/test-helpers/settled', '@ember/test-helpers/dom/-is-focusable', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _focus, _settled, _isFocusable, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.__doubleClick__ = __doubleClick__;
  exports.default = doubleClick;


  /**
    @private
    @param {Element} element the element to double-click on
    @param {Object} options the options to be merged into the mouse events
  */
  function __doubleClick__(element, options) {
    (0, _fireEvent.default)(element, 'mousedown', options);

    if ((0, _isFocusable.default)(element)) {
      (0, _focus.__focus__)(element);
    }

    (0, _fireEvent.default)(element, 'mouseup', options);
    (0, _fireEvent.default)(element, 'click', options);
    (0, _fireEvent.default)(element, 'mousedown', options);
    (0, _fireEvent.default)(element, 'mouseup', options);
    (0, _fireEvent.default)(element, 'click', options);
    (0, _fireEvent.default)(element, 'dblclick', options);
  }

  /**
    Double-clicks on the specified target.
  
    Sends a number of events intending to simulate a "real" user clicking on an
    element.
  
    For non-focusable elements the following events are triggered (in order):
  
    - `mousedown`
    - `mouseup`
    - `click`
    - `mousedown`
    - `mouseup`
    - `click`
    - `dblclick`
  
    For focusable (e.g. form control) elements the following events are triggered
    (in order):
  
    - `mousedown`
    - `focus`
    - `focusin`
    - `mouseup`
    - `click`
    - `mousedown`
    - `mouseup`
    - `click`
    - `dblclick`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle clicking a given element.
  
    Use the `options` hash to change the parameters of the MouseEvents. 
  
    @public
    @param {string|Element} target the element or selector to double-click on
    @param {Object} options the options to be merged into the mouse events
    @return {Promise<void>} resolves when settled
  */
  function doubleClick(target) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `doubleClick`.');
      }

      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `doubleClick(\'' + target + '\')`.');
      }

      __doubleClick__(element, options);
      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/fill-in', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/-is-form-control', '@ember/test-helpers/dom/focus', '@ember/test-helpers/settled', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/-utils'], function (exports, _getElement, _isFormControl, _focus, _settled, _fireEvent, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = fillIn;


  /**
    Fill the provided text into the `value` property (or set `.innerHTML` when
    the target is a content editable element) then trigger `change` and `input`
    events on the specified target.
  
    @public
    @param {string|Element} target the element or selector to enter text into
    @param {string} text the text to fill into the target element
    @return {Promise<void>} resolves when the application is settled
  */
  function fillIn(target, text) {
    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `fillIn`.');
      }

      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `fillIn(\'' + target + '\')`.');
      }
      var isControl = (0, _isFormControl.default)(element);
      if (!isControl && !element.isContentEditable) {
        throw new Error('`fillIn` is only usable on form controls or contenteditable elements.');
      }

      if (typeof text === 'undefined' || text === null) {
        throw new Error('Must provide `text` when calling `fillIn`.');
      }

      (0, _focus.__focus__)(element);

      if (isControl) {
        element.value = text;
      } else {
        element.innerHTML = text;
      }

      (0, _fireEvent.default)(element, 'input');
      (0, _fireEvent.default)(element, 'change');

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/find-all', ['exports', '@ember/test-helpers/dom/-get-elements', '@ember/test-helpers/dom/-to-array'], function (exports, _getElements, _toArray) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = find;


  /**
    Find all elements matched by the given selector. Equivalent to calling
    `querySelectorAll()` on the test root element.
  
    @public
    @param {string} selector the selector to search for
    @return {Array} array of matched elements
  */
  function find(selector) {
    if (!selector) {
      throw new Error('Must pass a selector to `findAll`.');
    }

    if (arguments.length > 1) {
      throw new Error('The `findAll` test helper only takes a single argument.');
    }

    return (0, _toArray.default)((0, _getElements.default)(selector));
  }
});
define('@ember/test-helpers/dom/find', ['exports', '@ember/test-helpers/dom/-get-element'], function (exports, _getElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = find;


  /**
    Find the first element matched by the given selector. Equivalent to calling
    `querySelector()` on the test root element.
  
    @public
    @param {string} selector the selector to search for
    @return {Element} matched element or null
  */
  function find(selector) {
    if (!selector) {
      throw new Error('Must pass a selector to `find`.');
    }

    if (arguments.length > 1) {
      throw new Error('The `find` test helper only takes a single argument.');
    }

    return (0, _getElement.default)(selector);
  }
});
define('@ember/test-helpers/dom/fire-event', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = fireEvent;


  // eslint-disable-next-line require-jsdoc
  var MOUSE_EVENT_CONSTRUCTOR = function () {
    try {
      new MouseEvent('test');
      return true;
    } catch (e) {
      return false;
    }
  }();
  var DEFAULT_EVENT_OPTIONS = { bubbles: true, cancelable: true };
  var KEYBOARD_EVENT_TYPES = exports.KEYBOARD_EVENT_TYPES = Object.freeze(['keydown', 'keypress', 'keyup']);
  var MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];
  var FILE_SELECTION_EVENT_TYPES = ['change'];

  /**
    Internal helper used to build and dispatch events throughout the other DOM helpers.
  
    @private
    @param {Element} element the element to dispatch the event to
    @param {string} eventType the type of event
    @param {Object} [options] additional properties to be set on the event
    @returns {Event} the event that was dispatched
  */
  function fireEvent(element, eventType) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!element) {
      throw new Error('Must pass an element to `fireEvent`');
    }

    var event = void 0;
    if (KEYBOARD_EVENT_TYPES.indexOf(eventType) > -1) {
      event = buildKeyboardEvent(eventType, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(eventType) > -1) {
      var rect = void 0;
      if (element instanceof Window) {
        rect = element.document.documentElement.getBoundingClientRect();
      } else if (element.nodeType === Node.DOCUMENT_NODE) {
        rect = element.documentElement.getBoundingClientRect();
      } else if (element.nodeType === Node.ELEMENT_NODE) {
        rect = element.getBoundingClientRect();
      } else {
        return;
      }

      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5, // Those numbers don't really mean anything.
        screenY: y + 95, // They're just to make the screenX/Y be different of clientX/Y..
        clientX: x,
        clientY: y
      };

      event = buildMouseEvent(eventType, Ember.assign(simulatedCoordinates, options));
    } else if (FILE_SELECTION_EVENT_TYPES.indexOf(eventType) > -1 && element.files) {
      event = buildFileEvent(eventType, element, options);
    } else {
      event = buildBasicEvent(eventType, options);
    }

    element.dispatchEvent(event);
    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildBasicEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = document.createEvent('Events');

    var bubbles = options.bubbles !== undefined ? options.bubbles : true;
    var cancelable = options.cancelable !== undefined ? options.cancelable : true;

    delete options.bubbles;
    delete options.cancelable;

    // bubbles and cancelable are readonly, so they can be
    // set when initializing event
    event.initEvent(type, bubbles, cancelable);
    Ember.assign(event, options);
    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildMouseEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = void 0;
    var eventOpts = Ember.assign({ view: window }, DEFAULT_EVENT_OPTIONS, options);
    if (MOUSE_EVENT_CONSTRUCTOR) {
      event = new MouseEvent(type, eventOpts);
    } else {
      try {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent(type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
      } catch (e) {
        event = buildBasicEvent(type, options);
      }
    }

    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildKeyboardEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var eventOpts = Ember.assign({}, DEFAULT_EVENT_OPTIONS, options);
    var event = void 0,
        eventMethodName = void 0;

    try {
      event = new KeyboardEvent(type, eventOpts);

      // Property definitions are required for B/C for keyboard event usage
      // If this properties are not defined, when listening for key events
      // keyCode/which will be 0. Also, keyCode and which now are string
      // and if app compare it with === with integer key definitions,
      // there will be a fail.
      //
      // https://w3c.github.io/uievents/#interface-keyboardevent
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
      Object.defineProperty(event, 'keyCode', {
        get: function get() {
          return parseInt(eventOpts.keyCode);
        }
      });

      Object.defineProperty(event, 'which', {
        get: function get() {
          return parseInt(eventOpts.which);
        }
      });

      return event;
    } catch (e) {
      // left intentionally blank
    }

    try {
      event = document.createEvent('KeyboardEvents');
      eventMethodName = 'initKeyboardEvent';
    } catch (e) {
      // left intentionally blank
    }

    if (!event) {
      try {
        event = document.createEvent('KeyEvents');
        eventMethodName = 'initKeyEvent';
      } catch (e) {
        // left intentionally blank
      }
    }

    if (event) {
      event[eventMethodName](type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } else {
      event = buildBasicEvent(type, options);
    }

    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildFileEvent(type, element) {
    var files = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var event = buildBasicEvent(type);

    if (files.length > 0) {
      Object.defineProperty(files, 'item', {
        value: function value(index) {
          return typeof index === 'number' ? this[index] : null;
        }
      });
      Object.defineProperty(element, 'files', {
        value: files,
        configurable: true
      });
    }

    Object.defineProperty(event, 'target', {
      value: element
    });

    return event;
  }
});
define('@ember/test-helpers/dom/focus', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/settled', '@ember/test-helpers/dom/-is-focusable', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _settled, _isFocusable, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.__focus__ = __focus__;
  exports.default = focus;


  /**
    @private
    @param {Element} element the element to trigger events on
  */
  function __focus__(element) {
    var browserIsNotFocused = document.hasFocus && !document.hasFocus();

    // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event
    element.focus();

    // Firefox does not trigger the `focusin` event if the window
    // does not have focus. If the document does not have focus then
    // fire `focusin` event as well.
    if (browserIsNotFocused) {
      // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
      (0, _fireEvent.default)(element, 'focus', {
        bubbles: false
      });

      (0, _fireEvent.default)(element, 'focusin');
    }
  }

  /**
    Focus the specified target.
  
    Sends a number of events intending to simulate a "real" user focusing an
    element.
  
    The following events are triggered (in order):
  
    - `focus`
    - `focusin`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle focusing a given element.
  
    @public
    @param {string|Element} target the element or selector to focus
    @return {Promise<void>} resolves when the application is settled
  */
  function focus(target) {
    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `focus`.');
      }

      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `focus(\'' + target + '\')`.');
      }

      if (!(0, _isFocusable.default)(element)) {
        throw new Error(target + ' is not focusable');
      }

      __focus__(element);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/get-root-element', ['exports', '@ember/test-helpers/setup-context'], function (exports, _setupContext) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getRootElement;


  /**
    Get the root element of the application under test (usually `#ember-testing`)
  
    @public
    @returns {Element} the root element
  */
  function getRootElement() {
    var context = (0, _setupContext.getContext)();
    var owner = context && context.owner;

    if (!owner) {
      throw new Error('Must setup rendering context before attempting to interact with elements.');
    }

    var rootElement = void 0;
    // When the host app uses `setApplication` (instead of `setResolver`) the owner has
    // a `rootElement` set on it with the element or id to be used
    if (owner && owner._emberTestHelpersMockOwner === undefined) {
      rootElement = owner.rootElement;
    } else {
      rootElement = '#ember-testing';
    }

    if (rootElement.nodeType === Node.ELEMENT_NODE || rootElement.nodeType === Node.DOCUMENT_NODE || rootElement instanceof Window) {
      return rootElement;
    } else if (typeof rootElement === 'string') {
      return document.querySelector(rootElement);
    } else {
      throw new Error('Application.rootElement must be an element or a selector string');
    }
  }
});
define('@ember/test-helpers/dom/tap', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/dom/click', '@ember/test-helpers/settled', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _click, _settled, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = tap;


  /**
    Taps on the specified target.
  
    Sends a number of events intending to simulate a "real" user tapping on an
    element.
  
    For non-focusable elements the following events are triggered (in order):
  
    - `touchstart`
    - `touchend`
    - `mousedown`
    - `mouseup`
    - `click`
  
    For focusable (e.g. form control) elements the following events are triggered
    (in order):
  
    - `touchstart`
    - `touchend`
    - `mousedown`
    - `focus`
    - `focusin`
    - `mouseup`
    - `click`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle tapping on a given element.
  
    Use the `options` hash to change the parameters of the tap events. 
  
    @public
    @param {string|Element} target the element or selector to tap on
    @param {Object} options the options to be merged into the touch events
    @return {Promise<void>} resolves when settled
  */
  function tap(target) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `tap`.');
      }

      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `tap(\'' + target + '\')`.');
      }

      var touchstartEv = (0, _fireEvent.default)(element, 'touchstart', options);
      var touchendEv = (0, _fireEvent.default)(element, 'touchend', options);

      if (!touchstartEv.defaultPrevented && !touchendEv.defaultPrevented) {
        (0, _click.__click__)(element, options);
      }

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/trigger-event', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/settled', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _settled, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = triggerEvent;


  /**
   * Triggers an event on the specified target.
   *
   * @public
   * @param {string|Element} target the element or selector to trigger the event on
   * @param {string} eventType the type of event to trigger
   * @param {Object} options additional properties to be set on the event
   * @return {Promise<void>} resolves when the application is settled
   *
   * @example
   * <caption>Using triggerEvent to Upload a file
   * When using triggerEvent to upload a file the `eventType` must be `change` and  you must pass an
   * array of [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) as `options`.</caption>
   *
   * triggerEvent(
   *   'input.fileUpload',
   *   'change',
   *   [new Blob(['Ember Rules!'])]
   * );
   */
  function triggerEvent(target, eventType, options) {
    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `triggerEvent`.');
      }

      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `triggerEvent(\'' + target + '\', ...)`.');
      }

      if (!eventType) {
        throw new Error('Must provide an `eventType` to `triggerEvent`');
      }

      (0, _fireEvent.default)(element, eventType, options);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/trigger-key-event', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/settled', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _settled, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = triggerKeyEvent;


  var DEFAULT_MODIFIERS = Object.freeze({
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false
  });

  // This is not a comprehensive list, but it is better than nothing.
  var keyFromKeyCode = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'v',
    88: 'x',
    89: 'y',
    90: 'z',
    91: 'Meta',
    93: 'Meta', // There is two keys that map to meta,
    187: '=',
    189: '-'
  };

  /**
    Calculates the value of KeyboardEvent#key given a keycode and the modifiers.
    Note that this works if the key is pressed in combination with the shift key, but it cannot
    detect if caps lock is enabled.
    @param {number} keycode The keycode of the event.
    @param {object} modifiers The modifiers of the event.
    @returns {string} The key string for the event.
   */
  function keyFromKeyCodeAndModifiers(keycode, modifiers) {
    if (keycode > 64 && keycode < 91) {
      if (modifiers.shiftKey) {
        return String.fromCharCode(keycode);
      } else {
        return String.fromCharCode(keycode).toLocaleLowerCase();
      }
    }
    var key = keyFromKeyCode[keycode];
    if (key) {
      return key;
    }
  }

  /**
   * Infers the keycode from the given key
   * @param {string} key The KeyboardEvent#key string
   * @returns {number} The keycode for the given key
   */
  function keyCodeFromKey(key) {
    var keys = Object.keys(keyFromKeyCode);
    var keyCode = keys.find(function (keyCode) {
      return keyFromKeyCode[keyCode] === key;
    });
    if (!keyCode) {
      keyCode = keys.find(function (keyCode) {
        return keyFromKeyCode[keyCode] === key.toLowerCase();
      });
    }
    return parseInt(keyCode);
  }

  /**
    Triggers a keyboard event of given type in the target element.
    It also requires the developer to provide either a string with the [`key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
    or the numeric [`keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) of the pressed key.
    Optionally the user can also provide a POJO with extra modifiers for the event.
  
    @public
    @param {string|Element} target the element or selector to trigger the event on
    @param {'keydown' | 'keyup' | 'keypress'} eventType the type of event to trigger
    @param {number|string} key the `keyCode`(number) or `key`(string) of the event being triggered
    @param {Object} [modifiers] the state of various modifier keys
    @param {boolean} [modifiers.ctrlKey=false] if true the generated event will indicate the control key was pressed during the key event
    @param {boolean} [modifiers.altKey=false] if true the generated event will indicate the alt key was pressed during the key event
    @param {boolean} [modifiers.shiftKey=false] if true the generated event will indicate the shift key was pressed during the key event
    @param {boolean} [modifiers.metaKey=false] if true the generated event will indicate the meta key was pressed during the key event
    @return {Promise<void>} resolves when the application is settled
  */
  function triggerKeyEvent(target, eventType, key) {
    var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_MODIFIERS;

    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `triggerKeyEvent`.');
      }

      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `triggerKeyEvent(\'' + target + '\', ...)`.');
      }

      if (!eventType) {
        throw new Error('Must provide an `eventType` to `triggerKeyEvent`');
      }

      if (_fireEvent.KEYBOARD_EVENT_TYPES.indexOf(eventType) === -1) {
        var validEventTypes = _fireEvent.KEYBOARD_EVENT_TYPES.join(', ');
        throw new Error('Must provide an `eventType` of ' + validEventTypes + ' to `triggerKeyEvent` but you passed `' + eventType + '`.');
      }

      var props = void 0;
      if (typeof key === 'number') {
        props = { keyCode: key, which: key, key: keyFromKeyCodeAndModifiers(key, modifiers) };
      } else if (typeof key === 'string' && key.length !== 0) {
        var firstCharacter = key[0];
        if (firstCharacter !== firstCharacter.toUpperCase()) {
          throw new Error('Must provide a `key` to `triggerKeyEvent` that starts with an uppercase character but you passed `' + key + '`.');
        }

        if ((0, _utils.isNumeric)(key) && key.length > 1) {
          throw new Error('Must provide a numeric `keyCode` to `triggerKeyEvent` but you passed `' + key + '` as a string.');
        }

        var keyCode = keyCodeFromKey(key);
        props = { keyCode: keyCode, which: keyCode, key: key };
      } else {
        throw new Error('Must provide a `key` or `keyCode` to `triggerKeyEvent`');
      }

      var options = Ember.assign(props, modifiers);

      (0, _fireEvent.default)(element, eventType, options);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/type-in', ['exports', '@ember/test-helpers/-utils', '@ember/test-helpers/settled', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/-is-form-control', '@ember/test-helpers/dom/focus', '@ember/test-helpers/dom/fire-event'], function (exports, _utils, _settled, _getElement, _isFormControl, _focus, _fireEvent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = typeIn;


  /**
   * Mimics character by character entry into the target `input` or `textarea` element.
   *
   * Allows for simulation of slow entry by passing an optional millisecond delay
   * between key events.
  
   * The major difference between `typeIn` and `fillIn` is that `typeIn` triggers
   * keyboard events as well as `input` and `change`.
   * Typically this looks like `focus` -> `focusin` -> `keydown` -> `keypress` -> `keyup` -> `input` -> `change`
   * per character of the passed text (this may vary on some browsers).
   *
   * @public
   * @param {string|Element} target the element or selector to enter text into
   * @param {string} text the test to fill the element with
   * @param {Object} options {delay: x} (default 50) number of milliseconds to wait per keypress
   * @return {Promise<void>} resolves when the application is settled
   */
  function typeIn(target, text) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { delay: 50 };

    return (0, _utils.nextTickPromise)().then(function () {
      if (!target) {
        throw new Error('Must pass an element or selector to `typeIn`.');
      }

      var element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error('Element not found when calling `typeIn(\'' + target + '\')`');
      }
      var isControl = (0, _isFormControl.default)(element);
      if (!isControl) {
        throw new Error('`typeIn` is only usable on form controls.');
      }

      if (typeof text === 'undefined' || text === null) {
        throw new Error('Must provide `text` when calling `typeIn`.');
      }

      (0, _focus.__focus__)(element);

      return fillOut(element, text, options.delay).then(function () {
        return (0, _fireEvent.default)(element, 'change');
      }).then(_settled.default);
    });
  }

  // eslint-disable-next-line require-jsdoc
  function fillOut(element, text, delay) {
    var inputFunctions = text.split('').map(function (character) {
      return keyEntry(element, character, delay);
    });
    return inputFunctions.reduce(function (currentPromise, func) {
      return currentPromise.then(function () {
        return delayedExecute(func, delay);
      });
    }, Ember.RSVP.Promise.resolve());
  }

  // eslint-disable-next-line require-jsdoc
  function keyEntry(element, character) {
    var charCode = character.charCodeAt();

    var eventOptions = {
      bubbles: true,
      cancellable: true,
      charCode: charCode
    };

    var keyEvents = {
      down: new KeyboardEvent('keydown', eventOptions),
      press: new KeyboardEvent('keypress', eventOptions),
      up: new KeyboardEvent('keyup', eventOptions)
    };

    return function () {
      element.dispatchEvent(keyEvents.down);
      element.dispatchEvent(keyEvents.press);
      element.value = element.value + character;
      (0, _fireEvent.default)(element, 'input');
      element.dispatchEvent(keyEvents.up);
    };
  }

  // eslint-disable-next-line require-jsdoc
  function delayedExecute(func, delay) {
    return new Ember.RSVP.Promise(function (resolve) {
      setTimeout(resolve, delay);
    }).then(func);
  }
});
define('@ember/test-helpers/dom/wait-for', ['exports', '@ember/test-helpers/wait-until', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/-get-elements', '@ember/test-helpers/dom/-to-array', '@ember/test-helpers/-utils'], function (exports, _waitUntil, _getElement, _getElements, _toArray, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = waitFor;


  /**
    Used to wait for a particular selector to appear in the DOM. Due to the fact
    that it does not wait for general settledness, this is quite useful for testing
    interim DOM states (e.g. loading states, pending promises, etc).
  
    @param {string} selector the selector to wait for
    @param {Object} [options] the options to be used
    @param {number} [options.timeout=1000] the time to wait (in ms) for a match
    @param {number} [options.count=null] the number of elements that should match the provided selector (null means one or more)
    @return {Promise<Element|Element[]>} resolves when the element(s) appear on the page
  */
  function waitFor(selector) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 1000 : _ref$timeout,
        _ref$count = _ref.count,
        count = _ref$count === undefined ? null : _ref$count,
        timeoutMessage = _ref.timeoutMessage;

    return (0, _utils.nextTickPromise)().then(function () {
      if (!selector) {
        throw new Error('Must pass a selector to `waitFor`.');
      }
      if (!timeoutMessage) {
        timeoutMessage = 'waitFor timed out waiting for selector "' + selector + '"';
      }

      var callback = void 0;
      if (count !== null) {
        callback = function callback() {
          var elements = (0, _getElements.default)(selector);
          if (elements.length === count) {
            return (0, _toArray.default)(elements);
          }
        };
      } else {
        callback = function callback() {
          return (0, _getElement.default)(selector);
        };
      }
      return (0, _waitUntil.default)(callback, { timeout: timeout, timeoutMessage: timeoutMessage });
    });
  }
});
define('@ember/test-helpers/global', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () {
    if (typeof self !== 'undefined') {
      return self;
    } else if (typeof window !== 'undefined') {
      return window;
    } else if (typeof global !== 'undefined') {
      return global;
    } else {
      return Function('return this')();
    }
  }();
});
define('@ember/test-helpers/has-ember-version', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = hasEmberVersion;


  /**
    Checks if the currently running Ember version is greater than or equal to the
    specified major and minor version numbers.
  
    @private
    @param {number} major the major version number to compare
    @param {number} minor the minor version number to compare
    @returns {boolean} true if the Ember version is >= MAJOR.MINOR specified, false otherwise
  */
  function hasEmberVersion(major, minor) {
    var numbers = Ember.VERSION.split('-')[0].split('.');
    var actualMajor = parseInt(numbers[0], 10);
    var actualMinor = parseInt(numbers[1], 10);
    return actualMajor > major || actualMajor === major && actualMinor >= minor;
  }
});
define('@ember/test-helpers/index', ['exports', '@ember/test-helpers/resolver', '@ember/test-helpers/application', '@ember/test-helpers/setup-context', '@ember/test-helpers/teardown-context', '@ember/test-helpers/setup-rendering-context', '@ember/test-helpers/teardown-rendering-context', '@ember/test-helpers/setup-application-context', '@ember/test-helpers/teardown-application-context', '@ember/test-helpers/settled', '@ember/test-helpers/wait-until', '@ember/test-helpers/validate-error-handler', '@ember/test-helpers/dom/click', '@ember/test-helpers/dom/double-click', '@ember/test-helpers/dom/tap', '@ember/test-helpers/dom/focus', '@ember/test-helpers/dom/blur', '@ember/test-helpers/dom/trigger-event', '@ember/test-helpers/dom/trigger-key-event', '@ember/test-helpers/dom/fill-in', '@ember/test-helpers/dom/wait-for', '@ember/test-helpers/dom/get-root-element', '@ember/test-helpers/dom/find', '@ember/test-helpers/dom/find-all', '@ember/test-helpers/dom/type-in'], function (exports, _resolver, _application, _setupContext, _teardownContext, _setupRenderingContext, _teardownRenderingContext, _setupApplicationContext, _teardownApplicationContext, _settled, _waitUntil, _validateErrorHandler, _click, _doubleClick, _tap, _focus, _blur, _triggerEvent, _triggerKeyEvent, _fillIn, _waitFor, _getRootElement, _find, _findAll, _typeIn) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'setResolver', {
    enumerable: true,
    get: function () {
      return _resolver.setResolver;
    }
  });
  Object.defineProperty(exports, 'getResolver', {
    enumerable: true,
    get: function () {
      return _resolver.getResolver;
    }
  });
  Object.defineProperty(exports, 'getApplication', {
    enumerable: true,
    get: function () {
      return _application.getApplication;
    }
  });
  Object.defineProperty(exports, 'setApplication', {
    enumerable: true,
    get: function () {
      return _application.setApplication;
    }
  });
  Object.defineProperty(exports, 'setupContext', {
    enumerable: true,
    get: function () {
      return _setupContext.default;
    }
  });
  Object.defineProperty(exports, 'getContext', {
    enumerable: true,
    get: function () {
      return _setupContext.getContext;
    }
  });
  Object.defineProperty(exports, 'setContext', {
    enumerable: true,
    get: function () {
      return _setupContext.setContext;
    }
  });
  Object.defineProperty(exports, 'unsetContext', {
    enumerable: true,
    get: function () {
      return _setupContext.unsetContext;
    }
  });
  Object.defineProperty(exports, 'pauseTest', {
    enumerable: true,
    get: function () {
      return _setupContext.pauseTest;
    }
  });
  Object.defineProperty(exports, 'resumeTest', {
    enumerable: true,
    get: function () {
      return _setupContext.resumeTest;
    }
  });
  Object.defineProperty(exports, 'teardownContext', {
    enumerable: true,
    get: function () {
      return _teardownContext.default;
    }
  });
  Object.defineProperty(exports, 'setupRenderingContext', {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.default;
    }
  });
  Object.defineProperty(exports, 'render', {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.render;
    }
  });
  Object.defineProperty(exports, 'clearRender', {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.clearRender;
    }
  });
  Object.defineProperty(exports, 'teardownRenderingContext', {
    enumerable: true,
    get: function () {
      return _teardownRenderingContext.default;
    }
  });
  Object.defineProperty(exports, 'setupApplicationContext', {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.default;
    }
  });
  Object.defineProperty(exports, 'visit', {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.visit;
    }
  });
  Object.defineProperty(exports, 'currentRouteName', {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.currentRouteName;
    }
  });
  Object.defineProperty(exports, 'currentURL', {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.currentURL;
    }
  });
  Object.defineProperty(exports, 'teardownApplicationContext', {
    enumerable: true,
    get: function () {
      return _teardownApplicationContext.default;
    }
  });
  Object.defineProperty(exports, 'settled', {
    enumerable: true,
    get: function () {
      return _settled.default;
    }
  });
  Object.defineProperty(exports, 'isSettled', {
    enumerable: true,
    get: function () {
      return _settled.isSettled;
    }
  });
  Object.defineProperty(exports, 'getSettledState', {
    enumerable: true,
    get: function () {
      return _settled.getSettledState;
    }
  });
  Object.defineProperty(exports, 'waitUntil', {
    enumerable: true,
    get: function () {
      return _waitUntil.default;
    }
  });
  Object.defineProperty(exports, 'validateErrorHandler', {
    enumerable: true,
    get: function () {
      return _validateErrorHandler.default;
    }
  });
  Object.defineProperty(exports, 'click', {
    enumerable: true,
    get: function () {
      return _click.default;
    }
  });
  Object.defineProperty(exports, 'doubleClick', {
    enumerable: true,
    get: function () {
      return _doubleClick.default;
    }
  });
  Object.defineProperty(exports, 'tap', {
    enumerable: true,
    get: function () {
      return _tap.default;
    }
  });
  Object.defineProperty(exports, 'focus', {
    enumerable: true,
    get: function () {
      return _focus.default;
    }
  });
  Object.defineProperty(exports, 'blur', {
    enumerable: true,
    get: function () {
      return _blur.default;
    }
  });
  Object.defineProperty(exports, 'triggerEvent', {
    enumerable: true,
    get: function () {
      return _triggerEvent.default;
    }
  });
  Object.defineProperty(exports, 'triggerKeyEvent', {
    enumerable: true,
    get: function () {
      return _triggerKeyEvent.default;
    }
  });
  Object.defineProperty(exports, 'fillIn', {
    enumerable: true,
    get: function () {
      return _fillIn.default;
    }
  });
  Object.defineProperty(exports, 'waitFor', {
    enumerable: true,
    get: function () {
      return _waitFor.default;
    }
  });
  Object.defineProperty(exports, 'getRootElement', {
    enumerable: true,
    get: function () {
      return _getRootElement.default;
    }
  });
  Object.defineProperty(exports, 'find', {
    enumerable: true,
    get: function () {
      return _find.default;
    }
  });
  Object.defineProperty(exports, 'findAll', {
    enumerable: true,
    get: function () {
      return _findAll.default;
    }
  });
  Object.defineProperty(exports, 'typeIn', {
    enumerable: true,
    get: function () {
      return _typeIn.default;
    }
  });
});
define("@ember/test-helpers/resolver", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setResolver = setResolver;
  exports.getResolver = getResolver;
  var __resolver__;

  /**
    Stores the provided resolver instance so that tests being ran can resolve
    objects in the same way as a normal application.
  
    Used by `setupContext` and `setupRenderingContext` as a fallback when `setApplication` was _not_ used.
  
    @public
    @param {Ember.Resolver} resolver the resolver to be used for testing
  */
  function setResolver(resolver) {
    __resolver__ = resolver;
  }

  /**
    Retrieve the resolver instance stored by `setResolver`.
  
    @public
    @returns {Ember.Resolver} the previously stored resolver
  */
  function getResolver() {
    return __resolver__;
  }
});
define('@ember/test-helpers/settled', ['exports', '@ember/test-helpers/-utils', '@ember/test-helpers/wait-until'], function (exports, _utils, _waitUntil) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._teardownAJAXHooks = _teardownAJAXHooks;
  exports._setupAJAXHooks = _setupAJAXHooks;
  exports.getSettledState = getSettledState;
  exports.isSettled = isSettled;
  exports.default = settled;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  // Ember internally tracks AJAX requests in the same way that we do here for
  // legacy style "acceptance" tests using the `ember-testing.js` asset provided
  // by emberjs/ember.js itself. When `@ember/test-helpers`'s `settled` utility
  // is used in a legacy acceptance test context any pending AJAX requests are
  // not properly considered during the `isSettled` check below.
  //
  // This utilizes a local utility method present in Ember since around 2.8.0 to
  // properly consider pending AJAX requests done within legacy acceptance tests.
  var _internalPendingRequests = function () {
    if (Ember.__loader.registry['ember-testing/test/pending_requests']) {
      // Ember <= 3.1
      return Ember.__loader.require('ember-testing/test/pending_requests').pendingRequests;
    } else if (Ember.__loader.registry['ember-testing/lib/test/pending_requests']) {
      // Ember >= 3.2
      return Ember.__loader.require('ember-testing/lib/test/pending_requests').pendingRequests;
    }

    return function () {
      return 0;
    };
  }();

  var requests = void 0;

  /**
    @private
    @returns {number} the count of pending requests
  */
  function pendingRequests() {
    var localRequestsPending = requests !== undefined ? requests.length : 0;
    var internalRequestsPending = _internalPendingRequests();

    return localRequestsPending + internalRequestsPending;
  }

  /**
    @private
    @param {Event} event (unused)
    @param {XMLHTTPRequest} xhr the XHR that has initiated a request
  */
  function incrementAjaxPendingRequests(event, xhr) {
    requests.push(xhr);
  }

  /**
    @private
    @param {Event} event (unused)
    @param {XMLHTTPRequest} xhr the XHR that has initiated a request
  */
  function decrementAjaxPendingRequests(event, xhr) {
    // In most Ember versions to date (current version is 2.16) RSVP promises are
    // configured to flush in the actions queue of the Ember run loop, however it
    // is possible that in the future this changes to use "true" micro-task
    // queues.
    //
    // The entire point here, is that _whenever_ promises are resolved will be
    // before the next run of the JS event loop. Then in the next event loop this
    // counter will decrement. In the specific case of AJAX, this means that any
    // promises chained off of `$.ajax` will properly have their `.then` called
    // _before_ this is decremented (and testing continues)
    (0, _utils.nextTick)(function () {
      for (var i = 0; i < requests.length; i++) {
        if (xhr === requests[i]) {
          requests.splice(i, 1);
        }
      }
    }, 0);
  }

  /**
    Clears listeners that were previously setup for `ajaxSend` and `ajaxComplete`.
  
    @private
  */
  function _teardownAJAXHooks() {
    // jQuery will not invoke `ajaxComplete` if
    //    1. `transport.send` throws synchronously and
    //    2. it has an `error` option which also throws synchronously

    // We can no longer handle any remaining requests
    requests = [];

    if (!Ember.$) {
      return;
    }

    Ember.$(document).off('ajaxSend', incrementAjaxPendingRequests);
    Ember.$(document).off('ajaxComplete', decrementAjaxPendingRequests);
  }

  /**
    Sets up listeners for `ajaxSend` and `ajaxComplete`.
  
    @private
  */
  function _setupAJAXHooks() {
    requests = [];

    if (!Ember.$) {
      return;
    }

    Ember.$(document).on('ajaxSend', incrementAjaxPendingRequests);
    Ember.$(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }

  var _internalCheckWaiters = void 0;
  if (Ember.__loader.registry['ember-testing/test/waiters']) {
    // Ember <= 3.1
    _internalCheckWaiters = Ember.__loader.require('ember-testing/test/waiters').checkWaiters;
  } else if (Ember.__loader.registry['ember-testing/lib/test/waiters']) {
    // Ember >= 3.2
    _internalCheckWaiters = Ember.__loader.require('ember-testing/lib/test/waiters').checkWaiters;
  }

  /**
    @private
    @returns {boolean} true if waiters are still pending
  */
  function checkWaiters() {
    if (_internalCheckWaiters) {
      return _internalCheckWaiters();
    } else if (Ember.Test.waiters) {
      if (Ember.Test.waiters.any(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            context = _ref2[0],
            callback = _ref2[1];

        return !callback.call(context);
      })) {
        return true;
      }
    }

    return false;
  }

  /**
    Check various settledness metrics, and return an object with the following properties:
  
    - `hasRunLoop` - Checks if a run-loop has been started. If it has, this will
      be `true` otherwise it will be `false`.
    - `hasPendingTimers` - Checks if there are scheduled timers in the run-loop.
      These pending timers are primarily registered by `Ember.run.schedule`. If
      there are pending timers, this will be `true`, otherwise `false`.
    - `hasPendingWaiters` - Checks if any registered test waiters are still
      pending (e.g. the waiter returns `true`). If there are pending waiters,
      this will be `true`, otherwise `false`.
    - `hasPendingRequests` - Checks if there are pending AJAX requests (based on
      `ajaxSend` / `ajaxComplete` events triggered by `jQuery.ajax`). If there
      are pending requests, this will be `true`, otherwise `false`.
    - `pendingRequestCount` - The count of pending AJAX requests.
  
    @public
    @returns {Object} object with properties for each of the metrics used to determine settledness
  */
  function getSettledState() {
    var pendingRequestCount = pendingRequests();

    return {
      hasPendingTimers: Boolean(Ember.run.hasScheduledTimers()),
      hasRunLoop: Boolean(Ember.run.currentRunLoop),
      hasPendingWaiters: checkWaiters(),
      hasPendingRequests: pendingRequestCount > 0,
      pendingRequestCount: pendingRequestCount
    };
  }

  /**
    Checks various settledness metrics (via `getSettledState()`) to determine if things are settled or not.
  
    Settled generally means that there are no pending timers, no pending waiters,
    no pending AJAX requests, and no current run loop. However, new settledness
    metrics may be added and used as they become available.
  
    @public
    @returns {boolean} `true` if settled, `false` otherwise
  */
  function isSettled() {
    var _getSettledState = getSettledState(),
        hasPendingTimers = _getSettledState.hasPendingTimers,
        hasRunLoop = _getSettledState.hasRunLoop,
        hasPendingRequests = _getSettledState.hasPendingRequests,
        hasPendingWaiters = _getSettledState.hasPendingWaiters;

    if (hasPendingTimers || hasRunLoop || hasPendingRequests || hasPendingWaiters) {
      return false;
    }

    return true;
  }

  /**
    Returns a promise that resolves when in a settled state (see `isSettled` for
    a definition of "settled state").
  
    @public
    @returns {Promise<void>} resolves when settled
  */
  function settled() {
    return (0, _waitUntil.default)(isSettled, { timeout: Infinity });
  }
});
define('@ember/test-helpers/setup-application-context', ['exports', '@ember/test-helpers/-utils', '@ember/test-helpers/setup-context', '@ember/test-helpers/has-ember-version', '@ember/test-helpers/settled'], function (exports, _utils, _setupContext, _hasEmberVersion, _settled) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.visit = visit;
  exports.currentRouteName = currentRouteName;
  exports.currentURL = currentURL;
  exports.default = setupApplicationContext;


  /**
    Navigate the application to the provided URL.
  
    @public
    @returns {Promise<void>} resolves when settled
  */
  function visit() {
    var _arguments = arguments;

    var context = (0, _setupContext.getContext)();
    var owner = context.owner;


    return (0, _utils.nextTickPromise)().then(function () {
      return owner.visit.apply(owner, _arguments);
    }).then(function () {
      if (EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        context.element = document.querySelector('#ember-testing > .ember-view');
      } else {
        context.element = document.querySelector('#ember-testing');
      }
    }).then(_settled.default);
  }

  /**
    @public
    @returns {string} the currently active route name
  */
  function currentRouteName() {
    var _getContext = (0, _setupContext.getContext)(),
        owner = _getContext.owner;

    var router = owner.lookup('router:main');
    return Ember.get(router, 'currentRouteName');
  }

  var HAS_CURRENT_URL_ON_ROUTER = (0, _hasEmberVersion.default)(2, 13);

  /**
    @public
    @returns {string} the applications current url
  */
  function currentURL() {
    var _getContext2 = (0, _setupContext.getContext)(),
        owner = _getContext2.owner;

    var router = owner.lookup('router:main');

    if (HAS_CURRENT_URL_ON_ROUTER) {
      return Ember.get(router, 'currentURL');
    } else {
      return Ember.get(router, 'location').getURL();
    }
  }

  /**
    Used by test framework addons to setup the provided context for working with
    an application (e.g. routing).
  
    `setupContext` must have been run on the provided context prior to calling
    `setupApplicationContext`.
  
    Sets up the basic framework used by application tests.
  
    @public
    @param {Object} context the context to setup
    @returns {Promise<Object>} resolves with the context that was setup
  */
  function setupApplicationContext() {
    return (0, _utils.nextTickPromise)();
  }
});
define('@ember/test-helpers/setup-context', ['exports', '@ember/test-helpers/build-owner', '@ember/test-helpers/settled', '@ember/test-helpers/global', '@ember/test-helpers/resolver', '@ember/test-helpers/application', '@ember/test-helpers/-utils'], function (exports, _buildOwner, _settled, _global, _resolver, _application, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CLEANUP = undefined;
  exports.setContext = setContext;
  exports.getContext = getContext;
  exports.unsetContext = unsetContext;
  exports.pauseTest = pauseTest;
  exports.resumeTest = resumeTest;

  exports.default = function (context) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    Ember.testing = true;
    setContext(context);

    var contextGuid = Ember.guidFor(context);
    CLEANUP[contextGuid] = [];

    return (0, _utils.nextTickPromise)().then(function () {
      var application = (0, _application.getApplication)();
      if (application) {
        return application.boot();
      }
    }).then(function () {
      var testElementContainer = document.getElementById('ember-testing-container');
      var fixtureResetValue = testElementContainer.innerHTML;

      // push this into the final cleanup bucket, to be ran _after_ the owner
      // is destroyed and settled (e.g. flushed run loops, etc)
      CLEANUP[contextGuid].push(function () {
        testElementContainer.innerHTML = fixtureResetValue;
      });

      var resolver = options.resolver;

      // This handles precendence, specifying a specific option of
      // resolver always trumps whatever is auto-detected, then we fallback to
      // the suite-wide registrations
      //
      // At some later time this can be extended to support specifying a custom
      // engine or application...

      if (resolver) {
        return (0, _buildOwner.default)(null, resolver);
      }

      return (0, _buildOwner.default)((0, _application.getApplication)(), (0, _resolver.getResolver)());
    }).then(function (owner) {
      Object.defineProperty(context, 'owner', {
        configurable: true,
        enumerable: true,
        value: owner,
        writable: false
      });

      Object.defineProperty(context, 'set', {
        configurable: true,
        enumerable: true,
        value: function value(key, _value) {
          var ret = Ember.run(function () {
            return Ember.set(context, key, _value);
          });

          return ret;
        },

        writable: false
      });

      Object.defineProperty(context, 'setProperties', {
        configurable: true,
        enumerable: true,
        value: function value(hash) {
          var ret = Ember.run(function () {
            return Ember.setProperties(context, hash);
          });

          return ret;
        },

        writable: false
      });

      Object.defineProperty(context, 'get', {
        configurable: true,
        enumerable: true,
        value: function value(key) {
          return Ember.get(context, key);
        },

        writable: false
      });

      Object.defineProperty(context, 'getProperties', {
        configurable: true,
        enumerable: true,
        value: function value() {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return Ember.getProperties(context, args);
        },

        writable: false
      });

      var resume = void 0;
      context.resumeTest = function resumeTest() {
        (true && !(resume) && Ember.assert('Testing has not been paused. There is nothing to resume.', resume));

        resume();
        _global.default.resumeTest = resume = undefined;
      };

      context.pauseTest = function pauseTest() {
        console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

        return new Ember.RSVP.Promise(function (resolve) {
          resume = resolve;
          _global.default.resumeTest = resumeTest;
        }, 'TestAdapter paused promise');
      };

      (0, _settled._setupAJAXHooks)();

      return context;
    });
  };

  var __test_context__ = void 0;

  /**
    Stores the provided context as the "global testing context".
  
    Generally setup automatically by `setupContext`.
  
    @public
    @param {Object} context the context to use
  */
  function setContext(context) {
    __test_context__ = context;
  }

  /**
    Retrive the "global testing context" as stored by `setContext`.
  
    @public
    @returns {Object} the previously stored testing context
  */
  function getContext() {
    return __test_context__;
  }

  /**
    Clear the "global testing context".
  
    Generally invoked from `teardownContext`.
  
    @public
  */
  function unsetContext() {
    __test_context__ = undefined;
  }

  /**
   * Returns a promise to be used to pauses the current test (due to being
   * returned from the test itself).  This is useful for debugging while testing
   * or for test-driving.  It allows you to inspect the state of your application
   * at any point.
   *
   * The test framework wrapper (e.g. `ember-qunit` or `ember-mocha`) should
   * ensure that when `pauseTest()` is used, any framework specific test timeouts
   * are disabled.
   *
   * @public
   * @returns {Promise<void>} resolves _only_ when `resumeTest()` is invoked
   * @example <caption>Usage via ember-qunit</caption>
   *
   * import { setupRenderingTest } from 'ember-qunit';
   * import { render, click, pauseTest } from '@ember/test-helpers';
   *
   *
   * module('awesome-sauce', function(hooks) {
   *   setupRenderingTest(hooks);
   *
   *   test('does something awesome', async function(assert) {
   *     await render(hbs`{{awesome-sauce}}`);
   *
   *     // added here to visualize / interact with the DOM prior
   *     // to the interaction below
   *     await pauseTest();
   *
   *     click('.some-selector');
   *
   *     assert.equal(this.element.textContent, 'this sauce is awesome!');
   *   });
   * });
   */
  function pauseTest() {
    var context = getContext();

    if (!context || typeof context.pauseTest !== 'function') {
      throw new Error('Cannot call `pauseTest` without having first called `setupTest` or `setupRenderingTest`.');
    }

    return context.pauseTest();
  }

  /**
    Resumes a test previously paused by `await pauseTest()`.
  
    @public
  */
  function resumeTest() {
    var context = getContext();

    if (!context || typeof context.resumeTest !== 'function') {
      throw new Error('Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.');
    }

    context.resumeTest();
  }

  var CLEANUP = exports.CLEANUP = Object.create(null);

  /**
    Used by test framework addons to setup the provided context for testing.
  
    Responsible for:
  
    - sets the "global testing context" to the provided context (`setContext`)
    - create an owner object and set it on the provided context (e.g. `this.owner`)
    - setup `this.set`, `this.setProperties`, `this.get`, and `this.getProperties` to the provided context
    - setting up AJAX listeners
    - setting up `pauseTest` (also available as `this.pauseTest()`) and `resumeTest` helpers
  
    @public
    @param {Object} context the context to setup
    @param {Object} [options] options used to override defaults
    @param {Resolver} [options.resolver] a resolver to use for customizing normal resolution
    @returns {Promise<Object>} resolves with the context that was setup
  */
});
define('@ember/test-helpers/setup-rendering-context', ['exports', '@ember/test-helpers/global', '@ember/test-helpers/setup-context', '@ember/test-helpers/-utils', '@ember/test-helpers/settled', '@ember/test-helpers/dom/get-root-element'], function (exports, _global, _setupContext, _utils, _settled, _getRootElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RENDERING_CLEANUP = undefined;
  exports.render = render;
  exports.clearRender = clearRender;
  exports.default = setupRenderingContext;
  var RENDERING_CLEANUP = exports.RENDERING_CLEANUP = Object.create(null);
  var OUTLET_TEMPLATE = Ember.HTMLBars.template({
    "id": "gc40spmP",
    "block": "{\"symbols\":[],\"statements\":[[1,[18,\"outlet\"],false]],\"hasEval\":false}",
    "meta": {}
  });
  var EMPTY_TEMPLATE = Ember.HTMLBars.template({
    "id": "xOcW61lH",
    "block": "{\"symbols\":[],\"statements\":[],\"hasEval\":false}",
    "meta": {}
  });

  /**
    @private
    @param {Ember.ApplicationInstance} owner the current owner instance
    @returns {Template} a template representing {{outlet}}
  */
  function lookupOutletTemplate(owner) {
    var OutletTemplate = owner.lookup('template:-outlet');
    if (!OutletTemplate) {
      owner.register('template:-outlet', OUTLET_TEMPLATE);
      OutletTemplate = owner.lookup('template:-outlet');
    }

    return OutletTemplate;
  }

  /**
    @private
    @param {string} [selector] the selector to search for relative to element
    @returns {jQuery} a jQuery object representing the selector (or element itself if no selector)
  */
  function jQuerySelector(selector) {
    var _getContext = (0, _setupContext.getContext)(),
        element = _getContext.element;

    // emulates Ember internal behavor of `this.$` in a component
    // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
    return selector ? _global.default.jQuery(selector, element) : _global.default.jQuery(element);
  }

  var templateId = 0;
  /**
    Renders the provided template and appends it to the DOM.
  
    @public
    @param {CompiledTemplate} template the template to render
    @returns {Promise<void>} resolves when settled
  */
  function render(template) {
    var context = (0, _setupContext.getContext)();

    if (!template) {
      throw new Error('you must pass a template to `render()`');
    }

    return (0, _utils.nextTickPromise)().then(function () {
      var owner = context.owner;


      var toplevelView = owner.lookup('-top-level-view:main');
      var OutletTemplate = lookupOutletTemplate(owner);
      templateId += 1;
      var templateFullName = 'template:-undertest-' + templateId;
      owner.register(templateFullName, template);

      var outletState = {
        render: {
          owner: owner,
          into: undefined,
          outlet: 'main',
          name: 'application',
          controller: undefined,
          ViewClass: undefined,
          template: OutletTemplate
        },

        outlets: {
          main: {
            render: {
              owner: owner,
              into: undefined,
              outlet: 'main',
              name: 'index',
              controller: context,
              ViewClass: undefined,
              template: owner.lookup(templateFullName),
              outlets: {}
            },
            outlets: {}
          }
        }
      };
      toplevelView.setOutletState(outletState);

      // returning settled here because the actual rendering does not happen until
      // the renderer detects it is dirty (which happens on backburner's end
      // hook), see the following implementation details:
      //
      // * [view:outlet](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/views/outlet.js#L129-L145) manually dirties its own tag upon `setOutletState`
      // * [backburner's custom end hook](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/renderer.js#L145-L159) detects that the current revision of the root is no longer the latest, and triggers a new rendering transaction
      return (0, _settled.default)();
    });
  }

  /**
    Clears any templates previously rendered. This is commonly used for
    confirming behavior that is triggered by teardown (e.g.
    `willDestroyElement`).
  
    @public
    @returns {Promise<void>} resolves when settled
  */
  function clearRender() {
    var context = (0, _setupContext.getContext)();

    if (!context || typeof context.clearRender !== 'function') {
      throw new Error('Cannot call `clearRender` without having first called `setupRenderingContext`.');
    }

    return render(EMPTY_TEMPLATE);
  }

  /**
    Used by test framework addons to setup the provided context for rendering.
  
    `setupContext` must have been ran on the provided context
    prior to calling `setupRenderingContext`.
  
    Responsible for:
  
    - Setup the basic framework used for rendering by the
      `render` helper.
    - Ensuring the event dispatcher is properly setup.
    - Setting `this.element` to the root element of the testing
      container (things rendered via `render` will go _into_ this
      element).
  
    @public
    @param {Object} context the context to setup for rendering
    @returns {Promise<Object>} resolves with the context that was setup
  */
  function setupRenderingContext(context) {
    var contextGuid = Ember.guidFor(context);
    RENDERING_CLEANUP[contextGuid] = [];

    return (0, _utils.nextTickPromise)().then(function () {
      var owner = context.owner;


      // these methods being placed on the context itself will be deprecated in
      // a future version (no giant rush) to remove some confusion about which
      // is the "right" way to things...
      Object.defineProperty(context, 'render', {
        configurable: true,
        enumerable: true,
        value: render,
        writable: false
      });
      Object.defineProperty(context, 'clearRender', {
        configurable: true,
        enumerable: true,
        value: clearRender,
        writable: false
      });

      if (_global.default.jQuery) {
        Object.defineProperty(context, '$', {
          configurable: true,
          enumerable: true,
          value: jQuerySelector,
          writable: false
        });
      }

      // When the host app uses `setApplication` (instead of `setResolver`) the event dispatcher has
      // already been setup via `applicationInstance.boot()` in `./build-owner`. If using
      // `setResolver` (instead of `setApplication`) a "mock owner" is created by extending
      // `Ember._ContainerProxyMixin` and `Ember._RegistryProxyMixin` in this scenario we need to
      // manually start the event dispatcher.
      if (owner._emberTestHelpersMockOwner) {
        var dispatcher = owner.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
        dispatcher.setup({}, '#ember-testing');
      }

      var OutletView = owner.factoryFor ? owner.factoryFor('view:-outlet') : owner._lookupFactory('view:-outlet');
      var toplevelView = OutletView.create();

      owner.register('-top-level-view:main', {
        create: function create() {
          return toplevelView;
        }
      });

      // initially render a simple empty template
      return render(EMPTY_TEMPLATE).then(function () {
        Ember.run(toplevelView, 'appendTo', (0, _getRootElement.default)());

        return (0, _settled.default)();
      });
    }).then(function () {
      Object.defineProperty(context, 'element', {
        configurable: true,
        enumerable: true,
        // ensure the element is based on the wrapping toplevel view
        // Ember still wraps the main application template with a
        // normal tagged view
        //
        // In older Ember versions (2.4) the element itself is not stable,
        // and therefore we cannot update the `this.element` until after the
        // rendering is completed
        value: EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false ? (0, _getRootElement.default)().querySelector('.ember-view') : (0, _getRootElement.default)(),

        writable: false
      });

      return context;
    });
  }
});
define('@ember/test-helpers/teardown-application-context', ['exports', '@ember/test-helpers/settled'], function (exports, _settled) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () {
    return (0, _settled.default)();
  };
});
define('@ember/test-helpers/teardown-context', ['exports', '@ember/test-helpers/settled', '@ember/test-helpers/setup-context', '@ember/test-helpers/-utils'], function (exports, _settled, _setupContext, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = teardownContext;


  /**
    Used by test framework addons to tear down the provided context after testing is completed.
  
    Responsible for:
  
    - un-setting the "global testing context" (`unsetContext`)
    - destroy the contexts owner object
    - remove AJAX listeners
  
    @public
    @param {Object} context the context to setup
    @returns {Promise<void>} resolves when settled
  */
  function teardownContext(context) {
    return (0, _utils.nextTickPromise)().then(function () {
      var owner = context.owner;


      (0, _settled._teardownAJAXHooks)();

      Ember.run(owner, 'destroy');
      Ember.testing = false;

      (0, _setupContext.unsetContext)();

      return (0, _settled.default)();
    }).finally(function () {
      var contextGuid = Ember.guidFor(context);

      (0, _utils.runDestroyablesFor)(_setupContext.CLEANUP, contextGuid);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/teardown-rendering-context', ['exports', '@ember/test-helpers/setup-rendering-context', '@ember/test-helpers/-utils', '@ember/test-helpers/settled'], function (exports, _setupRenderingContext, _utils, _settled) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = teardownRenderingContext;


  /**
    Used by test framework addons to tear down the provided context after testing is completed.
  
    Responsible for:
  
    - resetting the `ember-testing-container` to its original state (the value
      when `setupRenderingContext` was called).
  
    @public
    @param {Object} context the context to setup
    @returns {Promise<void>} resolves when settled
  */
  function teardownRenderingContext(context) {
    return (0, _utils.nextTickPromise)().then(function () {
      var contextGuid = Ember.guidFor(context);

      (0, _utils.runDestroyablesFor)(_setupRenderingContext.RENDERING_CLEANUP, contextGuid);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/validate-error-handler', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = validateErrorHandler;

  var VALID = Object.freeze({ isValid: true, message: null });
  var INVALID = Object.freeze({
    isValid: false,
    message: 'error handler should have re-thrown the provided error'
  });

  /**
   * Validate the provided error handler to confirm that it properly re-throws
   * errors when `Ember.testing` is true.
   *
   * This is intended to be used by test framework hosts (or other libraries) to
   * ensure that `Ember.onerror` is properly configured. Without a check like
   * this, `Ember.onerror` could _easily_ swallow all errors and make it _seem_
   * like everything is just fine (and have green tests) when in reality
   * everything is on fire...
   *
   * @public
   * @param {Function} [callback=Ember.onerror] the callback to validate
   * @returns {Object} object with `isValid` and `message`
   *
   * @example <caption>Example implementation for `ember-qunit`</caption>
   *
   * import { validateErrorHandler } from '@ember/test-helpers';
   *
   * test('Ember.onerror is functioning properly', function(assert) {
   *   let result = validateErrorHandler();
   *   assert.ok(result.isValid, result.message);
   * });
   */
  function validateErrorHandler() {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Ember.onerror;

    if (callback === undefined || callback === null) {
      return VALID;
    }

    var error = new Error('Error handler validation error!');

    var originalEmberTesting = Ember.testing;
    Ember.testing = true;
    try {
      callback(error);
    } catch (e) {
      if (e === error) {
        return VALID;
      }
    } finally {
      Ember.testing = originalEmberTesting;
    }

    return INVALID;
  }
});
define('@ember/test-helpers/wait-until', ['exports', '@ember/test-helpers/-utils'], function (exports, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = waitUntil;


  var TIMEOUTS = [0, 1, 2, 5, 7];
  var MAX_TIMEOUT = 10;

  /**
    Wait for the provided callback to return a truthy value.
  
    This does not leverage `settled()`, and as such can be used to manage async
    while _not_ settled (e.g. "loading" or "pending" states).
  
    @public
    @param {Function} callback the callback to use for testing when waiting should stop
    @param {Object} [options] options used to override defaults
    @param {number} [options.timeout=1000] the maximum amount of time to wait
    @param {string} [options.timeoutMessage='waitUntil timed out'] the message to use in the reject on timeout
    @returns {Promise} resolves with the callback value when it returns a truthy value
  */
  function waitUntil(callback) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var timeout = 'timeout' in options ? options.timeout : 1000;
    var timeoutMessage = 'timeoutMessage' in options ? options.timeoutMessage : 'waitUntil timed out';

    // creating this error eagerly so it has the proper invocation stack
    var waitUntilTimedOut = new Error(timeoutMessage);

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var time = 0;

      // eslint-disable-next-line require-jsdoc
      function scheduleCheck(timeoutsIndex) {
        var interval = TIMEOUTS[timeoutsIndex];
        if (interval === undefined) {
          interval = MAX_TIMEOUT;
        }

        (0, _utils.futureTick)(function () {
          time += interval;

          var value = void 0;
          try {
            value = callback();
          } catch (error) {
            reject(error);
          }

          if (value) {
            resolve(value);
          } else if (time < timeout) {
            scheduleCheck(timeoutsIndex + 1);
          } else {
            reject(waitUntilTimedOut);
          }
        }, interval);
      }

      scheduleCheck(0);
    });
  }
});
define("ember-basic-dropdown/test-support/helpers", ["exports", "@ember/test-helpers"], function (_exports, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.nativeTap = nativeTap;
  _exports.clickTrigger = clickTrigger;
  _exports.tapTrigger = tapTrigger;
  _exports.fireKeydown = fireKeydown;
  _exports.default = _default;

  function nativeTap(selector) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var touchStartEvent = new window.Event('touchstart', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    Object.keys(options).forEach(function (key) {
      return touchStartEvent[key] = options[key];
    });
    Ember.run(function () {
      return document.querySelector(selector).dispatchEvent(touchStartEvent);
    });
    var touchEndEvent = new window.Event('touchend', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    Object.keys(options).forEach(function (key) {
      return touchEndEvent[key] = options[key];
    });
    Ember.run(function () {
      return document.querySelector(selector).dispatchEvent(touchEndEvent);
    });
  }

  function clickTrigger(scope) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var selector = '.ember-basic-dropdown-trigger';

    if (scope) {
      var element = document.querySelector(scope);

      if (element.classList.contains('ember-basic-dropdown-trigger')) {
        selector = scope;
      } else {
        selector = scope + ' ' + selector;
      }
    }

    (0, _testHelpers.click)(selector, options);
    return (0, _testHelpers.settled)();
  }

  function tapTrigger(scope) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var selector = '.ember-basic-dropdown-trigger';

    if (scope) {
      selector = scope + ' ' + selector;
    }

    nativeTap(selector, options);
  }

  function fireKeydown(selector, k) {
    var oEvent = document.createEvent('Events');
    oEvent.initEvent('keydown', true, true);
    Ember.merge(oEvent, {
      view: window,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      keyCode: k,
      charCode: k
    });
    Ember.run(function () {
      return document.querySelector(selector).dispatchEvent(oEvent);
    });
  } // acceptance helpers


  function _default() {
    Ember.Test.registerAsyncHelper('clickDropdown', function (app, cssPath) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      (true && !(false) && Ember.deprecate('Using the global `clickDropdown` acceptance helper from ember-basic-dropdown is deprecated. Please, explicitly import the `clickTrigger` or just use `click` helper from `@ember/test-helpers`.', false, {
        until: '1.0.0',
        id: 'ember-basic-dropdown-click-dropdown'
      }));
      clickTrigger(cssPath, options);
    });
    Ember.Test.registerAsyncHelper('tapDropdown', function (app, cssPath) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      (true && !(false) && Ember.deprecate('Using the global `tapDropdown` acceptance helper from ember-basic-dropdown is deprecated. Please, explicitly import the `tapTrigger` or just use `tap` helper from `@ember/test-helpers`.', false, {
        until: '1.0.0',
        id: 'ember-basic-dropdown-click-dropdown'
      }));
      tapTrigger(cssPath, options);
    });
  }
});
define("ember-cli-clipboard/test-support/index", ["exports", "@ember/test-helpers"], function (_exports, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.triggerCopySuccess = triggerCopySuccess;
  _exports.triggerCopyError = triggerCopyError;
  _exports._fireComponentAction = _fireComponentAction;

  /**
   * Fires `success` action for an instance of a copy-button component
   * @function triggerCopySuccess
   * @param {String} selector - css selector of the copy-button instance
   * @returns {Void}
   */
  function triggerCopySuccess(selector) {
    var _getContext = (0, _testHelpers.getContext)(),
        owner = _getContext.owner;

    _fireComponentAction(owner, selector, 'success');
  }
  /**
   * Fires `error` action for an instance of a copy-button component
   * @function triggerCopyError
   * @param {String} selector - css selector of the copy-button instance
   * @returns {Void}
   */


  function triggerCopyError(selector) {
    var _getContext2 = (0, _testHelpers.getContext)(),
        owner = _getContext2.owner;

    _fireComponentAction(owner, selector, 'error');
  }
  /**
   * Fires named action for an instance of a copy-button component
   * @function _fireComponentAction
   * @param {Object} owner - an owner object
   * @param {String} selector - css selector of the copy-button instance
   * @param {String} actionName - name of action
   * @returns {Void}
   */


  function _fireComponentAction(owner, selector, actionName) {
    var component = _getComponentBySelector(owner, selector);

    _fireActionByName(component, actionName);
  }
  /**
   * Fetches component reference for a given context and selector
   * @function getComponentBySelector
   * @param {Object} owner - an owner object
   * @param {String} [selector='.copy-btn'] - css selector of the copy-button instance
   * @returns {Ember.Component} component object
   */


  function _getComponentBySelector(owner) {
    var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.copy-btn';
    var emberId = document.querySelector(selector).getAttribute('id');
    return owner.lookup('-view-registry:main')[emberId];
  }
  /**
   * Fires a component's action given an action name
   * @function fireActionByName
   * @param {Ember.Component} component - component to fire action from
   * @param {String} actionName - name of action
   * @returns {Void}
   */


  function _fireActionByName(component, actionName) {
    var action = component[actionName];
    Ember.run(function () {
      if (typeof action === 'string') {
        component.sendAction(action);
      } else {
        action();
      }
    });
  }
});
define("ember-cli-mirage/test-support/index", ["exports", "ember-cli-mirage/test-support/setup-mirage"], function (_exports, _setupMirage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "setupMirage", {
    enumerable: true,
    get: function get() {
      return _setupMirage.default;
    }
  });
});
define("ember-cli-mirage/test-support/setup-mirage", ["exports", "ember-cli-mirage/start-mirage", "@ember/test-helpers"], function (_exports, _startMirage, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = setupMirage;

  /**
    Used to set up mirage for a test. Must be called after one of the
    `ember-qunit` `setup*Test()` methods. It starts the server and sets
    `this.server` to point to it, and shuts the server down when the test
    finishes.
  
    NOTE: the `hooks = self` is for mocha support
    @hide
  */
  function setupMirage() {
    var hooks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self;
    hooks.beforeEach(function () {
      if (!this.owner) {
        throw new Error('You must call one of the ember-qunit setupTest(),' + ' setupRenderingTest() or setupApplicationTest() methods before' + ' calling setupMirage()');
      }

      this.server = (0, _startMirage.default)(this.owner);
    });
    hooks.afterEach(function () {
      var _this = this;

      return (0, _testHelpers.settled)().then(function () {
        if (_this.server) {
          _this.server.shutdown();

          delete _this.server;
        }
      });
    });
  }
});
define('ember-cli-page-object/-private/execution_context', ['exports', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_execution_context).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _execution_context[key];
      }
    });
  });
});
define('ember-cli-page-object/extend', ['exports', 'ember-cli-page-object/test-support/extend'], function (exports, _extend) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_extend).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _extend[key];
      }
    });
  });
});
define('ember-cli-page-object/index', ['exports', 'ember-cli-page-object/test-support/index'], function (exports, _index) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_index).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _index[key];
      }
    });
  });
});
define('ember-cli-page-object/macros', ['exports', 'ember-cli-page-object/test-support/macros'], function (exports, _macros) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_macros).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _macros[key];
      }
    });
  });
});
define('ember-cli-page-object/test-support/-private/action', ['exports', 'ember-cli-page-object/test-support/-private/execution_context', 'ember-cli-page-object/test-support/-private/helpers', 'ceibo'], function (exports, _execution_context, _helpers, _ceibo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.run = run;
  exports.chainable = chainable;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  /**
   * Run action
   *
   * @param {Ceibo} node Page object node to run action on
   * @param {Function} cb Some async activity callback
   * @returns {Ceibo}
   */
  function run(node, cb) {
    var adapter = (0, _execution_context.getExecutionContext)(node);
    var chainedRoot = (0, _helpers.getRoot)(node)._chainedTree;

    if (typeof adapter.andThen === 'function') {
      // With old ember-testing helpers, we don't make the difference between
      // chanined VS independent action invocations. Awaiting for the previous
      // action settlement, before invoke a new action, is a part of
      // the legacy testing helpers adapters for backward compat reasons
      chainedRoot._promise = adapter.andThen(cb);

      return node;
    } else if (!chainedRoot) {
      // Our root is already the root of the chained tree,
      // we need to wait on its promise if it has one so the
      // previous invocations can resolve before we run ours.
      var root = (0, _helpers.getRoot)(node);
      root._promise = Ember.RSVP.resolve(root._promise).then(function () {
        return cb(adapter);
      });

      return node;
    } else {
      // Store our invocation result on the chained root
      // so that chained calls can find it to wait on it.
      chainedRoot._promise = cb(adapter);

      return chainable(node);
    }
  }

  function chainable(branch) {
    if (isChainedNode(branch)) {
      return branch;
    }

    // See explanation in `create.js` -- here instead of returning the node on
    // which our method was invoked, we find and return our node's mirror in the
    // chained tree so calls to it can be recognized as chained calls, and
    // trigger the chained-call waiting behavior.

    // Collecting node keys to build a path to our node, and then use that
    // to walk back down the chained tree to our mirror node.
    var path = [];
    var node = void 0;

    for (node = branch; node; node = _ceibo.default.parent(node)) {
      path.unshift(_ceibo.default.meta(node).key);
    }
    // The path will end with the root's key, 'root', so shift that back off
    path.shift();

    node = (0, _helpers.getRoot)(branch)._chainedTree;
    path.forEach(function (key) {
      node = getChildNode(node, key);
    });

    return node;
  }

  function isChainedNode(node) {
    var root = (0, _helpers.getRoot)(node);

    return !root._chainedTree;
  }

  function getChildNode(node, key) {
    // Normally an item's key is just its property name, but collection
    // items' keys also include their index. Collection item keys look like
    // `foo[2]` and legacy collection item keys look like `foo(2)`.
    var match = void 0;
    if (match = /\[(\d+)\]$/.exec(key)) {
      var _match = match,
          _match2 = _slicedToArray(_match, 2),
          indexStr = _match2[0],
          index = _match2[1];

      var name = key.slice(0, -indexStr.length);

      return node[name].objectAt(parseInt(index, 10));
    } else if (match = /\((\d+)\)$/.exec(key)) {
      var _match3 = match,
          _match4 = _slicedToArray(_match3, 2),
          _indexStr = _match4[0],
          _index = _match4[1];

      var _name = key.slice(0, -_indexStr.length);

      return node[_name](parseInt(_index, 10));
    } else {
      return node[key];
    }
  }
});
define('ember-cli-page-object/test-support/-private/better-errors', ['exports', 'ceibo'], function (exports, _ceibo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ELEMENT_NOT_FOUND = undefined;
  exports.throwBetterError = throwBetterError;
  var ELEMENT_NOT_FOUND = exports.ELEMENT_NOT_FOUND = 'Element not found.';

  /**
   * Throws an error with a descriptive message.
   *
   * @param {Ceibo} node              PageObject node containing the property that triggered the error
   * @param {string} key              Key of PageObject property tht triggered the error
   * @param {string} msg              Error message
   * @param {Object} options
   * @param {string} options.selector Selector of element targeted by PageObject property
   * @return {Ember.Error}
   */
  function throwBetterError(node, key, msg) {
    var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
        selector = _ref.selector;

    var path = [key];
    var current = void 0;

    for (current = node; current; current = _ceibo.default.parent(current)) {
      path.unshift(_ceibo.default.meta(current).key);
    }

    path[0] = 'page';

    var fullErrorMessage = msg + '\n\nPageObject: \'' + path.join('.') + '\'';

    if (selector) {
      fullErrorMessage = fullErrorMessage + '\n  Selector: \'' + selector + '\'';
    }

    console.error(fullErrorMessage);
    throw new Ember.Error(fullErrorMessage);
  }
});
define('ember-cli-page-object/test-support/-private/compatibility', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getContext = getContext;
  exports.getRootElement = getRootElement;
  exports.visit = visit;
  exports.click = click;
  exports.fillIn = fillIn;
  exports.triggerEvent = triggerEvent;
  exports.triggerKeyEvent = triggerKeyEvent;
  exports.focus = focus;
  exports.blur = blur;
  var _window = window,
      _require3 = _window.require;


  var helpers = void 0;
  var waitFn = void 0;

  if (_require3.has('@ember/test-helpers')) {
    helpers = _require3('@ember/test-helpers');
  } else {
    helpers = {
      getContext: function getContext() {
        return null;
      }
    };
  }

  if (_require3.has('ember-test-helpers/wait')) {
    // This is implemented as a function that calls `ember-test-helpers/wait`
    // rather than just assigning `helpers.wait = require(...).default` because
    // since this code executes while modules are initially loading, under certain
    // conditions `ember-test-helpers/wait` can still be in the pending state
    // at this point, so its exports are still undefined.
    waitFn = function waitFn() {
      var _require;

      return (_require = _require3('ember-test-helpers/wait')).default.apply(_require, arguments);
    };
  } else if (_require3.has('@ember/test-helpers')) {
    var _require2 = _require3('@ember/test-helpers'),
        _wait = _require2.wait,
        settled = _require2.settled;

    if (settled) {
      waitFn = function waitFn() {
        return settled.apply(undefined, arguments);
      };
    } else if (_wait) {
      waitFn = function waitFn() {
        return _wait.apply(undefined, arguments);
      };
    }
  }

  if (!waitFn) {
    waitFn = function waitFn() {
      throw new Error('ember-test-helpers or @ember/test-helpers must be installed');
    };
  }

  function getContext() {
    var _helpers;

    return (_helpers = helpers).getContext.apply(_helpers, arguments);
  }
  function getRootElement() {
    var _helpers2;

    return (_helpers2 = helpers).getRootElement.apply(_helpers2, arguments);
  }
  function visit() {
    var _helpers3;

    return (_helpers3 = helpers).visit.apply(_helpers3, arguments);
  }
  function click() {
    var _helpers4;

    return (_helpers4 = helpers).click.apply(_helpers4, arguments);
  }
  function fillIn() {
    var _helpers5;

    return (_helpers5 = helpers).fillIn.apply(_helpers5, arguments);
  }
  function triggerEvent() {
    var _helpers6;

    return (_helpers6 = helpers).triggerEvent.apply(_helpers6, arguments);
  }
  function triggerKeyEvent() {
    var _helpers7;

    return (_helpers7 = helpers).triggerKeyEvent.apply(_helpers7, arguments);
  }
  function focus() {
    var _helpers8;

    return (_helpers8 = helpers).focus.apply(_helpers8, arguments);
  }
  function blur() {
    var _helpers9;

    return (_helpers9 = helpers).blur.apply(_helpers9, arguments);
  }
  var wait = exports.wait = waitFn;
});
define('ember-cli-page-object/test-support/-private/context', ['exports', 'ember-cli-page-object/test-support/-private/deprecate'], function (exports, _deprecate) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.render = render;
  exports.setContext = setContext;
  exports.removeContext = removeContext;


  /**
   * @public
   *
   * Render a component's template in the context of a test.
   *
   * Throws an error if a test's context has not been set on the page.
   *
   * Returns the page object, which allows for method chaining.
   *
   * @example
   *
   * page.setContext(this)
   *   .render(hbs`{{my-component}}`)
   *   .clickOnText('Hi!');
   *
   * @param {Object} template - A compiled component template
   * @return {PageObject} - the page object
   */
  function render(template) {
    (0, _deprecate.default)('page-render', 'PageObject.render() is deprecated. Please use "htmlbars-inline-precompile" instead.', '1.16.0', '2.0.0');

    if (!this.context) {
      var message = 'You must set a context on the page object before calling calling `render()`';
      var error = new Error(message);

      throw error;
    }

    this.context.render(template);

    return this;
  }

  /**
   * @public
   *
   * Sets the page's test context.
   *
   * Returns the page object, which allows for method chaining.
   *
   * @example
   *
   * page.setContext(this)
   *   .render(hbs`{{my-component}}`)
   *   .clickOnText('Hi!');
   *
   * @param {Object} context - A component integration test's `this` context
   * @return {PageObject} - the page object
   */
  function setContext(context) {
    (0, _deprecate.default)('set-context', 'setContext() is deprecated. Please make sure you use "@ember/test-helpers" of v1 or higher.', '1.16.0', '2.0.0');

    if (context) {
      this.context = context;
    }

    return this;
  }

  /**
   * @public
   *
   * Unsets the page's test context.
   *
   * Useful in a component test's `afterEach()` hook, to make sure the context has been cleared after each test.
   *
   * @example
   *
   * page.removeContext();
   *
   * @return {PageObject} - the page object
   */
  function removeContext() {
    if (this.context) {
      delete this.context;
    }

    return this;
  }
});
define('ember-cli-page-object/test-support/-private/deprecate', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = deprecateWrapper;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var NAMESPACE = 'ember-cli-page-object';

  function deprecateWrapper(name, message, since, until) {
    var _since$split = since.split('.'),
        _since$split2 = _slicedToArray(_since$split, 2),
        major = _since$split2[0],
        minor = _since$split2[1];

    (true && !(false) && Ember.deprecate(message, false, {
      id: NAMESPACE + '.' + name,
      for: NAMESPACE,
      since: {
        enabled: since
      },
      until: until,
      url: 'https://ember-cli-page-object.js.org/docs/v' + major + '.' + minor + '.x/deprecations#' + name
    }));
  }
});
define('ember-cli-page-object/test-support/-private/dsl', ['exports', 'ember-cli-page-object/test-support/properties/as', 'ember-cli-page-object/test-support/properties/blurrable', 'ember-cli-page-object/test-support/properties/clickable', 'ember-cli-page-object/test-support/properties/click-on-text', 'ember-cli-page-object/test-support/properties/contains', 'ember-cli-page-object/test-support/properties/fillable', 'ember-cli-page-object/test-support/properties/focusable', 'ember-cli-page-object/test-support/properties/is-hidden', 'ember-cli-page-object/test-support/properties/is-present', 'ember-cli-page-object/test-support/properties/is-visible', 'ember-cli-page-object/test-support/properties/text', 'ember-cli-page-object/test-support/properties/value', 'ember-cli-page-object/test-support/-private/helpers'], function (exports, _as, _blurrable, _clickable, _clickOnText, _contains, _fillable, _focusable, _isHidden, _isPresent, _isVisible, _text, _value, _helpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var thenDescriptor = {
    isDescriptor: true,
    value: function value() {
      var _chainedRoot$_promise;

      var root = (0, _helpers.getRoot)(this);
      var chainedRoot = root._chainedTree || root;

      return (_chainedRoot$_promise = chainedRoot._promise).then.apply(_chainedRoot$_promise, arguments);
    }
  };

  var dsl = {
    as: _as.as,
    blur: (0, _blurrable.blurrable)(),
    click: (0, _clickable.clickable)(),
    clickOn: (0, _clickOnText.clickOnText)(),
    contains: (0, _contains.contains)(),
    fillIn: (0, _fillable.fillable)(),
    focus: (0, _focusable.focusable)(),
    isHidden: (0, _isHidden.isHidden)(),
    isPresent: (0, _isPresent.isPresent)(),
    isVisible: (0, _isVisible.isVisible)(),
    select: (0, _fillable.fillable)(),
    text: (0, _text.text)(),
    then: thenDescriptor,
    value: (0, _value.value)()
  };

  exports.default = dsl;
});
define('ember-cli-page-object/test-support/-private/execution_context', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/compatibility', 'ember-cli-page-object/test-support/-private/execution_context/acceptance', 'ember-cli-page-object/test-support/-private/execution_context/integration', 'ember-cli-page-object/test-support/-private/execution_context/rfc268'], function (exports, _helpers, _compatibility, _acceptance, _integration, _rfc) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getExecutionContext = getExecutionContext;
  exports.supportsRfc268 = supportsRfc268;
  exports.register = register;


  var executioncontexts = {
    acceptance: _acceptance.default,
    integration: _integration.default,
    rfc268: _rfc.default
  };

  /*
   * @private
   */
  function getExecutionContext(pageObjectNode) {
    // Our `getContext(pageObjectNode)` will return a context only if the test
    // called `page.setContext(this)`, which is only supposed to happen in
    // integration tests (i.e. pre-RFC232/RFC268). However, the integration
    // context does work with RFC232 (`setupRenderingContext()`) tests, and before
    // the RFC268 execution context was implemented, some users may have migrated
    // their tests to RFC232 tests, leaving the `page.setContext(this)` in place.
    // So, in order to not break those tests, we need to check for that case
    // first, and only if that hasn't happened, check to see if we're in an
    // RFC232/RFC268 test, and if not, fall back on assuming a pre-RFC268
    // acceptance test, which is the only remaining supported scenario.
    var integrationTestContext = (0, _helpers.getContext)(pageObjectNode);
    var contextName = void 0;
    if (integrationTestContext) {
      contextName = 'integration';
    } else if (supportsRfc268()) {
      contextName = 'rfc268';
    } else if (isAcceptanceTest()) {
      contextName = 'acceptance';
    } else {
      throw new Error('Looks like you attempt to access page object property outside of test context.\nIf that\'s not the case, please make sure you use the latest version of "@ember/test-helpers".');
    }

    return new executioncontexts[contextName](pageObjectNode, integrationTestContext);
  }

  /**
   * @private
   */
  function isAcceptanceTest() {
    return window.visit && window.andThen;
  }

  /**
   * @private
   */
  function supportsRfc268() {
    // `getContext()` returns:
    //  - falsey, if @ember/test-helpers is not available (stubbed in
    //    compatibility.js)
    //  - falsey, if @ember/test-helpers is available but none of the
    //    `ember-qunit` setupTest() methods has been called (e.g.,
    //    `setupRenderingTest()`)
    //  - truthy, if @ember/test-helpers is available and one of the `ember-qunit`
    //    setupTest() methods has been called.
    //
    // Note that if `page.setContext(this)` has been called, we'll never get here
    // and will just be running with the integration context (even if the test is
    // an RFC268 test).
    var hasValidTestContext = Boolean((0, _compatibility.getContext)());
    if (!hasValidTestContext) {
      return false;
    }

    // There are a few versions of `@ember/test-helpers` that have support for
    // `ember-qunit`'s `setupRenderingTest()` method, but do not have the DOM
    // helpers (`click`, `fillIn`, etc.) that the RFC268 execution context uses.
    // `visit` was the last helper to be added to `@ember/test-helpers`, so we
    // check for it, and if we can't find it, we can't use the RFC268 execution
    // context, so we throw an exception.
    var hasExpectedTestHelpers = Boolean(_compatibility.visit);
    if (!hasExpectedTestHelpers) {
      throw new Error(['You are trying to use ember-cli-page-object with RFC232/RFC268 support', '(setupRenderingContext()/setupApplicationContext()) which requires at', 'least ember-qunit@3.2.0 or ember-mocha@0.13.0-beta.3.'].join());
    }

    return true;
  }

  /*
   * @private
   */
  function register(type, definition) {
    executioncontexts[type] = definition;
  }
});
define('ember-cli-page-object/test-support/-private/execution_context/acceptance-native-events', ['exports', 'ember-native-dom-helpers', 'ember-cli-page-object/test-support/-private/execution_context/native-events-context', 'ember-cli-page-object/test-support/-private/compatibility'], function (exports, _emberNativeDomHelpers, _nativeEventsContext, _compatibility) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = AcceptanceNativeEventsExecutionContext;
  function AcceptanceNativeEventsExecutionContext(pageObjectNode) {
    _nativeEventsContext.default.call(this, pageObjectNode);
  }

  AcceptanceNativeEventsExecutionContext.prototype = Object.create(_nativeEventsContext.default.prototype);

  AcceptanceNativeEventsExecutionContext.prototype.visit = function () {
    _emberNativeDomHelpers.visit.apply(undefined, arguments);
  };

  AcceptanceNativeEventsExecutionContext.prototype.andThen = function (cb) {
    var _this = this;

    return (window.wait || _compatibility.wait)().then(function () {
      cb(_this);
    });
  };
});
define('ember-cli-page-object/test-support/-private/execution_context/acceptance', ['exports', 'ember-cli-page-object/test-support/-private/action', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context/helpers', 'ember-cli-page-object/test-support/-private/better-errors'], function (exports, _action, _helpers, _helpers2, _betterErrors) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = AcceptanceExecutionContext;
  function AcceptanceExecutionContext(pageObjectNode) {
    this.pageObjectNode = pageObjectNode;
  }

  AcceptanceExecutionContext.prototype = {
    andThen: function andThen(cb) {
      var _this = this;

      return window.wait().then(function () {
        cb(_this);
      });
    },
    runAsync: function runAsync(cb) {
      return (0, _action.run)(this.pageObjectNode, cb);
    },
    visit: function (_visit) {
      function visit(_x) {
        return _visit.apply(this, arguments);
      }

      visit.toString = function () {
        return _visit.toString();
      };

      return visit;
    }(function (path) {
      /* global visit */
      visit(path);
    }),
    click: function (_click) {
      function click(_x2, _x3) {
        return _click.apply(this, arguments);
      }

      click.toString = function () {
        return _click.toString();
      };

      return click;
    }(function (selector, container) {
      /* global click */
      click(selector, container);
    }),
    fillIn: function fillIn(selector, container, options, content) {
      var $selection = find(selector, container || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer'));

      /* global focus */
      focus($selection);

      (0, _helpers2.fillElement)($selection, content, {
        selector: selector,
        pageObjectNode: this.pageObjectNode,
        pageObjectKey: options.pageObjectKey
      });

      /* global triggerEvent */
      triggerEvent(selector, container, 'input');
      triggerEvent(selector, container, 'change');
    },
    triggerEvent: function (_triggerEvent) {
      function triggerEvent(_x4, _x5, _x6, _x7, _x8) {
        return _triggerEvent.apply(this, arguments);
      }

      triggerEvent.toString = function () {
        return _triggerEvent.toString();
      };

      return triggerEvent;
    }(function (selector, container, options, eventName, eventOptions) {
      /* global triggerEvent */
      triggerEvent(selector, container, eventName, eventOptions);
    }),
    focus: function focus(selector, options) {
      var $selection = this.findWithAssert(selector, options);

      (0, _helpers2.assertFocusable)($selection[0], {
        selector: selector,
        pageObjectNode: this.pageObjectNode,
        pageObjectKey: options.pageObjectKey
      });

      $selection.focus();
    },
    blur: function blur(selector, options) {
      var $selection = this.findWithAssert(selector, options);

      (0, _helpers2.assertFocusable)($selection[0], {
        selector: selector,
        pageObjectNode: this.pageObjectNode,
        pageObjectKey: options.pageObjectKey
      });

      $selection.blur();
    },
    assertElementExists: function assertElementExists(selector, options) {
      /* global find */
      var result = find(selector, options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer'));

      if (result.length === 0) {
        (0, _betterErrors.throwBetterError)(this.pageObjectNode, options.pageObjectKey, _betterErrors.ELEMENT_NOT_FOUND, { selector: selector });
      }
    },
    find: function (_find) {
      function find(_x9, _x10) {
        return _find.apply(this, arguments);
      }

      find.toString = function () {
        return _find.toString();
      };

      return find;
    }(function (selector, options) {
      var result = void 0;

      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);

      /* global find */
      result = find(selector, options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer'));

      (0, _helpers.guardMultiple)(result, selector, options.multiple);

      return result;
    }),
    findWithAssert: function findWithAssert(selector, options) {
      var result = void 0;

      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);

      /* global find */
      result = find(selector, options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer'));

      if (result.length === 0) {
        (0, _betterErrors.throwBetterError)(this.pageObjectNode, options.pageObjectKey, _betterErrors.ELEMENT_NOT_FOUND, { selector: selector });
      }

      (0, _helpers.guardMultiple)(result, selector, options.multiple);

      return result;
    }
  };
});
define('ember-cli-page-object/test-support/-private/execution_context/helpers', ['exports', 'ember-cli-page-object/test-support/-private/better-errors', '-jquery'], function (exports, _betterErrors, _jquery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.fillElement = fillElement;
  exports.assertFocusable = assertFocusable;


  /**
   * @private
   *
   * Fills inputs, textareas, or contenteditable elements with the passed-in content.
   *
   * @param {jQuery} $selection              jQuery object containing collection of DOM elements to fill in
   * @param {string} content                 Content to be inserted into the target element(s)
   * @param {Object} options                 Options for error reporting
   * @param {string} options.selector        jQuery selector used to target element(s) to fill in
   * @param {Ceibo} options.pageObjectNode   PageObject node containing the method which, when invoked, resulted in this call to `fillElement`
   * @param {string} options.pageObjectKey   Key of method on PageObject which, when invoked, resulted in this call to `fillElement`
   * @return
   *
   * @throws Will throw an error if called on a contenteditable element that has `contenteditable="false"`
   */
  function fillElement(selection, content, _ref) {
    var selector = _ref.selector,
        pageObjectNode = _ref.pageObjectNode,
        pageObjectKey = _ref.pageObjectKey;

    var $selection = (0, _jquery.default)(selection);

    if ($selection.is('[contenteditable][contenteditable!="false"]')) {
      $selection.html(content);
    } else if ($selection.is('[contenteditable="false"]')) {
      (0, _betterErrors.throwBetterError)(pageObjectNode, pageObjectKey, 'Element cannot be filled because it has `contenteditable="false"`.', {
        selector: selector
      });
    } else {
      $selection.val(content);
    }
  }

  /**
   * @private
   *
   * Given an element, asserts that element is focusable/blurable
   *
   * @param {Element} element - the element to check
   */
  function assertFocusable(element, _ref2) {
    var selector = _ref2.selector,
        pageObjectNode = _ref2.pageObjectNode,
        pageObjectKey = _ref2.pageObjectKey;

    var $element = (0, _jquery.default)(element);

    var error = void 0;

    if ($element.is(':hidden')) {
      error = 'hidden';
    } else if ($element.is(':disabled')) {
      error = 'disabled';
    } else if ($element.is('[contenteditable="false"]')) {
      error = 'contenteditable="false"';
    } else if (!$element.is(':input, a[href], area[href], iframe, [contenteditable], [tabindex]')) {
      error = 'not a link, input, form element, contenteditable, iframe, or an element with tabindex';
    }

    if (error) {
      (0, _betterErrors.throwBetterError)(pageObjectNode, pageObjectKey, 'Element is not focusable because it is ' + error, {
        selector: selector
      });
    }
  }
});
define('ember-cli-page-object/test-support/-private/execution_context/integration-native-events', ['exports', 'ember-cli-page-object/test-support/-private/execution_context/native-events-context', 'ember-cli-page-object/test-support/-private/compatibility'], function (exports, _nativeEventsContext, _compatibility) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = IntegrationNativeEventsExecutionContext;
  function IntegrationNativeEventsExecutionContext(pageObjectNode, testContext) {
    _nativeEventsContext.default.call(this, pageObjectNode, testContext);
  }

  IntegrationNativeEventsExecutionContext.prototype = Object.create(_nativeEventsContext.default.prototype);

  IntegrationNativeEventsExecutionContext.prototype.visit = function () {};

  IntegrationNativeEventsExecutionContext.prototype.andThen = function (cb) {
    var _this = this;

    Ember.run(function () {
      cb(_this);
    });

    return (0, _compatibility.wait)();
  };
});
define('ember-cli-page-object/test-support/-private/execution_context/integration', ['exports', '-jquery', 'ember-cli-page-object/test-support/-private/action', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context/helpers', 'ember-cli-page-object/test-support/-private/better-errors', 'ember-cli-page-object/test-support/-private/compatibility'], function (exports, _jquery, _action, _helpers, _helpers2, _betterErrors, _compatibility) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = IntegrationExecutionContext;
  function IntegrationExecutionContext(pageObjectNode, testContext) {
    this.pageObjectNode = pageObjectNode;
    this.testContext = testContext;
  }

  IntegrationExecutionContext.prototype = {
    andThen: function andThen(cb) {
      var _this = this;

      Ember.run(function () {
        cb(_this);
      });

      return (0, _compatibility.wait)();
    },
    runAsync: function runAsync(cb) {
      return (0, _action.run)(this.pageObjectNode, cb);
    },
    visit: function visit() {},
    click: function click(selector, container) {
      this.$(selector, container).click();
    },
    fillIn: function fillIn(selector, container, options, content) {
      var $selection = this.$(selector, container);

      (0, _helpers2.fillElement)($selection, content, {
        selector: selector,
        pageObjectNode: this.pageObjectNode,
        pageObjectKey: options.pageObjectKey
      });

      $selection.trigger('input');
      $selection.change();
    },
    $: function $(selector, container) {
      if (container) {
        return (0, _jquery.default)(selector, container);
      } else {
        return this.testContext.$(selector);
      }
    },
    triggerEvent: function triggerEvent(selector, container, options, eventName, eventOptions) {
      var event = _jquery.default.Event(eventName, eventOptions);

      if (container) {
        (0, _jquery.default)(selector, container).trigger(event);
      } else {
        this.testContext.$(selector).trigger(event);
      }
    },
    focus: function focus(selector, options) {
      var $selection = this.findWithAssert(selector, options);

      (0, _helpers2.assertFocusable)($selection[0], {
        selector: selector,
        pageObjectNode: this.pageObjectNode,
        pageObjectKey: options.pageObjectKey
      });

      $selection.focus();
    },
    blur: function blur(selector, options) {
      var $selection = this.findWithAssert(selector, options);

      (0, _helpers2.assertFocusable)($selection[0], {
        selector: selector,
        pageObjectNode: this.pageObjectNode,
        pageObjectKey: options.pageObjectKey
      });

      $selection.blur();
    },
    assertElementExists: function assertElementExists(selector, options) {
      var result = void 0;
      var container = options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer');

      if (container) {
        result = (0, _jquery.default)(selector, container);
      } else {
        result = this.testContext.$(selector);
      }

      if (result.length === 0) {
        (0, _betterErrors.throwBetterError)(this.pageObjectNode, options.pageObjectKey, _betterErrors.ELEMENT_NOT_FOUND, { selector: selector });
      }
    },
    find: function find(selector, options) {
      var result = void 0;
      var container = options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer');

      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);

      if (container) {
        result = (0, _jquery.default)(selector, container);
      } else {
        result = this.testContext.$(selector);
      }

      (0, _helpers.guardMultiple)(result, selector, options.multiple);

      return result;
    },
    findWithAssert: function findWithAssert(selector, options) {
      var result = void 0;
      var container = options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer');

      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);

      if (container) {
        result = (0, _jquery.default)(selector, container);
      } else {
        result = this.testContext.$(selector);
      }

      (0, _helpers.guardMultiple)(result, selector, options.multiple);

      if (result.length === 0) {
        (0, _betterErrors.throwBetterError)(this.pageObjectNode, options.pageObjectKey, _betterErrors.ELEMENT_NOT_FOUND, { selector: selector });
      }

      return result;
    }
  };
});
define('ember-cli-page-object/test-support/-private/execution_context/native-events-context', ['exports', '-jquery', 'ember-native-dom-helpers', 'ember-cli-page-object/test-support/-private/action', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context/helpers', 'ember-cli-page-object/test-support/-private/better-errors'], function (exports, _jquery, _emberNativeDomHelpers, _action, _helpers, _helpers2, _betterErrors) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = ExecutionContext;


  var KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];

  function ExecutionContext(pageObjectNode, testContext) {
    this.pageObjectNode = pageObjectNode;
    this.testContext = testContext;
  }

  ExecutionContext.prototype = {
    runAsync: function runAsync(cb) {
      return (0, _action.run)(this.pageObjectNode, cb);
    },
    click: function click(selector, container) {
      var el = this.$(selector, container)[0];
      (0, _emberNativeDomHelpers.click)(el);
    },
    fillIn: function fillIn(selector, container, options, content) {
      var _this = this;

      var elements = this.$(selector, container).toArray();

      elements.forEach(function (el) {
        (0, _helpers2.fillElement)(el, content, {
          selector: selector,
          pageObjectNode: _this.pageObjectNode,
          pageObjectKey: options.pageObjectKey
        });

        (0, _emberNativeDomHelpers.triggerEvent)(el, 'input');
        (0, _emberNativeDomHelpers.triggerEvent)(el, 'change');
      });
    },
    $: function $(selector, container) {
      if (container) {
        return (0, _jquery.default)(selector, container);
      } else {
        // @todo: we should fixed usage of private `_element`
        // after https://github.com/emberjs/ember-test-helpers/issues/184 is resolved
        var testsContainer = this.testContext ? this.testContext._element : '#ember-testing';

        return (0, _jquery.default)(selector, testsContainer);
      }
    },
    triggerEvent: function triggerEvent(selector, container, options, eventName, eventOptions) {
      var element = this.$(selector, container)[0];

      // `keyCode` is a deprecated property.
      // @see: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
      // Due to this deprecation `ember-native-dom-helpers` doesn't accept `keyCode` as a `KeyboardEvent` option.
      if (typeof eventOptions.key === 'undefined' && typeof eventOptions.keyCode !== 'undefined') {
        eventOptions.key = eventOptions.keyCode.toString();
        delete eventOptions.keyCode;
      }

      if (KEYBOARD_EVENT_TYPES.indexOf(eventName) > -1) {
        (0, _emberNativeDomHelpers.keyEvent)(element, eventName, eventOptions.key, eventOptions);
      } else {
        (0, _emberNativeDomHelpers.triggerEvent)(element, eventName, eventOptions);
      }
    },
    focus: function focus(selector, options) {
      var element = this.findWithAssert(selector, options)[0];

      (0, _helpers2.assertFocusable)(element, {
        selector: selector,
        pageObjectNode: this.pageObjectNode,
        pageObjectKey: options.pageObjectKey
      });

      (0, _emberNativeDomHelpers.focus)(element);
    },
    blur: function blur(selector, options) {
      var element = this.findWithAssert(selector, options)[0];

      (0, _helpers2.assertFocusable)(element, {
        selector: selector,
        pageObjectNode: this.pageObjectNode,
        pageObjectKey: options.pageObjectKey
      });

      (0, _emberNativeDomHelpers.blur)(element);
    },
    assertElementExists: function assertElementExists(selector, options) {
      var container = options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer');

      var result = this.$(selector, container);

      if (result.length === 0) {
        (0, _betterErrors.throwBetterError)(this.pageObjectNode, options.pageObjectKey, _betterErrors.ELEMENT_NOT_FOUND, { selector: selector });
      }
    },
    find: function find(selector, options) {
      var container = options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer');

      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);

      var result = this.$(selector, container);

      (0, _helpers.guardMultiple)(result, selector, options.multiple);

      return result;
    },
    findWithAssert: function findWithAssert(selector, options) {
      var container = options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer');

      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);

      var result = this.$(selector, container);

      if (result.length === 0) {
        (0, _betterErrors.throwBetterError)(this.pageObjectNode, options.pageObjectKey, _betterErrors.ELEMENT_NOT_FOUND, { selector: selector });
      }

      (0, _helpers.guardMultiple)(result, selector, options.multiple);

      return result;
    }
  };
});
define('ember-cli-page-object/test-support/-private/execution_context/rfc268', ['exports', '-jquery', 'ember-cli-page-object/test-support/-private/action', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/compatibility', 'ember-cli-page-object/test-support/-private/better-errors'], function (exports, _jquery, _action, _helpers, _compatibility, _betterErrors) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = ExecutionContext;

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function ExecutionContext(pageObjectNode) {
    this.pageObjectNode = pageObjectNode;
  }

  ExecutionContext.prototype = {
    runAsync: function runAsync(cb) {
      return (0, _action.run)(this.pageObjectNode, cb);
    },
    visit: function visit(path) {
      return (0, _compatibility.visit)(path);
    },
    click: function click(selector, container, options) {
      return this.invokeHelper(selector, options, _compatibility.click);
    },
    fillIn: function fillIn(selector, container, options, content) {
      return this.invokeHelper(selector, options, _compatibility.fillIn, content);
    },
    triggerEvent: function triggerEvent(selector, container, options, eventName, eventOptions) {
      if (typeof eventOptions.key !== 'undefined' || typeof eventOptions.keyCode !== 'undefined') {
        var key = eventOptions.key || eventOptions.keyCode;

        return this.invokeHelper(selector, options, _compatibility.triggerKeyEvent, eventName, key, eventOptions);
      }

      return this.invokeHelper(selector, options, _compatibility.triggerEvent, eventName, eventOptions);
    },
    focus: function focus(selector, options) {
      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);
      return this.invokeHelper(selector, options, _compatibility.focus);
    },
    blur: function blur(selector, options) {
      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);
      return this.invokeHelper(selector, options, _compatibility.blur);
    },
    assertElementExists: function assertElementExists(selector, options) {
      var result = this.getElements(selector, options);

      if (result.length === 0) {
        (0, _betterErrors.throwBetterError)(this.pageObjectNode, options.pageObjectKey, _betterErrors.ELEMENT_NOT_FOUND, { selector: selector });
      }
    },
    find: function find(selector, options) {
      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);
      var result = this.getElements(selector, options);

      (0, _helpers.guardMultiple)(result, selector, options.multiple);

      return result;
    },
    findWithAssert: function findWithAssert(selector, options) {
      selector = (0, _helpers.buildSelector)(this.pageObjectNode, selector, options);
      var result = this.getElements(selector, options);

      (0, _helpers.guardMultiple)(result, selector, options.multiple);

      if (result.length === 0) {
        (0, _betterErrors.throwBetterError)(this.pageObjectNode, options.pageObjectKey, _betterErrors.ELEMENT_NOT_FOUND, { selector: selector });
      }

      return result;
    },
    getElements: function getElements(selector, options) {
      var container = options.testContainer || (0, _helpers.findClosestValue)(this.pageObjectNode, 'testContainer');
      if (container) {
        return (0, _jquery.default)(selector, container);
      } else {
        return (0, _jquery.default)(selector, (0, _compatibility.getRootElement)());
      }
    },
    invokeHelper: function invokeHelper(selector, options, helper) {
      var _this = this;

      var element = this.getElements(selector, options)[0];

      for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        args[_key - 3] = arguments[_key];
      }

      return helper.apply(undefined, [element].concat(_toConsumableArray(args))).catch(function (e) {
        (0, _betterErrors.throwBetterError)(_this.pageObjectNode, options.pageObjectKey, e.message || e.toString(), { selector: selector });
      });
    }
  };
});
define('ember-cli-page-object/test-support/-private/helpers', ['exports', 'ceibo', 'ember-cli-page-object/test-support/-private/deprecate', 'ember-cli-page-object/test-support/-private/compatibility', '-jquery'], function (exports, _ceibo, _deprecate, _compatibility, _jquery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.assign = undefined;
  exports.guardMultiple = guardMultiple;
  exports.buildSelector = buildSelector;
  exports.normalizeText = normalizeText;
  exports.every = every;
  exports.filterWhitelistedOption = filterWhitelistedOption;
  exports.getRoot = getRoot;
  exports.getContext = getContext;
  exports.fullScope = fullScope;
  exports.findClosestValue = findClosestValue;
  exports.objectHasProperty = objectHasProperty;
  exports.getProperty = getProperty;
  exports.isPageObject = isPageObject;
  exports.getPageObjectDefinition = getPageObjectDefinition;
  exports.storePageObjectDefinition = storePageObjectDefinition;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var assign = exports.assign = Ember.assign;

  var Selector = function () {
    function Selector(node, scope, selector, filters) {
      _classCallCheck(this, Selector);

      this.targetNode = node;
      this.targetScope = scope || '';
      this.targetSelector = selector || '';
      this.targetFilters = filters;
    }

    _createClass(Selector, [{
      key: 'toString',
      value: function toString() {
        var scope = void 0;
        var filters = void 0;

        if (this.targetFilters.resetScope) {
          scope = this.targetScope;
        } else {
          scope = this.calculateScope(this.targetNode, this.targetScope);
        }

        if ((scope + ' ' + this.targetSelector).indexOf(',') > -1) {
          (0, _deprecate.default)('comma-separated-selectors', 'Usage of comma separated selectors is deprecated in ember-cli-page-object', '1.16.0', '2.0.0');
        }

        filters = this.calculateFilters(this.targetFilters);

        var selector = _jquery.default.trim(scope + ' ' + this.targetSelector + filters);

        if (!selector.length) {
          // When an empty selector is resolved take the first direct child of the
          // testing container.
          selector = ':first';
        }

        return selector;
      }
    }, {
      key: 'calculateFilters',
      value: function calculateFilters() {
        var filters = [];

        if (this.targetFilters.visible) {
          filters.push(':visible');
        }

        if (this.targetFilters.contains) {
          filters.push(':contains("' + this.targetFilters.contains + '")');
        }

        if (typeof this.targetFilters.at === 'number') {
          filters.push(':eq(' + this.targetFilters.at + ')');
        } else if (this.targetFilters.last) {
          filters.push(':last');
        }

        return filters.join('');
      }
    }, {
      key: 'calculateScope',
      value: function calculateScope(node, targetScope) {
        var scopes = this.getScopes(node);

        scopes.reverse();
        scopes.push(targetScope);

        return _jquery.default.trim(scopes.join(' '));
      }
    }, {
      key: 'getScopes',
      value: function getScopes(node) {
        var scopes = [];

        if (node.scope) {
          scopes.push(node.scope);
        }

        if (!node.resetScope && _ceibo.default.parent(node)) {
          scopes = scopes.concat(this.calculateScope(_ceibo.default.parent(node)));
        }

        return scopes;
      }
    }]);

    return Selector;
  }();

  function guardMultiple(items, selector, supportMultiple) {
    (true && !(supportMultiple || items.length <= 1) && Ember.assert('"' + selector + '" matched more than one element. If you want to select many elements, use collections instead.', supportMultiple || items.length <= 1));
  }

  /**
   * @public
   *
   * Builds a CSS selector from a target selector and a PageObject or a node in a PageObject, along with optional parameters.
   *
   * @example
   *
   * const component = PageObject.create({ scope: '.component'});
   *
   * buildSelector(component, '.my-element');
   * // returns '.component .my-element'
   *
   * @example
   *
   * const page = PageObject.create({});
   *
   * buildSelector(page, '.my-element', { at: 0 });
   * // returns '.my-element:eq(0)'
   *
   * @example
   *
   * const page = PageObject.create({});
   *
   * buildSelector(page, '.my-element', { contains: "Example" });
   * // returns ".my-element :contains('Example')"
   *
   * @example
   *
   * const page = PageObject.create({});
   *
   * buildSelector(page, '.my-element', { last: true });
   * // returns '.my-element:last'
   *
   * @param {Ceibo} node - Node of the tree
   * @param {string} targetSelector - CSS selector
   * @param {Object} options - Additional options
   * @param {boolean} options.resetScope - Do not use inherited scope
   * @param {string} options.contains - Filter by using :contains('foo') pseudo-class
   * @param {number} options.at - Filter by index using :eq(x) pseudo-class
   * @param {boolean} options.last - Filter by using :last pseudo-class
   * @param {boolean} options.visible - Filter by using :visible pseudo-class
   * @return {string} Fully qualified selector
   */
  function buildSelector(node, targetSelector, options) {
    return new Selector(node, options.scope, targetSelector, options).toString();
  }

  /**
   * @private
   *
   * Trim whitespaces at both ends and normalize whitespaces inside `text`
   *
   * Due to variations in the HTML parsers in different browsers, the text
   * returned may vary in newlines and other white space.
   *
   * @see http://api.jquery.com/text/
   */
  function normalizeText(text) {
    return _jquery.default.trim(text).replace(/\n/g, ' ').replace(/\s\s*/g, ' ');
  }

  function every(jqArray, cb) {
    var arr = jqArray.get();

    return Ember.A(arr).every(function (element) {
      return cb((0, _jquery.default)(element));
    });
  }

  /**
   * @private
   *
   * Check if all options are in whitelist
   *
   */
  function filterWhitelistedOption(options, whitelist) {
    return whitelist.reduce(function (whitelisted, knownKey) {
      if (knownKey in options) {
        whitelisted[knownKey] = options[knownKey];
      }
      return whitelisted;
    }, {});
  }

  /**
   * @public
   *
   * Return the root of a node's tree
   *
   * @param {Ceibo} node - Node of the tree
   * @return {Ceibo} node - Root node of the tree
   */
  function getRoot(node) {
    var parent = _ceibo.default.parent(node);
    var root = node;

    while (parent) {
      root = parent;
      parent = _ceibo.default.parent(parent);
    }

    return root;
  }

  /**
   * @public
   *
   * Return a test context if one was provided during `create()` or via `setContext()`
   *
   * @param {Ceibo} node - Node of the tree
   * @return {Object} `moduleForComponent` test's `this` context, or null
   */
  function getContext(node) {
    var root = getRoot(node);
    var context = root.context;


    if ((typeof context === 'undefined' ? 'undefined' : _typeof(context)) === 'object' && context !== null && typeof context.$ === 'function') {
      return context;
    }

    context = (0, _compatibility.getContext)();
    if ((typeof context === 'undefined' ? 'undefined' : _typeof(context)) === 'object' && context !== null && typeof context.$ === 'function' && !context.element) {
      return context;
    }

    return null;
  }

  function getAllValuesForProperty(node, property) {
    var iterator = node;
    var values = [];

    while (Ember.isPresent(iterator)) {
      if (Ember.isPresent(iterator[property])) {
        values.push(iterator[property]);
      }

      iterator = _ceibo.default.parent(iterator);
    }

    return values;
  }

  /**
   * @public
   *
   * Return full scope of node (includes all ancestors scopes)
   *
   * @param {Ceibo} node - Node of the tree
   * @return {string} Full scope of node
   */
  function fullScope(node) {
    var scopes = getAllValuesForProperty(node, 'scope');

    return scopes.reverse().join(' ');
  }

  /**
   * @public
   *
   * Returns the value of property defined on the closest ancestor of given
   * node.
   *
   * @param {Ceibo} node - Node of the tree
   * @param {string} property - Property to look for
   * @return {?Object} The value of property on closest node to the given node
   */
  function findClosestValue(node, property) {
    if (Ember.isPresent(node[property])) {
      return node[property];
    }

    var parent = _ceibo.default.parent(node);

    if (Ember.isPresent(parent)) {
      return findClosestValue(parent, property);
    }
  }

  /**
   * @public
   *
   * Returns a boolean indicating whether an object contains a given property.
   * The path to a nested property should be indicated by a dot-separated string.
   *
   * @param {Object} object - object to check for the target property
   * @param {string} pathToProp - dot-separated path to property
   * @return {Boolean}
   */
  function objectHasProperty(object, pathToProp) {
    var pathSegments = pathToProp.split('.');

    for (var i = 0; i < pathSegments.length; i++) {
      var key = pathSegments[i];
      if (object === null || object === undefined || !object.hasOwnProperty(key)) {
        return false;
      } else {
        object = object[key];
      }
    }

    return true;
  }

  /**
   * @public
   *
   * Returns the value of an object property. If the property is a function,
   * the return value is that function bound to its "owner."
   *
   * @param {Object} object - object on which to look up the target property
   * @param {string} pathToProp - dot-separated path to property
   * @return {Boolean|String|Number|Function|Null|Undefined} - value of property
   */
  function getProperty(object, pathToProp) {
    var pathSegments = pathToProp.split('.');

    if (pathSegments.length === 1) {
      var _value = Ember.get(object, pathToProp);
      return typeof _value === 'function' ? _value.bind(object) : _value;
    }

    var pathToPropOwner = pathSegments.slice(0, -1).join('.');
    var propOwner = Ember.get(object, pathToPropOwner);

    if (propOwner === null || propOwner === undefined) {
      return undefined;
    }

    var propKey = pathSegments[pathSegments.length - 1];
    var value = Ember.get(propOwner, propKey);

    return typeof value === 'function' ? value.bind(propOwner) : value;
  }

  function isPageObject(property) {
    if (property && (typeof property === 'undefined' ? 'undefined' : _typeof(property)) === 'object') {
      var meta = _ceibo.default.meta(property);
      return meta && meta.__poDef__;
    } else {
      return false;
    }
  }

  function getPageObjectDefinition(node) {
    if (!isPageObject(node)) {
      throw new Error('cannot get the page object definition from a node that is not a page object');
    } else {
      return _ceibo.default.meta(node).__poDef__;
    }
  }

  function storePageObjectDefinition(node, definition) {
    _ceibo.default.meta(node).__poDef__ = definition;
  }
});
define('ember-cli-page-object/test-support/create', ['exports', 'ceibo', 'ember-cli-page-object/test-support/-private/deprecate', 'ember-cli-page-object/test-support/-private/context', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/properties/visitable', 'ember-cli-page-object/test-support/-private/dsl'], function (exports, _ceibo, _deprecate, _context, _helpers, _visitable, _dsl) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.create = create;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function assignDescriptors(target, source) {
    Object.getOwnPropertyNames(source).forEach(function (key) {
      var descriptor = Object.getOwnPropertyDescriptor(source, key);

      Object.defineProperty(target, key, descriptor);
    });

    return target;
  }

  //
  // When running RFC268 tests, we have to play some tricks to support chaining.
  // RFC268 helpers don't wait for things to settle by defaut, but return a
  // promise that will resolve when everything settles. So this means
  //
  // page.clickOn('.foo');
  // page.clickOn('.bar');
  //
  // will not wait after either of the clicks, whereas
  //
  // await page.clickOn('.foo');
  // await page.clickOn('.bar');
  //
  // will wait after each of them. However, to preserve chaining behavior,
  //
  // page
  //   .clickOn('.foo')
  //   .clickOn('.bar');
  //
  // would need to wait between the clicks. However, if `clickOn()` just returned
  // `page` this would be impossible because then it would be exactly the same as
  // the first example, which must not wait between clicks.
  //
  // So the solution is to return something other than `page` from,
  // `page.clickOn('.foo')`, but something that behaves just like `page` except
  // waits for things to settle before invoking any async methods.
  //
  // To accomplish this, when building our Ceibo tree, we build a mirror copy of
  // it (the "chained tree"). Anytime a chainable method is invoked, instead of
  // returning the node whose method was invoked, we can return its mirror node in
  // the chained tree. Then, anytime an async method is invoked on that node
  // (meaning we are in a chaining scenario), the execution context can recognize
  // it as a chained node and wait before invoking the target method.
  //

  // See https://github.com/san650/ceibo#examples for more info on how Ceibo
  // builders work.

  // This builder builds the primary tree
  function buildObject(node, blueprintKey, blueprint, defaultBuilder) {
    var definition = void 0;

    // to allow page objects to exist in definitions, we store the definition that
    // created the page object, allowing us to substitute a page object with its
    // definition during creation
    if ((0, _helpers.isPageObject)(blueprint)) {
      definition = (0, _helpers.getPageObjectDefinition)(blueprint);
    } else {
      Object.getOwnPropertyNames(blueprint).forEach(function (key) {
        var _Object$getOwnPropert = Object.getOwnPropertyDescriptor(blueprint, key),
            get = _Object$getOwnPropert.get,
            value = _Object$getOwnPropert.value;

        if (typeof get === 'function') {
          Object.defineProperty(blueprint, key, {
            value: {
              isDescriptor: true,
              get: get
            }
          });
        } else if (typeof value === 'string' && !['scope', 'testContainer'].includes(key)) {
          (0, _deprecate.default)('string-properties-on-definition', 'do not use string values on definitions', '1.17.0', '2.0.0');
        }
      });

      definition = blueprint;
    }

    var blueprintToStore = (0, _helpers.assign)({}, definition);
    //the _chainedTree is an implementation detail that shouldn't make it into the stored
    if (blueprintToStore._chainedTree) {
      delete blueprintToStore._chainedTree;
    }
    blueprint = (0, _helpers.assign)({}, _dsl.default, definition);

    var _defaultBuilder = defaultBuilder(node, blueprintKey, blueprint, defaultBuilder),
        _defaultBuilder2 = _slicedToArray(_defaultBuilder, 2),
        instance = _defaultBuilder2[0],
        blueprintToApply = _defaultBuilder2[1];

    // persist definition once we have an instance
    (0, _helpers.storePageObjectDefinition)(instance, blueprintToStore);

    return [instance, blueprintToApply];
  }

  /**
   * Creates a new PageObject.
   *
   * By default, the resulting PageObject will respond to:
   *
   * - **Actions**: click, clickOn, fillIn, select
   * - **Predicates**: contains, isHidden, isPresent, isVisible
   * - **Queries**: text
   *
   * `definition` can include a key `context`, which is an
   * optional integration test `this` context.
   *
   * If a context is passed, it is used by actions, queries, etc.,
   * as the `this` in `this.$()`.
   *
   * If no context is passed, the global Ember acceptence test
   * helpers are used.
   *
   * @example
   *
   * // <div class="title">My title</div>
   *
   * import PageObject, { text } from 'ember-cli-page-object';
   *
   * const page = PageObject.create({
   *   title: text('.title')
   * });
   *
   * assert.equal(page.title, 'My title');
   *
   * @example
   *
   * // <div id="my-page">
   * //   My super text
   * //   <button>Press Me</button>
   * // </div>
   *
   * const page = PageObject.create({
   *   scope: '#my-page'
   * });
   *
   * assert.equal(page.text, 'My super text');
   * assert.ok(page.contains('super'));
   * assert.ok(page.isPresent);
   * assert.ok(page.isVisible);
   * assert.notOk(page.isHidden);
   * assert.equal(page.value, 'my input value');
   *
   * // clicks div#my-page
   * page.click();
   *
   * // clicks button
   * page.clickOn('Press Me');
   *
   * // fills an input
   * page.fillIn('name', 'John Doe');
   *
   * // selects an option
   * page.select('country', 'Uruguay');
   *
   * @example Defining path
   *
   * const usersPage = PageObject.create('/users');
   *
   * // visits user page
   * usersPage.visit();
   *
   * const userTasksPage = PageObject.create('/users/tasks', {
   *  tasks: collection({
   *    itemScope: '.tasks li',
   *    item: {}
   *  });
   * });
   *
   * // get user's tasks
   * userTasksPage.visit();
   * userTasksPage.tasks().count
   *
   * @public
   *
   * @param {Object} definition - PageObject definition
   * @param {Object} [definition.context] - A test's `this` context
   * @param {Object} options - [private] Ceibo options. Do not use!
   * @return {PageObject}
   */
  function create(definitionOrUrl, definitionOrOptions, optionsOrNothing) {
    var definition = void 0;
    var url = void 0;
    var options = void 0;

    if (typeof definitionOrUrl === 'string') {
      url = definitionOrUrl;
      definition = definitionOrOptions || {};
      options = optionsOrNothing || {};
    } else {
      url = false;
      definition = definitionOrUrl || {};
      options = definitionOrOptions || {};
    }

    var _definition = definition,
        context = _definition.context;

    // in the instance where the definition is a page object, we must use the stored definition directly
    // or else we will fire off the Ceibo created getters which will error
    definition = (0, _helpers.isPageObject)(definition) ? (0, _helpers.assign)({}, (0, _helpers.getPageObjectDefinition)(definition)) : assignDescriptors({}, definition);

    delete definition.context;

    if (typeof url === 'string') {
      (0, _deprecate.default)('create-url-argument', 'Passing an URL argument to `create()` is deprecated', '1.17.0', "2.0.0");
    }

    if (url) {
      definition.visit = (0, _visitable.visitable)(url);
    }

    // Build the chained tree
    var chainedBuilder = {
      object: buildObject
    };
    var chainedTree = _ceibo.default.create(definition, (0, _helpers.assign)({ builder: chainedBuilder }, options));

    // Attach it to the root in the definition of the primary tree
    definition._chainedTree = {
      isDescriptor: true,

      get: function get() {
        return chainedTree;
      }
    };

    // Build the primary tree
    var builder = {
      object: buildObject
    };

    var page = _ceibo.default.create(definition, (0, _helpers.assign)({ builder: builder }, options));

    if (page) {
      page.render = _context.render;
      page.setContext = _context.setContext;
      page.removeContext = _context.removeContext;

      if (typeof context !== 'undefined') {
        page.setContext(context);
      }
    }

    return page;
  }
});
define('ember-cli-page-object/test-support/extend/find-element-with-assert', ['exports', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.findElementWithAssert = findElementWithAssert;


  /**
   * @public
   *
   * Returns a jQuery element matched by a selector built from parameters
   *
   * @example
   *
   * import { findElementWithAssert } from 'ember-cli-page-object/extend';
   *
   * export default function isDisabled(selector, options = {}) {
   *   return {
   *     isDescriptor: true,
   *
   *     get() {
   *       return findElementWithAssert(this, selector, options).is(':disabled');
   *     }
   *   };
   * }
   *
   * @param {Ceibo} pageObjectNode - Node of the tree
   * @param {string} targetSelector - Specific CSS selector
   * @param {Object} options - Additional options
   * @param {boolean} options.resetScope - Do not use inherited scope
   * @param {string} options.contains - Filter by using :contains('foo') pseudo-class
   * @param {number} options.at - Filter by index using :eq(x) pseudo-class
   * @param {boolean} options.last - Filter by using :last pseudo-class
   * @param {boolean} options.visible - Filter by using :visible pseudo-class
   * @param {boolean} options.multiple - Specify if built selector can match multiple elements.
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @param {string} options.pageObjectKey - Used in the error message when the element is not found
   * @return {Object} jQuery object
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function findElementWithAssert(pageObjectNode, targetSelector) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return (0, _execution_context.getExecutionContext)(pageObjectNode).findWithAssert(targetSelector, options);
  }
});
define('ember-cli-page-object/test-support/extend/find-element', ['exports', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.findElement = findElement;


  /**
   * @public
   *
   * Returns a jQuery element (can be an empty jQuery result)
   *
   * @example
   *
   * import { findElement } from 'ember-cli-page-object/extend';
   *
   * export default function isDisabled(selector, options = {}) {
   *   return {
   *     isDescriptor: true,
   *
   *     get() {
   *       return findElement(this, selector, options).is(':disabled');
   *     }
   *   };
   * }
   *
   * @param {Ceibo} pageObjectNode - Node of the tree
   * @param {string} targetSelector - Specific CSS selector
   * @param {Object} options - Additional options
   * @param {boolean} options.resetScope - Do not use inherited scope
   * @param {string} options.contains - Filter by using :contains('foo') pseudo-class
   * @param {number} options.at - Filter by index using :eq(x) pseudo-class
   * @param {boolean} options.last - Filter by using :last pseudo-class
   * @param {boolean} options.visible - Filter by using :visible pseudo-class
   * @param {boolean} options.multiple - Specify if built selector can match multiple elements.
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Object} jQuery object
   *
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function findElement(pageObjectNode, targetSelector) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return (0, _execution_context.getExecutionContext)(pageObjectNode).find(targetSelector, options);
  }
});
define('ember-cli-page-object/test-support/extend/find-many', ['exports', 'ember-cli-page-object/test-support/-private/deprecate', 'ember-cli-page-object/test-support/-private/execution_context', 'ember-cli-page-object/test-support/-private/helpers'], function (exports, _deprecate, _execution_context, _helpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.findMany = findMany;

  /**
   * @public
   *
   * Returns array of elements
   *
   * @example
   *
   * import { findMany } from '../extend';
   *
   * export default function count(selector, options = {}) {
   *   return {
   *     isDescriptor: true,
   *
   *     get() {
   *       return findMany(this, selector, options).length;
   *     }
   *   };
   * }
   *
   * @param {Ceibo} pageObjectNode - Node of the tree
   * @param {string} targetSelector - Specific CSS selector
   * @param {Object} options - Additional options
   * @param {boolean} options.resetScope - Do not use inherited scope
   * @param {string} options.contains - Filter by using :contains('foo') pseudo-class
   * @param {string} options.scope
   * @param {number} options.at - Filter by index using :eq(x) pseudo-class
   * @param {boolean} options.last - Filter by using :last pseudo-class
   * @param {boolean} options.visible - Filter by using :visible pseudo-class
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Array} of Element
   */
  function findMany(pageObjectNode, targetSelector) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var shouldShowMutlipleDeprecation = 'multiple' in options;
    if (shouldShowMutlipleDeprecation) {
      (0, _deprecate.default)('multiple', '"multiple" property is deprecated', '1.17.0', '2.0.0');
    }

    var filteredOptions = (0, _helpers.filterWhitelistedOption)(options, ['resetScope', 'visible', 'testContainer', 'contains', 'scope', 'at', 'last']);
    var opts = Object.assign({}, filteredOptions, { multiple: true });
    return (0, _execution_context.getExecutionContext)(pageObjectNode).find(targetSelector, opts).get();
  }
});
define('ember-cli-page-object/test-support/extend/find-one', ['exports', 'ember-cli-page-object/test-support/-private/execution_context', 'ember-cli-page-object/test-support/-private/helpers'], function (exports, _execution_context, _helpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.findOne = findOne;


  /**
   * @public
   *
   * Returns a element
   *
   * @example
   *
   * import { findOne } from 'ember-cli-page-object';
   *
   * export default function isDisabled(selector, options = {}) {
   *   return {
   *     isDescriptor: true,
   *
   *     get() {
   *       return findOne(this, selector, options).disabled;
   *     }
   *   };
   * }
   *
   * @param {Ceibo} pageObjectNode - Node of the tree
   * @param {string} targetSelector - Specific CSS selector
   * @param {Object} options - Additional options
   * @param {boolean} options.resetScope - Do not use inherited scope
   * @param {string} options.contains - Filter by using :contains('foo') pseudo-class
   * @param {string} options.scope
   * @param {number} options.at - Filter by index using :eq(x) pseudo-class
   * @param {boolean} options.last - Filter by using :last pseudo-class
   * @param {boolean} options.visible - Filter by using :visible pseudo-class
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @param {string} options.pageObjectKey - Used in the error message when the element is not found
   * @return {Element}
   *
   * @throws If no elements found
   * @throws If more than one element found
   */
  function findOne(pageObjectNode, targetSelector) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var filteredOptions = (0, _helpers.filterWhitelistedOption)(options, ['resetScope', 'visible', 'testContainer', 'contains', 'at', 'last', 'scope', 'pageObjectKey']);
    var opts = Object.assign({}, filteredOptions, { multiple: false });
    return (0, _execution_context.getExecutionContext)(pageObjectNode).findWithAssert(targetSelector, opts).get(0);
  }
});
define('ember-cli-page-object/test-support/extend/index', ['exports', 'ember-cli-page-object/test-support/extend/find-element', 'ember-cli-page-object/test-support/extend/find-element-with-assert', 'ember-cli-page-object/test-support/extend/find-one', 'ember-cli-page-object/test-support/extend/find-many', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context', 'ember-cli-page-object/test-support/-private/execution_context/integration-native-events', 'ember-cli-page-object/test-support/-private/execution_context/acceptance-native-events', 'ember-cli-page-object/test-support/-private/execution_context/integration', 'ember-cli-page-object/test-support/-private/execution_context/acceptance'], function (exports, _findElement, _findElementWithAssert, _findOne, _findMany, _helpers, _execution_context, _integrationNativeEvents, _acceptanceNativeEvents, _integration, _acceptance) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.useNativeEvents = exports.registerExecutionContext = exports.fullScope = exports.getContext = exports.buildSelector = exports.findMany = exports.findOne = exports.findElementWithAssert = exports.findElement = undefined;
  Object.defineProperty(exports, 'findElement', {
    enumerable: true,
    get: function () {
      return _findElement.findElement;
    }
  });
  Object.defineProperty(exports, 'findElementWithAssert', {
    enumerable: true,
    get: function () {
      return _findElementWithAssert.findElementWithAssert;
    }
  });
  Object.defineProperty(exports, 'findOne', {
    enumerable: true,
    get: function () {
      return _findOne.findOne;
    }
  });
  Object.defineProperty(exports, 'findMany', {
    enumerable: true,
    get: function () {
      return _findMany.findMany;
    }
  });
  Object.defineProperty(exports, 'buildSelector', {
    enumerable: true,
    get: function () {
      return _helpers.buildSelector;
    }
  });
  Object.defineProperty(exports, 'getContext', {
    enumerable: true,
    get: function () {
      return _helpers.getContext;
    }
  });
  Object.defineProperty(exports, 'fullScope', {
    enumerable: true,
    get: function () {
      return _helpers.fullScope;
    }
  });


  function useNativeEvents() {
    var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    if (flag) {
      (0, _execution_context.register)('integration', _integrationNativeEvents.default);
      (0, _execution_context.register)('acceptance', _acceptanceNativeEvents.default);
    } else {
      (0, _execution_context.register)('integration', _integration.default);
      (0, _execution_context.register)('acceptance', _acceptance.default);
    }
  }

  exports.registerExecutionContext = _execution_context.register;
  exports.useNativeEvents = useNativeEvents;
});
define('ember-cli-page-object/test-support/index', ['exports', 'ember-cli-page-object/test-support/extend/find-element', 'ember-cli-page-object/test-support/extend/find-element-with-assert', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/create', 'ember-cli-page-object/test-support/properties/attribute', 'ember-cli-page-object/test-support/properties/blurrable', 'ember-cli-page-object/test-support/properties/click-on-text', 'ember-cli-page-object/test-support/properties/clickable', 'ember-cli-page-object/test-support/properties/collection', 'ember-cli-page-object/test-support/properties/contains', 'ember-cli-page-object/test-support/properties/count', 'ember-cli-page-object/test-support/properties/fillable', 'ember-cli-page-object/test-support/properties/focusable', 'ember-cli-page-object/test-support/properties/has-class', 'ember-cli-page-object/test-support/properties/is', 'ember-cli-page-object/test-support/properties/is-hidden', 'ember-cli-page-object/test-support/properties/is-present', 'ember-cli-page-object/test-support/properties/is-visible', 'ember-cli-page-object/test-support/properties/not-has-class', 'ember-cli-page-object/test-support/properties/property', 'ember-cli-page-object/test-support/properties/text', 'ember-cli-page-object/test-support/properties/triggerable', 'ember-cli-page-object/test-support/properties/value', 'ember-cli-page-object/test-support/properties/visitable'], function (exports, _findElement, _findElementWithAssert, _helpers, _create, _attribute, _blurrable, _clickOnText, _clickable, _collection, _contains, _count, _fillable, _focusable, _hasClass, _is, _isHidden, _isPresent, _isVisible, _notHasClass, _property, _text, _triggerable, _value, _visitable) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getContext = exports.buildSelector = exports.findElementWithAssert = exports.findElement = exports.visitable = exports.value = exports.triggerable = exports.text = exports.property = exports.notHasClass = exports.isVisible = exports.isPresent = exports.isHidden = exports.is = exports.hasClass = exports.focusable = exports.selectable = exports.fillable = exports.count = exports.contains = exports.collection = exports.clickable = exports.clickOnText = exports.blurrable = exports.attribute = exports.create = undefined;
  Object.defineProperty(exports, 'findElement', {
    enumerable: true,
    get: function () {
      return _findElement.findElement;
    }
  });
  Object.defineProperty(exports, 'findElementWithAssert', {
    enumerable: true,
    get: function () {
      return _findElementWithAssert.findElementWithAssert;
    }
  });
  Object.defineProperty(exports, 'buildSelector', {
    enumerable: true,
    get: function () {
      return _helpers.buildSelector;
    }
  });
  Object.defineProperty(exports, 'getContext', {
    enumerable: true,
    get: function () {
      return _helpers.getContext;
    }
  });
  exports.create = _create.create;
  exports.attribute = _attribute.attribute;
  exports.blurrable = _blurrable.blurrable;
  exports.clickOnText = _clickOnText.clickOnText;
  exports.clickable = _clickable.clickable;
  exports.collection = _collection.collection;
  exports.contains = _contains.contains;
  exports.count = _count.count;
  exports.fillable = _fillable.fillable;
  var selectable = exports.selectable = _fillable.fillable;
  exports.focusable = _focusable.focusable;
  exports.hasClass = _hasClass.hasClass;
  exports.is = _is.is;
  exports.isHidden = _isHidden.isHidden;
  exports.isPresent = _isPresent.isPresent;
  exports.isVisible = _isVisible.isVisible;
  exports.notHasClass = _notHasClass.notHasClass;
  exports.property = _property.property;
  exports.text = _text.text;
  exports.triggerable = _triggerable.triggerable;
  exports.value = _value.value;
  exports.visitable = _visitable.visitable;
  exports.default = {
    attribute: _attribute.attribute,
    blurrable: _blurrable.blurrable,
    clickOnText: _clickOnText.clickOnText,
    clickable: _clickable.clickable,
    collection: _collection.collection,
    contains: _contains.contains,
    count: _count.count,
    create: _create.create,
    fillable: _fillable.fillable,
    focusable: _focusable.focusable,
    hasClass: _hasClass.hasClass,
    is: _is.is,
    isHidden: _isHidden.isHidden,
    isPresent: _isPresent.isPresent,
    isVisible: _isVisible.isVisible,
    notHasClass: _notHasClass.notHasClass,
    property: _property.property,
    selectable: selectable,
    text: _text.text,
    value: _value.value,
    visitable: _visitable.visitable,
    triggerable: _triggerable.triggerable
  };
});
define('ember-cli-page-object/test-support/macros/alias', ['exports', 'ember-cli-page-object/test-support/-private/better-errors', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/action', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _betterErrors, _helpers, _action, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.alias = alias;


  var ALIASED_PROP_NOT_FOUND = 'PageObject does not contain aliased property';

  /**
   * Returns the value of some other property on the PageObject.
   *
   * @example
   *
   * import { create } from 'ember-cli-page-object';
   * import { alias } from 'ember-cli-page-object/macros';
   *
   * const page = create({
   *   submitButton: {
   *     scope: '.submit-button'
   *   },
   *   submit: alias('submitButton.click')
   * });
   *
   * // calls `page.submitButton.click`
   * page.submit();
   *
   * @example
   *
   * import { create } from 'ember-cli-page-object';
   * import { alias } from 'ember-cli-page-object/macros';
   *
   * const page = create({
   *   submitButton: {
   *     scope: '.submit-button'
   *   },
   *   isSubmitButtonVisible: alias('submitButton.isVisible')
   * });
   *
   * // checks value of `page.submitButton.isVisible`
   * assert.ok(page.isSubmitButtonVisible);
   *
   * @example
   *
   * import { create } from 'ember-cli-page-object';
   * import { alias } from 'ember-cli-page-object/macros';
   *
   * const page = create({
   *   form: {
   *     input: {
   *       scope: 'input'
   *     },
   *     submitButton: {
   *       scope: '.submit-button'
   *     }
   *   },
   *   fillFormInput: alias('form.input.fillIn', { chainable: true }),
   *   submitForm: alias('form.submitButton.click', { chainable: true })
   * });
   *
   * // executes `page.form.input.fillIn` then `page.form.submitButton.click`
   * // and causes both methods to return `page` (instead of `page.form.input`
   * // and `page.form.submitButton` respectively) so that the aliased methods
   * // can be chained off `page`.
   * page
   *   .fillFormInput('foo')
   *   .submitForm();
   *
   * @public
   *
   * @param {string} pathToProp - dot-separated path to a property specified on the PageObject
   * @param {Object} options
   * @param {Boolean} options.chainable - when this is true, an aliased
   * method returns the PageObject node on which the alias is defined, rather
   * than the PageObject node on which the aliased property is defined.
   * @return {Descriptor}
   *
   * @throws Will throw an error if the PageObject does not have the specified property.
   */
  function alias(pathToProp) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        if (!(0, _helpers.objectHasProperty)(this, pathToProp)) {
          (0, _betterErrors.throwBetterError)(this, key, ALIASED_PROP_NOT_FOUND + ' `' + pathToProp + '`.');
        }

        var value = (0, _helpers.getProperty)(this, pathToProp);

        if (typeof value !== 'function' || !options.chainable) {
          return value;
        }

        return function () {
          // We can't just return value(...args) here because if the alias points
          // to a property on a child node, then the return value would be that
          // child node rather than this node.
          value.apply(undefined, arguments);

          return typeof (0, _execution_context.getExecutionContext)(this).andThen === 'function' ? this : (0, _action.chainable)(this);
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/macros/getter', ['exports', 'ember-cli-page-object/test-support/-private/better-errors'], function (exports, _betterErrors) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getter = getter;


  var NOT_A_FUNCTION_ERROR = 'Argument passed to `getter` must be a function.';

  /**
   * Creates a Descriptor whose value is determined by the passed-in function.
   * The passed-in function must not be bound and must not be an arrow function,
   * as this would prevent it from running with the correct context.
   *
   * @example
   *
   * // <input type="text">
   * // <button disabled>Submit</button>
   *
   * import { create, value, property } from 'ember-cli-page-object';
   * import { getter } from 'ember-cli-page-object/macros';
   *
   * const page = create({
   *   inputValue: value('input'),
   *   isSubmitButtonDisabled: property('disabled', 'button'),
   *
   *   // with the `getter` macro
   *   isFormEmpty: getter(function() {
   *     return !this.inputValue && this.isSubmitButtonDisabled;
   *   }),
   *
   *   // without the `getter` macro
   *   _isFormEmpty: {
   *     isDescriptor: true,
   *     get() {
   *       return !this.inputValue && this.isSubmitButtonDisabled;
   *     }
   *   }
   * });
   *
   * // checks the value returned by the function passed into `getter`
   * assert.ok(page.isFormEmpty);
   *
   * @public
   *
   * @param {Function} fn - determines what value is returned when the Descriptor is accessed
   * @return {Descriptor}
   *
   * @throws Will throw an error if a function is not passed in as the first argument
   */
  function getter(fn) {
    return {
      isDescriptor: true,

      get: function get(key) {
        if (typeof fn !== 'function') {
          (0, _betterErrors.throwBetterError)(this, key, NOT_A_FUNCTION_ERROR);
        }

        return fn.call(this, key);
      }
    };
  }
});
define('ember-cli-page-object/test-support/macros/index', ['exports', 'ember-cli-page-object/test-support/macros/alias', 'ember-cli-page-object/test-support/macros/getter'], function (exports, _alias, _getter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'alias', {
    enumerable: true,
    get: function () {
      return _alias.alias;
    }
  });
  Object.defineProperty(exports, 'getter', {
    enumerable: true,
    get: function () {
      return _getter.getter;
    }
  });
  exports.default = 1;
});
define("ember-cli-page-object/test-support/properties/as", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.as = as;
  /**
   * @public
   *
   * Allow to perform operations on intermediate results within the chain.
   *
   * Useful for grouping what's being tested.
   *
   * @example
   * page.users(1).as(user => {
   *   assert.equal(user.name, 'John');
   *   assert.equal(user.lastName, 'Doe');
   *   assert.equal(user.email, 'john@doe');
   * });
   *
   * page.users(2).as(user => {
   *   assert.equal(user.name, 'John');
   *   assert.equal(user.lastName, 'Doe');
   *   assert.equal(user.email, 'john@doe');
   * });
   *
   * page.users(3).as(user => {
   *   assert.equal(user.name, 'John');
   *   assert.equal(user.lastName, 'Doe');
   *   assert.equal(user.email, 'john@doe');
   * });
   *
   * @example
   * // Lorem <span>ipsum <strong>dolor</strong></span>
   *
   * let page = create({
   *   scope: 'span',
   *   foo: {
   *     bar: {
   *       scope: 'strong'
   *     }
   *   }
   * });
   *
   * page.foo.bar.as(element => {
   *   assert.equal(element.text, 'dolor');
   * });
   *
   * @param {function} callback - Function to be called with the current object as the parameter
   * @return {object} this
   *
   */
  function as(callback) {
    callback(this);
    return this;
  }
});
define('ember-cli-page-object/test-support/properties/attribute', ['exports', '-jquery', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend'], function (exports, _jquery, _helpers, _extend) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.attribute = attribute;


  /**
   * @public
   *
   * Returns the value of an attribute from the matched element, or an array of
   * values from multiple matched elements.
   *
   * @example
   * // <input placeholder="a value">
   *
   * import { create, attribute } from 'ember-cli-page-object';
   *
   * const page = create({
   *   inputPlaceholder: attribute('placeholder', 'input')
   * });
   *
   * assert.equal(page.inputPlaceholder, 'a value');
   *
   * @example
   *
   * // <input placeholder="a value">
   * // <input placeholder="other value">
   *
   * import { create, attribute } from 'ember-cli-page-object';
   *
   * const page = create({
   *   inputPlaceholders: attribute('placeholder', ':input', { multiple: true })
   * });
   *
   * assert.deepEqual(page.inputPlaceholders, ['a value', 'other value']);
   *
   * @example
   *
   * // <div><input></div>
   * // <div class="scope"><input placeholder="a value"></div>
   * // <div><input></div>
   *
   * import { create, attribute } from 'ember-cli-page-object';
   *
   * const page = create({
   *   inputPlaceholder: attribute('placeholder', ':input', { scope: '.scope' })
   * });
   *
   * assert.equal(page.inputPlaceholder, 'a value');
   *
   * @example
   *
   * // <div><input></div>
   * // <div class="scope"><input placeholder="a value"></div>
   * // <div><input></div>
   *
   * import { create, attribute } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: 'scope',
   *   inputPlaceholder: attribute('placeholder', ':input')
   * });
   *
   * assert.equal(page.inputPlaceholder, 'a value');
   *
   * @public
   *
   * @param {string} attributeName - Name of the attribute to get
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.multiple - If set, the function will return an array of values
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function attribute(attributeName, selector) {
    var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        if (options.multiple) {
          return (0, _extend.findMany)(this, selector, options).map(function (element) {
            return (0, _jquery.default)(element).attr(attributeName);
          });
        } else {
          return (0, _jquery.default)((0, _extend.findOne)(this, selector, options)).attr(attributeName);
        }
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/blurrable', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _helpers, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.blurrable = blurrable;


  /**
   *
   * Blurs element matched by selector.
   *
   * @example
   *
   * // <input class="name">
   * // <input class="email">
   *
   * import { create, blurrable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   blur: blurrable('.name')
   * });
   *
   * // blurs on element with selector '.name'
   * page.blur();
   *
   * @example
   *
   * // <div class="scope">
   * //   <input class="name">
   * // </div>
   * // <input class="email">
   *
   * import { create, blurrable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   blur: blurrable('.name', { scope: '.scope' })
   * });
   *
   * // blurs on element with selector '.scope .name'
   * page.blur();
   *
   * @example
   *
   * // <div class="scope">
   * //   <input class="name">
   * // </div>
   * // <input class="email">
   *
   * import { create, blurrable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   blur: blurrable('.name')
   * });
   *
   * // blurs on element with selector '.scope .name'
   * page.blur();
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element which will be blurred
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Ignore parent scope
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
  */
  function blurrable(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        return function () {
          var executionContext = (0, _execution_context.getExecutionContext)(this);
          var options = (0, _helpers.assign)({ pageObjectKey: key + '()' }, userOptions);

          return executionContext.runAsync(function (context) {
            return context.blur(selector, options);
          });
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/click-on-text', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context', 'ember-cli-page-object/test-support/properties/click-on-text/helpers'], function (exports, _helpers, _execution_context, _helpers2) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.clickOnText = clickOnText;


  /**
   * Clicks on an element containing specified text.
   *
   * The element can either match a specified selector,
   * or be inside an element matching the specified selector.
   *
   * @example
   *
   * // <fieldset>
   * //  <button>Lorem</button>
   * //  <button>Ipsum</button>
   * // </fieldset>
   *
   * import { create, clickOnText } from 'ember-cli-page-object';
   *
   * const page = create({
   *   clickOnFieldset: clickOnText('fieldset'),
   *   clickOnButton: clickOnText('button')
   * });
   *
   * // queries the DOM with selector 'fieldset :contains("Lorem"):last'
   * page.clickOnFieldset('Lorem');
   *
   * // queries the DOM with selector 'button:contains("Ipsum")'
   * page.clickOnButton('Ipsum');
   *
   * @example
   *
   * // <div class="scope">
   * //   <fieldset>
   * //    <button>Lorem</button>
   * //    <button>Ipsum</button>
   * //   </fieldset>
   * // </div>
   *
   * import { create, clickOnText } from 'ember-cli-page-object';
   *
   * const page = create({
   *   clickOnFieldset: clickOnText('fieldset', { scope: '.scope' }),
   *   clickOnButton: clickOnText('button', { scope: '.scope' })
   * });
   *
   * // queries the DOM with selector '.scope fieldset :contains("Lorem"):last'
   * page.clickOnFieldset('Lorem');
   *
   * // queries the DOM with selector '.scope button:contains("Ipsum")'
   * page.clickOnButton('Ipsum');
   *
   * @example
   *
   * // <div class="scope">
   * //   <fieldset>
   * //    <button>Lorem</button>
   * //    <button>Ipsum</button>
   * //   </fieldset>
   * // </div>
   *
   * import { create, clickOnText } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   clickOnFieldset: clickOnText('fieldset'),
   *   clickOnButton: clickOnText('button')
   * });
   *
   * // queries the DOM with selector '.scope fieldset :contains("Lorem"):last'
   * page.clickOnFieldset('Lorem');
   *
   * // queries the DOM with selector '.scope button:contains("Ipsum")'
   * page.clickOnButton('Ipsum');
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element in which to look for text
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.visible - Make the action to raise an error if the element is not visible
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   */
  function clickOnText(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        return function (textToClick) {
          var _this = this;

          var executionContext = (0, _execution_context.getExecutionContext)(this);
          var options = (0, _helpers.assign)({ pageObjectKey: key + '("' + textToClick + '")', contains: textToClick }, userOptions);

          return executionContext.runAsync(function (context) {
            var fullSelector = (0, _helpers2.buildSelector)(_this, context, selector, options);
            var container = options.testContainer || (0, _helpers.findClosestValue)(_this, 'testContainer');

            context.assertElementExists(fullSelector, options);

            return context.click(fullSelector, container, options);
          });
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/click-on-text/helpers', ['exports', 'ember-cli-page-object/test-support/-private/helpers'], function (exports, _helpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.buildSelector = buildSelector;


  function childSelector(pageObjectNode, context, selector, options) {
    // Suppose that we have something like `<form><button>Submit</button></form>`
    // In this case <form> and <button> elements contains "Submit" text, so, we'll
    // want to __always__ click on the __last__ element that contains the text.
    var selectorWithSpace = (selector || '') + ' ';
    var opts = (0, _helpers.assign)({ last: true, multiple: true }, options);

    if (context.find(selectorWithSpace, opts).length) {
      return (0, _helpers.buildSelector)(pageObjectNode, selectorWithSpace, opts);
    }
  }

  function buildSelector(pageObjectNode, context, selector, options) {
    var childSel = childSelector(pageObjectNode, context, selector, options);

    if (childSel) {
      return childSel;
    } else {
      return (0, _helpers.buildSelector)(pageObjectNode, selector, options);
    }
  }
});
define('ember-cli-page-object/test-support/properties/clickable', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _helpers, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.clickable = clickable;


  /**
   * Clicks elements matched by a selector.
   *
   * @example
   *
   * // <button class="continue">Continue<button>
   * // <button>Cancel</button>
   *
   * import { create, clickable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   continue: clickable('button.continue')
   * });
   *
   * // clicks on element with selector 'button.continue'
   * page.continue();
   *
   * @example
   *
   * // <div class="scope">
   * //   <button>Continue<button>
   * // </div>
   * // <button>Cancel</button>
   *
   * import { create, clickable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   continue: clickable('button.continue', { scope: '.scope' })
   * });
   *
   * // clicks on element with selector '.scope button.continue'
   * page.continue();
   *
   * @example
   *
   * // <div class="scope">
   * //   <button>Continue<button>
   * // </div>
   * // <button>Cancel</button>
   *
   * import { create, clickable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   continue: clickable('button.continue')
   * });
   *
   * // clicks on element with selector '.scope button.continue'
   * page.continue();
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to click
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.visible - Make the action to raise an error if the element is not visible
   * @param {boolean} options.resetScope - Ignore parent scope
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   */
  function clickable(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        return function () {
          var _this = this;

          var executionContext = (0, _execution_context.getExecutionContext)(this);
          var options = (0, _helpers.assign)({ pageObjectKey: key + '()' }, userOptions);

          return executionContext.runAsync(function (context) {
            var fullSelector = (0, _helpers.buildSelector)(_this, selector, options);
            var container = options.testContainer || (0, _helpers.findClosestValue)(_this, 'testContainer');

            context.assertElementExists(fullSelector, options);

            return context.click(fullSelector, container, options);
          });
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/collection', ['exports', 'ember-cli-page-object/test-support/-private/deprecate', 'ember-cli-page-object/test-support/properties/collection/main', 'ember-cli-page-object/test-support/properties/collection/legacy'], function (exports, _deprecate, _main, _legacy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.collection = collection;


  /**
   *  <div class="alert alert-warning" role="alert">
   *   <strong>Note:</strong> v1.14.x introduces the new collection API.
   *   You can see the legacy collection API in the <a href="/docs/v1.13.x/api/collection">v1.13.x docs</a>
   * </div>
   *
   * Creates a enumerable that represents a collection of items. The collection is zero-indexed
   * and has the following public methods and properties:
   *
   * - `length` - The number of items in the collection.
   * - `objectAt()` - Returns the page for the item at the specified index.
   * - `filter()` - Filters the items in the array and returns the ones which match the predicate function.
   * - `filterBy()` - Filters the items of the array by the specified property, returning all that are truthy or that match an optional value.
   * - `forEach()` - Runs a function for each item in the collection
   * - `map()` - maps over the elements of the collection
   * - `mapBy()` - maps over the elements of the collecton by the specified property
   * - `find()` - finds first item of the array with assert by specified function
   * - `findBy()` - finds first item of the array with assert by property
   * - `toArray()` - returns an array containing all the items in the collection
   * - `[Symbol.iterator]()` - if supported by the environment, this allows the collection to be iterated with `for/of` and spread with `...` like a normal array
   *
   * @example
   *
   * // <table>
   * //   <tbody>
   * //     <tr>
   * //       <td>Mary<td>
   * //       <td>Watson</td>
   * //     </tr>
   * //     <tr>
   * //       <td>John<td>
   * //       <td>Doe</td>
   * //     </tr>
   * //   </tbody>
   * // </table>
   *
   * import { create, collection, text } from 'ember-cli-page-object';
   *
   * const page = create({
   *   users: collection('table tr', {
   *     firstName: text('td', { at: 0 }),
   *     lastName: text('td', { at: 1 })
   *   })
   * });
   *
   * assert.equal(page.users.length, 2);
   * assert.equal(page.users.objectAt(1).firstName, 'John');
   * assert.equal(page.users.objectAt(1).lastName, 'Doe');
   *
   * @example
   *
   * // <div class="admins">
   * //   <table>
   * //     <tbody>
   * //       <tr>
   * //         <td>Mary<td>
   * //         <td>Watson</td>
   * //       </tr>
   * //       <tr>
   * //         <td>John<td>
   * //         <td>Doe</td>
   * //       </tr>
   * //     </tbody>
   * //   </table>
   * // </div>
   *
   * // <div class="normal">
   * //   <table>
   * //   </table>
   * // </div>
   *
   * import { create, collection, text } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.admins',
   *
   *   users: collection('table tr', {
   *     firstName: text('td', { at: 0 }),
   *     lastName: text('td', { at: 1 })
   *   })
   * });
   *
   * assert.equal(page.users.length, 2);
   *
   * @example
   *
   * // <table>
   * //   <caption>User Index</caption>
   * //   <tbody>
   * //     <tr>
   * //         <td>Mary<td>
   * //         <td>Watson</td>
   * //       </tr>
   * //       <tr>
   * //         <td>John<td>
   * //         <td>Doe</td>
   * //       </tr>
   * //   </tbody>
   * // </table>
   *
   * import { create, collection, text } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: 'table',
   *
   *   users: collection('tr', {
   *     firstName: text('td', { at: 0 }),
   *     lastName: text('td', { at: 1 }),
   *   })
   * });
   *
   * let john = page.users.filter((item) => item.firstName === 'John' )[0];
   * assert.equal(john.lastName, 'Doe');
   *
   * @example
   * <caption>If the browser you run tests [supports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Browser_compatibility) Proxy, you can use array accessors to access elements by index</caption>
   *
   * // <table>
   * //   <tr>
   * //       <td>Mary<td>
   * //   </tr>
   * //   <tr>
   * //     <td>John<td>
   * //   </tr>
   * // </table>
   *
   * import { create, collection } from 'ember-cli-page-object';
   *
   * const page = create({
   *   users: collection('tr')
   * });
   *
   * // This only works on browsers that support `Proxy`
   * assert.equal(page.users[0].text, 'Mary');
   * assert.equal(page.users[1].text, 'John');
   *
   *
   * @param {String} scopeOrDefinition - Selector to define the items of the collection
   * @param {Object} [definitionOrNothing] - Object with the definition of item properties
   * @param {boolean} definition.resetScope - Override parent's scope
   * @return {Descriptor}
   */
  function collection(scopeOrDefinition, definitionOrNothing) {

    if (typeof scopeOrDefinition === 'string') {
      return (0, _main.collection)(scopeOrDefinition, definitionOrNothing);
    }

    (0, _deprecate.default)('old-collection-api', 'You are currently using the legacy collection API, check the documentation to see how to upgrade to the new API.', '1.16.0', '2.0.0');

    (true && Ember.warn('Legacy page object collection definition is invalid. Please, make sure you include a `itemScope` selector.', scopeOrDefinition.itemScope, {
      id: 'ember-cli-page-object.legacy-collection-missing-item-scope'
    }));


    return (0, _legacy.collection)(scopeOrDefinition);
  }
});
define('ember-cli-page-object/test-support/properties/collection/legacy', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/create', 'ember-cli-page-object/test-support/properties/count', 'ceibo'], function (exports, _helpers, _create, _count, _ceibo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.collection = collection;


  var arrayDelegateMethods = ['map', 'filter', 'mapBy', 'filterBy', 'forEach'];

  function merge(target) {
    for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      objects[_key - 1] = arguments[_key];
    }

    objects.forEach(function (o) {
      return (0, _helpers.assign)(target, o);
    });

    return target;
  }

  function generateEnumerable(node, definition, item, key) {
    var enumerable = merge({}, definition);

    if (typeof enumerable.count === 'undefined') {
      enumerable.count = (0, _count.count)(item.itemScope);
    }

    if (typeof enumerable.toArray === 'undefined') {
      enumerable.toArray = toArrayMethod(node, item, key);
      arrayDelegateMethods.forEach(function (method) {
        return delegateToArray(enumerable, method);
      });
    }

    var collection = (0, _create.create)(enumerable, { parent: node });

    if (typeof Symbol !== 'undefined' && Symbol.iterator) {
      collection[Symbol.iterator] = iteratorMethod;
    }

    // Change the key of the root node
    _ceibo.default.meta(collection).key = key + '()';

    return collection;
  }

  function generateItem(node, index, definition, key) {
    var filters = merge({}, { scope: definition.scope, at: index });
    var scope = (0, _helpers.buildSelector)({}, definition.itemScope, filters);

    var tree = (0, _create.create)(merge({
      testContainer: definition.testContainer
    }, definition.item, {
      scope: scope,
      resetScope: definition.resetScope
    }), { parent: node });

    // Change the key of the root node
    _ceibo.default.meta(tree).key = key + '(' + index + ')';

    return tree;
  }

  function toArrayMethod(node, definition, key) {
    return function () {
      var array = Ember.A();
      var index = void 0;
      var count = void 0;

      for (index = 0, count = this.count; index < count; index++) {
        array.push(generateItem(node, index, definition, key));
      }

      return array;
    };
  }

  function delegateToArray(enumerable, method) {
    if (typeof enumerable[method] === 'undefined') {
      enumerable[method] = function () {
        var _toArray;

        return (_toArray = this.toArray())[method].apply(_toArray, arguments);
      };
    }
  }

  function iteratorMethod() {
    var i = 0;
    var items = this.toArray();
    var next = function next() {
      return { done: i >= items.length, value: items[i++] };
    };

    return { next: next };
  }

  function collection(definition) {
    definition = (0, _helpers.assign)({}, definition);

    var item = {
      scope: definition.scope,
      itemScope: definition.itemScope,
      resetScope: definition.resetScope,
      item: definition.item,
      testContainer: definition.testContainer
    };

    delete definition.item;
    delete definition.itemScope;

    return {
      isDescriptor: true,

      get: function get(key) {
        var _this = this;

        return function (index) {
          if (typeof index === 'number') {
            return generateItem(_this, index, item, key);
          } else {
            return generateEnumerable(_this, definition, item, key);
          }
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/collection/main', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/create', 'ember-cli-page-object/test-support/properties/count', 'ceibo', 'ember-cli-page-object/test-support/-private/better-errors'], function (exports, _helpers, _create, _count, _ceibo, _betterErrors) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Collection = undefined;
  exports.collection = collection;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Collection = exports.Collection = function () {
    function Collection(scope, definition, parent, key) {
      _classCallCheck(this, Collection);

      this.scope = scope;
      this.definition = definition || {};
      this.parent = parent;
      this.key = key;

      this._itemCounter = (0, _create.create)({
        count: (0, _count.count)(scope, {
          resetScope: this.definition.resetScope,
          testContainer: this.definition.testContainer
        })
      }, { parent: parent });

      this._items = [];
    }

    _createClass(Collection, [{
      key: 'objectAt',
      value: function objectAt(index) {
        var key = this.key;


        if (typeof this._items[index] === 'undefined') {
          var scope = this.scope,
              definition = this.definition,
              parent = this.parent;

          var itemScope = (0, _helpers.buildSelector)({}, scope, { at: index });

          var finalizedDefinition = (0, _helpers.assign)({}, definition);

          finalizedDefinition.scope = itemScope;

          var tree = (0, _create.create)(finalizedDefinition, { parent: parent });

          // Change the key of the root node
          _ceibo.default.meta(tree).key = key + '[' + index + ']';

          this._items[index] = tree;
        }

        return this._items[index];
      }
    }, {
      key: 'filter',
      value: function filter() {
        var _toArray;

        return (_toArray = this.toArray()).filter.apply(_toArray, arguments);
      }
    }, {
      key: 'filterBy',
      value: function filterBy() {
        var _toArray2;

        return (_toArray2 = this.toArray()).filterBy.apply(_toArray2, arguments);
      }
    }, {
      key: 'forEach',
      value: function forEach() {
        var _toArray3;

        return (_toArray3 = this.toArray()).forEach.apply(_toArray3, arguments);
      }
    }, {
      key: 'map',
      value: function map() {
        var _toArray4;

        return (_toArray4 = this.toArray()).map.apply(_toArray4, arguments);
      }
    }, {
      key: 'mapBy',
      value: function mapBy() {
        var _toArray5;

        return (_toArray5 = this.toArray()).mapBy.apply(_toArray5, arguments);
      }
    }, {
      key: 'findOneBy',
      value: function findOneBy() {
        var _toArray6;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var elements = (_toArray6 = this.toArray()).filterBy.apply(_toArray6, args);
        this._assertFoundElements.apply(this, [elements].concat(args));
        return elements[0];
      }
    }, {
      key: 'findOne',
      value: function findOne() {
        var _toArray7;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var elements = (_toArray7 = this.toArray()).filter.apply(_toArray7, args);
        this._assertFoundElements.apply(this, [elements].concat(args));
        return elements[0];
      }
    }, {
      key: '_assertFoundElements',
      value: function _assertFoundElements(elements) {
        var argsToText = (arguments.length <= 1 ? 0 : arguments.length - 1) === 1 ? 'condition' : (arguments.length <= 1 ? undefined : arguments[1]) + ': "' + (arguments.length <= 2 ? undefined : arguments[2]) + '"';
        if (elements.length > 1) {
          (0, _betterErrors.throwBetterError)(this.parent, this.key, elements.length + ' elements found by ' + argsToText + ', but expected 1');
        }

        if (elements.length === 0) {
          (0, _betterErrors.throwBetterError)(this.parent, this.key, 'cannot find element by ' + argsToText);
        }
      }
    }, {
      key: 'toArray',
      value: function toArray() {
        var length = this.length;


        var array = Ember.A();

        for (var i = 0; i < length; i++) {
          array.push(this.objectAt(i));
        }

        return array;
      }
    }, {
      key: 'length',
      get: function get() {
        return this._itemCounter.count;
      }
    }]);

    return Collection;
  }();

  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
    Collection.prototype[Symbol.iterator] = function () {
      var i = 0;
      var items = this.toArray();
      var next = function next() {
        return { done: i >= items.length, value: items[i++] };
      };

      return { next: next };
    };
  }

  function proxyIfSupported(instance) {
    if (window.Proxy) {
      return new window.Proxy(instance, {
        get: function get(target, name) {
          if (typeof name === 'number' || typeof name === 'string') {
            var index = parseInt(name, 10);

            if (!isNaN(index)) {
              return target.objectAt(index);
            }
          }

          return target[name];
        }
      });
    } else {
      return instance;
    }
  }

  function collection(scope, definition) {

    if ((0, _helpers.isPageObject)(definition)) {
      //extract the stored definition from the page object
      definition = (0, _helpers.getPageObjectDefinition)(definition);
    }
    var descriptor = {
      isDescriptor: true,

      setup: function setup(node, key) {
        // Set the value on the descriptor so that it will be picked up and applied by Ceibo.
        // This does mutate the descriptor, but because `setup` is always called before the
        // value is assigned we are guaranteed to get a new, unique Collection instance each time.
        descriptor.value = proxyIfSupported(new Collection(scope, definition, node, key));
      }
    };

    return descriptor;
  }
});
define('ember-cli-page-object/test-support/properties/contains', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend'], function (exports, _helpers, _extend) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.contains = contains;


  /**
   * Returns a boolean representing whether an element or a set of elements contains the specified text.
   *
   * @example
   *
   * // Lorem <span>ipsum</span>
   *
   * import { create, contains } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanContains: contains('span')
   * });
   *
   * assert.ok(page.spanContains('ipsum'));
   *
   * @example
   *
   * // <span>lorem</span>
   * // <span>ipsum</span>
   * // <span>dolor</span>
   *
   * const page = PageObject.create({
   *   spansContain: PageObject.contains('span', { multiple: true })
   * });
   *
   * // not all spans contain 'lorem'
   * assert.notOk(page.spansContain('lorem'));
   *
   * @example
   *
   * // <span>super text</span>
   * // <span>regular text</span>
   *
   * import { create, contains } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spansContain: contains('span', { multiple: true })
   * });
   *
   * // all spans contain 'text'
   * assert.ok(page.spansContain('text'));
   *
   * @example
   *
   * // <div><span>lorem</span></div>
   * // <div class="scope"><span>ipsum</span></div>
   * // <div><span>dolor</span></div>
   *
   * import { create, contains } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanContains: contains('span', { scope: '.scope' })
   * });
   *
   * assert.notOk(page.spanContains('lorem'));
   * assert.ok(page.spanContains('ipsum'));
   *
   * @example
   *
   * // <div><span>lorem</span></div>
   * // <div class="scope"><span>ipsum</span></div>
   * // <div><span>dolor</span></div>
   *
   * import { create, contains } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
  
   *   spanContains: contains('span')
   * });
   *
   * assert.notOk(page.spanContains('lorem'));
   * assert.ok(page.spanContains('ipsum'));
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {boolean} options.multiple - Check if all elements matched by selector contain the subtext
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function contains(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        return function (textToSearch) {
          var options = (0, _helpers.assign)({
            pageObjectKey: key + '("' + textToSearch + '")'
          }, userOptions);

          var elements = options.multiple ? (0, _extend.findMany)(this, selector, options) : [(0, _extend.findOne)(this, selector, options)];

          return Ember.A(elements).every(function (element) {
            return element.innerText.indexOf(textToSearch) >= 0;
          });
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/count', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend'], function (exports, _helpers, _extend) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.count = count;


  /**
   * @public
   *
   * Returns the number of elements matched by a selector.
   *
   * @example
   *
   * // <span>1</span>
   * // <span>2</span>
   *
   * import { create, count } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanCount: count('span')
   * });
   *
   * assert.equal(page.spanCount, 2);
   *
   * @example
   *
   * // <div>Text</div>
   *
   * import { create, count } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanCount: count('span')
   * });
   *
   * assert.equal(page.spanCount, 0);
   *
   * @example
   *
   * // <div><span></span></div>
   * // <div class="scope"><span></span><span></span></div>
   *
   * import { create, count } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanCount: count('span', { scope: '.scope' })
   * });
   *
   * assert.equal(page.spanCount, 2)
   *
   * @example
   *
   * // <div><span></span></div>
   * // <div class="scope"><span></span><span></span></div>
   *
   * import { create, count } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   spanCount: count('span')
   * });
   *
   * assert.equal(page.spanCount, 2)
   *
   * @example
   *
   * // <div><span></span></div>
   * // <div class="scope"><span></span><span></span></div>
   *
   * import { create, count } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   spanCount: count('span', { resetScope: true })
   * });
   *
   * assert.equal(page.spanCount, 1);
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element or elements to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Add scope
   * @param {boolean} options.resetScope - Ignore parent scope
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   */
  function count(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        return (0, _extend.findMany)(this, selector, options).length;
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/fillable', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _helpers, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.fillable = fillable;


  /**
   * Alias for `fillable`, which works for inputs, HTML select menus, and
   * contenteditable elements.
   *
   * [See `fillable` for usage examples.](#fillable)
   *
   * @name selectable
   * @function
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to look for text
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   */

  /**
   * Fills in an input matched by a selector.
   *
   * @example
   *
   * // <input value="">
   *
   * import { create, fillable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   fillIn: fillable('input')
   * });
   *
   * // result: <input value="John Doe">
   * page.fillIn('John Doe');
   *
   * @example
   *
   * // <div class="name">
   * //   <input value="">
   * // </div>
   * // <div class="last-name">
   * //   <input value= "">
   * // </div>
   *
   * import { create, fillable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   fillInName: fillable('input', { scope: '.name' })
   * });
   *
   * page.fillInName('John Doe');
   *
   * // result
   * // <div class="name">
   * //   <input value="John Doe">
   * // </div>
   *
   * @example
   *
   * // <div class="name">
   * //   <input value="">
   * // </div>
   * // <div class="last-name">
   * //   <input value= "">
   * // </div>
   *
   * import { create, fillable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: 'name',
   *   fillInName: fillable('input')
   * });
   *
   * page.fillInName('John Doe');
   *
   * // result
   * // <div class="name">
   * //   <input value="John Doe">
   * // </div>
   *
   * @example <caption>Filling different inputs with the same property</caption>
   *
   * // <input id="name">
   * // <input name="lastname">
   * // <input data-test="email">
   * // <textarea aria-label="address"></textarea>
   * // <input placeholder="phone">
   * // <div contenteditable="true" id="bio"></div>
   *
   * const page = create({
   *   fillIn: fillable('input, textarea, [contenteditable]')
   * });
   *
   * page
   *   .fillIn('name', 'Doe')
   *   .fillIn('lastname', 'Doe')
   *   .fillIn('email', 'john@doe')
   *   .fillIn('address', 'A street')
   *   .fillIn('phone', '555-000')
   *   .fillIn('bio', 'The story of <b>John Doe</b>');
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to look for text
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   */
  function fillable(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        return function (contentOrClue, content) {
          var _this = this;

          var clue = void 0;

          if (content === undefined) {
            content = contentOrClue;
          } else {
            clue = contentOrClue;
          }

          var executionContext = (0, _execution_context.getExecutionContext)(this);
          var options = (0, _helpers.assign)({ pageObjectKey: key + '()' }, userOptions);

          return executionContext.runAsync(function (context) {
            var fullSelector = (0, _helpers.buildSelector)(_this, selector, options);
            var container = options.testContainer || (0, _helpers.findClosestValue)(_this, 'testContainer');

            if (clue) {
              fullSelector = ['input', 'textarea', 'select', '[contenteditable]'].map(function (tag) {
                return [fullSelector + ' ' + tag + '[data-test="' + clue + '"]', fullSelector + ' ' + tag + '[aria-label="' + clue + '"]', fullSelector + ' ' + tag + '[placeholder="' + clue + '"]', fullSelector + ' ' + tag + '[name="' + clue + '"]', fullSelector + ' ' + tag + '#' + clue];
              }).reduce(function (total, other) {
                return total.concat(other);
              }, []).join(',');
            }

            context.assertElementExists(fullSelector, options);

            return context.fillIn(fullSelector, container, options, content);
          });
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/focusable', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _helpers, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.focusable = focusable;


  /**
   *
   * Focuses element matched by selector.
   *
   * @example
   *
   * // <input class="name">
   * // <input class="email">
   *
   * import { create, focusable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   focus: focusable('.name')
   * });
   *
   * // focuses on element with selector '.name'
   * page.focus();
   *
   * @example
   *
   * // <div class="scope">
   * //   <input class="name">
   * // </div>
   * // <input class="email">
   *
   * import { create, focusable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   focus: focusable('.name', { scope: '.scope' })
   * });
   *
   * // focuses on element with selector '.scope .name'
   * page.focus();
   *
   * @example
   *
   * // <div class="scope">
   * //   <input class="name">
   * // </div>
   * // <input class="email">
   *
   * import { create, focusable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   focus: focusable('.name')
   * });
   *
   * // focuses on element with selector '.scope .name'
   * page.focus();
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element which will be focused
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Ignore parent scope
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
  */
  function focusable(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        return function () {
          var executionContext = (0, _execution_context.getExecutionContext)(this);
          var options = (0, _helpers.assign)({ pageObjectKey: key + '()' }, userOptions);

          return executionContext.runAsync(function (context) {
            return context.focus(selector, options);
          });
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/has-class', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend'], function (exports, _helpers, _extend) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.hasClass = hasClass;


  /**
   * Validates if an element or a set of elements have a given CSS class.
   *
   * @example
   *
   * // <em class="lorem"></em><span class="success">Message!</span>
   *
   * import { create, hasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   messageIsSuccess: hasClass('success', 'span')
   * });
   *
   * assert.ok(page.messageIsSuccess);
   *
   * @example
   *
   * // <span class="success"></span>
   * // <span class="error"></span>
   *
   * import { create, hasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   messagesAreSuccessful: hasClass('success', 'span', { multiple: true })
   * });
   *
   * assert.notOk(page.messagesAreSuccessful);
   *
   * @example
   *
   * // <span class="success"></span>
   * // <span class="success"></span>
   *
   * import { create, hasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   messagesAreSuccessful: hasClass('success', 'span', { multiple: true })
   * });
   *
   * assert.ok(page.messagesAreSuccessful);
   *
   * @example
   *
   * // <div>
   * //   <span class="lorem"></span>
   * // </div>
   * // <div class="scope">
   * //   <span class="ipsum"></span>
   * // </div>
   *
   * import { create, hasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanHasClass: hasClass('ipsum', 'span', { scope: '.scope' })
   * });
   *
   * assert.ok(page.spanHasClass);
   *
   * @example
   *
   * // <div>
   * //   <span class="lorem"></span>
   * // </div>
   * // <div class="scope">
   * //   <span class="ipsum"></span>
   * // </div>
   *
   * import { create, hasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   spanHasClass: hasClass('ipsum', 'span')
   * });
   *
   * assert.ok(page.spanHasClass);
   *
   * @public
   *
   * @param {string} cssClass - CSS class to be validated
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {boolean} options.multiple - Check if all elements matched by selector have the CSS class
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function hasClass(cssClass, selector) {
    var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        var elements = options.multiple ? (0, _extend.findMany)(this, selector, options) : [(0, _extend.findOne)(this, selector, options)];

        return Ember.A(elements).every(function (element) {
          return element.classList.contains(cssClass);
        });
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/is-hidden', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend', '-jquery'], function (exports, _helpers, _extend, _jquery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isHidden = isHidden;


  /**
   * Validates if an element or set of elements is hidden or does not exist in the DOM.
   *
   * @example
   *
   * // Lorem <span style="display:none">ipsum</span>
   *
   * import { create, isHidden } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanIsHidden: isHidden('span')
   * });
   *
   * assert.ok(page.spanIsHidden);
   *
   * @example
   *
   * // <span>ipsum</span>
   * // <span style="display:none">dolor</span>
   *
   * import { create, isHidden } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spansAreHidden: isHidden('span', { multiple: true })
   * });
   *
   * // not all spans are hidden
   * assert.notOk(page.spansAreHidden);
   *
   * @example
   *
   * // <span style="display:none">dolor</span>
   * // <span style="display:none">dolor</span>
   *
   * import { create, isHidden } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spansAreHidden: isHidden('span', { multiple: true })
   * });
   *
   * // all spans are hidden
   * assert.ok(page.spansAreHidden);
   *
   * @example
   *
   * // Lorem <strong>ipsum</strong>
   *
   * import { create, isHidden } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanIsHidden: isHidden('span')
   * });
   *
   * // returns true when element doesn't exist in DOM
   * assert.ok(page.spanIsHidden);
   *
   * @example
   *
   * // <div><span>lorem</span></div>
   * // <div class="scope"><span style="display:none">ipsum</span></div>
   * // <div><span>dolor</span></div>
   *
   * import { create, isHidden } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scopedSpanIsHidden: isHidden('span', { scope: '.scope' })
   * });
   *
   * assert.ok(page.scopedSpanIsHidden);
   *
   * @example
   *
   * // <div><span>lorem</span></div>
   * // <div class="scope"><span style="display:none">ipsum</span></div>
   * // <div><span>dolor</span></div>
   *
   * import { create, isHidden } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   scopedSpanIsHidden: isHidden('span')
   * });
   *
   * assert.ok(page.scopedSpanIsHidden);
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {boolean} options.multiple - Check if all elements matched by selector are hidden
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function isHidden(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        var elements = (0, _extend.findMany)(this, selector, options);

        (0, _helpers.guardMultiple)(elements, selector, options.multiple);

        return elements.length === 0 || Ember.A(elements).every(function (element) {
          return (0, _jquery.default)(element).is(':hidden');
        });
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/is-present', ['exports', 'ember-cli-page-object/test-support/extend', 'ember-cli-page-object/test-support/-private/helpers'], function (exports, _extend, _helpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isPresent = isPresent;


  /**
   * Validates if any element matching the target selector is rendered in the DOM.
   *
   * `isPresent` vs. `isVisible`:
   *   - Both validate that an element matching the target selector can be found in the DOM
   *   - `isVisible` additionally validates that all matching elements are visible
   *
   * Some uses cases for `isPresent` over `isVisible`:
   *   - To check for the presence of a tag that is never visible in the DOM (e.g. `<meta>`).
   *   - To validate that, even though an element may not currently be visible, it is still in the DOM.
   *   - To validate that an element has not merely been hidden but has in fact been removed from the DOM.
   *
   * @example
   *
   * // Lorem <span>ipsum</span>
   *
   * import { create, isPresent } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanIsPresent: isPresent('span')
   * });
   *
   * assert.ok(page.spanIsPresent);
   *
   * @example
   *
   * // <span>ipsum</span>
   * // <span style="display:none">dolor</span>
   *
   * import { create, isPresent } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanIsPresent: isPresent('span', { multiple: true })
   * });
   *
   * assert.ok(page.spanIsPresent);
   *
   * @example
   *
   * // <head>
   * //   <meta name='robots' content='noindex'>
   * // </head>
   *
   * import { create, isPresent } from 'ember-cli-page-object';
   *
   * const page = create({
   *   notIndexed: isPresent(`meta[name='robots'][content='noindex']`, {
   *     testContainer: 'head'
   *   })
   * });
   *
   * assert.ok(page.notIndexed);
   *
   * @example
   *
   * // Lorem <strong>ipsum</strong>
   *
   * import { create, isPresent } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanIsPresent: isPresent('span')
   * });
   *
   * // returns false when element doesn't exist in DOM
   * assert.notOk(page.spanIsPresent);
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {boolean} options.multiple - Check if all elements matched by selector are visible
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function isPresent(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,
      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        var elements = (0, _extend.findMany)(this, selector, options);
        (0, _helpers.guardMultiple)(elements, selector, options.multiple);
        return elements.length > 0;
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/is-visible', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend', '-jquery'], function (exports, _helpers, _extend, _jquery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isVisible = isVisible;


  /**
   * Validates if an element or set of elements are visible.
   *
   * @example
   *
   * // Lorem <span>ipsum</span>
   *
   * import { create, isVisible } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanIsVisible: isVisible('span')
   * });
   *
   * assert.ok(page.spanIsVisible);
   *
   * @example
   *
   * // <span>ipsum</span>
   * // <span style="display:none">dolor</span>
   *
   * import { create, isVisible } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spansAreVisible: isVisible('span', { multiple: true })
   * });
   *
   * // not all spans are visible
   * assert.notOk(page.spansAreVisible);
   *
   * @example
   *
   * // <span>ipsum</span>
   * // <span>dolor</span>
   *
   * import { create, isVisible } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spansAreVisible: isVisible('span', { multiple: true })
   * });
   *
   * // all spans are visible
   * assert.ok(page.spansAreVisible);
   *
   * @example
   *
   * // Lorem <strong>ipsum</strong>
   *
   * import { create, isVisible } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanIsVisible: isVisible('span')
   * });
   *
   * // returns false when element doesn't exist in DOM
   * assert.notOk(page.spanIsVisible);
   *
   * @example
   *
   * // <div>
   * //   <span style="display:none">lorem</span>
   * // </div>
   * // <div class="scope">
   * //   <span>ipsum</span>
   * // </div>
   *
   * import { create, isVisible } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanIsVisible: isVisible('span', { scope: '.scope' })
   * });
   *
   * assert.ok(page.spanIsVisible);
   *
   * @example
   *
   * // <div>
   * //   <span style="display:none">lorem</span>
   * // </div>
   * // <div class="scope">
   * //   <span>ipsum</span>
   * // </div>
   *
   * import { create, isVisible } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   spanIsVisible: isVisible('span')
   * });
   *
   * assert.ok(page.spanIsVisible);
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {boolean} options.multiple - Check if all elements matched by selector are visible
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function isVisible(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        var elements = (0, _extend.findMany)(this, selector, options);
        (0, _helpers.guardMultiple)(elements, selector, options.multiple);

        if (elements.length === 0) {
          return false;
        }

        return Ember.A(elements).every(function (element) {
          return (0, _jquery.default)(element).is(':visible');
        });
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/is', ['exports', 'ember-cli-page-object/test-support/-private/deprecate', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend'], function (exports, _deprecate, _helpers, _extend) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.is = is;


  /**
   * @public
   *
   * Validates if an element (or elements) matches a given selector.
   *
   * Useful for checking if an element (or elements) matches a selector like
   * `:disabled` or `:checked`, which can be the result of either an attribute
   * (`disabled="disabled"`, `disabled=true`) or a property (`disabled`).
   *
   * @example
   * // <input type="checkbox" checked="checked">
   * // <input type="checkbox" checked>
   *
   * import { create, is } from 'ember-cli-page-object';
   *
   * const page = create({
   *   areInputsChecked: is(':checked', 'input', { multiple: true })
   * });
   *
   * assert.equal(page.areInputsChecked, true, 'Inputs are checked');
   *
   * @example
   * // <button class="toggle-button active" disabled>Toggle something</button>
   *
   * import { create, is } from 'ember-cli-page-object';
   *
   * const page = create({
   *   isToggleButtonActive: is('.active:disabled', '.toggle-button')
   * });
   *
   * assert.equal(page.isToggleButtonActive, true, 'Button is active');
   *
   * @param {string} testSelector - CSS selector to test
   * @param {string} targetSelector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.multiple - If set, the function will return an array of values
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function is(testSelector, targetSelector) {
    var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        (0, _deprecate.default)('is-property', ':is property is deprecated', '1.16.0', '2.0.0');

        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        var elements = (0, _extend.findElementWithAssert)(this, targetSelector, options);

        return (0, _helpers.every)(elements, function (element) {
          return element.is(testSelector);
        });
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/not-has-class', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend'], function (exports, _helpers, _extend) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.notHasClass = notHasClass;


  /**
   * @public
   *
   * Validates if an element or a set of elements don't have a given CSS class.
   *
   * @example
   *
   * // <em class="lorem"></em><span class="success">Message!</span>
   *
   * import { create, notHasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   messageIsSuccess: notHasClass('error', 'span')
   * });
   *
   * assert.ok(page.messageIsSuccess);
   *
   * @example
   *
   * // <span class="success"></span>
   * // <span class="error"></span>
   *
   * import { create, notHasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   messagesAreSuccessful: notHasClass('error', 'span', { multiple: true })
   * });
   *
   * // one span has error class
   * assert.notOk(page.messagesAreSuccessful);
   *
   * @example
   *
   * // <span class="success"></span>
   * // <span class="success"></span>
   *
   * import { create, notHasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   messagesAreSuccessful: notHasClass('error', 'span', { multiple: true })
   * });
   *
   * // no spans have error class
   * assert.ok(page.messagesAreSuccessful);
   *
   * @example
   *
   * // <div>
   * //   <span class="lorem"></span>
   * // </div>
   * // <div class="scope">
   * //   <span class="ipsum"></span>
   * // </div>
   *
   * import { create, notHasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   spanNotHasClass: notHasClass('lorem', 'span', { scope: '.scope' })
   * });
   *
   * assert.ok(page.spanNotHasClass);
   *
   * @example
   *
   * // <div>
   * //   <span class="lorem"></span>
   * // </div>
   * // <div class="scope">
   * //   <span class="ipsum"></span>
   * // </div>
   *
   * import { create, notHasClass } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   spanNotHasClass: notHasClass('lorem', 'span')
   * });
   *
   * assert.ok(page.spanNotHasClass);
   *
   * @public
   *
   * @param {string} cssClass - CSS class to be validated
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {boolean} options.multiple - Check if all elements matched by selector don't have the CSS class
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function notHasClass(cssClass, selector) {
    var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        var elements = options.multiple ? (0, _extend.findMany)(this, selector, options) : [(0, _extend.findOne)(this, selector, options)];

        return Ember.A(elements).every(function (element) {
          return !element.classList.contains(cssClass);
        });
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/property', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend', '-jquery'], function (exports, _helpers, _extend, _jquery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.property = property;


  /**
   * @public
   *
   * Returns the value of a property from the matched element, or an array of
   * values from multiple matched elements.
   *
   * @example
   * // <input type="checkbox" checked="checked">
   *
   * import { create, property } from 'ember-cli-page-object';
   *
   * const page = create({
   *   isChecked: property('checked', 'input')
   * });
   *
   * assert.ok(page.isChecked);
   *
   * @example
   *
   * // <input type="checkbox" checked="checked">
   * // <input type="checkbox" checked="">
   *
   * import { create, property } from 'ember-cli-page-object';
   *
   * const page = create({
   *   inputsChecked: property('checked', 'input', { multiple: true })
   * });
   *
   * assert.deepEqual(page.inputsChecked, [true, false]);
   *
   * @example
   *
   * // <div><input></div>
   * // <div class="scope"><input type="checkbox" checked="checked"></div>
   * // <div><input></div>
   *
   * import { create, property } from 'ember-cli-page-object';
   *
   * const page = create({
   *   isChecked: property('checked', 'input', { scope: '.scope' })
   * });
   *
   * assert.ok(page.isChecked);
   *
   * @public
   *
   * @param {string} propertyName - Name of the property to get
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.multiple - If set, the function will return an array of values
   * @return {Descriptor}
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function property(propertyName, selector) {
    var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        if (options.multiple) {
          return (0, _extend.findMany)(this, selector, options).map(function (element) {
            return (0, _jquery.default)(element).prop(propertyName);
          });
        } else {
          return (0, _jquery.default)((0, _extend.findOne)(this, selector, options)).prop(propertyName);
        }
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/text', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend', '-jquery'], function (exports, _helpers, _extend, _jquery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.text = text;


  function identity(v) {
    return v;
  }

  /**
   * @public
   *
   * Returns text of the element or Array of texts of all matched elements by selector.
   *
   * @example
   *
   * // Hello <span>world!</span>
   *
   * import { create, text } from 'ember-cli-page-object';
   *
   * const page = create({
   *   text: text('span')
   * });
   *
   * assert.equal(page.text, 'world!');
   *
   * @example
   *
   * // <span>lorem</span>
   * // <span> ipsum </span>
   * // <span>dolor</span>
   *
   * import { create, text } from 'ember-cli-page-object';
   *
   * const page = create({
   *   texts: text('span', { multiple: true })
   * });
   *
   * assert.deepEqual(page.texts, ['lorem', 'ipsum', 'dolor']);
   *
   * @example
   *
   * // <div><span>lorem</span></div>
   * // <div class="scope"><span>ipsum</span></div>
   * // <div><span>dolor</span></div>
   *
   * import { create, text } from 'ember-cli-page-object';
   *
   * const page = create({
   *   text: text('span', { scope: '.scope' })
   * });
   *
   * assert.equal(page.text, 'ipsum');
   *
   * @example
   *
   * // <div><span>lorem</span></div>
   * // <div class="scope"><span>ipsum</span></div>
   * // <div><span>dolor</span></div>
   *
   * import { create, text } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   text: text('span')
   * });
   *
   * // returns 'ipsum'
   * assert.equal(page.text, 'ipsum');
   *
   * @example
   *
   * // <div><span>lorem</span></div>
   * // <div class="scope">
   * //  ipsum
   * // </div>
   * // <div><span>dolor</span></div>
   *
   * import { create, text } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   text: text('span', { normalize: false })
   * });
   *
   * // returns 'ipsum'
   * assert.equal(page.text, '\n ipsum\n');
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {boolean} options.multiple - Return an array of values
   * @param {boolean} options.normalize - Set to `false` to avoid text normalization
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function text(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);
        var f = options.normalize === false ? identity : _helpers.normalizeText;

        if (options.multiple) {
          return (0, _extend.findMany)(this, selector, options).map(function (element) {
            return f((0, _jquery.default)(element).text());
          });
        } else {
          return f((0, _jquery.default)((0, _extend.findOne)(this, selector, options)).text());
        }
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/triggerable', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context'], function (exports, _helpers, _execution_context) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.triggerable = triggerable;


  /**
   *
   * Triggers event on element matched by selector.
   *
   * @example
   *
   * // <input class="name">
   * // <input class="email">
   *
   * import { create, triggerable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   enter: triggerable('keypress', '.name', { eventProperties: { keyCode: 13 } })
   * });
   *
   * // triggers keypress using enter key on element with selector '.name'
   * page.enter();
   *
   * @example
   *
   * // <input class="name">
   * // <input class="email">
   *
   * import { create, triggerable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   keydown: triggerable('keypress', '.name')
   * });
   *
   * // triggers keypress using enter key on element with selector '.name'
   * page.keydown({ which: 13 });
   *
   * @example
   *
   * // <div class="scope">
   * //   <input class="name">
   * // </div>
   * // <input class="email">
   *
   * import { create, triggerable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   keydown: triggerable('keypress', '.name', { scope: '.scope' })
   * });
   *
   * // triggers keypress using enter key on element with selector '.name'
   * page.keydown({ which: 13 });
   *
   * @example
   *
   * // <div class="scope">
   * //   <input class="name">
   * // </div>
   * // <input class="email">
   *
   * import { create, triggerable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   keydown: triggerable('keypress', '.name')
   * });
   *
   * // triggers keypress using enter key on element with selector '.name'
   * page.keydown({ which: 13 });
   *
   * @public
   *
   * @param {string} event - Event to be triggered
   * @param {string} selector - CSS selector of the element on which the event will be triggered
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.resetScope - Ignore parent scope
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @param {string} options.eventProperties - Event properties that will be passed to trigger function
   * @return {Descriptor}
  */
  function triggerable(event, selector) {
    var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        return function () {
          var _this = this;

          var eventProperties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          var executionContext = (0, _execution_context.getExecutionContext)(this);
          var options = (0, _helpers.assign)({ pageObjectKey: key + '()' }, userOptions);
          var staticEventProperties = (0, _helpers.assign)({}, options.eventProperties);

          return executionContext.runAsync(function (context) {
            var fullSelector = (0, _helpers.buildSelector)(_this, selector, options);
            var container = options.testContainer || (0, _helpers.findClosestValue)(_this, 'testContainer');

            context.assertElementExists(fullSelector, options);

            var mergedEventProperties = (0, _helpers.assign)(staticEventProperties, eventProperties);
            return context.triggerEvent(fullSelector, container, options, event, mergedEventProperties);
          });
        };
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/value', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/extend', '-jquery'], function (exports, _helpers, _extend, _jquery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.value = value;


  /**
   * @public
   *
   * Returns the value of a matched element, or an array of values of all
   * matched elements. If a matched element is contenteditable, this helper
   * will return the html content of the element.
   *
   * @example
   *
   * // <input value="Lorem ipsum">
   *
   * import { create, value } from 'ember-cli-page-object';
   *
   * const page = create({
   *   value: value('input')
   * });
   *
   * assert.equal(page.value, 'Lorem ipsum');
   *
   * @example
   *
   * // <div contenteditable="true"><b>Lorem ipsum</b></div>
   *
   * import { create, value } from 'ember-cli-page-object';
   *
   * const page = create({
   *   value: value('[contenteditable]')
   * });
   *
   * assert.equal(page.value, '<b>Lorem ipsum</b>');
   *
   * @example
   *
   * // <input value="lorem">
   * // <input value="ipsum">
   *
   * import { create, value } from 'ember-cli-page-object';
   *
   * const page = create({
   *   value: value('input', { multiple: true })
   * });
   *
   * assert.deepEqual(page.value, ['lorem', 'ipsum']);
   *
   * @example
   *
   * // <div><input value="lorem"></div>
   * // <div class="scope"><input value="ipsum"></div>
   *
   * import { create, value } from 'ember-cli-page-object';
   *
   * const page = create({
   *   value: value('input', { scope: '.scope' })
   * });
   *
   * assert.equal(page.value, 'ipsum');
   *
   * @example
   *
   * // <div><input value="lorem"></div>
   * // <div class="scope"><input value="ipsum"></div>
   *
   * import { create, value } from 'ember-cli-page-object';
   *
   * const page = create({
   *   scope: '.scope',
   *   value: value('input')
   * });
   *
   * assert.equal(page.value, 'ipsum');
   *
   * @public
   *
   * @param {string} selector - CSS selector of the element to check
   * @param {Object} options - Additional options
   * @param {string} options.scope - Nests provided scope within parent's scope
   * @param {boolean} options.resetScope - Override parent's scope
   * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
   * @param {boolean} options.multiple - If set, the function will return an array of values
   * @param {string} options.testContainer - Context where to search elements in the DOM
   * @return {Descriptor}
   *
   * @throws Will throw an error if no element matches selector
   * @throws Will throw an error if multiple elements are matched by selector and multiple option is not set
   */
  function value(selector) {
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return {
      isDescriptor: true,

      get: function get(key) {
        var options = (0, _helpers.assign)({ pageObjectKey: key }, userOptions);

        var checkValue = function checkValue(element) {
          return element.hasAttribute('contenteditable') ? (0, _jquery.default)(element).html() : (0, _jquery.default)(element).val();
        };

        if (options.multiple) {
          return (0, _extend.findMany)(this, selector, options).map(checkValue);
        } else {
          return checkValue((0, _extend.findOne)(this, selector, options));
        }
      }
    };
  }
});
define('ember-cli-page-object/test-support/properties/visitable', ['exports', 'ember-cli-page-object/test-support/-private/helpers', 'ember-cli-page-object/test-support/-private/execution_context', '-jquery'], function (exports, _helpers, _execution_context, _jquery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.visitable = visitable;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function fillInDynamicSegments(path, params) {
    return path.split('/').map(function (segment) {
      var match = segment.match(/^:(.+)$/);

      if (match) {
        var _match = _slicedToArray(match, 2),
            key = _match[1];

        var value = params[key];

        if (typeof value === 'undefined') {
          throw new Error('Missing parameter for \'' + key + '\'');
        }

        // Remove dynamic segment key from params
        delete params[key];

        return encodeURIComponent(value);
      }

      return segment;
    }).join('/');
  }

  function appendQueryParams(path, queryParams) {
    if (Object.keys(queryParams).length) {
      path += '?' + _jquery.default.param(queryParams);
    }

    return path;
  }

  /**
   * @public
   *
   * Loads a given route.
   *
   * The resulting descriptor can be called with dynamic segments and parameters.
   *
   * @example
   *
   * import { create, visitable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   visit: visitable('/users')
   * });
   *
   * // visits '/users'
   * page.visit();
   *
   * @example
   *
   * import { create, visitable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   visit: visitable('/users/:user_id')
   * });
   *
   * // visits '/users/10'
   * page.visit({ user_id: 10 });
   *
   * @example
   *
   * import { create, visitable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   visit: visitable('/users')
   * });
   *
   * // visits '/users?name=john'
   * page.visit({ name: 'john' });
   *
   * @example
   *
   * import { create, visitable } from 'ember-cli-page-object';
   *
   * const page = create({
   *   visit: visitable('/users/:user_id')
   * });
   *
   * // visits '/users/1?name=john'
   * page.visit({ user_id: 1, name: 'john' });
   *
   * @param {string} path - Full path of the route to visit
   * @return {Descriptor}
   *
   * @throws Will throw an error if dynamic segments are not filled
   */
  function visitable(path) {
    return {
      isDescriptor: true,

      get: function get() {
        return function () {
          var dynamicSegmentsAndQueryParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          var executionContext = (0, _execution_context.getExecutionContext)(this);

          return executionContext.runAsync(function (context) {
            var params = (0, _helpers.assign)({}, dynamicSegmentsAndQueryParams);
            var fullPath = fillInDynamicSegments(path, params);

            fullPath = appendQueryParams(fullPath, params);

            return context.visit(fullPath);
          });
        };
      }
    };
  }
});
define('ember-cli-qunit', ['exports', 'ember-qunit'], function (exports, _emberQunit) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'TestLoader', {
    enumerable: true,
    get: function () {
      return _emberQunit.TestLoader;
    }
  });
  Object.defineProperty(exports, 'setupTestContainer', {
    enumerable: true,
    get: function () {
      return _emberQunit.setupTestContainer;
    }
  });
  Object.defineProperty(exports, 'loadTests', {
    enumerable: true,
    get: function () {
      return _emberQunit.loadTests;
    }
  });
  Object.defineProperty(exports, 'startTests', {
    enumerable: true,
    get: function () {
      return _emberQunit.startTests;
    }
  });
  Object.defineProperty(exports, 'setupTestAdapter', {
    enumerable: true,
    get: function () {
      return _emberQunit.setupTestAdapter;
    }
  });
  Object.defineProperty(exports, 'start', {
    enumerable: true,
    get: function () {
      return _emberQunit.start;
    }
  });
});
define("ember-cli-test-loader/test-support/index", ["exports"], function (_exports) {
  /* globals requirejs, require */
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.addModuleIncludeMatcher = addModuleIncludeMatcher;
  _exports.addModuleExcludeMatcher = addModuleExcludeMatcher;
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var moduleIncludeMatchers = [];
  var moduleExcludeMatchers = [];

  function addModuleIncludeMatcher(fn) {
    moduleIncludeMatchers.push(fn);
  }

  function addModuleExcludeMatcher(fn) {
    moduleExcludeMatchers.push(fn);
  }

  function checkMatchers(matchers, moduleName) {
    return matchers.some(function (matcher) {
      return matcher(moduleName);
    });
  }

  var TestLoader = /*#__PURE__*/function () {
    function TestLoader() {
      _classCallCheck(this, TestLoader);

      this._didLogMissingUnsee = false;
    }

    _createClass(TestLoader, [{
      key: "shouldLoadModule",
      value: function shouldLoadModule(moduleName) {
        return moduleName.match(/[-_]test$/);
      }
    }, {
      key: "listModules",
      value: function listModules() {
        return Object.keys(requirejs.entries);
      }
    }, {
      key: "listTestModules",
      value: function listTestModules() {
        var moduleNames = this.listModules();
        var testModules = [];
        var moduleName;

        for (var i = 0; i < moduleNames.length; i++) {
          moduleName = moduleNames[i];

          if (checkMatchers(moduleExcludeMatchers, moduleName)) {
            continue;
          }

          if (checkMatchers(moduleIncludeMatchers, moduleName) || this.shouldLoadModule(moduleName)) {
            testModules.push(moduleName);
          }
        }

        return testModules;
      }
    }, {
      key: "loadModules",
      value: function loadModules() {
        var testModules = this.listTestModules();
        var testModule;

        for (var i = 0; i < testModules.length; i++) {
          testModule = testModules[i];

          this.require(testModule);

          this.unsee(testModule);
        }
      }
    }, {
      key: "require",
      value: function (_require) {
        function require(_x) {
          return _require.apply(this, arguments);
        }

        require.toString = function () {
          return _require.toString();
        };

        return require;
      }(function (moduleName) {
        try {
          require(moduleName);
        } catch (e) {
          this.moduleLoadFailure(moduleName, e);
        }
      })
    }, {
      key: "unsee",
      value: function unsee(moduleName) {
        if (typeof require.unsee === 'function') {
          require.unsee(moduleName);
        } else if (!this._didLogMissingUnsee) {
          this._didLogMissingUnsee = true;

          if (typeof console !== 'undefined') {
            console.warn('unable to require.unsee, please upgrade loader.js to >= v3.3.0');
          }
        }
      }
    }, {
      key: "moduleLoadFailure",
      value: function moduleLoadFailure(moduleName, error) {
        console.error('Error loading: ' + moduleName, error.stack);
      }
    }], [{
      key: "load",
      value: function load() {
        new TestLoader().loadModules();
      }
    }]);

    return TestLoader;
  }();

  _exports.default = TestLoader;
  ;
});
define("ember-exam/test-support/-private/async-iterator", ["exports"], function (_exports) {
  'use strict';

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var iteratorCompleteResponse = {
    done: true,
    value: null
  };
  /**
   * A class to iterate a sequencial set of asynchronous events.
   *
   * @class AsyncIterator
   */

  var AsyncIterator = /*#__PURE__*/function () {
    function AsyncIterator(testem, options) {
      _classCallCheck(this, AsyncIterator);

      this._testem = testem;
      this._request = options.request;
      this._response = options.response;
      this._done = false;
      this._current = null;
      this._boundHandleResponse = this.handleResponse.bind(this);
      this._waiting = false; // Set a timeout value from either url parameter or default timeout value, 15 s.

      this._timeout = options.timeout || 15;
      this._browserId = options.browserId;
      this._emberExamExitOnError = options.emberExamExitOnError;
      testem.on(this._response, this._boundHandleResponse);
    }
    /**
     * Indicates whether the response queue is done or not.
     *
     * @method done
     * @return {bool} whether the response queue is done or not
     */


    _createClass(AsyncIterator, [{
      key: "done",
      get: function get() {
        return this._done;
      }
      /**
       * @method toString
       * @return {String} the stringified value of the iterator.
       */

    }, {
      key: "toString",
      value: function toString() {
        return "<AsyncIterator (request: ".concat(this._request, " response: ").concat(this._response, ")>");
      }
      /**
       * Handle a response when it's waiting for a response
       *
       * @method handleResponse
       * @param {*} response
       */

    }, {
      key: "handleResponse",
      value: function handleResponse(response) {
        if (this._waiting === false) {
          throw new Error("".concat(this.toString(), " Was not expecting a response, but got a response"));
        } else {
          this._waiting = false;
        }

        try {
          if (response.done) {
            this.dispose();
          }

          this._current.resolve(response);
        } catch (e) {
          this._current.reject(e);
        } finally {
          this._current = null;

          if (this.timer) {
            clearTimeout(this.timer);
          }
        }
      }
      /**
       * Dispose when an iteration is finished.
       *
       * @method dispose
       */

    }, {
      key: "dispose",
      value: function dispose() {
        this._done = true;

        this._testem.removeEventCallbacks(this._response, this._boundHandleResponse);
      }
      /**
       * Emit the current request.
       *
       * @method _makeNextRequest
       */

    }, {
      key: "_makeNextRequest",
      value: function _makeNextRequest() {
        this._waiting = true;

        this._testem.emit(this._request, this._browserId);
      }
      /**
       * Set a timeout to reject a promise if it doesn't get response within the timeout threshold.
       *
       * @method _setTimeout
       * @param {*} resolve
       */

    }, {
      key: "_setTimeout",
      value: function _setTimeout(resolve, reject) {
        var _this = this;

        clearTimeout(this.timeout);
        this.timer = setTimeout(function () {
          if (!_this._waiting) {
            return;
          }

          if (_this._emberExamExitOnError) {
            var err = new Error("EmberExam: Promise timed out after ".concat(_this._timeout, " s while waiting for response for ").concat(_this._request));
            reject(err);
          } else {
            // eslint-disable-next-line no-console
            console.error("EmberExam: Promise timed out after ".concat(_this._timeout, " s while waiting for response for ").concat(_this._request, ". Closing browser to exit gracefully."));
            resolve(iteratorCompleteResponse);
          }
        }, this._timeout * 1000);
      }
      /**
       * Gets the next response from the request and resolve the promise.
       * if it's end of the iteration resolve the promise with done being true.
       *
       * @method next
       * @return {Promise}
       */

    }, {
      key: "next",
      value: function next() {
        var _this2 = this;

        if (this._done) {
          return Promise.resolve(iteratorCompleteResponse);
        }

        if (this._current) {
          return this._current.promise;
        }

        var resolve, reject;
        var promise = new Promise(function (_resolve, _reject) {
          resolve = _resolve;
          reject = _reject;

          _this2._setTimeout(resolve, reject);
        });
        this._current = {
          resolve: resolve,
          reject: reject,
          promise: promise
        };

        this._makeNextRequest();

        return promise;
      }
    }]);

    return AsyncIterator;
  }();

  _exports.default = AsyncIterator;
});
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define("ember-exam/test-support/-private/ember-exam-mocha-test-loader", ["exports", "ember-exam/test-support/-private/get-url-params", "ember-exam/test-support/-private/split-test-modules", "ember-exam/test-support/-private/filter-test-modules", "ember-mocha/test-loader"], function (_exports, _getUrlParams, _splitTestModules, _filterTestModules, _testLoader) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

  function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  /**
   * EmberExamMochaTestLoader extends ember-mocha/test-loader used by `ember test`, since it
   * overrides moduleLoadFailure() to log a test failure when a module fails to load
   * @class EmberExamMochaTestLoader
   * @extends {TestLoader}
   */
  var EmberExamMochaTestLoader = /*#__PURE__*/function (_TestLoader) {
    _inherits(EmberExamMochaTestLoader, _TestLoader);

    var _super = _createSuper(EmberExamMochaTestLoader);

    function EmberExamMochaTestLoader(testem, urlParams) {
      var _this;

      _classCallCheck(this, EmberExamMochaTestLoader);

      _this = _super.call(this);
      _this._testModules = [];
      _this._testem = testem;
      _this._urlParams = urlParams || (0, _getUrlParams.default)();
      return _this;
    }

    _createClass(EmberExamMochaTestLoader, [{
      key: "urlParams",
      get: function get() {
        return this._urlParams;
      }
      /**
       * Ember-cli-test-loader instantiates a new TestLoader instance and calls loadModules.
       * EmberExamMochaTestLoader does not support load() in favor of loadModules().
       *
       * @method load
       */

    }, {
      key: "require",
      value:
      /**
       * require() collects the full list of modules before requiring each module with
       * super.require, instead of requiring and unseeing a module when each gets loaded.
       *
       * @method require
       * @param {string} moduleName
       */
      function require(moduleName) {
        this._testModules.push(moduleName);
      }
      /**
       * Make unsee a no-op to avoid any unwanted resets
       *
       * @method unsee
       */

    }, {
      key: "unsee",
      value: function unsee() {}
      /**
       * Loads the test modules depending on the urlParam
       *
       * @method loadModules
       */

    }, {
      key: "loadModules",
      value: function loadModules() {
        var _this2 = this;

        var modulePath = this._urlParams.get('modulePath');

        var filePath = this._urlParams.get('filePath');

        var partitions = this._urlParams.get('partition');

        var split = parseInt(this._urlParams.get('split'), 10);
        split = isNaN(split) ? 1 : split;

        if (partitions === undefined) {
          partitions = [1];
        } else if (!Array.isArray(partitions)) {
          partitions = [partitions];
        }

        _get(_getPrototypeOf(EmberExamMochaTestLoader.prototype), "loadModules", this).call(this);

        if (modulePath || filePath) {
          this._testModules = (0, _filterTestModules.filterTestModules)(this._testModules, modulePath, filePath);
        }

        this._testModules = (0, _splitTestModules.default)(this._testModules, split, partitions);

        this._testModules.forEach(function (moduleName) {
          _get(_getPrototypeOf(EmberExamMochaTestLoader.prototype), "require", _this2).call(_this2, moduleName);

          _get(_getPrototypeOf(EmberExamMochaTestLoader.prototype), "unsee", _this2).call(_this2, moduleName);
        });
      }
    }], [{
      key: "load",
      value: function load() {
        throw new Error('`EmberExamMochaTestLoader` doesn\'t support `load()`.');
      }
    }]);

    return EmberExamMochaTestLoader;
  }(_testLoader.TestLoader);

  _exports.default = EmberExamMochaTestLoader;
});
define("ember-exam/test-support/-private/ember-exam-qunit-test-loader", ["exports", "ember-exam/test-support/-private/get-url-params", "ember-exam/test-support/-private/split-test-modules", "ember-exam/test-support/-private/weight-test-modules", "ember-exam/test-support/-private/filter-test-modules", "ember-qunit/test-loader", "ember-exam/test-support/-private/async-iterator", "qunit"], function (_exports, _getUrlParams, _splitTestModules, _weightTestModules, _filterTestModules, _testLoader, _asyncIterator, _qunit) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

  function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  /**
   * EmberExamQUnitTestLoader allows delayed requiring of test modules to enable test load balancing
   * It extends ember-qunit/test-loader used by `ember test`, since it overrides moduleLoadFailure()
   * to log a test failure when a module fails to load
   * @class EmberExamQUnitTestLoader
   * @extends {TestLoader}
   */
  var EmberExamQUnitTestLoader = /*#__PURE__*/function (_TestLoader) {
    _inherits(EmberExamQUnitTestLoader, _TestLoader);

    var _super = _createSuper(EmberExamQUnitTestLoader);

    function EmberExamQUnitTestLoader(testem, urlParams) {
      var _this;

      var qunit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _qunit.default;

      _classCallCheck(this, EmberExamQUnitTestLoader);

      _this = _super.call(this);
      _this._testModules = [];
      _this._testem = testem;
      _this._qunit = qunit;
      _this._urlParams = urlParams || (0, _getUrlParams.default)();
      return _this;
    }

    _createClass(EmberExamQUnitTestLoader, [{
      key: "urlParams",
      get: function get() {
        return this._urlParams;
      }
      /**
       * ember-cli-test-loader instantiates a new TestLoader instance and calls loadModules.
       * EmberExamQUnitTestLoader does not support load() in favor of loadModules().
       *
       * @method load
       */

    }, {
      key: "require",
      value:
      /**
       * require() collects the full list of modules before requiring each module with
       * super.require(), instead of requiring and unseeing a module when each gets loaded.
       *
       * @method require
       * @param {string} moduleName
       */
      function require(moduleName) {
        this._testModules.push(moduleName);
      }
      /**
       * Make unsee a no-op to avoid any unwanted resets
       *
       * @method unsee
       */

    }, {
      key: "unsee",
      value: function unsee() {}
      /**
       * Loads the test modules depending on the urlParam
       *
       * @method loadModules
       */

    }, {
      key: "loadModules",
      value: function loadModules() {
        var _this2 = this;

        var loadBalance = this._urlParams.get('loadBalance');

        var browserId = this._urlParams.get('browser');

        var modulePath = this._urlParams.get('modulePath');

        var filePath = this._urlParams.get('filePath');

        var partitions = this._urlParams.get('partition');

        var split = parseInt(this._urlParams.get('split'), 10);
        split = isNaN(split) ? 1 : split;

        if (partitions === undefined) {
          partitions = [1];
        } else if (!Array.isArray(partitions)) {
          partitions = [partitions];
        }

        _get(_getPrototypeOf(EmberExamQUnitTestLoader.prototype), "loadModules", this).call(this);

        this.setupModuleMetadataHandler();

        if (modulePath || filePath) {
          this._testModules = (0, _filterTestModules.filterTestModules)(this._testModules, modulePath, filePath);
        }

        if (loadBalance && this._testem) {
          this.setupLoadBalanceHandlers();
          this._testModules = (0, _splitTestModules.default)((0, _weightTestModules.default)(this._testModules), split, partitions);

          this._testem.emit('testem:set-modules-queue', this._testModules, browserId);
        } else {
          this._testModules = (0, _splitTestModules.default)(this._testModules, split, partitions);

          this._testModules.forEach(function (moduleName) {
            _get(_getPrototypeOf(EmberExamQUnitTestLoader.prototype), "require", _this2).call(_this2, moduleName);

            _get(_getPrototypeOf(EmberExamQUnitTestLoader.prototype), "unsee", _this2).call(_this2, moduleName);
          });
        }
      }
      /**
       * Allow loading one module at a time.
       *
       * @method loadIndividualModule
       * @param {string} moduleName
       */

    }, {
      key: "loadIndividualModule",
      value: function loadIndividualModule(moduleName) {
        if (moduleName === undefined) {
          throw new Error('Failed to load a test module. `moduleName` is undefined in `loadIndividualModule`.');
        }

        _get(_getPrototypeOf(EmberExamQUnitTestLoader.prototype), "require", this).call(this, moduleName);

        _get(_getPrototypeOf(EmberExamQUnitTestLoader.prototype), "unsee", this).call(this, moduleName);
      }
      /**
       * setupModuleMetadataHandler() register QUnit callback to enable generating module metadata file.
       *
       * @method setupModuleMetadataHandler
       */

    }, {
      key: "setupModuleMetadataHandler",
      value: function setupModuleMetadataHandler() {
        var _this3 = this;

        this._qunit.testDone(function (metadata) {
          if (typeof _this3._testem !== 'undefined' && _this3._testem !== null) {
            // testem:test-done-metadata is sent to server to track test module details.
            // metadata contains name, module, failed, passed, total, duration, skipped, and todo.
            // https://api.qunitjs.com/callbacks/QUnit.testDone
            _this3._testem.emit('testem:test-done-metadata', metadata);
          }
        });
      }
      /**
       * setupLoadBalanceHandlers() registers QUnit callbacks needed for the load-balance option.
       *
       * @method setupLoadBalanceHandlers
       */

    }, {
      key: "setupLoadBalanceHandlers",
      value: function setupLoadBalanceHandlers() {
        var _this4 = this;

        // nextModuleAsyncIterator handles the async testem events
        // it returns an element of {value: <moduleName>, done: boolean}
        var nextModuleAsyncIterator = new _asyncIterator.default(this._testem, {
          request: 'testem:next-module-request',
          response: 'testem:next-module-response',
          timeout: this._urlParams.get('asyncTimeout'),
          browserId: this._urlParams.get('browser'),
          emberExamExitOnError: this._urlParams.get('_emberExamExitOnError')
        });

        var nextModuleHandler = function nextModuleHandler() {
          // if there are already tests queued up, don't request next module
          // this is possible if a test file has multiple qunit modules
          if (_this4._qunit.config.queue.length > 0) {
            return;
          }

          return nextModuleAsyncIterator.next().then(function (response) {
            if (!response.done) {
              var moduleName = response.value;

              _this4.loadIndividualModule(moduleName); // if no tests were added, request the next module


              if (_this4._qunit.config.queue.length === 0) {
                return nextModuleHandler();
              }
            }
          }).catch(function (e) {
            if (_typeof(e) === 'object' && e !== null && typeof e.message === 'string') {
              e.message = "EmberExam: Failed to get next test module: ".concat(e.message);
            }

            throw new Error("EmberExam: Failed to get next test module: ".concat(e));
          });
        }; // it registers qunit begin callback to ask for a next test moudle to execute when the test suite begins.
        // By default ember-qunit adds `Ember.onerror` test to a qunit processing queue and once the test is complete it execute _qunit.moduleDone callback.
        // However, when `setupEmberOnerrorValidation: false` is passed the test is disabled and _qunit.begin callback needs to request a next test module to run.


        this._qunit.begin(function () {
          return nextModuleHandler();
        });

        this._qunit.moduleDone(function () {
          return nextModuleHandler();
        });
      }
    }], [{
      key: "load",
      value: function load() {
        throw new Error('`EmberExamQUnitTestLoader` doesn\'t support `load()`.');
      }
    }]);

    return EmberExamQUnitTestLoader;
  }(_testLoader.TestLoader);

  _exports.default = EmberExamQUnitTestLoader;
});
define("ember-exam/test-support/-private/filter-test-modules", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.convertFilePathToModulePath = convertFilePathToModulePath;
  _exports.filterTestModules = filterTestModules;
  // A regular expression to help parsing a string to verify regex.
  var MODULE_PATH_REGEXP = /^(!?)\/(.*)\/(i?)$/;
  var TEST_PATH_REGEX = /\/tests\/(.*?)$/;
  /**
   * Return the matched test.
   * e.g. if an input is '!/weight/' it returns an array, ['!/weight/', '!', 'weight', ''];
   *
   * @function getRegexFilter
   * @param {*} modulePath
   */

  function getRegexFilter(modulePath) {
    return MODULE_PATH_REGEXP.exec(modulePath);
  }
  /**
   * Determine if a given module path is matched with module filter with wildcard.
   * e.g. A given moduleFilter, /tests/integration/*, matches with /tests/integration/foo and /tests/integration/bar
   *
   * @function wildcardFilter
   * @param {*} module
   * @param {*} moduleFilter
   */


  function wildcardFilter(module, moduleFilter) {
    // Generate a regular expression to handle wildcard from path filter
    var moduleFilterRule = ['^.*', moduleFilter.split('*').join('.*'), '$'].join('');
    return new RegExp(moduleFilterRule).test(module);
  }
  /**
   * Return a list of test modules that contain a given module path string.
   *
   * @function stringFilter
   * @param {Array<string>} modules
   * @param {string} moduleFilter
   */


  function stringFilter(modules, moduleFilter) {
    return modules.filter(function (module) {
      return module.includes(moduleFilter) || wildcardFilter(module, moduleFilter);
    });
  }
  /**
   * Return a list of test modules that matches with a given regular expression.
   *
   * @function regexFilter
   * @param {Array<string>} modules
   * @param {Array<string>} modulePathRegexFilter
   */


  function regexFilter(modules, modulePathRegexFilter) {
    var re = new RegExp(modulePathRegexFilter[2], modulePathRegexFilter[3]);
    var exclude = modulePathRegexFilter[1];
    return modules.filter(function (module) {
      return !exclude && re.test(module) || exclude && !re.test(module);
    });
  }
  /**
   * Return a module path that's mapped by a given test file path.
   *
   * @function convertFilePathToModulePath
   * @param {*} filePath
   */


  function convertFilePathToModulePath(filePath) {
    var filePathWithNoExtension = filePath.replace(/\.[^/.]+$/, '');
    var testFilePathMatch = TEST_PATH_REGEX.exec(filePathWithNoExtension);

    if (typeof filePath !== 'undefined' && testFilePathMatch !== null) {
      return testFilePathMatch[0];
    }

    return filePathWithNoExtension;
  }
  /**
   * Returns a list of test modules that match with the given module path filter or test file path.
   *
   * @function filterTestModules
   * @param {Array<string>} modules
   * @param {string} modulePath
   * @param {string} filePath
   */


  function filterTestModules(modules, modulePath, filePath) {
    // Generates an array with module filter value seperated by comma (,).
    var moduleFilters = (filePath || modulePath).split(',').map(function (value) {
      return value.trim();
    });
    var filteredTestModules = moduleFilters.reduce(function (result, moduleFilter) {
      var modulePath = convertFilePathToModulePath(moduleFilter);
      var modulePathRegex = getRegexFilter(modulePath);

      if (modulePathRegex) {
        return result.concat(regexFilter(modules, modulePathRegex).filter(function (module) {
          return result.indexOf(module) === -1;
        }));
      } else {
        return result.concat(stringFilter(modules, modulePath).filter(function (module) {
          return result.indexOf(module) === -1;
        }));
      }
    }, []);

    if (filteredTestModules.length === 0) {
      throw new Error("No tests matched with the filter: ".concat(modulePath || filePath, "."));
    }

    return filteredTestModules;
  }
});
define("ember-exam/test-support/-private/get-test-loader", ["exports", "@embroider/macros/runtime"], function (_exports, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = getTestLoader;

  /**
   * Returns ember-exam-qunit-test-loader or ember-exam-mocha-test-loader
   *
   * @export
   * @function getTestLoader
   * @return {Object}
   */
  function getTestLoader() {
    if ((0, _runtime.macroCondition)(true)) {
      var EmberExamQUnitTestLoader = require("ember-exam/test-support/-private/ember-exam-qunit-test-loader");

      return EmberExamQUnitTestLoader['default'];
    } else if ((0, _runtime.macroCondition)(false)) {
      var EmberExamMochaTestLoader = require("ember-exam/test-support/-private/ember-exam-mocha-test-loader");

      return EmberExamMochaTestLoader['default'];
    }

    throw new Error('Unable to find a suitable test loader. You should ensure that one of `ember-qunit` or `ember-mocha` are added as dependencies.');
  }
});
define("ember-exam/test-support/-private/get-url-params", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = getUrlParams;

  function decodeQueryParam(param) {
    return decodeURIComponent(param.replace(/\+/g, '%20'));
  }
  /**
   * Parses the url and return an object containing a param's key and value
   *
   * @export
   * @function getUrlParams
   * @return {Object} urlParams
   */


  function getUrlParams() {
    var urlParams = new Map();
    var params = location.search.slice(1).split('&');

    for (var i = 0; i < params.length; i++) {
      if (params[i]) {
        var param = params[i].split('=');
        var name = decodeQueryParam(param[0]); // Allow just a key to turn on a flag, e.g., test.html?noglobals

        var value = param.length === 1 || decodeQueryParam(param.slice(1).join('='));

        if (urlParams.has(name)) {
          urlParams.set(name, [].concat(urlParams.get(name), value));
        } else {
          urlParams.set(name, value);
        }
      }
    }

    return urlParams;
  }
});
define("ember-exam/test-support/-private/patch-testem-output", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.updateTestName = updateTestName;
  _exports.patchTestemOutput = patchTestemOutput;

  /* globals Testem */

  /**
   * Returns a modified test name including browser or partition information
   *
   * @function updateTestName
   * @param {Map} urlParams
   * @param {string} testName
   * @return {string} testName
   */
  function updateTestName(urlParams, testName) {
    var split = urlParams.get('split');
    var loadBalance = urlParams.get('loadBalance');
    var partition = urlParams.get('partition') || 1;
    var browser = urlParams.get('browser') || 1;

    if (split && loadBalance) {
      testName = "Exam Partition ".concat(partition, " - Browser Id ").concat(browser, " - ").concat(testName);
    } else if (split) {
      testName = "Exam Partition ".concat(partition, " - ").concat(testName);
    } else if (loadBalance) {
      testName = "Browser Id ".concat(browser, " - ").concat(testName);
    }

    return testName;
  }
  /**
   * Setup testem test-result event to update the test name when a test completes
   *
   * @function patchTestemOutput
   * @param {Map} urlParams
   */


  function patchTestemOutput(urlParams) {
    Testem.on('test-result', function (test) {
      test.name = updateTestName(urlParams, test.name);
    });
  }
});
define("ember-exam/test-support/-private/split-test-modules", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = splitTestModules;

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function createGroups(num) {
    var groups = new Array(num);

    for (var i = 0; i < num; i++) {
      groups[i] = [];
    }

    return groups;
  }

  function filterIntoGroups(arr, filter, numGroups) {
    var filtered = arr.filter(filter);
    var groups = createGroups(numGroups);

    for (var i = 0; i < filtered.length; i++) {
      groups[i % numGroups].push(filtered[i]);
    }

    return groups;
  }

  function isLintTest(name) {
    return name.match(/\.(jshint|(es)?lint-test)$/);
  }

  function isNotLintTest(name) {
    return !isLintTest(name);
  }
  /**
   * Splits the list of modules into unique subset of modules
   * return the subset indexed by the partition
   *
   * @export
   * @function splitTestModules
   * @param {Array<string>} modules
   * @param {number} split
   * @param {number} partitions
   * @return {Array<string>} tests
   */


  function splitTestModules(modules, split, partitions) {
    if (split < 1) {
      throw new Error('You must specify a split greater than 0');
    }

    var lintTestGroups = filterIntoGroups(modules, isLintTest, split);
    var otherTestGroups = filterIntoGroups(modules, isNotLintTest, split);
    var tests = [];

    for (var i = 0; i < partitions.length; i++) {
      var partition = parseInt(partitions[i], 10);

      if (isNaN(partition)) {
        throw new Error('You must specify numbers for partition (you specified \'' + partitions + '\')');
      }

      if (split < partition) {
        throw new Error('You must specify partitions numbered less than or equal to your split value of ' + split);
      } else if (partition < 1) {
        throw new Error('You must specify partitions numbered greater than 0');
      }

      var group = partition - 1;
      tests.push.apply(tests, _toConsumableArray(lintTestGroups[group]).concat(_toConsumableArray(otherTestGroups[group])));
    }

    return tests;
  }
});
define("ember-exam/test-support/-private/weight-test-modules", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = weightTestModules;

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  var TEST_TYPE_WEIGHT = {
    eslint: 1,
    unit: 10,
    integration: 20,
    acceptance: 150
  };
  var WEIGHT_REGEX = /\/(eslint|unit|integration|acceptance)\//;
  var DEFAULT_WEIGHT = 50;
  /**
   * Return the weight for a given module name, a file path to the module
   * Ember tests consist of Acceptance, Integration, Unit, and lint tests. In general, acceptance takes
   * longest time to execute, followed by integration and unit.
   * The weight assigned to a module corresponds to its test type execution speed, with slowest being the highest in weight.
   * If the test type is not identifiable from the modulePath, weight default to 50 (ordered after acceptance, but before integration)
   *
   * @function getWeight
   * @param {string} modulePath File path to a module
   */

  function getWeight(modulePath) {
    var _ref = WEIGHT_REGEX.exec(modulePath) || [],
        _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[1];

    if (typeof TEST_TYPE_WEIGHT[key] === 'number') {
      return TEST_TYPE_WEIGHT[key];
    } else {
      return DEFAULT_WEIGHT;
    }
  }
  /**
   * Returns the list of modules sorted by its weight
   *
   * @export
   * @function weightTestModules
   * @param {Array<string>} modules
   * @return {Array<string>}
   */


  function weightTestModules(modules) {
    var groups = new Map();
    modules.forEach(function (module) {
      var moduleWeight = getWeight(module);
      var moduleWeightGroup = groups.get(moduleWeight);

      if (Array.isArray(moduleWeightGroup)) {
        moduleWeightGroup.push(module);
      } else {
        moduleWeightGroup = [module];
      }

      groups.set(moduleWeight, moduleWeightGroup);
    }); // return modules sorted by weight and alphabetically within its weighted groups

    return Array.from(groups.keys()).sort(function (a, b) {
      return b - a;
    }).reduce(function (accumulatedArray, weight) {
      var sortedModuleArr = groups.get(weight).sort();
      return accumulatedArray.concat(sortedModuleArr);
    }, []);
  }
});
define("ember-exam/test-support/load", ["exports", "ember-exam/test-support/-private/patch-testem-output", "ember-exam/test-support/-private/get-test-loader"], function (_exports, _patchTestemOutput, _getTestLoader) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = loadEmberExam;
  var loaded = false;
  /**
   * Setup EmberExamTestLoader to enable ember exam functionalities
   *
   * @function loadEmberExam
   * @return {*} testLoader
   */

  function loadEmberExam() {
    if (loaded) {
      // eslint-disable-next-line no-console
      console.warn('Attempted to load Ember Exam more than once.');
      return;
    }

    loaded = true;
    var EmberExamTestLoader = (0, _getTestLoader.default)();
    var testLoader = new EmberExamTestLoader(window.Testem);

    if (window.Testem) {
      (0, _patchTestemOutput.patchTestemOutput)(testLoader.urlParams);
    }

    return testLoader;
  }
});
define("ember-exam/test-support/start", ["exports", "ember-exam/test-support/load", "@embroider/macros/runtime"], function (_exports, _load, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = start;

  /**
   * Equivalent to ember-qunit or ember-mocha's loadTest() except this does not create a new TestLoader instance
   *
   * @function loadTests
   * @param {*} testLoader
   */
  function loadTests(testLoader) {
    if (testLoader === undefined) {
      throw new Error('A testLoader instance has not been created. You must call `loadEmberExam()` before calling `loadTest()`.');
    }

    testLoader.loadModules();
  }
  /**
   * Ember-exam's own start function to set up EmberExamTestLoader, load tests and calls start() from
   * ember-qunit or ember-mocha
   *
   * @function start
   * @param {*} qunitOptions
   */


  function start(qunitOptions) {
    var modifiedOptions = qunitOptions || Object.create(null);
    modifiedOptions.loadTests = false;
    var testLoader = (0, _load.default)();
    loadTests(testLoader);
    var emberTestFramework;

    if ((0, _runtime.macroCondition)(true)) {
      emberTestFramework = require("ember-qunit");
    } else if ((0, _runtime.macroCondition)(false)) {
      emberTestFramework = require("ember-mocha");
    }

    if (emberTestFramework.start) {
      emberTestFramework.start(modifiedOptions);
    }
  }
});
define("ember-intl/test-support/-private/make-intl-helper", ["exports", "@ember/test-helpers"], function (_exports, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.makeIntlHelper = makeIntlHelper;
  _exports.default = void 0;

  function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function makeIntlHelper(fn) {
    return function () {
      var _ref = (0, _testHelpers.getContext)(),
          owner = _ref.owner;

      (true && !(_typeof(owner) === 'object' && typeof owner.lookup === 'function') && Ember.assert('The current test context has no owner. Did you forget to call `setupTest(hooks)`, `setupContext(this)` or some other test helper?', _typeof(owner) === 'object' && typeof owner.lookup === 'function'));
      var intl = owner.lookup('service:intl');

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (typeof fn === 'string') {
        // @ts-expect-error I tried all the things. Seems like this dynamism is
        // just not possible in TypeScript. Luckily `makeIntlHelper()` generic
        // types already reliably prevent any misuse, so we do not sacrifice any
        // safety here.
        return intl[fn].apply(intl, args);
      }

      return fn.apply(void 0, [intl].concat(args));
    };
  }

  var _default = makeIntlHelper;
  _exports.default = _default;
});
define("ember-intl/test-support/-private/pick-last-locale", ["exports", "lodash.castarray", "lodash.last"], function (_exports, _lodash, _lodash2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _exports.pickLastLocale = void 0;

  // @ts-ignore We don't want to bring along extra baggage, when installed in a
  // host project.
  // @ts-ignore

  /**
   * Picks the last locale from a locales array. In case of a string value,
   * returns that string.
   *
   * @private
   * @function
   * @param {string|string[]} locale
   * @return {string}
   * @hide
   */
  var pickLastLocale = function pickLastLocale(locale) {
    return (0, _lodash2.default)((0, _lodash.default)(locale));
  };

  _exports.pickLastLocale = pickLastLocale;
  var _default = pickLastLocale;
  _exports.default = _default;
});
define("ember-intl/test-support/-private/serialize-translation", ["exports", "lodash.omit"], function (_exports, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.missingMessage = _exports.serializeTranslation = void 0;

  // @ts-ignore We don't want to bring along extra baggage, when installed in a
  // host project.

  /**
   * Takes an object and stringifies it in a deterministic way. It will also only
   * include top-level entries.
   *
   * @private
   * @function
   * @param {object} obj
   * @return {string}
   */
  var stringifyDeterministically = function stringifyDeterministically(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
  };
  /**
   * Replaces the `{` and `}` characters with `(` and `)` in order for those to
   * not be interpreted as variables.
   * Replaces the `\"` characters with `"` in order for the additional escape to work.
   * For more details, refer: https://github.com/ember-intl/ember-intl/issues/1035
   *
   * @private
   * @function
   * @param {string} subject
   * @return {string}
   */


  var replaceInterpolators = function replaceInterpolators(subject) {
    return String(subject).replace(/\{/g, '(').replace(/\}/g, ')').replace(/\\"/g, '"');
  };
  /**
   * A list of internal options that should not be serialized.
   */


  var INTERNAL_OPTIONS = 'resilient default htmlSafe'.split(' ');
  /**
   * Takes a translation options object and stringifies it in a deterministic way.
   * It will also only include top-level entries and filter out irrelevant,
   * internal entries.
   *
   * @private
   * @function
   * @param {object} options
   * @return {string}
   */

  var stringifyOptions = function stringifyOptions() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return replaceInterpolators(stringifyDeterministically((0, _lodash.default)(options, INTERNAL_OPTIONS)));
  };
  /**
   * Serializes a translation invocation deterministically.
   *
   * @private
   * @function
   * @param {string} key translation key
   * @param {object} [options] options and variables passed along
   * @return {string}
   * @hide
   */


  var serializeTranslation = function serializeTranslation(key, options) {
    return "t:".concat(key, ":").concat(stringifyOptions(options));
  };
  /**
   * Used to overwrite the default `intl/missing-message` implementation in order
   * to display a deterministic serialization of the translation for easier
   * assertions in the tests.
   *
   * @private
   * @function
   * @param {string} key translation key
   * @param {string[]} locales list of locales to search through
   * @param {object} [options] options and variables passed along
   * @return {string}
   * @hide
   */


  _exports.serializeTranslation = serializeTranslation;

  var missingMessage = function missingMessage(key, _locales, options) {
    return serializeTranslation(key, options);
  };

  _exports.missingMessage = missingMessage;
});
define("ember-intl/test-support/-private/type-utils", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
});
define("ember-intl/test-support/add-translations", ["exports", "ember-intl/test-support/-private/make-intl-helper", "ember-intl/test-support/-private/pick-last-locale"], function (_exports, _makeIntlHelper, _pickLastLocale) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  // ! Because TypeScript seems to short-circuit overloaded functions when passed
  // as generics, including these overloads would not work with `makeIntlHelper`.
  // function addTranslations(intl: IntlService, translations: Translations): void;
  // function addTranslations(intl: IntlService, localeName: string, translations: Translations): void;
  function addTranslations(intl, localeNameOrTranslations, translations) {
    if (_typeof(localeNameOrTranslations) === 'object') {
      translations = localeNameOrTranslations;
      localeNameOrTranslations = (0, _pickLastLocale.default)(Ember.get(intl, 'locale'));
    }

    intl.addTranslations(localeNameOrTranslations, translations);
  }
  /**
   * Invokes the `addTranslations` method of the `intl` service. The first
   * parameter, the `localeName`, is optional and will default to the last
   * currently enabled locale. This means, that if you invoke this helper with
   * just translations, they will be added to the last locale and all other
   * locales will be tried before.
   *
   * @function addTranslations
   * @param {string} [localeName]
   * @param {object} translations
   */


  var _default = (0, _makeIntlHelper.default)(addTranslations);

  _exports.default = _default;
});
define("ember-intl/test-support/index", ["exports", "ember-intl/test-support/t", "ember-intl/test-support/set-locale", "ember-intl/test-support/add-translations", "ember-intl/test-support/setup-intl"], function (_exports, _t, _setLocale, _addTranslations, _setupIntl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "t", {
    enumerable: true,
    get: function get() {
      return _t.default;
    }
  });
  Object.defineProperty(_exports, "setLocale", {
    enumerable: true,
    get: function get() {
      return _setLocale.default;
    }
  });
  Object.defineProperty(_exports, "addTranslations", {
    enumerable: true,
    get: function get() {
      return _addTranslations.default;
    }
  });
  Object.defineProperty(_exports, "setupIntl", {
    enumerable: true,
    get: function get() {
      return _setupIntl.default;
    }
  });
});
define("ember-intl/test-support/set-locale", ["exports", "ember-intl/test-support/-private/make-intl-helper"], function (_exports, _makeIntlHelper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Invokes the `setLocale` method of the `intl` service.
   *
   * @function setLocale
   * @param {string|string[]} locale
   */
  var _default = (0, _makeIntlHelper.default)('setLocale');

  _exports.default = _default;
});
define("ember-intl/test-support/setup-intl", ["exports", "ember-intl/test-support/add-translations", "ember-intl/test-support/-private/serialize-translation"], function (_exports, _addTranslations, _serializeTranslation) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = setupIntl;

  function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function setupIntl(hooks, localeOrTranslations, translationsOrOptions, options) {
    var locale;
    var translations;

    if (_typeof(localeOrTranslations) === 'object' && !Array.isArray(localeOrTranslations)) {
      translations = localeOrTranslations;
      localeOrTranslations = undefined;

      if (_typeof(translationsOrOptions) === 'object') {
        options = translationsOrOptions;
      }
    } else {
      locale = localeOrTranslations;
      translations = translationsOrOptions;
    }

    hooks.beforeEach(function () {
      var _options, _options$missingMessa, _options2, _options3;

      if (typeof ((_options = options) === null || _options === void 0 ? void 0 : _options.missingMessage) === 'function') {
        this.owner.register('util:intl/missing-message', options.missingMessage);
      } else if (((_options$missingMessa = (_options2 = options) === null || _options2 === void 0 ? void 0 : _options2.missingMessage) !== null && _options$missingMessa !== void 0 ? _options$missingMessa : true) === true) {
        this.owner.register('util:intl/missing-message', _serializeTranslation.missingMessage);
      }

      this.intl = this.owner.lookup('service:intl');

      if ((_options3 = options) !== null && _options3 !== void 0 && _options3.formats) {
        this.intl.set('formats', options.formats);
      }
    });

    if (locale) {
      hooks.beforeEach(function () {
        this.intl.setLocale(locale);
      });
    }

    if (translations) {
      hooks.beforeEach(function () {
        return (0, _addTranslations.default)(translations);
      });
    }
  }
});
define("ember-intl/test-support/t", ["exports", "ember-intl/test-support/-private/make-intl-helper"], function (_exports, _makeIntlHelper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Invokes the `t` method of the `intl` service.
   *
   * @function t
   * @param {string} key
   * @param {object} [options]
   * @return {string}
   */
  var _default = (0, _makeIntlHelper.default)('t');

  _exports.default = _default;
});
define('ember-keyboard/test-support/key-event', ['exports', 'ember-keyboard', 'ember-keyboard/fixtures/modifiers-array', 'ember-keyboard/fixtures/mouse-buttons-array', 'ember-keyboard/utils/get-cmd-key', '@ember/test-helpers'], function (exports, _emberKeyboard, _modifiersArray, _mouseButtonsArray, _getCmdKey, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.keyEvent = undefined;
  var keyEvent = exports.keyEvent = function keyEvent(attributes, type, element) {
    var keys = (attributes || '').split('+');

    var event = keys.reduce(function (event, attribute) {
      var isValidModifier = _modifiersArray.default.indexOf(attribute) > -1;

      if (isValidModifier) {
        attribute = attribute === 'cmd' ? (0, _getCmdKey.default)() : attribute;

        event[attribute + 'Key'] = true;
      } else if (_mouseButtonsArray.default.indexOf(attribute) > -1) {
        event.button = (0, _emberKeyboard.getMouseCode)(attribute);
      } else {
        var keyCode = (0, _emberKeyboard.getKeyCode)(attribute);

        event.code = attribute;

        // deprecated / removed from the Web Standards
        event.which = keyCode;
        event.keyCode = keyCode;
      }

      return event;
    }, {});

    return (0, _testHelpers.triggerEvent)(element || document.body, type, event);
  };
});
define('ember-keyboard/test-support/test-helpers', ['exports', 'ember-keyboard/test-support/key-event'], function (exports, _keyEvent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.mouseDown = mouseDown;
  exports.mouseUp = mouseUp;
  exports.keyDown = keyDown;
  exports.keyUp = keyUp;
  exports.keyPress = keyPress;
  exports.touchStart = touchStart;
  exports.touchEnd = touchEnd;
  function mouseDown(attributes) {
    return (0, _keyEvent.keyEvent)(attributes, 'mousedown');
  }

  function mouseUp(attributes) {
    return (0, _keyEvent.keyEvent)(attributes, 'mouseup');
  }

  function keyDown(attributes) {
    return (0, _keyEvent.keyEvent)(attributes, 'keydown');
  }

  function keyUp(attributes) {
    return (0, _keyEvent.keyEvent)(attributes, 'keyup');
  }

  function keyPress(attributes) {
    return (0, _keyEvent.keyEvent)(attributes, 'keypress');
  }

  function touchStart(attributes) {
    return (0, _keyEvent.keyEvent)(attributes, 'touchstart');
  }

  function touchEnd(attributes) {
    return (0, _keyEvent.keyEvent)(attributes, 'touchend');
  }
});
define('ember-macro-helpers/test-support/compute', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (_ref) {
    var assert = _ref.assert,
        _ref$baseClass = _ref.baseClass,
        baseClass = _ref$baseClass === undefined ? Ember.Component : _ref$baseClass,
        computed = _ref.computed,
        properties = _ref.properties,
        strictEqual = _ref.strictEqual,
        deepEqual = _ref.deepEqual,
        assertion = _ref.assertion,
        assertReadOnly = _ref.assertReadOnly;

    var MyComponent = baseClass.extend({
      computed: computed
    });
    var subject = void 0;
    try {
      subject = MyComponent.create({
        renderer: {}
      });
    } catch (err) {
      // this is for ember < 2.10
      // can remove once only support 2.12
      subject = MyComponent.create();
    }

    // compute initial value
    // to test recomputes
    Ember.get(subject, 'computed');

    Ember.setProperties(subject, properties);

    var result = Ember.get(subject, 'computed');

    function doAssertion(result) {
      if (assertion) {
        assert.ok(assertion(result));
      } else if (deepEqual) {
        assert.deepEqual(result, deepEqual);
      } else if (assertReadOnly) {
        var func = function func() {
          return Ember.set(subject, 'computed', 'assert read only');
        };
        assert.throws(func, /Cannot set read-only property/);
      } else if (assert) {
        assert.strictEqual(result, strictEqual);
      }
    }

    var promise = void 0;
    if (result && (typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object' && typeof result.then === 'function') {
      promise = result.then(doAssertion);
    } else {
      doAssertion(result);
    }

    return {
      subject: subject,
      result: result,
      promise: promise
    };
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };
});
define('ember-macro-helpers/test-support/expect-imports', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (assert, obj) {
    assert.expect(Object.getOwnPropertyNames(obj).filter(function (p) {
      return exclude.indexOf(p) === -1;
    }).length);
  };

  var exclude = ['__esModule', 'default'];

  // helps prevent forgetting to test a new import
});
define('ember-macro-helpers/test-support/index', ['exports', 'ember-macro-helpers/test-support/compute'], function (exports, _compute) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'compute', {
    enumerable: true,
    get: function () {
      return _compute.default;
    }
  });
});
define('ember-native-dom-helpers/-private/compatibility', ['exports', 'require'], function (exports, _require4) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.wait = undefined;


  var waitFn = void 0; // This is a wrapper around `@ember/test-helpers` that we need for compatibility
  // reasons. Apps and addons using ember-qunit v4 aren't supposed to depend directly on
  // `@ember/test-helpers` and just use the one that their version of
  // `ember-qunit` or `ember-mocha` provides.
  // Apps and addons using ember-qunit v5 directly depend on
  // `@ember/test-helpers`.


  if (_require4.default.has('ember-test-helpers/wait')) {
    // This is implemented as a function that calls `ember-test-helpers/wait`
    // rather than just assigning `helpers.wait = require(...).default` because
    // since this code executes while modules are initially loading, under certain
    // conditions `ember-test-helpers/wait` can still be in the pending state
    // at this point, so its exports are still undefined.
    waitFn = function waitFn() {
      var _require;

      return (_require = (0, _require4.default)('ember-test-helpers/wait')).default.apply(_require, arguments);
    };
  } else if (_require4.default.has('@ember/test-helpers')) {
    waitFn = function waitFn() {
      var _require2;

      return (_require2 = (0, _require4.default)('@ember/test-helpers')).wait.apply(_require2, arguments);
    };
  }

  var wait = exports.wait = waitFn;
});
define('ember-native-dom-helpers/-private/get-element-with-assert', ['exports', 'ember-native-dom-helpers/-private/get-element'], function (exports, _getElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getElementWithAssert;


  /*
    @method getElementWithAssert
    @param {String|HTMLElement} selectorOrElement
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return {Error|HTMLElement} element if found, or raises an error
    @private
  */
  function getElementWithAssert(selectorOrElement, contextEl) {
    var el = (0, _getElement.default)(selectorOrElement, contextEl);
    if (el) {
      return el;
    }
    throw new Error('Element ' + selectorOrElement + ' not found.');
  }
});
define('ember-native-dom-helpers/-private/get-element', ['exports', 'ember-native-dom-helpers/settings'], function (exports, _settings) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getElement;


  /*
    @method getElement
    @param {String|HTMLElement} selectorOrElement
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return HTMLElement
    @private
  */
  function getElement() {
    var selectorOrElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var contextEl = arguments[1];

    if (selectorOrElement instanceof Window || selectorOrElement instanceof Document || selectorOrElement instanceof HTMLElement || selectorOrElement instanceof SVGElement) {
      return selectorOrElement;
    }
    var result = void 0;
    if (contextEl instanceof HTMLElement) {
      result = contextEl.querySelector(selectorOrElement);
    } else {
      result = document.querySelector(_settings.default.rootElement + ' ' + selectorOrElement);
    }
    return result;
  }
});
define('ember-native-dom-helpers/-private/is-content-editable', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isContentEditable;
  function isContentEditable(el) {
    return el.contentEditable === 'true';
  }
});
define('ember-native-dom-helpers/-private/is-focusable', ['exports', 'ember-native-dom-helpers/-private/is-form-control', 'ember-native-dom-helpers/-private/is-content-editable'], function (exports, _isFormControl, _isContentEditable) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isFocusable;
  function isFocusable(el) {
    var focusableTags = ['LINK', 'A'];

    if ((0, _isFormControl.default)(el) || (0, _isContentEditable.default)(el) || focusableTags.indexOf(el.tagName) > -1) {
      return true;
    }

    return el.hasAttribute('tabindex');
  }
});
define('ember-native-dom-helpers/-private/is-form-control', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isFormControl;
  function isFormControl(el) {
    var formControlTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
    var tagName = el.tagName,
        type = el.type;


    if (type === 'hidden') {
      return false;
    }

    return formControlTags.indexOf(tagName) > -1;
  }
});
define('ember-native-dom-helpers/blur', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-focusable', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _getElementWithAssert, _isFocusable, _fireEvent, _wait) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.blur = blur;


  /*
    @method blur
    @param {String|HTMLElement} selector
    @return {RSVP.Promise}
    @public
  */
  function blur(selector) {
    if (!selector) {
      return;
    }

    var el = (0, _getElementWithAssert.default)(selector);

    if ((0, _isFocusable.default)(el)) {
      Ember.run(null, function () {
        var browserIsNotFocused = document.hasFocus && !document.hasFocus();

        // makes `document.activeElement` be `body`.
        // If the browser is focused, it also fires a blur event
        el.blur();

        // Chrome/Firefox does not trigger the `blur` event if the window
        // does not have focus. If the document does not have focus then
        // fire `blur` event via native event.
        if (browserIsNotFocused) {
          (0, _fireEvent.fireEvent)(el, 'blur', { bubbles: false });
        }
      });
    }

    return (window.wait || _wait.default)();
  }
});
define('ember-native-dom-helpers/click', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-native-dom-helpers/focus', 'ember-test-helpers/wait'], function (exports, _getElementWithAssert, _fireEvent, _focus, _wait) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.clickEventSequence = clickEventSequence;
  exports.click = click;


  /*
    @method clickEventSequence
    @private
  */
  function clickEventSequence(el, options) {
    Ember.run(function () {
      return (0, _fireEvent.fireEvent)(el, 'mousedown', options);
    });
    (0, _focus.focus)(el);
    Ember.run(function () {
      return (0, _fireEvent.fireEvent)(el, 'mouseup', options);
    });
    Ember.run(function () {
      return (0, _fireEvent.fireEvent)(el, 'click', options);
    });
  }

  /*
    @method click
    @param {String|HTMLElement} selector
    @param {HTMLElement} context
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */
  function click(selector, context, options) {
    var element = void 0;
    if (context instanceof HTMLElement) {
      element = (0, _getElementWithAssert.default)(selector, context);
    } else {
      options = context || {};
      element = (0, _getElementWithAssert.default)(selector);
    }
    clickEventSequence(element, options);
    return (window.wait || _wait.default)();
  }
});
define('ember-native-dom-helpers/current-path', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.currentPath = currentPath;
  function currentPath() {
    var _window;

    if (!window.currentPath) {
      throw new Error('currentPath is only available during acceptance tests');
    }

    return (_window = window).currentPath.apply(_window, arguments);
  }
});
define('ember-native-dom-helpers/current-route-name', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.currentRouteName = currentRouteName;
  function currentRouteName() {
    var _window;

    if (!window.currentRouteName) {
      throw new Error('currentRouteName is only available during acceptance tests');
    }

    return (_window = window).currentRouteName.apply(_window, arguments);
  }
});
define('ember-native-dom-helpers/current-url', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.currentURL = currentURL;
  function currentURL() {
    var _window;

    if (!window.currentURL) {
      throw new Error('currentURL is only available during acceptance tests');
    }

    return (_window = window).currentURL.apply(_window, arguments);
  }
});
define('ember-native-dom-helpers/fill-in', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-form-control', 'ember-native-dom-helpers/-private/is-content-editable', 'ember-native-dom-helpers/focus', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _getElementWithAssert, _isFormControl, _isContentEditable, _focus, _fireEvent, _wait) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.fillIn = fillIn;


  /*
    @method fillIn
    @param {String|HTMLElement} selector
    @param {String} text
    @return {RSVP.Promise}
    @public
  */
  function fillIn(selector, text) {
    var el = (0, _getElementWithAssert.default)(selector);

    if (!(0, _isFormControl.default)(el) && !(0, _isContentEditable.default)(el)) {
      throw new Error('Unable to fill element');
    }

    Ember.run(function () {
      return (0, _focus.focus)(el);
    });
    Ember.run(function () {
      if ((0, _isContentEditable.default)(el)) {
        el.innerHTML = text;
      } else {
        el.value = text;
      }
    });
    Ember.run(function () {
      return (0, _fireEvent.fireEvent)(el, 'input');
    });
    Ember.run(function () {
      return (0, _fireEvent.fireEvent)(el, 'change');
    });
    return (window.wait || _wait.default)();
  }
});
define('ember-native-dom-helpers/find-all', ['exports', 'ember-native-dom-helpers/settings'], function (exports, _settings) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.findAll = findAll;


  /*
    The findAll test helper uses `querySelectorAll` to search inside the test
    DOM (based on app configuration for the rootElement).
  
    Alternatively, a second argument may be passed which is an element as the
    DOM context to search within.
  
    @method findAll
    @param {String} CSS selector to find elements in the test DOM
    @param {Element} context to query within, query from its contained DOM
    @return {Array} An array of zero or more HTMLElement objects
    @public
  */
  function findAll(selector, context) {
    var result = void 0;
    if (context instanceof Element) {
      result = context.querySelectorAll(selector);
    } else {
      result = document.querySelectorAll(_settings.default.rootElement + ' ' + selector);
    }
    return toArray(result);
  }

  function toArray(nodelist) {
    var array = new Array(nodelist.length);
    for (var i = 0; i < nodelist.length; i++) {
      array[i] = nodelist[i];
    }
    return array;
  }
});
define('ember-native-dom-helpers/find-with-assert', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert'], function (exports, _getElementWithAssert) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.findWithAssert = findWithAssert;


  /*
    @method findWithAssert
    @param {String} CSS selector to find elements in the test DOM
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return {Error|HTMLElement} element if found, or raises an error
    @public
  */
  function findWithAssert(selector, contextEl) {
    return (0, _getElementWithAssert.default)(selector, contextEl);
  }
});
define('ember-native-dom-helpers/find', ['exports', 'ember-native-dom-helpers/-private/get-element'], function (exports, _getElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.find = find;


  /*
    The find test helper uses `querySelector` to search inside the test
    DOM (based on app configuration for the rootElement).
  
    Alternalively, a second argument may be passed which is an element as the
    DOM context to search within.
  
    @method find
    @param {String} CSS selector to find one or more elements in the test DOM
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return {null|HTMLElement} null or an element
    @public
  */
  function find(selector, contextEl) {
    return (0, _getElement.default)(selector, contextEl);
  }
});
define('ember-native-dom-helpers/fire-event', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.fireEvent = fireEvent;

  var DEFAULT_EVENT_OPTIONS = { bubbles: true, cancelable: true };
  var KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];
  var MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];
  var FILE_SELECTION_EVENT_TYPES = ['change'];

  /*
    @method fireEvent
    @param {HTMLElement} element
    @param {String} type
    @param {Object} (optional) options
    @return {Event} The dispatched event
    @private
  */
  function fireEvent(element, type) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!element) {
      return;
    }
    var event = void 0;
    if (KEYBOARD_EVENT_TYPES.indexOf(type) > -1) {
      event = buildKeyboardEvent(type, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(type) > -1) {
      var rect = void 0;
      if (element instanceof Window) {
        rect = element.document.documentElement.getBoundingClientRect();
      } else if (element instanceof Document) {
        rect = element.documentElement.getBoundingClientRect();
      } else if (element instanceof HTMLElement || element instanceof SVGElement) {
        rect = element.getBoundingClientRect();
      } else {
        return;
      }
      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5, // Those numbers don't really mean anything.
        screenY: y + 95, // They're just to make the screenX/Y be different of clientX/Y..
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(type, Ember.merge(simulatedCoordinates, options));
    } else if (FILE_SELECTION_EVENT_TYPES.indexOf(type) > -1 && element.files) {
      event = buildFileEvent(type, element, options);
    } else {
      event = buildBasicEvent(type, options);
    }
    element.dispatchEvent(event);
    return event;
  }

  /*
    @method buildBasicEvent
    @param {String} type
    @param {Object} (optional) options
    @return {Event}
    @private
  */
  function buildBasicEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = document.createEvent('Events');

    var bubbles = options.bubbles !== undefined ? options.bubbles : true;
    var cancelable = options.cancelable !== undefined ? options.cancelable : true;

    delete options.bubbles;
    delete options.cancelable;

    // bubbles and cancelable are readonly, so they can be
    // set when initializing event
    event.initEvent(type, bubbles, cancelable);
    Ember.merge(event, options);
    return event;
  }

  /*
    @method buildMouseEvent
    @param {String} type
    @param {Object} (optional) options
    @return {Event}
    @private
  */
  function buildMouseEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = void 0;
    try {
      event = document.createEvent('MouseEvents');
      var eventOpts = Ember.merge(Ember.merge({}, DEFAULT_EVENT_OPTIONS), options);
      event.initMouseEvent(type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }

  /*
    @method buildKeyboardEvent
    @param {String} type
    @param {Object} (optional) options
    @return {Event}
    @private
  */
  function buildKeyboardEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var eventOpts = Ember.merge(Ember.merge({}, DEFAULT_EVENT_OPTIONS), options);
    var event = void 0,
        eventMethodName = void 0;

    try {
      event = new KeyboardEvent(type, eventOpts);

      // Property definitions are required for B/C for keyboard event usage
      // If this properties are not defined, when listening for key events
      // keyCode/which will be 0. Also, keyCode and which now are string
      // and if app compare it with === with integer key definitions,
      // there will be a fail.
      //
      // https://w3c.github.io/uievents/#interface-keyboardevent
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
      Object.defineProperty(event, 'keyCode', {
        get: function get() {
          return parseInt(this.key);
        }
      });

      Object.defineProperty(event, 'which', {
        get: function get() {
          return parseInt(this.key);
        }
      });

      return event;
    } catch (e) {
      // left intentionally blank
    }

    try {
      event = document.createEvent('KeyboardEvents');
      eventMethodName = 'initKeyboardEvent';
    } catch (e) {
      // left intentionally blank
    }

    if (!event) {
      try {
        event = document.createEvent('KeyEvents');
        eventMethodName = 'initKeyEvent';
      } catch (e) {
        // left intentionally blank
      }
    }

    if (event) {
      event[eventMethodName](type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } else {
      event = buildBasicEvent(type, options);
    }

    return event;
  }

  /*
    @method buildFileEvent
    @param {String} type
    @param {Array} array of flies
    @param {HTMLElement} element
    @return {Event}
    @private
  */
  function buildFileEvent(type, element) {
    var files = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var event = buildBasicEvent(type);

    if (files.length > 0) {
      Object.defineProperty(files, 'item', {
        value: function value(index) {
          return typeof index === 'number' ? this[index] : null;
        }
      });
      Object.defineProperty(element, 'files', {
        value: files
      });
    }

    Object.defineProperty(event, 'target', {
      value: element
    });

    return event;
  }
});
define('ember-native-dom-helpers/focus', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-focusable', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _getElementWithAssert, _isFocusable, _fireEvent, _wait) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.focus = focus;


  /*
    @method focus
    @param {String|HTMLElement} selector
    @return {RSVP.Promise}
    @public
  */
  function focus(selector) {
    if (!selector) {
      return;
    }

    var el = (0, _getElementWithAssert.default)(selector);

    if ((0, _isFocusable.default)(el)) {
      Ember.run(null, function () {
        var browserIsNotFocused = document.hasFocus && !document.hasFocus();

        // Firefox does not trigger the `focusin` event if the window
        // does not have focus. If the document does not have focus then
        // fire `focusin` event as well.
        if (browserIsNotFocused) {
          (0, _fireEvent.fireEvent)(el, 'focusin', {
            bubbles: false
          });
        }

        // makes `document.activeElement` be `el`. If the browser is focused, it also fires a focus event
        el.focus();

        // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
        if (browserIsNotFocused) {
          (0, _fireEvent.fireEvent)(el, 'focus', {
            bubbles: false
          });
        }
      });
    }

    return (window.wait || _wait.default)();
  }
});
define('ember-native-dom-helpers/index', ['exports', 'ember-native-dom-helpers/find', 'ember-native-dom-helpers/find-all', 'ember-native-dom-helpers/find-with-assert', 'ember-native-dom-helpers/click', 'ember-native-dom-helpers/tap', 'ember-native-dom-helpers/fill-in', 'ember-native-dom-helpers/key-event', 'ember-native-dom-helpers/trigger-event', 'ember-native-dom-helpers/visit', 'ember-native-dom-helpers/wait-until', 'ember-native-dom-helpers/wait-for', 'ember-native-dom-helpers/current-url', 'ember-native-dom-helpers/current-path', 'ember-native-dom-helpers/focus', 'ember-native-dom-helpers/blur', 'ember-native-dom-helpers/scroll-to', 'ember-native-dom-helpers/current-route-name', 'ember-native-dom-helpers/select-files', 'ember-native-dom-helpers/settings'], function (exports, _find, _findAll, _findWithAssert, _click, _tap, _fillIn, _keyEvent, _triggerEvent, _visit, _waitUntil, _waitFor, _currentUrl, _currentPath, _focus, _blur, _scrollTo, _currentRouteName, _selectFiles, _settings) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'find', {
    enumerable: true,
    get: function () {
      return _find.find;
    }
  });
  Object.defineProperty(exports, 'findAll', {
    enumerable: true,
    get: function () {
      return _findAll.findAll;
    }
  });
  Object.defineProperty(exports, 'findWithAssert', {
    enumerable: true,
    get: function () {
      return _findWithAssert.findWithAssert;
    }
  });
  Object.defineProperty(exports, 'click', {
    enumerable: true,
    get: function () {
      return _click.click;
    }
  });
  Object.defineProperty(exports, 'tap', {
    enumerable: true,
    get: function () {
      return _tap.tap;
    }
  });
  Object.defineProperty(exports, 'fillIn', {
    enumerable: true,
    get: function () {
      return _fillIn.fillIn;
    }
  });
  Object.defineProperty(exports, 'keyEvent', {
    enumerable: true,
    get: function () {
      return _keyEvent.keyEvent;
    }
  });
  Object.defineProperty(exports, 'triggerEvent', {
    enumerable: true,
    get: function () {
      return _triggerEvent.triggerEvent;
    }
  });
  Object.defineProperty(exports, 'visit', {
    enumerable: true,
    get: function () {
      return _visit.visit;
    }
  });
  Object.defineProperty(exports, 'waitUntil', {
    enumerable: true,
    get: function () {
      return _waitUntil.waitUntil;
    }
  });
  Object.defineProperty(exports, 'waitFor', {
    enumerable: true,
    get: function () {
      return _waitFor.waitFor;
    }
  });
  Object.defineProperty(exports, 'currentURL', {
    enumerable: true,
    get: function () {
      return _currentUrl.currentURL;
    }
  });
  Object.defineProperty(exports, 'currentPath', {
    enumerable: true,
    get: function () {
      return _currentPath.currentPath;
    }
  });
  Object.defineProperty(exports, 'focus', {
    enumerable: true,
    get: function () {
      return _focus.focus;
    }
  });
  Object.defineProperty(exports, 'blur', {
    enumerable: true,
    get: function () {
      return _blur.blur;
    }
  });
  Object.defineProperty(exports, 'scrollTo', {
    enumerable: true,
    get: function () {
      return _scrollTo.scrollTo;
    }
  });
  Object.defineProperty(exports, 'currentRouteName', {
    enumerable: true,
    get: function () {
      return _currentRouteName.currentRouteName;
    }
  });
  Object.defineProperty(exports, 'selectFiles', {
    enumerable: true,
    get: function () {
      return _selectFiles.selectFiles;
    }
  });
  Object.defineProperty(exports, 'settings', {
    enumerable: true,
    get: function () {
      return _settings.default;
    }
  });
});
define('ember-native-dom-helpers/key-event', ['exports', 'ember-native-dom-helpers/trigger-event'], function (exports, _triggerEvent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.keyEvent = keyEvent;


  /**
   * @public
   * @param selector
   * @param type
   * @param keyCode
   * @param modifiers
   * @return {*}
   */
  function keyEvent(selector, type, keyCode) {
    var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };

    return (0, _triggerEvent.triggerEvent)(selector, type, Ember.merge({ keyCode: keyCode, which: keyCode, key: keyCode }, modifiers));
  }
});
define('ember-native-dom-helpers/scroll-to', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-test-helpers/wait'], function (exports, _getElementWithAssert, _wait) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.scrollTo = scrollTo;


  var rAF = window.requestAnimationFrame || function (cb) {
    setTimeout(cb, 17);
  };

  /*
    Triggers a paint (and therefore flushes any queued up scroll events).
  
    @method triggerFlushWithPromise
    @return {RSVP.Promise}
    @private
  */
  function waitForScrollEvent() {
    var waitForEvent = new Ember.RSVP.Promise(function (resolve) {
      rAF(resolve);
    });
    return waitForEvent.then(function () {
      return (0, _wait.default)();
    });
  }

  /*
    Scrolls DOM element or selector to the given coordinates (if the DOM element is currently overflowed).
    The promise resolves after the scroll event has been triggered.
    @method scrollTo
    @param {String|HTMLElement} selector
    @param {Number} x
    @param {Number} y
    @return {RSVP.Promise}
    @public
  */
  function scrollTo(selector, x, y) {
    var el = (0, _getElementWithAssert.default)(selector);
    if (el instanceof HTMLElement) {
      el.scrollTop = y;
      el.scrollLeft = x;
    } else if (el instanceof Window) {
      el.scrollTo(x, y);
    }
    return waitForScrollEvent();
  }
});
define('ember-native-dom-helpers/select-files', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _getElementWithAssert, _fireEvent, _wait) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.selectFiles = selectFiles;


  /*
    @method selectFiles
    @param {String|HTMLElement} selector
    @param {Array} flies
    @return {RSVP.Promise}
    @public
  */
  function selectFiles(selector) {
    var files = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var element = (0, _getElementWithAssert.default)(selector);

    (true && !(element.type === 'file') && Ember.assert('This is only used with file inputs.\n          Either change to a \'type="file"\' or use the \'triggerEvent\' helper.', element.type === 'file'));


    if (!Ember.isArray(files)) {
      files = [files];
    }

    (true && !(element.multiple || files.length <= 1) && Ember.assert('Can only handle multiple slection when an input is set to allow for multiple files.\n          Please add the property "multiple" to your file input.', element.multiple || files.length <= 1));


    Ember.run(function () {
      return (0, _fireEvent.fireEvent)(element, 'change', files);
    });
    return (window.wait || _wait.default)();
  }
});
define('ember-native-dom-helpers/settings', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var TestSupportSettings = function () {
    function TestSupportSettings() {
      var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { rootElement: '#ember-testing' };

      _classCallCheck(this, TestSupportSettings);

      this._rootElement = init.rootElement;
    }

    /*
      Setting for Ember app root element, default is #ember-testing
       @public rootElement
      @type String
    */


    _createClass(TestSupportSettings, [{
      key: 'rootElement',
      get: function get() {
        return this._rootElement;
      },
      set: function set(value) {
        this._rootElement = value;
      }
    }]);

    return TestSupportSettings;
  }();

  var settings = new TestSupportSettings();

  exports.default = settings;
});
define('ember-native-dom-helpers/tap', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-native-dom-helpers/click', 'ember-test-helpers/wait'], function (exports, _getElementWithAssert, _fireEvent, _click, _wait) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.tap = tap;


  /*
    @method tap
    @param {String|HTMLElement} selector
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */
  function tap(selector) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var el = (0, _getElementWithAssert.default)(selector);
    var touchstartEv = void 0,
        touchendEv = void 0;
    Ember.run(function () {
      return touchstartEv = (0, _fireEvent.fireEvent)(el, 'touchstart', options);
    });
    Ember.run(function () {
      return touchendEv = (0, _fireEvent.fireEvent)(el, 'touchend', options);
    });
    if (!touchstartEv.defaultPrevented && !touchendEv.defaultPrevented) {
      (0, _click.clickEventSequence)(el);
    }
    return (window.wait || _wait.default)();
  }
});
define('ember-native-dom-helpers/trigger-event', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _getElementWithAssert, _fireEvent, _wait) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.triggerEvent = triggerEvent;


  /*
    @method triggerEvent
    @param {String|HTMLElement} selector
    @param {String} type
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */
  function triggerEvent(selector, type, options) {
    var el = (0, _getElementWithAssert.default)(selector);
    Ember.run(function () {
      return (0, _fireEvent.fireEvent)(el, type, options);
    });
    return (window.wait || _wait.default)();
  }
});
define('ember-native-dom-helpers/visit', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.visit = visit;
  function visit() {
    var _window;

    if (!window.visit) {
      throw new Error('visit is only available during acceptance tests');
    }

    return (_window = window).visit.apply(_window, arguments);
  }
});
define('ember-native-dom-helpers/wait-for', ['exports', 'ember-native-dom-helpers/wait-until', 'ember-native-dom-helpers/find', 'ember-native-dom-helpers/find-all'], function (exports, _waitUntil, _find, _findAll) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.waitFor = waitFor;
  function waitFor(selector) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 1000 : _ref$timeout,
        _ref$count = _ref.count,
        count = _ref$count === undefined ? null : _ref$count;

    var callback = void 0;
    if (count) {
      callback = function callback() {
        var elements = (0, _findAll.findAll)(selector);
        if (elements.length === count) {
          return elements;
        }
      };
    } else {
      callback = function callback() {
        return (0, _find.find)(selector);
      };
    }
    return (0, _waitUntil.waitUntil)(callback, { timeout: timeout });
  }
});
define('ember-native-dom-helpers/wait-until', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.waitUntil = waitUntil;
  function waitUntil(callback) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 1000 : _ref$timeout;

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var value = Ember.run(callback);
      if (value) {
        resolve(value);
        return;
      }
      var time = 0;
      var tick = function tick() {
        time += 10;
        var value = Ember.run(callback);
        if (value) {
          resolve(value);
        } else if (time < timeout) {
          setTimeout(tick, 10);
        } else {
          reject('waitUntil timed out');
        }
      };
      setTimeout(tick, 10);
    });
  }
});
define('ember-power-calendar/test-support/index', ['exports', 'ember-test-helpers/wait', 'ember-native-dom-helpers', 'moment'], function (exports, _wait, _emberNativeDomHelpers, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.calendarSelect = exports.calendarCenter = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function findCalendarElement(selector) {
    var target = (0, _emberNativeDomHelpers.find)(selector);
    if (target) {
      if (target.classList.contains('ember-power-calendar')) {
        return target;
      } else {
        return (0, _emberNativeDomHelpers.find)('.ember-power-calendar', target) || (0, _emberNativeDomHelpers.find)('[data-power-calendar-id]', target);
      }
    }
  }

  function findCalendarGuid(selector) {
    var maybeCalendar = findCalendarElement(selector);
    if (!maybeCalendar) {
      return;
    }
    if (maybeCalendar.classList.contains('ember-power-calendar')) {
      return maybeCalendar.id;
    } else {
      return maybeCalendar.attributes['data-power-calendar-id'].value;
    }
  }

  function findComponentInstance(selector) {
    var calendarGuid = findCalendarGuid(selector);
    (true && !(calendarGuid) && Ember.assert('Could not find a calendar using selector: "' + selector + '"', calendarGuid));

    return window.__powerCalendars[calendarGuid];
  }

  var calendarCenter = exports.calendarCenter = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(selector, newCenter) {
      var calendarComponent, onCenterChange, publicAPI;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              (true && !(newCenter) && Ember.assert('`calendarCenter` expect a Date or MomentJS object as second argument', newCenter));
              calendarComponent = findComponentInstance(selector);
              onCenterChange = calendarComponent.get('onCenterChange');
              (true && !(!!onCenterChange) && Ember.assert('You cannot call `calendarCenter` on a component that doesn\'t has an `onCenterChange` action', !!onCenterChange));
              publicAPI = calendarComponent.get('publicAPI');
              _context.next = 7;
              return Ember.run(function () {
                return publicAPI.actions.changeCenter(newCenter, publicAPI);
              });

            case 7:
              return _context.abrupt('return', (0, _wait.default)());

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function calendarCenter(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  var calendarSelect = exports.calendarSelect = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(selector, selected) {
      var selectedMoment, calendarElement, daySelector, dayElement;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              (true && !(selected) && Ember.assert('`calendarSelect` expect a Date or MomentJS object as second argument', selected));
              selectedMoment = (0, _moment.default)(selected);
              calendarElement = findCalendarElement(selector);
              daySelector = selector + ' [data-date="' + selectedMoment.format('YYYY-MM-DD') + '"]';
              dayElement = (0, _emberNativeDomHelpers.find)(daySelector, calendarElement);

              if (dayElement) {
                _context2.next = 8;
                break;
              }

              _context2.next = 8;
              return calendarCenter(selector, selected);

            case 8:
              return _context2.abrupt('return', (0, _emberNativeDomHelpers.click)(daySelector));

            case 9:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function calendarSelect(_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();
});
define("ember-power-select/test-support/helpers", ["exports", "@ember/test-helpers", "ember-power-select/test-support/index"], function (_exports, _testHelpers, _index) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findContains = findContains;
  _exports.nativeMouseDown = nativeMouseDown;
  _exports.nativeMouseUp = nativeMouseUp;
  _exports.triggerKeydown = triggerKeydown;
  _exports.typeInSearch = typeInSearch;
  _exports.clickTrigger = clickTrigger;
  _exports.nativeTouch = nativeTouch;
  _exports.touchTrigger = touchTrigger;
  _exports.selectChoose = selectChoose;
  _exports.selectSearch = selectSearch;
  _exports.removeMultipleOption = removeMultipleOption;
  _exports.clearSelected = clearSelected;
  _exports.default = _default;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  /**
   * @private
   * @param {String} selector CSS3 selector of the elements to check the content
   * @param {String} text Substring that the selected element must contain
   * @returns HTMLElement The first element that maches the given selector and contains the
   *                      given text
   */
  function findContains(selector, text) {
    return [].slice.apply(document.querySelectorAll(selector)).filter(function (e) {
      return e.textContent.trim().indexOf(text) > -1;
    })[0];
  }

  function nativeMouseDown(_x, _x2) {
    return _nativeMouseDown.apply(this, arguments);
  }

  function _nativeMouseDown() {
    _nativeMouseDown = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(selectorOrDomElement, options) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", (0, _testHelpers.triggerEvent)(selectorOrDomElement, 'mousedown', options));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _nativeMouseDown.apply(this, arguments);
  }

  function nativeMouseUp(_x3, _x4) {
    return _nativeMouseUp.apply(this, arguments);
  }

  function _nativeMouseUp() {
    _nativeMouseUp = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(selectorOrDomElement, options) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", (0, _testHelpers.triggerEvent)(selectorOrDomElement, 'mouseup', options));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));
    return _nativeMouseUp.apply(this, arguments);
  }

  function triggerKeydown(_x5, _x6) {
    return _triggerKeydown.apply(this, arguments);
  }

  function _triggerKeydown() {
    _triggerKeydown = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(domElement, k) {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", (0, _testHelpers.triggerKeyEvent)(domElement, 'keydown', k));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));
    return _triggerKeydown.apply(this, arguments);
  }

  function typeInSearch(scopeOrText, text) {
    var scope = '';

    if (typeof text === 'undefined') {
      text = scopeOrText;
    } else {
      scope = scopeOrText;
    }

    var selectors = ['.ember-power-select-search-input', '.ember-power-select-search input', '.ember-power-select-trigger-multiple-input', 'input[type="search"]'].map(function (selector) {
      return "".concat(scope, " ").concat(selector);
    }).join(', ');
    return (0, _testHelpers.fillIn)(selectors, text);
  }

  function clickTrigger(_x7) {
    return _clickTrigger.apply(this, arguments);
  }

  function _clickTrigger() {
    _clickTrigger = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(scope) {
      var options,
          selector,
          _args7 = arguments;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              options = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : {};
              selector = '.ember-power-select-trigger';

              if (scope) {
                selector = "".concat(scope, " ").concat(selector);
              }

              return _context7.abrupt("return", (0, _testHelpers.click)(selector, options));

            case 4:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));
    return _clickTrigger.apply(this, arguments);
  }

  function nativeTouch(_x8) {
    return _nativeTouch.apply(this, arguments);
  }

  function _nativeTouch() {
    _nativeTouch = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(selectorOrDomElement) {
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              (0, _testHelpers.triggerEvent)(selectorOrDomElement, 'touchstart');
              return _context8.abrupt("return", (0, _testHelpers.triggerEvent)(selectorOrDomElement, 'touchend'));

            case 2:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));
    return _nativeTouch.apply(this, arguments);
  }

  function touchTrigger() {
    return _touchTrigger.apply(this, arguments);
  }

  function _touchTrigger() {
    _touchTrigger = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", nativeTouch('.ember-power-select-trigger'));

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }));
    return _touchTrigger.apply(this, arguments);
  }

  function selectChoose(_x9, _x10, _x11) {
    return _selectChoose2.apply(this, arguments);
  }

  function _selectChoose2() {
    _selectChoose2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(cssPathOrTrigger, valueOrSelector, optionIndex) {
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", (0, _index.selectChoose)(cssPathOrTrigger, valueOrSelector, optionIndex));

            case 1:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10);
    }));
    return _selectChoose2.apply(this, arguments);
  }

  function selectSearch(_x12, _x13) {
    return _selectSearch2.apply(this, arguments);
  }

  function _selectSearch2() {
    _selectSearch2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(cssPathOrTrigger, value) {
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              return _context11.abrupt("return", (0, _index.selectSearch)(cssPathOrTrigger, value));

            case 1:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11);
    }));
    return _selectSearch2.apply(this, arguments);
  }

  function removeMultipleOption(_x14, _x15) {
    return _removeMultipleOption2.apply(this, arguments);
  }

  function _removeMultipleOption2() {
    _removeMultipleOption2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(cssPath, value) {
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              return _context12.abrupt("return", (0, _index.removeMultipleOption)(cssPath, value));

            case 1:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12);
    }));
    return _removeMultipleOption2.apply(this, arguments);
  }

  function clearSelected(_x16) {
    return _clearSelected2.apply(this, arguments);
  } // Helpers for acceptance tests


  function _clearSelected2() {
    _clearSelected2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(cssPath) {
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              return _context13.abrupt("return", (0, _index.clearSelected)(cssPath));

            case 1:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13);
    }));
    return _clearSelected2.apply(this, arguments);
  }

  function _default() {
    Ember.Test.registerAsyncHelper('selectChoose', function (_, cssPathOrTrigger, valueOrSelector, optionIndex) {
      (true && !(true) && Ember.deprecate('Using the implicit global async helper `selectChoose` is deprecated. Please, import it explicitly with `import { selectChoose } from "ember-power-select/test-support"`', true, {
        id: 'ember-power-select-global-select-choose',
        until: '2.0.0'
      }));
      return (0, _index.selectChoose)(cssPathOrTrigger, valueOrSelector, optionIndex);
    });
    Ember.Test.registerAsyncHelper('selectSearch', /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(app, cssPathOrTrigger, value) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                (true && !(true) && Ember.deprecate('Using the implicit global async helper `selectSearch` is deprecated. Please, import it explicitly with `import { selectSearch } from "ember-power-select/test-support"`', true, {
                  id: 'ember-power-select-global-select-search',
                  until: '2.0.0'
                }));
                return _context.abrupt("return", (0, _index.selectSearch)(cssPathOrTrigger, value));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x17, _x18, _x19) {
        return _ref.apply(this, arguments);
      };
    }());
    Ember.Test.registerAsyncHelper('removeMultipleOption', /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(app, cssPath, value) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                (true && !(true) && Ember.deprecate('Using the implicit global async helper `removeMultipleOption` is deprecated. Please, import it explicitly with `import { removeMultipleOption } from "ember-power-select/test-support"`', true, {
                  id: 'ember-power-select-global-remove-multiple-option',
                  until: '2.0.0'
                }));
                return _context2.abrupt("return", (0, _index.removeMultipleOption)(cssPath, value));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x20, _x21, _x22) {
        return _ref2.apply(this, arguments);
      };
    }());
    Ember.Test.registerAsyncHelper('clearSelected', /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(app, cssPath) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                (true && !(true) && Ember.deprecate('Using the implicit global async helper `clearSelected` is deprecated. Please, import it explicitly with `import { clearSelected } from "ember-power-select/test-support"`', true, {
                  id: 'ember-power-select-global-clear-selected',
                  until: '2.0.0'
                }));
                return _context3.abrupt("return", (0, _index.clearSelected)(cssPath));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function (_x23, _x24) {
        return _ref3.apply(this, arguments);
      };
    }());
  }
});
define("ember-power-select/test-support/index", ["exports", "@ember/test-helpers"], function (_exports, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.selectChoose = selectChoose;
  _exports.selectSearch = selectSearch;
  _exports.removeMultipleOption = removeMultipleOption;
  _exports.clearSelected = clearSelected;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function openIfClosedAndGetContentId(_x) {
    return _openIfClosedAndGetContentId.apply(this, arguments);
  }

  function _openIfClosedAndGetContentId() {
    _openIfClosedAndGetContentId = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(trigger) {
      var contentId, content;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              contentId = trigger.attributes['aria-owns'] && "".concat(trigger.attributes['aria-owns'].value);
              content = contentId ? document.querySelector("#".concat(contentId)) : undefined; // If the dropdown is closed, open it

              if (!(!content || content.classList.contains('ember-basic-dropdown-content-placeholder'))) {
                _context.next = 8;
                break;
              }

              _context.next = 5;
              return (0, _testHelpers.click)(trigger);

            case 5:
              _context.next = 7;
              return (0, _testHelpers.settled)();

            case 7:
              contentId = "".concat(trigger.attributes['aria-owns'].value);

            case 8:
              return _context.abrupt("return", contentId);

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _openIfClosedAndGetContentId.apply(this, arguments);
  }

  function selectChoose(_x2, _x3, _x4) {
    return _selectChoose.apply(this, arguments);
  }

  function _selectChoose() {
    _selectChoose = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(cssPathOrTrigger, valueOrSelector, optionIndex) {
      var trigger, target, contentId, options, potentialTargets, filteredTargets;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(cssPathOrTrigger instanceof HTMLElement)) {
                _context2.next = 4;
                break;
              }

              if (cssPathOrTrigger.classList.contains('ember-power-select-trigger')) {
                trigger = cssPathOrTrigger;
              } else {
                trigger = cssPathOrTrigger.querySelector('.ember-power-select-trigger');
              }

              _context2.next = 8;
              break;

            case 4:
              trigger = document.querySelector("".concat(cssPathOrTrigger, " .ember-power-select-trigger"));

              if (!trigger) {
                trigger = document.querySelector(cssPathOrTrigger);
              }

              if (trigger) {
                _context2.next = 8;
                break;
              }

              throw new Error("You called \"selectChoose('".concat(cssPathOrTrigger, "', '").concat(valueOrSelector, "')\" but no select was found using selector \"").concat(cssPathOrTrigger, "\""));

            case 8:
              if (trigger.scrollIntoView) {
                trigger.scrollIntoView();
              }

              _context2.next = 11;
              return openIfClosedAndGetContentId(trigger);

            case 11:
              contentId = _context2.sent;
              // Select the option with the given text
              options = document.querySelectorAll("#".concat(contentId, " .ember-power-select-option"));
              potentialTargets = [].slice.apply(options).filter(function (opt) {
                return opt.textContent.indexOf(valueOrSelector) > -1;
              });

              if (potentialTargets.length === 0) {
                potentialTargets = document.querySelectorAll("#".concat(contentId, " ").concat(valueOrSelector));
              }

              if (potentialTargets.length > 1) {
                filteredTargets = [].slice.apply(potentialTargets).filter(function (t) {
                  return t.textContent.trim() === valueOrSelector;
                });

                if (optionIndex === undefined) {
                  target = filteredTargets[0] || potentialTargets[0];
                } else {
                  target = filteredTargets[optionIndex] || potentialTargets[optionIndex];
                }
              } else {
                target = potentialTargets[0];
              }

              if (target) {
                _context2.next = 18;
                break;
              }

              throw new Error("You called \"selectChoose('".concat(cssPathOrTrigger, "', '").concat(valueOrSelector, "')\" but \"").concat(valueOrSelector, "\" didn't match any option"));

            case 18:
              _context2.next = 20;
              return (0, _testHelpers.click)(target);

            case 20:
              return _context2.abrupt("return", (0, _testHelpers.settled)());

            case 21:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _selectChoose.apply(this, arguments);
  }

  function selectSearch(_x5, _x6) {
    return _selectSearch.apply(this, arguments);
  }

  function _selectSearch() {
    _selectSearch = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(cssPathOrTrigger, value) {
      var trigger, triggerPath, isMultipleSelect, contentId, isDefaultSingleSelect, inputIsInTrigger;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(cssPathOrTrigger instanceof HTMLElement)) {
                _context3.next = 4;
                break;
              }

              trigger = cssPathOrTrigger;
              _context3.next = 9;
              break;

            case 4:
              triggerPath = "".concat(cssPathOrTrigger, " .ember-power-select-trigger");
              trigger = document.querySelector(triggerPath);

              if (!trigger) {
                triggerPath = cssPathOrTrigger;
                trigger = document.querySelector(triggerPath);
              }

              if (trigger) {
                _context3.next = 9;
                break;
              }

              throw new Error("You called \"selectSearch('".concat(cssPathOrTrigger, "', '").concat(value, "')\" but no select was found using selector \"").concat(cssPathOrTrigger, "\""));

            case 9:
              if (trigger.scrollIntoView) {
                trigger.scrollIntoView();
              }

              isMultipleSelect = !!trigger.querySelector('.ember-power-select-trigger-multiple-input');
              _context3.next = 13;
              return openIfClosedAndGetContentId(trigger);

            case 13:
              contentId = _context3.sent;
              isDefaultSingleSelect = !!document.querySelector('.ember-power-select-search-input');

              if (!isMultipleSelect) {
                _context3.next = 20;
                break;
              }

              _context3.next = 18;
              return (0, _testHelpers.fillIn)(trigger.querySelector('.ember-power-select-trigger-multiple-input'), value);

            case 18:
              _context3.next = 33;
              break;

            case 20:
              if (!isDefaultSingleSelect) {
                _context3.next = 25;
                break;
              }

              _context3.next = 23;
              return (0, _testHelpers.fillIn)('.ember-power-select-search-input', value);

            case 23:
              _context3.next = 33;
              break;

            case 25:
              // It's probably a customized version
              inputIsInTrigger = !!trigger.querySelector('.ember-power-select-trigger input[type=search]');

              if (!inputIsInTrigger) {
                _context3.next = 31;
                break;
              }

              _context3.next = 29;
              return (0, _testHelpers.fillIn)(trigger.querySelector('input[type=search]'), value);

            case 29:
              _context3.next = 33;
              break;

            case 31:
              _context3.next = 33;
              return (0, _testHelpers.fillIn)("#".concat(contentId, " .ember-power-select-search-input[type=search]"), 'input');

            case 33:
              return _context3.abrupt("return", (0, _testHelpers.settled)());

            case 34:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _selectSearch.apply(this, arguments);
  }

  function removeMultipleOption(_x7, _x8) {
    return _removeMultipleOption.apply(this, arguments);
  }

  function _removeMultipleOption() {
    _removeMultipleOption = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(cssPath, value) {
      var elem, items, item;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              items = document.querySelectorAll("".concat(cssPath, " .ember-power-select-multiple-options > li"));
              item = [].slice.apply(items).find(function (el) {
                return el.textContent.indexOf(value) > -1;
              });

              if (item) {
                elem = item.querySelector('.ember-power-select-multiple-remove-btn');
              }

              _context4.prev = 3;
              _context4.next = 6;
              return (0, _testHelpers.click)(elem);

            case 6:
              return _context4.abrupt("return", (0, _testHelpers.settled)());

            case 9:
              _context4.prev = 9;
              _context4.t0 = _context4["catch"](3);
              (true && Ember.warn('css path to remove btn not found'));
              throw _context4.t0;

            case 13:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, null, [[3, 9]]);
    }));
    return _removeMultipleOption.apply(this, arguments);
  }

  function clearSelected(_x9) {
    return _clearSelected.apply(this, arguments);
  }

  function _clearSelected() {
    _clearSelected = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(cssPath) {
      var elem;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              elem = document.querySelector("".concat(cssPath, " .ember-power-select-clear-btn"));
              _context5.prev = 1;
              _context5.next = 4;
              return (0, _testHelpers.click)(elem);

            case 4:
              return _context5.abrupt("return", (0, _testHelpers.settled)());

            case 7:
              _context5.prev = 7;
              _context5.t0 = _context5["catch"](1);
              (true && Ember.warn('css path to clear btn not found'));
              throw _context5.t0;

            case 11:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, null, [[1, 7]]);
    }));
    return _clearSelected.apply(this, arguments);
  }
});
define('ember-qunit/adapter', ['exports', 'qunit', '@ember/test-helpers/has-ember-version'], function (exports, _qunit, _hasEmberVersion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function unhandledRejectionAssertion(current, error) {
    var message = void 0,
        source = void 0;

    if ((typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && error !== null) {
      message = error.message;
      source = error.stack;
    } else if (typeof error === 'string') {
      message = error;
      source = 'unknown source';
    } else {
      message = 'unhandledRejection occured, but it had no message';
      source = 'unknown source';
    }

    current.assert.pushResult({
      result: false,
      actual: false,
      expected: true,
      message: message,
      source: source
    });
  }

  var Adapter = Ember.Test.Adapter.extend({
    init: function init() {
      this.doneCallbacks = [];
    },
    asyncStart: function asyncStart() {
      this.doneCallbacks.push(_qunit.default.config.current ? _qunit.default.config.current.assert.async() : null);
    },
    asyncEnd: function asyncEnd() {
      var done = this.doneCallbacks.pop();
      // This can be null if asyncStart() was called outside of a test
      if (done) {
        done();
      }
    },


    // clobber default implementation of `exception` will be added back for Ember
    // < 2.17 just below...
    exception: null
  });

  // Ember 2.17 and higher do not require the test adapter to have an `exception`
  // method When `exception` is not present, the unhandled rejection is
  // automatically re-thrown and will therefore hit QUnit's own global error
  // handler (therefore appropriately causing test failure)
  if (!(0, _hasEmberVersion.default)(2, 17)) {
    Adapter = Adapter.extend({
      exception: function exception(error) {
        unhandledRejectionAssertion(_qunit.default.config.current, error);
      }
    });
  }

  exports.default = Adapter;
});
define('ember-qunit/index', ['exports', 'ember-qunit/legacy-2-x/module-for', 'ember-qunit/legacy-2-x/module-for-component', 'ember-qunit/legacy-2-x/module-for-model', 'ember-qunit/adapter', 'qunit', 'ember-qunit/test-loader', '@ember/test-helpers', 'ember-qunit/test-isolation-validation'], function (exports, _moduleFor, _moduleForComponent, _moduleForModel, _adapter, _qunit, _testLoader, _testHelpers, _testIsolationValidation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.loadTests = exports.todo = exports.only = exports.skip = exports.test = exports.module = exports.QUnitAdapter = exports.moduleForModel = exports.moduleForComponent = exports.moduleFor = undefined;
  Object.defineProperty(exports, 'moduleFor', {
    enumerable: true,
    get: function () {
      return _moduleFor.default;
    }
  });
  Object.defineProperty(exports, 'moduleForComponent', {
    enumerable: true,
    get: function () {
      return _moduleForComponent.default;
    }
  });
  Object.defineProperty(exports, 'moduleForModel', {
    enumerable: true,
    get: function () {
      return _moduleForModel.default;
    }
  });
  Object.defineProperty(exports, 'QUnitAdapter', {
    enumerable: true,
    get: function () {
      return _adapter.default;
    }
  });
  Object.defineProperty(exports, 'module', {
    enumerable: true,
    get: function () {
      return _qunit.module;
    }
  });
  Object.defineProperty(exports, 'test', {
    enumerable: true,
    get: function () {
      return _qunit.test;
    }
  });
  Object.defineProperty(exports, 'skip', {
    enumerable: true,
    get: function () {
      return _qunit.skip;
    }
  });
  Object.defineProperty(exports, 'only', {
    enumerable: true,
    get: function () {
      return _qunit.only;
    }
  });
  Object.defineProperty(exports, 'todo', {
    enumerable: true,
    get: function () {
      return _qunit.todo;
    }
  });
  Object.defineProperty(exports, 'loadTests', {
    enumerable: true,
    get: function () {
      return _testLoader.loadTests;
    }
  });
  exports.setResolver = setResolver;
  exports.render = render;
  exports.clearRender = clearRender;
  exports.settled = settled;
  exports.pauseTest = pauseTest;
  exports.resumeTest = resumeTest;
  exports.setupTest = setupTest;
  exports.setupRenderingTest = setupRenderingTest;
  exports.setupApplicationTest = setupApplicationTest;
  exports.setupTestContainer = setupTestContainer;
  exports.startTests = startTests;
  exports.setupTestAdapter = setupTestAdapter;
  exports.setupEmberTesting = setupEmberTesting;
  exports.setupEmberOnerrorValidation = setupEmberOnerrorValidation;
  exports.setupTestIsolationValidation = setupTestIsolationValidation;
  exports.start = start;
  function setResolver() {
    (true && !(false) && Ember.deprecate('`setResolver` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.setResolver',
      until: '4.0.0'
    }));


    return _testHelpers.setResolver.apply(undefined, arguments);
  }

  function render() {
    (true && !(false) && Ember.deprecate('`render` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.render',
      until: '4.0.0'
    }));


    return _testHelpers.render.apply(undefined, arguments);
  }

  function clearRender() {
    (true && !(false) && Ember.deprecate('`clearRender` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.clearRender',
      until: '4.0.0'
    }));


    return _testHelpers.clearRender.apply(undefined, arguments);
  }

  function settled() {
    (true && !(false) && Ember.deprecate('`settled` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.settled',
      until: '4.0.0'
    }));


    return _testHelpers.settled.apply(undefined, arguments);
  }

  function pauseTest() {
    (true && !(false) && Ember.deprecate('`pauseTest` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.pauseTest',
      until: '4.0.0'
    }));


    return _testHelpers.pauseTest.apply(undefined, arguments);
  }

  function resumeTest() {
    (true && !(false) && Ember.deprecate('`resumeTest` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.resumeTest',
      until: '4.0.0'
    }));


    return _testHelpers.resumeTest.apply(undefined, arguments);
  }

  function setupTest(hooks, options) {
    hooks.beforeEach(function (assert) {
      var _this = this;

      return (0, _testHelpers.setupContext)(this, options).then(function () {
        var originalPauseTest = _this.pauseTest;
        _this.pauseTest = function QUnit_pauseTest() {
          assert.timeout(-1); // prevent the test from timing out

          return originalPauseTest.call(this);
        };
      });
    });

    hooks.afterEach(function () {
      return (0, _testHelpers.teardownContext)(this);
    });
  }

  function setupRenderingTest(hooks, options) {
    setupTest(hooks, options);

    hooks.beforeEach(function () {
      return (0, _testHelpers.setupRenderingContext)(this);
    });

    hooks.afterEach(function () {
      return (0, _testHelpers.teardownRenderingContext)(this);
    });
  }

  function setupApplicationTest(hooks, options) {
    setupTest(hooks, options);

    hooks.beforeEach(function () {
      return (0, _testHelpers.setupApplicationContext)(this);
    });

    hooks.afterEach(function () {
      return (0, _testHelpers.teardownApplicationContext)(this);
    });
  }

  /**
     Uses current URL configuration to setup the test container.
  
     * If `?nocontainer` is set, the test container will be hidden.
     * If `?dockcontainer` or `?devmode` are set the test container will be
       absolutely positioned.
     * If `?devmode` is set, the test container will be made full screen.
  
     @method setupTestContainer
   */
  function setupTestContainer() {
    var testContainer = document.getElementById('ember-testing-container');
    if (!testContainer) {
      return;
    }

    var params = _qunit.default.urlParams;

    var containerVisibility = params.nocontainer ? 'hidden' : 'visible';
    var containerPosition = params.dockcontainer || params.devmode ? 'fixed' : 'relative';

    if (params.devmode) {
      testContainer.className = ' full-screen';
    }

    testContainer.style.visibility = containerVisibility;
    testContainer.style.position = containerPosition;

    var qunitContainer = document.getElementById('qunit');
    if (params.dockcontainer) {
      qunitContainer.style.marginBottom = window.getComputedStyle(testContainer).height;
    }
  }

  /**
     Instruct QUnit to start the tests.
     @method startTests
   */
  function startTests() {
    _qunit.default.start();
  }

  /**
     Sets up the `Ember.Test` adapter for usage with QUnit 2.x.
  
     @method setupTestAdapter
   */
  function setupTestAdapter() {
    Ember.Test.adapter = _adapter.default.create();
  }

  /**
    Ensures that `Ember.testing` is set to `true` before each test begins
    (including `before` / `beforeEach`), and reset to `false` after each test is
    completed. This is done via `QUnit.testStart` and `QUnit.testDone`.
  
   */
  function setupEmberTesting() {
    _qunit.default.testStart(function () {
      Ember.testing = true;
    });

    _qunit.default.testDone(function () {
      Ember.testing = false;
    });
  }

  /**
    Ensures that `Ember.onerror` (if present) is properly configured to re-throw
    errors that occur while `Ember.testing` is `true`.
  */
  function setupEmberOnerrorValidation() {
    _qunit.default.module('ember-qunit: Ember.onerror validation', function () {
      _qunit.default.test('Ember.onerror is functioning properly', function (assert) {
        assert.expect(1);
        var result = (0, _testHelpers.validateErrorHandler)();
        assert.ok(result.isValid, 'Ember.onerror handler with invalid testing behavior detected. An Ember.onerror handler _must_ rethrow exceptions when `Ember.testing` is `true` or the test suite is unreliable. See https://git.io/vbine for more details.');
      });
    });
  }

  function setupTestIsolationValidation() {
    _qunit.default.testDone(_testIsolationValidation.detectIfTestNotIsolated);
    _qunit.default.done(_testIsolationValidation.reportIfTestNotIsolated);
  }

  /**
     @method start
     @param {Object} [options] Options to be used for enabling/disabling behaviors
     @param {Boolean} [options.loadTests] If `false` tests will not be loaded automatically.
     @param {Boolean} [options.setupTestContainer] If `false` the test container will not
     be setup based on `devmode`, `dockcontainer`, or `nocontainer` URL params.
     @param {Boolean} [options.startTests] If `false` tests will not be automatically started
     (you must run `QUnit.start()` to kick them off).
     @param {Boolean} [options.setupTestAdapter] If `false` the default Ember.Test adapter will
     not be updated.
     @param {Boolean} [options.setupEmberTesting] `false` opts out of the
     default behavior of setting `Ember.testing` to `true` before all tests and
     back to `false` after each test will.
     @param {Boolean} [options.setupEmberOnerrorValidation] If `false` validation
     of `Ember.onerror` will be disabled.
     @param {Boolean} [options.setupTestIsolationValidation] If `false` test isolation validation
     will be disabled.
   */
  function start() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (options.loadTests !== false) {
      (0, _testLoader.loadTests)();
    }

    if (options.setupTestContainer !== false) {
      setupTestContainer();
    }

    if (options.setupTestAdapter !== false) {
      setupTestAdapter();
    }

    if (options.setupEmberTesting !== false) {
      setupEmberTesting();
    }

    if (options.setupEmberOnerrorValidation !== false) {
      setupEmberOnerrorValidation();
    }

    if (typeof options.setupTestIsolationValidation !== 'undefined' && options.setupTestIsolationValidation !== false) {
      setupTestIsolationValidation();
    }

    if (options.startTests !== false) {
      startTests();
    }
  }
});
define('ember-qunit/legacy-2-x/module-for-component', ['exports', 'ember-qunit/legacy-2-x/qunit-module', 'ember-test-helpers'], function (exports, _qunitModule, _emberTestHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = moduleForComponent;
  function moduleForComponent(name, description, callbacks) {
    (0, _qunitModule.createModule)(_emberTestHelpers.TestModuleForComponent, name, description, callbacks);
  }
});
define('ember-qunit/legacy-2-x/module-for-model', ['exports', 'ember-qunit/legacy-2-x/qunit-module', 'ember-test-helpers'], function (exports, _qunitModule, _emberTestHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = moduleForModel;
  function moduleForModel(name, description, callbacks) {
    (0, _qunitModule.createModule)(_emberTestHelpers.TestModuleForModel, name, description, callbacks);
  }
});
define('ember-qunit/legacy-2-x/module-for', ['exports', 'ember-qunit/legacy-2-x/qunit-module', 'ember-test-helpers'], function (exports, _qunitModule, _emberTestHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = moduleFor;
  function moduleFor(name, description, callbacks) {
    (0, _qunitModule.createModule)(_emberTestHelpers.TestModule, name, description, callbacks);
  }
});
define('ember-qunit/legacy-2-x/qunit-module', ['exports', 'qunit'], function (exports, _qunit) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createModule = createModule;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function noop() {}

  function callbackFor(name, callbacks) {
    if ((typeof callbacks === 'undefined' ? 'undefined' : _typeof(callbacks)) !== 'object') {
      return noop;
    }
    if (!callbacks) {
      return noop;
    }

    var callback = noop;

    if (callbacks[name]) {
      callback = callbacks[name];
      delete callbacks[name];
    }

    return callback;
  }

  function createModule(Constructor, name, description, callbacks) {
    if (!callbacks && (typeof description === 'undefined' ? 'undefined' : _typeof(description)) === 'object') {
      callbacks = description;
      description = name;
    }

    var _before = callbackFor('before', callbacks);
    var _beforeEach = callbackFor('beforeEach', callbacks);
    var _afterEach = callbackFor('afterEach', callbacks);
    var _after = callbackFor('after', callbacks);

    var module;
    var moduleName = typeof description === 'string' ? description : name;

    (0, _qunit.module)(moduleName, {
      before: function before() {
        // storing this in closure scope to avoid exposing these
        // private internals to the test context
        module = new Constructor(name, description, callbacks);
        return _before.apply(this, arguments);
      },
      beforeEach: function beforeEach() {
        var _module,
            _this = this,
            _arguments = arguments;

        // provide the test context to the underlying module
        module.setContext(this);

        return (_module = module).setup.apply(_module, arguments).then(function () {
          return _beforeEach.apply(_this, _arguments);
        });
      },
      afterEach: function afterEach() {
        var _arguments2 = arguments;

        var result = _afterEach.apply(this, arguments);
        return Ember.RSVP.resolve(result).then(function () {
          var _module2;

          return (_module2 = module).teardown.apply(_module2, _arguments2);
        });
      },
      after: function after() {
        try {
          return _after.apply(this, arguments);
        } finally {
          _after = _afterEach = _before = _beforeEach = callbacks = module = null;
        }
      }
    });
  }
});
define('ember-qunit/test-isolation-validation', ['exports', '@ember/test-helpers'], function (exports, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.detectIfTestNotIsolated = detectIfTestNotIsolated;
  exports.reportIfTestNotIsolated = reportIfTestNotIsolated;
  exports.getMessage = getMessage;


  var TESTS_NOT_ISOLATED = [];

  /**
   * Detects if a specific test isn't isolated. A test is considered
   * not isolated if it:
   *
   * - has pending timers
   * - is in a runloop
   * - has pending AJAX requests
   * - has pending test waiters
   *
   * @function detectIfTestNotIsolated
   * @param {Object} testInfo
   * @param {string} testInfo.module The name of the test module
   * @param {string} testInfo.name The test name
   */
  function detectIfTestNotIsolated(_ref) {
    var module = _ref.module,
        name = _ref.name;

    if (!(0, _testHelpers.isSettled)()) {
      TESTS_NOT_ISOLATED.push(module + ': ' + name);
      Ember.run.cancelTimers();
    }
  }

  /**
   * Reports if a test isn't isolated. Please see above for what
   * constitutes a test being isolated.
   *
   * @function reportIfTestNotIsolated
   * @throws Error if tests are not isolated
   */
  function reportIfTestNotIsolated() {
    if (TESTS_NOT_ISOLATED.length > 0) {
      var leakyTests = TESTS_NOT_ISOLATED.slice();
      TESTS_NOT_ISOLATED.length = 0;

      throw new Error(getMessage(leakyTests.length, leakyTests.join('\n')));
    }
  }

  function getMessage(testCount, testsToReport) {
    return 'TESTS ARE NOT ISOLATED\n    The following (' + testCount + ') tests have one or more of pending timers, pending AJAX requests, pending test waiters, or are still in a runloop: \n\n    ' + testsToReport + '\n  ';
  }
});
define('ember-qunit/test-loader', ['exports', 'qunit', 'ember-cli-test-loader/test-support/index'], function (exports, _qunit, _index) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TestLoader = undefined;
  exports.loadTests = loadTests;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  (0, _index.addModuleExcludeMatcher)(function (moduleName) {
    return _qunit.default.urlParams.nolint && moduleName.match(/\.(jshint|lint-test)$/);
  });

  (0, _index.addModuleIncludeMatcher)(function (moduleName) {
    return moduleName.match(/\.jshint$/);
  });

  var moduleLoadFailures = [];

  _qunit.default.done(function () {
    var length = moduleLoadFailures.length;

    try {
      if (length === 0) {
        // do nothing
      } else if (length === 1) {
        throw moduleLoadFailures[0];
      } else {
        throw new Error('\n' + moduleLoadFailures.join('\n'));
      }
    } finally {
      // ensure we release previously captured errors.
      moduleLoadFailures = [];
    }
  });

  var TestLoader = exports.TestLoader = function (_AbstractTestLoader) {
    _inherits(TestLoader, _AbstractTestLoader);

    function TestLoader() {
      _classCallCheck(this, TestLoader);

      return _possibleConstructorReturn(this, (TestLoader.__proto__ || Object.getPrototypeOf(TestLoader)).apply(this, arguments));
    }

    _createClass(TestLoader, [{
      key: 'moduleLoadFailure',
      value: function moduleLoadFailure(moduleName, error) {
        moduleLoadFailures.push(error);

        _qunit.default.module('TestLoader Failures');
        _qunit.default.test(moduleName + ': could not be loaded', function () {
          throw error;
        });
      }
    }]);

    return TestLoader;
  }(_index.default);

  /**
     Load tests following the default patterns:
  
     * The module name ends with `-test`
     * The module name ends with `.jshint`
  
     Excludes tests that match the following
     patterns when `?nolint` URL param is set:
  
     * The module name ends with `.jshint`
     * The module name ends with `-lint-test`
  
     @method loadTests
   */
  function loadTests() {
    new TestLoader().loadModules();
  }
});
define("ember-responsive/test-support/index", ["exports", "@ember/test-helpers"], function (_exports, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setBreakpoint = setBreakpoint;

  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function setBreakpoint(breakpoint) {
    var breakpointArray = Array.isArray(breakpoint) ? breakpoint : [breakpoint];

    var _getContext = (0, _testHelpers.getContext)(),
        owner = _getContext.owner;

    var breakpoints = owner.lookup('breakpoints:main');
    var media = owner.lookup('service:media');

    var _iterator = _createForOfIteratorHelper(breakpointArray),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var breakpointName = _step.value;

        if (breakpointName === 'auto') {
          media.set('_mocked', false);
          return;
        }

        if (Object.keys(breakpoints).indexOf(breakpointName) === -1) {
          throw new Error("Breakpoint \"".concat(breakpointName, "\" is not defined in your breakpoints file"));
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    var matches = media.get('matches');
    Ember.run(function () {
      matches.clear();
      matches.addObjects(breakpointArray);

      media._triggerMediaChanged();
    });
    return (0, _testHelpers.settled)();
  }
});
define('ember-test-helpers/has-ember-version', ['exports', '@ember/test-helpers/has-ember-version'], function (exports, _hasEmberVersion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _hasEmberVersion.default;
    }
  });
});
define('ember-test-helpers/index', ['exports', '@ember/test-helpers', 'ember-test-helpers/legacy-0-6-x/test-module', 'ember-test-helpers/legacy-0-6-x/test-module-for-acceptance', 'ember-test-helpers/legacy-0-6-x/test-module-for-component', 'ember-test-helpers/legacy-0-6-x/test-module-for-model'], function (exports, _testHelpers, _testModule, _testModuleForAcceptance, _testModuleForComponent, _testModuleForModel) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_testHelpers).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _testHelpers[key];
      }
    });
  });
  Object.defineProperty(exports, 'TestModule', {
    enumerable: true,
    get: function () {
      return _testModule.default;
    }
  });
  Object.defineProperty(exports, 'TestModuleForAcceptance', {
    enumerable: true,
    get: function () {
      return _testModuleForAcceptance.default;
    }
  });
  Object.defineProperty(exports, 'TestModuleForComponent', {
    enumerable: true,
    get: function () {
      return _testModuleForComponent.default;
    }
  });
  Object.defineProperty(exports, 'TestModuleForModel', {
    enumerable: true,
    get: function () {
      return _testModuleForModel.default;
    }
  });
});
define('ember-test-helpers/legacy-0-6-x/-legacy-overrides', ['exports', 'ember-test-helpers/has-ember-version'], function (exports, _hasEmberVersion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.preGlimmerSetupIntegrationForComponent = preGlimmerSetupIntegrationForComponent;
  function preGlimmerSetupIntegrationForComponent() {
    var module = this;
    var context = this.context;

    this.actionHooks = {};

    context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    context.actions = module.actionHooks;

    (this.registry || this.container).register('component:-test-holder', Ember.Component.extend());

    context.render = function (template) {
      // in case `this.render` is called twice, make sure to teardown the first invocation
      module.teardownComponent();

      if (!template) {
        throw new Error('in a component integration test you must pass a template to `render()`');
      }
      if (Ember.isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = Ember.Handlebars.compile(template);
      }
      module.component = module.container.lookupFactory('component:-test-holder').create({
        layout: template
      });

      module.component.set('context', context);
      module.component.set('controller', context);

      Ember.run(function () {
        module.component.appendTo('#ember-testing');
      });

      context._element = module.component.element;
    };

    context.$ = function () {
      return module.component.$.apply(module.component, arguments);
    };

    context.set = function (key, value) {
      var ret = Ember.run(function () {
        return Ember.set(context, key, value);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = Ember.run(function () {
        return Ember.setProperties(context, hash);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return Ember.get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return Ember.getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error('integration testing template received unexpected action ' + actionName);
      }
      hook.apply(module, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      module.teardownComponent();
    };
  }
});
define('ember-test-helpers/legacy-0-6-x/abstract-test-module', ['exports', 'ember-test-helpers/legacy-0-6-x/ext/rsvp', '@ember/test-helpers/settled', '@ember/test-helpers'], function (exports, _rsvp, _settled, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _class = function () {
    function _class(name, options) {
      _classCallCheck(this, _class);

      this.context = undefined;
      this.name = name;
      this.callbacks = options || {};

      this.initSetupSteps();
      this.initTeardownSteps();
    }

    _createClass(_class, [{
      key: 'setup',
      value: function setup(assert) {
        var _this = this;

        Ember.testing = true;
        return this.invokeSteps(this.setupSteps, this, assert).then(function () {
          _this.contextualizeCallbacks();
          return _this.invokeSteps(_this.contextualizedSetupSteps, _this.context, assert);
        });
      }
    }, {
      key: 'teardown',
      value: function teardown(assert) {
        var _this2 = this;

        return this.invokeSteps(this.contextualizedTeardownSteps, this.context, assert).then(function () {
          return _this2.invokeSteps(_this2.teardownSteps, _this2, assert);
        }).then(function () {
          _this2.cache = null;
          _this2.cachedCalls = null;
        }).finally(function () {
          Ember.testing = false;
        });
      }
    }, {
      key: 'initSetupSteps',
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);
        this.setupSteps.push(this.setupPromiseListeners);

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: 'invokeSteps',
      value: function invokeSteps(steps, context, assert) {
        steps = steps.slice();

        function nextStep() {
          var step = steps.shift();
          if (step) {
            // guard against exceptions, for example missing components referenced from needs.
            return new Ember.RSVP.Promise(function (resolve) {
              resolve(step.call(context, assert));
            }).then(nextStep);
          } else {
            return Ember.RSVP.resolve();
          }
        }
        return nextStep();
      }
    }, {
      key: 'contextualizeCallbacks',
      value: function contextualizeCallbacks() {}
    }, {
      key: 'initTeardownSteps',
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownTestElements);
        this.teardownSteps.push(this.teardownAJAXListeners);
        this.teardownSteps.push(this.teardownPromiseListeners);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: 'setupTestElements',
      value: function setupTestElements() {
        var testElementContainer = document.querySelector('#ember-testing-container');
        if (!testElementContainer) {
          testElementContainer = document.createElement('div');
          testElementContainer.setAttribute('id', 'ember-testing-container');
          document.body.appendChild(testElementContainer);
        }

        var testEl = document.querySelector('#ember-testing');
        if (!testEl) {
          var element = document.createElement('div');
          element.setAttribute('id', 'ember-testing');

          testElementContainer.appendChild(element);
          this.fixtureResetValue = '';
        } else {
          this.fixtureResetValue = testElementContainer.innerHTML;
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext(options) {
        var context = this.getContext();

        Ember.assign(context, {
          dispatcher: null,
          inject: {}
        }, options);

        this.setToString();
        (0, _testHelpers.setContext)(context);
        this.context = context;
      }
    }, {
      key: 'setContext',
      value: function setContext(context) {
        this.context = context;
      }
    }, {
      key: 'getContext',
      value: function getContext() {
        if (this.context) {
          return this.context;
        }

        return this.context = (0, _testHelpers.getContext)() || {};
      }
    }, {
      key: 'setToString',
      value: function setToString() {
        var _this3 = this;

        this.context.toString = function () {
          if (_this3.subjectName) {
            return 'test context for: ' + _this3.subjectName;
          }

          if (_this3.name) {
            return 'test context for: ' + _this3.name;
          }
        };
      }
    }, {
      key: 'setupAJAXListeners',
      value: function setupAJAXListeners() {
        (0, _settled._setupAJAXHooks)();
      }
    }, {
      key: 'teardownAJAXListeners',
      value: function teardownAJAXListeners() {
        (0, _settled._teardownAJAXHooks)();
      }
    }, {
      key: 'setupPromiseListeners',
      value: function setupPromiseListeners() {
        (0, _rsvp._setupPromiseListeners)();
      }
    }, {
      key: 'teardownPromiseListeners',
      value: function teardownPromiseListeners() {
        (0, _rsvp._teardownPromiseListeners)();
      }
    }, {
      key: 'teardownTestElements',
      value: function teardownTestElements() {
        document.getElementById('ember-testing-container').innerHTML = this.fixtureResetValue;

        // Ember 2.0.0 removed Ember.View as public API, so only do this when
        // Ember.View is present
        if (Ember.View && Ember.View.views) {
          Ember.View.views = {};
        }
      }
    }, {
      key: 'teardownContext',
      value: function teardownContext() {
        var context = this.context;
        this.context = undefined;
        (0, _testHelpers.unsetContext)();

        if (context && context.dispatcher && !context.dispatcher.isDestroyed) {
          Ember.run(function () {
            context.dispatcher.destroy();
          });
        }
      }
    }]);

    return _class;
  }();

  exports.default = _class;
});
define('ember-test-helpers/legacy-0-6-x/build-registry', ['exports', 'require'], function (exports, _require2) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (resolver) {
    var fallbackRegistry, registry, container;
    var namespace = Ember.Object.create({
      Resolver: {
        create: function create() {
          return resolver;
        }
      }
    });

    function register(name, factory) {
      var thingToRegisterWith = registry || container;

      if (!(container.factoryFor ? container.factoryFor(name) : container.lookupFactory(name))) {
        thingToRegisterWith.register(name, factory);
      }
    }

    if (Ember.Application.buildRegistry) {
      fallbackRegistry = Ember.Application.buildRegistry(namespace);
      fallbackRegistry.register('component-lookup:main', Ember.ComponentLookup);

      registry = new Ember.Registry({
        fallback: fallbackRegistry
      });

      if (Ember.ApplicationInstance && Ember.ApplicationInstance.setupRegistry) {
        Ember.ApplicationInstance.setupRegistry(registry);
      }

      // these properties are set on the fallback registry by `buildRegistry`
      // and on the primary registry within the ApplicationInstance constructor
      // but we need to manually recreate them since ApplicationInstance's are not
      // exposed externally
      registry.normalizeFullName = fallbackRegistry.normalizeFullName;
      registry.makeToString = fallbackRegistry.makeToString;
      registry.describe = fallbackRegistry.describe;

      var owner = Owner.create({
        __registry__: registry,
        __container__: null
      });

      container = registry.container({ owner: owner });
      owner.__container__ = container;

      exposeRegistryMethodsWithoutDeprecations(container);
    } else {
      container = Ember.Application.buildContainer(namespace);
      container.register('component-lookup:main', Ember.ComponentLookup);
    }

    // Ember 1.10.0 did not properly add `view:toplevel` or `view:default`
    // to the registry in Ember.Application.buildRegistry :(
    //
    // Ember 2.0.0 removed Ember.View as public API, so only do this when
    // Ember.View is present
    if (Ember.View) {
      register('view:toplevel', Ember.View.extend());
    }

    // Ember 2.0.0 removed Ember._MetamorphView from the Ember global, so only
    // do this when present
    if (Ember._MetamorphView) {
      register('view:default', Ember._MetamorphView);
    }

    var globalContext = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object' && global || self;
    if (requirejs.entries['ember-data/setup-container']) {
      // ember-data is a proper ember-cli addon since 2.3; if no 'import
      // 'ember-data'' is present somewhere in the tests, there is also no `DS`
      // available on the globalContext and hence ember-data wouldn't be setup
      // correctly for the tests; that's why we import and call setupContainer
      // here; also see https://github.com/emberjs/data/issues/4071 for context
      var setupContainer = (0, _require2.default)('ember-data/setup-container')['default'];
      setupContainer(registry || container);
    } else if (globalContext.DS) {
      var DS = globalContext.DS;
      if (DS._setupContainer) {
        DS._setupContainer(registry || container);
      } else {
        register('transform:boolean', DS.BooleanTransform);
        register('transform:date', DS.DateTransform);
        register('transform:number', DS.NumberTransform);
        register('transform:string', DS.StringTransform);
        register('serializer:-default', DS.JSONSerializer);
        register('serializer:-rest', DS.RESTSerializer);
        register('adapter:-rest', DS.RESTAdapter);
      }
    }

    return {
      registry: registry,
      container: container,
      owner: owner
    };
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function exposeRegistryMethodsWithoutDeprecations(container) {
    var methods = ['register', 'unregister', 'resolve', 'normalize', 'typeInjection', 'injection', 'factoryInjection', 'factoryTypeInjection', 'has', 'options', 'optionsForType'];

    function exposeRegistryMethod(container, method) {
      if (method in container) {
        container[method] = function () {
          return container._registry[method].apply(container._registry, arguments);
        };
      }
    }

    for (var i = 0, l = methods.length; i < l; i++) {
      exposeRegistryMethod(container, methods[i]);
    }
  }

  var Owner = function () {
    if (Ember._RegistryProxyMixin && Ember._ContainerProxyMixin) {
      return Ember.Object.extend(Ember._RegistryProxyMixin, Ember._ContainerProxyMixin, {
        _emberTestHelpersMockOwner: true
      });
    }

    return Ember.Object.extend({
      _emberTestHelpersMockOwner: true
    });
  }();
});
define('ember-test-helpers/legacy-0-6-x/ext/rsvp', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._setupPromiseListeners = _setupPromiseListeners;
  exports._teardownPromiseListeners = _teardownPromiseListeners;


  var originalAsync = void 0;

  /**
    Configures `RSVP` to resolve promises on the run-loop's action queue. This is
    done by Ember internally since Ember 1.7 and it is only needed to
    provide a consistent testing experience for users of Ember < 1.7.
  
    @private
  */
  function _setupPromiseListeners() {
    originalAsync = Ember.RSVP.configure('async');

    Ember.RSVP.configure('async', function (callback, promise) {
      Ember.run.backburner.schedule('actions', function () {
        callback(promise);
      });
    });
  }

  /**
    Resets `RSVP`'s `async` to its prior value.
  
    @private
  */
  function _teardownPromiseListeners() {
    Ember.RSVP.configure('async', originalAsync);
  }
});
define('ember-test-helpers/legacy-0-6-x/test-module-for-acceptance', ['exports', 'ember-test-helpers/legacy-0-6-x/abstract-test-module', '@ember/test-helpers'], function (exports, _abstractTestModule, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _class = function (_AbstractTestModule) {
    _inherits(_class, _AbstractTestModule);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'setupContext',
      value: function setupContext() {
        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'setupContext', this).call(this, { application: this.createApplication() });
      }
    }, {
      key: 'teardownContext',
      value: function teardownContext() {
        Ember.run(function () {
          (0, _testHelpers.getContext)().application.destroy();
        });

        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'teardownContext', this).call(this);
      }
    }, {
      key: 'createApplication',
      value: function createApplication() {
        var _callbacks = this.callbacks,
            Application = _callbacks.Application,
            config = _callbacks.config;

        var application = void 0;

        Ember.run(function () {
          application = Application.create(config);
          application.setupForTesting();
          application.injectTestHelpers();
        });

        return application;
      }
    }]);

    return _class;
  }(_abstractTestModule.default);

  exports.default = _class;
});
define('ember-test-helpers/legacy-0-6-x/test-module-for-component', ['exports', 'ember-test-helpers/legacy-0-6-x/test-module', 'ember-test-helpers/has-ember-version', 'ember-test-helpers/legacy-0-6-x/-legacy-overrides'], function (exports, _testModule, _hasEmberVersion, _legacyOverrides) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setupComponentIntegrationTest = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var ACTION_KEY = void 0;
  if ((0, _hasEmberVersion.default)(2, 0)) {
    ACTION_KEY = 'actions';
  } else {
    ACTION_KEY = '_actions';
  }

  var isPreGlimmer = !(0, _hasEmberVersion.default)(1, 13);

  var _class = function (_TestModule) {
    _inherits(_class, _TestModule);

    function _class(componentName, description, callbacks) {
      _classCallCheck(this, _class);

      // Allow `description` to be omitted
      if (!callbacks && (typeof description === 'undefined' ? 'undefined' : _typeof(description)) === 'object') {
        callbacks = description;
        description = null;
      } else if (!callbacks) {
        callbacks = {};
      }

      var integrationOption = callbacks.integration;
      var hasNeeds = Array.isArray(callbacks.needs);

      var _this2 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, 'component:' + componentName, description, callbacks));

      _this2.componentName = componentName;

      if (hasNeeds || callbacks.unit || integrationOption === false) {
        _this2.isUnitTest = true;
      } else if (integrationOption) {
        _this2.isUnitTest = false;
      } else {
        Ember.deprecate('the component:' + componentName + ' test module is implicitly running in unit test mode, ' + 'which will change to integration test mode by default in an upcoming version of ' + 'ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit ' + 'test mode.', false, {
          id: 'ember-test-helpers.test-module-for-component.test-type',
          until: '0.6.0'
        });
        _this2.isUnitTest = true;
      }

      if (!_this2.isUnitTest && !_this2.isLegacy) {
        callbacks.integration = true;
      }

      if (_this2.isUnitTest || _this2.isLegacy) {
        _this2.setupSteps.push(_this2.setupComponentUnitTest);
      } else {
        _this2.callbacks.subject = function () {
          throw new Error("component integration tests do not support `subject()`. Instead, render the component as if it were HTML: `this.render('<my-component foo=true>');`. For more information, read: http://guides.emberjs.com/current/testing/testing-components/");
        };
        _this2.setupSteps.push(_this2.setupComponentIntegrationTest);
        _this2.teardownSteps.unshift(_this2.teardownComponent);
      }

      if (Ember.View && Ember.View.views) {
        _this2.setupSteps.push(_this2._aliasViewRegistry);
        _this2.teardownSteps.unshift(_this2._resetViewRegistry);
      }
      return _this2;
    }

    _createClass(_class, [{
      key: 'initIntegration',
      value: function initIntegration(options) {
        this.isLegacy = options.integration === 'legacy';
        this.isIntegration = options.integration !== 'legacy';
      }
    }, {
      key: '_aliasViewRegistry',
      value: function _aliasViewRegistry() {
        this._originalGlobalViewRegistry = Ember.View.views;
        var viewRegistry = this.container.lookup('-view-registry:main');

        if (viewRegistry) {
          Ember.View.views = viewRegistry;
        }
      }
    }, {
      key: '_resetViewRegistry',
      value: function _resetViewRegistry() {
        Ember.View.views = this._originalGlobalViewRegistry;
      }
    }, {
      key: 'setupComponentUnitTest',
      value: function setupComponentUnitTest() {
        var _this = this;
        var resolver = this.resolver;
        var context = this.context;

        var layoutName = 'template:components/' + this.componentName;

        var layout = resolver.resolve(layoutName);

        var thingToRegisterWith = this.registry || this.container;
        if (layout) {
          thingToRegisterWith.register(layoutName, layout);
          thingToRegisterWith.injection(this.subjectName, 'layout', layoutName);
        }
        var eventDispatcher = resolver.resolve('event_dispatcher:main');
        if (eventDispatcher) {
          thingToRegisterWith.register('event_dispatcher:main', eventDispatcher);
        }

        context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
        context.dispatcher.setup({}, '#ember-testing');

        context._element = null;

        this.callbacks.render = function () {
          var subject;

          Ember.run(function () {
            subject = context.subject();
            subject.appendTo('#ember-testing');
          });

          context._element = subject.element;

          _this.teardownSteps.unshift(function () {
            Ember.run(function () {
              Ember.tryInvoke(subject, 'destroy');
            });
          });
        };

        this.callbacks.append = function () {
          Ember.deprecate('this.append() is deprecated. Please use this.render() or this.$() instead.', false, {
            id: 'ember-test-helpers.test-module-for-component.append',
            until: '0.6.0'
          });
          return context.$();
        };

        context.$ = function () {
          this.render();
          var subject = this.subject();

          return subject.$.apply(subject, arguments);
        };
      }
    }, {
      key: 'setupComponentIntegrationTest',
      value: function setupComponentIntegrationTest() {
        if (isPreGlimmer) {
          return _legacyOverrides.preGlimmerSetupIntegrationForComponent.apply(this, arguments);
        } else {
          return _setupComponentIntegrationTest.apply(this, arguments);
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext() {
        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'setupContext', this).call(this);

        // only setup the injection if we are running against a version
        // of Ember that has `-view-registry:main` (Ember >= 1.12)
        if (this.container.factoryFor ? this.container.factoryFor('-view-registry:main') : this.container.lookupFactory('-view-registry:main')) {
          (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
        }

        if (!this.isUnitTest && !this.isLegacy) {
          this.context.factory = function () {};
        }
      }
    }, {
      key: 'teardownComponent',
      value: function teardownComponent() {
        var component = this.component;
        if (component) {
          Ember.run(component, 'destroy');
          this.component = null;
        }
      }
    }]);

    return _class;
  }(_testModule.default);

  exports.default = _class;
  function _setupComponentIntegrationTest() {
    var module = this;
    var context = this.context;

    this.actionHooks = context[ACTION_KEY] = {};
    context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');

    var hasRendered = false;
    var OutletView = module.container.factoryFor ? module.container.factoryFor('view:-outlet') : module.container.lookupFactory('view:-outlet');
    var OutletTemplate = module.container.lookup('template:-outlet');
    var toplevelView = module.component = OutletView.create();
    var hasOutletTemplate = !!OutletTemplate;
    var outletState = {
      render: {
        owner: Ember.getOwner ? Ember.getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'application',
        controller: module.context,
        ViewClass: undefined,
        template: OutletTemplate
      },

      outlets: {}
    };

    var element = document.getElementById('ember-testing');
    var templateId = 0;

    if (hasOutletTemplate) {
      Ember.run(function () {
        toplevelView.setOutletState(outletState);
      });
    }

    context.render = function (template) {
      if (!template) {
        throw new Error('in a component integration test you must pass a template to `render()`');
      }
      if (Ember.isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = Ember.Handlebars.compile(template);
      }

      var templateFullName = 'template:-undertest-' + ++templateId;
      this.registry.register(templateFullName, template);
      var stateToRender = {
        owner: Ember.getOwner ? Ember.getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'index',
        controller: module.context,
        ViewClass: undefined,
        template: module.container.lookup(templateFullName),
        outlets: {}
      };

      if (hasOutletTemplate) {
        stateToRender.name = 'index';
        outletState.outlets.main = { render: stateToRender, outlets: {} };
      } else {
        stateToRender.name = 'application';
        outletState = { render: stateToRender, outlets: {} };
      }

      Ember.run(function () {
        toplevelView.setOutletState(outletState);
      });

      if (!hasRendered) {
        Ember.run(module.component, 'appendTo', '#ember-testing');
        hasRendered = true;
      }

      if (EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        // ensure the element is based on the wrapping toplevel view
        // Ember still wraps the main application template with a
        // normal tagged view
        context._element = element = document.querySelector('#ember-testing > .ember-view');
      } else {
        context._element = element = document.querySelector('#ember-testing');
      }
    };

    context.$ = function (selector) {
      // emulates Ember internal behavor of `this.$` in a component
      // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
      return selector ? Ember.$(selector, element) : Ember.$(element);
    };

    context.set = function (key, value) {
      var ret = Ember.run(function () {
        return Ember.set(context, key, value);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = Ember.run(function () {
        return Ember.setProperties(context, hash);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return Ember.get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return Ember.getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error('integration testing template received unexpected action ' + actionName);
      }
      hook.apply(module.context, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      Ember.run(function () {
        toplevelView.setOutletState({
          render: {
            owner: module.container,
            into: undefined,
            outlet: 'main',
            name: 'application',
            controller: module.context,
            ViewClass: undefined,
            template: undefined
          },
          outlets: {}
        });
      });
    };
  }
  exports.setupComponentIntegrationTest = _setupComponentIntegrationTest;
});
define('ember-test-helpers/legacy-0-6-x/test-module-for-model', ['exports', 'require', 'ember-test-helpers/legacy-0-6-x/test-module'], function (exports, _require2, _testModule) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _class = function (_TestModule) {
    _inherits(_class, _TestModule);

    function _class(modelName, description, callbacks) {
      _classCallCheck(this, _class);

      var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, 'model:' + modelName, description, callbacks));

      _this.modelName = modelName;

      _this.setupSteps.push(_this.setupModel);
      return _this;
    }

    _createClass(_class, [{
      key: 'setupModel',
      value: function setupModel() {
        var container = this.container;
        var defaultSubject = this.defaultSubject;
        var callbacks = this.callbacks;
        var modelName = this.modelName;

        var adapterFactory = container.factoryFor ? container.factoryFor('adapter:application') : container.lookupFactory('adapter:application');
        if (!adapterFactory) {
          if (requirejs.entries['ember-data/adapters/json-api']) {
            adapterFactory = (0, _require2.default)('ember-data/adapters/json-api')['default'];
          }

          // when ember-data/adapters/json-api is provided via ember-cli shims
          // using Ember Data 1.x the actual JSONAPIAdapter isn't found, but the
          // above require statement returns a bizzaro object with only a `default`
          // property (circular reference actually)
          if (!adapterFactory || !adapterFactory.create) {
            adapterFactory = DS.JSONAPIAdapter || DS.FixtureAdapter;
          }

          var thingToRegisterWith = this.registry || this.container;
          thingToRegisterWith.register('adapter:application', adapterFactory);
        }

        callbacks.store = function () {
          var container = this.container;
          return container.lookup('service:store') || container.lookup('store:main');
        };

        if (callbacks.subject === defaultSubject) {
          callbacks.subject = function (options) {
            var container = this.container;

            return Ember.run(function () {
              var store = container.lookup('service:store') || container.lookup('store:main');
              return store.createRecord(modelName, options);
            });
          };
        }
      }
    }]);

    return _class;
  }(_testModule.default);

  exports.default = _class;
});
define('ember-test-helpers/legacy-0-6-x/test-module', ['exports', 'ember-test-helpers/legacy-0-6-x/abstract-test-module', '@ember/test-helpers', 'ember-test-helpers/legacy-0-6-x/build-registry', '@ember/test-helpers/has-ember-version'], function (exports, _abstractTestModule, _testHelpers, _buildRegistry, _hasEmberVersion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _class = function (_AbstractTestModule) {
    _inherits(_class, _AbstractTestModule);

    function _class(subjectName, description, callbacks) {
      _classCallCheck(this, _class);

      // Allow `description` to be omitted, in which case it should
      // default to `subjectName`
      if (!callbacks && (typeof description === 'undefined' ? 'undefined' : _typeof(description)) === 'object') {
        callbacks = description;
        description = subjectName;
      }

      var _this2 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, description || subjectName, callbacks));

      _this2.subjectName = subjectName;
      _this2.description = description || subjectName;
      _this2.resolver = _this2.callbacks.resolver || (0, _testHelpers.getResolver)();

      if (_this2.callbacks.integration && _this2.callbacks.needs) {
        throw new Error("cannot declare 'integration: true' and 'needs' in the same module");
      }

      if (_this2.callbacks.integration) {
        _this2.initIntegration(callbacks);
        delete callbacks.integration;
      }

      _this2.initSubject();
      _this2.initNeeds();
      return _this2;
    }

    _createClass(_class, [{
      key: 'initIntegration',
      value: function initIntegration(options) {
        if (options.integration === 'legacy') {
          throw new Error("`integration: 'legacy'` is only valid for component tests.");
        }
        this.isIntegration = true;
      }
    }, {
      key: 'initSubject',
      value: function initSubject() {
        this.callbacks.subject = this.callbacks.subject || this.defaultSubject;
      }
    }, {
      key: 'initNeeds',
      value: function initNeeds() {
        this.needs = [this.subjectName];
        if (this.callbacks.needs) {
          this.needs = this.needs.concat(this.callbacks.needs);
          delete this.callbacks.needs;
        }
      }
    }, {
      key: 'initSetupSteps',
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContainer);
        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);
        this.setupSteps.push(this.setupPromiseListeners);

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: 'initTeardownSteps',
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownSubject);
        this.teardownSteps.push(this.teardownContainer);
        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownTestElements);
        this.teardownSteps.push(this.teardownAJAXListeners);
        this.teardownSteps.push(this.teardownPromiseListeners);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: 'setupContainer',
      value: function setupContainer() {
        if (this.isIntegration || this.isLegacy) {
          this._setupIntegratedContainer();
        } else {
          this._setupIsolatedContainer();
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext() {
        var subjectName = this.subjectName;
        var container = this.container;

        var factory = function factory() {
          return container.factoryFor ? container.factoryFor(subjectName) : container.lookupFactory(subjectName);
        };

        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'setupContext', this).call(this, {
          container: this.container,
          registry: this.registry,
          factory: factory,
          register: function register() {
            var target = this.registry || this.container;
            return target.register.apply(target, arguments);
          }
        });

        if (Ember.setOwner) {
          Ember.setOwner(this.context, this.container.owner);
        }

        this.setupInject();
      }
    }, {
      key: 'setupInject',
      value: function setupInject() {
        var module = this;
        var context = this.context;

        if (Ember.inject) {
          var keys = (Object.keys || keys)(Ember.inject);

          keys.forEach(function (typeName) {
            context.inject[typeName] = function (name, opts) {
              var alias = opts && opts.as || name;
              Ember.run(function () {
                Ember.set(context, alias, module.container.lookup(typeName + ':' + name));
              });
            };
          });
        }
      }
    }, {
      key: 'teardownSubject',
      value: function teardownSubject() {
        var subject = this.cache.subject;

        if (subject) {
          Ember.run(function () {
            Ember.tryInvoke(subject, 'destroy');
          });
        }
      }
    }, {
      key: 'teardownContainer',
      value: function teardownContainer() {
        var container = this.container;
        Ember.run(function () {
          container.destroy();
        });
      }
    }, {
      key: 'defaultSubject',
      value: function defaultSubject(options, factory) {
        return factory.create(options);
      }
    }, {
      key: 'contextualizeCallbacks',
      value: function contextualizeCallbacks() {
        var callbacks = this.callbacks;
        var context = this.context;

        this.cache = this.cache || {};
        this.cachedCalls = this.cachedCalls || {};

        var keys = (Object.keys || keys)(callbacks);
        var keysLength = keys.length;

        if (keysLength) {
          var deprecatedContext = this._buildDeprecatedContext(this, context);
          for (var i = 0; i < keysLength; i++) {
            this._contextualizeCallback(context, keys[i], deprecatedContext);
          }
        }
      }
    }, {
      key: '_contextualizeCallback',
      value: function _contextualizeCallback(context, key, callbackContext) {
        var _this = this;
        var callbacks = this.callbacks;
        var factory = context.factory;

        context[key] = function (options) {
          if (_this.cachedCalls[key]) {
            return _this.cache[key];
          }

          var result = callbacks[key].call(callbackContext, options, factory());

          _this.cache[key] = result;
          _this.cachedCalls[key] = true;

          return result;
        };
      }
    }, {
      key: '_buildDeprecatedContext',
      value: function _buildDeprecatedContext(module, context) {
        var deprecatedContext = Object.create(context);

        var keysForDeprecation = Object.keys(module);

        for (var i = 0, l = keysForDeprecation.length; i < l; i++) {
          this._proxyDeprecation(module, deprecatedContext, keysForDeprecation[i]);
        }

        return deprecatedContext;
      }
    }, {
      key: '_proxyDeprecation',
      value: function _proxyDeprecation(obj, proxy, key) {
        if (typeof proxy[key] === 'undefined') {
          Object.defineProperty(proxy, key, {
            get: function get() {
              Ember.deprecate('Accessing the test module property "' + key + '" from a callback is deprecated.', false, {
                id: 'ember-test-helpers.test-module.callback-context',
                until: '0.6.0'
              });
              return obj[key];
            }
          });
        }
      }
    }, {
      key: '_setupContainer',
      value: function _setupContainer(isolated) {
        var resolver = this.resolver;

        var items = (0, _buildRegistry.default)(!isolated ? resolver : Object.create(resolver, {
          resolve: {
            value: function value() {}
          }
        }));

        this.container = items.container;
        this.registry = items.registry;

        if ((0, _hasEmberVersion.default)(1, 13)) {
          var thingToRegisterWith = this.registry || this.container;
          var router = resolver.resolve('router:main');
          router = router || Ember.Router.extend();
          thingToRegisterWith.register('router:main', router);
        }
      }
    }, {
      key: '_setupIsolatedContainer',
      value: function _setupIsolatedContainer() {
        var resolver = this.resolver;
        this._setupContainer(true);

        var thingToRegisterWith = this.registry || this.container;

        for (var i = this.needs.length; i > 0; i--) {
          var fullName = this.needs[i - 1];
          var normalizedFullName = resolver.normalize(fullName);
          thingToRegisterWith.register(fullName, resolver.resolve(normalizedFullName));
        }

        if (!this.registry) {
          this.container.resolver = function () {};
        }
      }
    }, {
      key: '_setupIntegratedContainer',
      value: function _setupIntegratedContainer() {
        this._setupContainer();
      }
    }]);

    return _class;
  }(_abstractTestModule.default);

  exports.default = _class;
});
define('ember-test-helpers/wait', ['exports', '@ember/test-helpers/settled', '@ember/test-helpers'], function (exports, _settled, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._teardownPromiseListeners = exports._teardownAJAXHooks = exports._setupPromiseListeners = exports._setupAJAXHooks = undefined;
  Object.defineProperty(exports, '_setupAJAXHooks', {
    enumerable: true,
    get: function () {
      return _settled._setupAJAXHooks;
    }
  });
  Object.defineProperty(exports, '_setupPromiseListeners', {
    enumerable: true,
    get: function () {
      return _settled._setupPromiseListeners;
    }
  });
  Object.defineProperty(exports, '_teardownAJAXHooks', {
    enumerable: true,
    get: function () {
      return _settled._teardownAJAXHooks;
    }
  });
  Object.defineProperty(exports, '_teardownPromiseListeners', {
    enumerable: true,
    get: function () {
      return _settled._teardownPromiseListeners;
    }
  });
  exports.default = wait;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  /**
    Returns a promise that resolves when in a settled state (see `isSettled` for
    a definition of "settled state").
  
    @private
    @deprecated
    @param {Object} [options={}] the options to be used for waiting
    @param {boolean} [options.waitForTimers=true] should timers be waited upon
    @param {boolean} [options.waitForAjax=true] should $.ajax requests be waited upon
    @param {boolean} [options.waitForWaiters=true] should test waiters be waited upon
    @returns {Promise<void>} resolves when settled
  */
  function wait() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object' || options === null) {
      options = {};
    }

    return (0, _testHelpers.waitUntil)(function () {
      var waitForTimers = 'waitForTimers' in options ? options.waitForTimers : true;
      var waitForAJAX = 'waitForAJAX' in options ? options.waitForAJAX : true;
      var waitForWaiters = 'waitForWaiters' in options ? options.waitForWaiters : true;

      var _getSettledState = (0, _testHelpers.getSettledState)(),
          hasPendingTimers = _getSettledState.hasPendingTimers,
          hasRunLoop = _getSettledState.hasRunLoop,
          hasPendingRequests = _getSettledState.hasPendingRequests,
          hasPendingWaiters = _getSettledState.hasPendingWaiters;

      if (waitForTimers && (hasPendingTimers || hasRunLoop)) {
        return false;
      }

      if (waitForAJAX && hasPendingRequests) {
        return false;
      }

      if (waitForWaiters && hasPendingWaiters) {
        return false;
      }

      return true;
    }, { timeout: Infinity });
  }
});
define("qunit/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /* globals QUnit */

  var _module = QUnit.module;
  exports.module = _module;
  var test = exports.test = QUnit.test;
  var skip = exports.skip = QUnit.skip;
  var only = exports.only = QUnit.only;
  var todo = exports.todo = QUnit.todo;

  exports.default = QUnit;
});
runningTests = true;

if (window.Testem) {
  window.Testem.hookIntoTestFramework();
}


;
var __ember_auto_import__ =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"tests": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp_ember_auto_import_"] = window["webpackJsonp_ember_auto_import_"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([1,"vendors~tests"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/l.js":
/*!**********************************************************!*\
  !*** ./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/l.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nwindow._eai_r = require;\nwindow._eai_d = define;\n\n\n//# sourceURL=webpack://__ember_auto_import__/./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/l.js?");

/***/ }),

/***/ "./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/tests.js":
/*!**************************************************************!*\
  !*** ./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/tests.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("\nif (typeof document !== 'undefined') {\n  __webpack_require__.p = (function(){\n    var scripts = document.querySelectorAll('script');\n    return scripts[scripts.length - 1].src.replace(/\\/[^/]*$/, '/');\n  })();\n}\n\nmodule.exports = (function(){\n  var d = _eai_d;\n  var r = _eai_r;\n  window.emberAutoImportDynamic = function(specifier) {\n    if (arguments.length === 1) {\n      return r('_eai_dyn_' + specifier);\n    } else {\n      return r('_eai_dynt_' + specifier)(Array.prototype.slice.call(arguments, 1))\n    }\n  };\n    d('lodash.castarray', [], function() { return __webpack_require__(/*! ./node_modules/lodash.castarray/index.js */ \"./node_modules/lodash.castarray/index.js\"); });\n    d('lodash.last', [], function() { return __webpack_require__(/*! ./node_modules/lodash.last/index.js */ \"./node_modules/lodash.last/index.js\"); });\n    d('lodash.omit', [], function() { return __webpack_require__(/*! ./node_modules/lodash.omit/index.js */ \"./node_modules/lodash.omit/index.js\"); });\n})();\n\n\n//# sourceURL=webpack://__ember_auto_import__/./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/tests.js?");

/***/ }),

/***/ 1:
/*!***********************************************************************************************************************!*\
  !*** multi ./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/l.js ./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/tests.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! /Users/vthyagaraj/Documents/forms/fs-dev/tmp/bundler-cache_path-gtJdVNrb.tmp/staging/l.js */\"./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/l.js\");\nmodule.exports = __webpack_require__(/*! /Users/vthyagaraj/Documents/forms/fs-dev/tmp/bundler-cache_path-gtJdVNrb.tmp/staging/tests.js */\"./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/tests.js\");\n\n\n//# sourceURL=webpack://__ember_auto_import__/multi_./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/l.js_./tmp/bundler-cache_path-gtJdVNrb.tmp/staging/tests.js?");

/***/ })

/******/ });;
(window["webpackJsonp_ember_auto_import_"] = window["webpackJsonp_ember_auto_import_"] || []).push([["vendors~tests"],{

/***/ "./node_modules/lodash.castarray/index.js":
/*!************************************************!*\
  !*** ./node_modules/lodash.castarray/index.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n * lodash 4.4.0 (Custom Build) <https://lodash.com/>\n * Build: `lodash modularize exports=\"npm\" -o ./`\n * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>\n * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>\n * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n * Available under MIT license <https://lodash.com/license>\n */\n\n/**\n * Casts `value` as an array if it's not one.\n *\n * @static\n * @memberOf _\n * @category Lang\n * @param {*} value The value to inspect.\n * @returns {Array} Returns the cast array.\n * @example\n *\n * _.castArray(1);\n * // => [1]\n *\n * _.castArray({ 'a': 1 });\n * // => [{ 'a': 1 }]\n *\n * _.castArray('abc');\n * // => ['abc']\n *\n * _.castArray(null);\n * // => [null]\n *\n * _.castArray(undefined);\n * // => [undefined]\n *\n * _.castArray();\n * // => []\n *\n * var array = [1, 2, 3];\n * console.log(_.castArray(array) === array);\n * // => true\n */\nfunction castArray() {\n  if (!arguments.length) {\n    return [];\n  }\n\n  var value = arguments[0];\n  return isArray(value) ? value : [value];\n}\n/**\n * Checks if `value` is classified as an `Array` object.\n *\n * @static\n * @memberOf _\n * @type {Function}\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n * @example\n *\n * _.isArray([1, 2, 3]);\n * // => true\n *\n * _.isArray(document.body.children);\n * // => false\n *\n * _.isArray('abc');\n * // => false\n *\n * _.isArray(_.noop);\n * // => false\n */\n\n\nvar isArray = Array.isArray;\nmodule.exports = castArray;\n\n//# sourceURL=webpack://__ember_auto_import__/./node_modules/lodash.castarray/index.js?");

/***/ }),

/***/ "./node_modules/lodash.last/index.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash.last/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n * lodash 3.0.0 (Custom Build) <https://lodash.com/>\n * Build: `lodash modern modularize exports=\"npm\" -o ./`\n * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>\n * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>\n * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n * Available under MIT license <https://lodash.com/license>\n */\n\n/**\n * Gets the last element of `array`.\n *\n * @static\n * @memberOf _\n * @category Array\n * @param {Array} array The array to query.\n * @returns {*} Returns the last element of `array`.\n * @example\n *\n * _.last([1, 2, 3]);\n * // => 3\n */\nfunction last(array) {\n  var length = array ? array.length : 0;\n  return length ? array[length - 1] : undefined;\n}\n\nmodule.exports = last;\n\n//# sourceURL=webpack://__ember_auto_import__/./node_modules/lodash.last/index.js?");

/***/ }),

/***/ "./node_modules/lodash.omit/index.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash.omit/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _typeof(obj) { \"@babel/helpers - typeof\"; if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\n/**\n * lodash (Custom Build) <https://lodash.com/>\n * Build: `lodash modularize exports=\"npm\" -o ./`\n * Copyright jQuery Foundation and other contributors <https://jquery.org/>\n * Released under MIT license <https://lodash.com/license>\n * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>\n * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n */\n\n/** Used as the size to enable large array optimizations. */\nvar LARGE_ARRAY_SIZE = 200;\n/** Used to stand-in for `undefined` hash values. */\n\nvar HASH_UNDEFINED = '__lodash_hash_undefined__';\n/** Used as references for various `Number` constants. */\n\nvar INFINITY = 1 / 0,\n    MAX_SAFE_INTEGER = 9007199254740991;\n/** `Object#toString` result references. */\n\nvar argsTag = '[object Arguments]',\n    funcTag = '[object Function]',\n    genTag = '[object GeneratorFunction]',\n    symbolTag = '[object Symbol]';\n/**\n * Used to match `RegExp`\n * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).\n */\n\nvar reRegExpChar = /[\\\\^$.*+?()[\\]{}|]/g;\n/** Used to detect host constructors (Safari). */\n\nvar reIsHostCtor = /^\\[object .+?Constructor\\]$/;\n/** Used to detect unsigned integer values. */\n\nvar reIsUint = /^(?:0|[1-9]\\d*)$/;\n/** Detect free variable `global` from Node.js. */\n\nvar freeGlobal = (typeof global === \"undefined\" ? \"undefined\" : _typeof(global)) == 'object' && global && global.Object === Object && global;\n/** Detect free variable `self`. */\n\nvar freeSelf = (typeof self === \"undefined\" ? \"undefined\" : _typeof(self)) == 'object' && self && self.Object === Object && self;\n/** Used as a reference to the global object. */\n\nvar root = freeGlobal || freeSelf || Function('return this')();\n/**\n * A faster alternative to `Function#apply`, this function invokes `func`\n * with the `this` binding of `thisArg` and the arguments of `args`.\n *\n * @private\n * @param {Function} func The function to invoke.\n * @param {*} thisArg The `this` binding of `func`.\n * @param {Array} args The arguments to invoke `func` with.\n * @returns {*} Returns the result of `func`.\n */\n\nfunction apply(func, thisArg, args) {\n  switch (args.length) {\n    case 0:\n      return func.call(thisArg);\n\n    case 1:\n      return func.call(thisArg, args[0]);\n\n    case 2:\n      return func.call(thisArg, args[0], args[1]);\n\n    case 3:\n      return func.call(thisArg, args[0], args[1], args[2]);\n  }\n\n  return func.apply(thisArg, args);\n}\n/**\n * A specialized version of `_.includes` for arrays without support for\n * specifying an index to search from.\n *\n * @private\n * @param {Array} [array] The array to inspect.\n * @param {*} target The value to search for.\n * @returns {boolean} Returns `true` if `target` is found, else `false`.\n */\n\n\nfunction arrayIncludes(array, value) {\n  var length = array ? array.length : 0;\n  return !!length && baseIndexOf(array, value, 0) > -1;\n}\n/**\n * This function is like `arrayIncludes` except that it accepts a comparator.\n *\n * @private\n * @param {Array} [array] The array to inspect.\n * @param {*} target The value to search for.\n * @param {Function} comparator The comparator invoked per element.\n * @returns {boolean} Returns `true` if `target` is found, else `false`.\n */\n\n\nfunction arrayIncludesWith(array, value, comparator) {\n  var index = -1,\n      length = array ? array.length : 0;\n\n  while (++index < length) {\n    if (comparator(value, array[index])) {\n      return true;\n    }\n  }\n\n  return false;\n}\n/**\n * A specialized version of `_.map` for arrays without support for iteratee\n * shorthands.\n *\n * @private\n * @param {Array} [array] The array to iterate over.\n * @param {Function} iteratee The function invoked per iteration.\n * @returns {Array} Returns the new mapped array.\n */\n\n\nfunction arrayMap(array, iteratee) {\n  var index = -1,\n      length = array ? array.length : 0,\n      result = Array(length);\n\n  while (++index < length) {\n    result[index] = iteratee(array[index], index, array);\n  }\n\n  return result;\n}\n/**\n * Appends the elements of `values` to `array`.\n *\n * @private\n * @param {Array} array The array to modify.\n * @param {Array} values The values to append.\n * @returns {Array} Returns `array`.\n */\n\n\nfunction arrayPush(array, values) {\n  var index = -1,\n      length = values.length,\n      offset = array.length;\n\n  while (++index < length) {\n    array[offset + index] = values[index];\n  }\n\n  return array;\n}\n/**\n * The base implementation of `_.findIndex` and `_.findLastIndex` without\n * support for iteratee shorthands.\n *\n * @private\n * @param {Array} array The array to inspect.\n * @param {Function} predicate The function invoked per iteration.\n * @param {number} fromIndex The index to search from.\n * @param {boolean} [fromRight] Specify iterating from right to left.\n * @returns {number} Returns the index of the matched value, else `-1`.\n */\n\n\nfunction baseFindIndex(array, predicate, fromIndex, fromRight) {\n  var length = array.length,\n      index = fromIndex + (fromRight ? 1 : -1);\n\n  while (fromRight ? index-- : ++index < length) {\n    if (predicate(array[index], index, array)) {\n      return index;\n    }\n  }\n\n  return -1;\n}\n/**\n * The base implementation of `_.indexOf` without `fromIndex` bounds checks.\n *\n * @private\n * @param {Array} array The array to inspect.\n * @param {*} value The value to search for.\n * @param {number} fromIndex The index to search from.\n * @returns {number} Returns the index of the matched value, else `-1`.\n */\n\n\nfunction baseIndexOf(array, value, fromIndex) {\n  if (value !== value) {\n    return baseFindIndex(array, baseIsNaN, fromIndex);\n  }\n\n  var index = fromIndex - 1,\n      length = array.length;\n\n  while (++index < length) {\n    if (array[index] === value) {\n      return index;\n    }\n  }\n\n  return -1;\n}\n/**\n * The base implementation of `_.isNaN` without support for number objects.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.\n */\n\n\nfunction baseIsNaN(value) {\n  return value !== value;\n}\n/**\n * The base implementation of `_.times` without support for iteratee shorthands\n * or max array length checks.\n *\n * @private\n * @param {number} n The number of times to invoke `iteratee`.\n * @param {Function} iteratee The function invoked per iteration.\n * @returns {Array} Returns the array of results.\n */\n\n\nfunction baseTimes(n, iteratee) {\n  var index = -1,\n      result = Array(n);\n\n  while (++index < n) {\n    result[index] = iteratee(index);\n  }\n\n  return result;\n}\n/**\n * The base implementation of `_.unary` without support for storing metadata.\n *\n * @private\n * @param {Function} func The function to cap arguments for.\n * @returns {Function} Returns the new capped function.\n */\n\n\nfunction baseUnary(func) {\n  return function (value) {\n    return func(value);\n  };\n}\n/**\n * Checks if a cache value for `key` exists.\n *\n * @private\n * @param {Object} cache The cache to query.\n * @param {string} key The key of the entry to check.\n * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n */\n\n\nfunction cacheHas(cache, key) {\n  return cache.has(key);\n}\n/**\n * Gets the value at `key` of `object`.\n *\n * @private\n * @param {Object} [object] The object to query.\n * @param {string} key The key of the property to get.\n * @returns {*} Returns the property value.\n */\n\n\nfunction getValue(object, key) {\n  return object == null ? undefined : object[key];\n}\n/**\n * Checks if `value` is a host object in IE < 9.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a host object, else `false`.\n */\n\n\nfunction isHostObject(value) {\n  // Many host objects are `Object` objects that can coerce to strings\n  // despite having improperly defined `toString` methods.\n  var result = false;\n\n  if (value != null && typeof value.toString != 'function') {\n    try {\n      result = !!(value + '');\n    } catch (e) {}\n  }\n\n  return result;\n}\n/**\n * Creates a unary function that invokes `func` with its argument transformed.\n *\n * @private\n * @param {Function} func The function to wrap.\n * @param {Function} transform The argument transform.\n * @returns {Function} Returns the new function.\n */\n\n\nfunction overArg(func, transform) {\n  return function (arg) {\n    return func(transform(arg));\n  };\n}\n/** Used for built-in method references. */\n\n\nvar arrayProto = Array.prototype,\n    funcProto = Function.prototype,\n    objectProto = Object.prototype;\n/** Used to detect overreaching core-js shims. */\n\nvar coreJsData = root['__core-js_shared__'];\n/** Used to detect methods masquerading as native. */\n\nvar maskSrcKey = function () {\n  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');\n  return uid ? 'Symbol(src)_1.' + uid : '';\n}();\n/** Used to resolve the decompiled source of functions. */\n\n\nvar funcToString = funcProto.toString;\n/** Used to check objects for own properties. */\n\nvar hasOwnProperty = objectProto.hasOwnProperty;\n/**\n * Used to resolve the\n * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n * of values.\n */\n\nvar objectToString = objectProto.toString;\n/** Used to detect if a method is native. */\n\nvar reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\\\$&').replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, '$1.*?') + '$');\n/** Built-in value references. */\n\nvar _Symbol = root.Symbol,\n    getPrototype = overArg(Object.getPrototypeOf, Object),\n    propertyIsEnumerable = objectProto.propertyIsEnumerable,\n    splice = arrayProto.splice,\n    spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;\n/* Built-in method references for those with the same name as other `lodash` methods. */\n\nvar nativeGetSymbols = Object.getOwnPropertySymbols,\n    nativeMax = Math.max;\n/* Built-in method references that are verified to be native. */\n\nvar Map = getNative(root, 'Map'),\n    nativeCreate = getNative(Object, 'create');\n/**\n * Creates a hash object.\n *\n * @private\n * @constructor\n * @param {Array} [entries] The key-value pairs to cache.\n */\n\nfunction Hash(entries) {\n  var index = -1,\n      length = entries ? entries.length : 0;\n  this.clear();\n\n  while (++index < length) {\n    var entry = entries[index];\n    this.set(entry[0], entry[1]);\n  }\n}\n/**\n * Removes all key-value entries from the hash.\n *\n * @private\n * @name clear\n * @memberOf Hash\n */\n\n\nfunction hashClear() {\n  this.__data__ = nativeCreate ? nativeCreate(null) : {};\n}\n/**\n * Removes `key` and its value from the hash.\n *\n * @private\n * @name delete\n * @memberOf Hash\n * @param {Object} hash The hash to modify.\n * @param {string} key The key of the value to remove.\n * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n */\n\n\nfunction hashDelete(key) {\n  return this.has(key) && delete this.__data__[key];\n}\n/**\n * Gets the hash value for `key`.\n *\n * @private\n * @name get\n * @memberOf Hash\n * @param {string} key The key of the value to get.\n * @returns {*} Returns the entry value.\n */\n\n\nfunction hashGet(key) {\n  var data = this.__data__;\n\n  if (nativeCreate) {\n    var result = data[key];\n    return result === HASH_UNDEFINED ? undefined : result;\n  }\n\n  return hasOwnProperty.call(data, key) ? data[key] : undefined;\n}\n/**\n * Checks if a hash value for `key` exists.\n *\n * @private\n * @name has\n * @memberOf Hash\n * @param {string} key The key of the entry to check.\n * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n */\n\n\nfunction hashHas(key) {\n  var data = this.__data__;\n  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);\n}\n/**\n * Sets the hash `key` to `value`.\n *\n * @private\n * @name set\n * @memberOf Hash\n * @param {string} key The key of the value to set.\n * @param {*} value The value to set.\n * @returns {Object} Returns the hash instance.\n */\n\n\nfunction hashSet(key, value) {\n  var data = this.__data__;\n  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;\n  return this;\n} // Add methods to `Hash`.\n\n\nHash.prototype.clear = hashClear;\nHash.prototype['delete'] = hashDelete;\nHash.prototype.get = hashGet;\nHash.prototype.has = hashHas;\nHash.prototype.set = hashSet;\n/**\n * Creates an list cache object.\n *\n * @private\n * @constructor\n * @param {Array} [entries] The key-value pairs to cache.\n */\n\nfunction ListCache(entries) {\n  var index = -1,\n      length = entries ? entries.length : 0;\n  this.clear();\n\n  while (++index < length) {\n    var entry = entries[index];\n    this.set(entry[0], entry[1]);\n  }\n}\n/**\n * Removes all key-value entries from the list cache.\n *\n * @private\n * @name clear\n * @memberOf ListCache\n */\n\n\nfunction listCacheClear() {\n  this.__data__ = [];\n}\n/**\n * Removes `key` and its value from the list cache.\n *\n * @private\n * @name delete\n * @memberOf ListCache\n * @param {string} key The key of the value to remove.\n * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n */\n\n\nfunction listCacheDelete(key) {\n  var data = this.__data__,\n      index = assocIndexOf(data, key);\n\n  if (index < 0) {\n    return false;\n  }\n\n  var lastIndex = data.length - 1;\n\n  if (index == lastIndex) {\n    data.pop();\n  } else {\n    splice.call(data, index, 1);\n  }\n\n  return true;\n}\n/**\n * Gets the list cache value for `key`.\n *\n * @private\n * @name get\n * @memberOf ListCache\n * @param {string} key The key of the value to get.\n * @returns {*} Returns the entry value.\n */\n\n\nfunction listCacheGet(key) {\n  var data = this.__data__,\n      index = assocIndexOf(data, key);\n  return index < 0 ? undefined : data[index][1];\n}\n/**\n * Checks if a list cache value for `key` exists.\n *\n * @private\n * @name has\n * @memberOf ListCache\n * @param {string} key The key of the entry to check.\n * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n */\n\n\nfunction listCacheHas(key) {\n  return assocIndexOf(this.__data__, key) > -1;\n}\n/**\n * Sets the list cache `key` to `value`.\n *\n * @private\n * @name set\n * @memberOf ListCache\n * @param {string} key The key of the value to set.\n * @param {*} value The value to set.\n * @returns {Object} Returns the list cache instance.\n */\n\n\nfunction listCacheSet(key, value) {\n  var data = this.__data__,\n      index = assocIndexOf(data, key);\n\n  if (index < 0) {\n    data.push([key, value]);\n  } else {\n    data[index][1] = value;\n  }\n\n  return this;\n} // Add methods to `ListCache`.\n\n\nListCache.prototype.clear = listCacheClear;\nListCache.prototype['delete'] = listCacheDelete;\nListCache.prototype.get = listCacheGet;\nListCache.prototype.has = listCacheHas;\nListCache.prototype.set = listCacheSet;\n/**\n * Creates a map cache object to store key-value pairs.\n *\n * @private\n * @constructor\n * @param {Array} [entries] The key-value pairs to cache.\n */\n\nfunction MapCache(entries) {\n  var index = -1,\n      length = entries ? entries.length : 0;\n  this.clear();\n\n  while (++index < length) {\n    var entry = entries[index];\n    this.set(entry[0], entry[1]);\n  }\n}\n/**\n * Removes all key-value entries from the map.\n *\n * @private\n * @name clear\n * @memberOf MapCache\n */\n\n\nfunction mapCacheClear() {\n  this.__data__ = {\n    'hash': new Hash(),\n    'map': new (Map || ListCache)(),\n    'string': new Hash()\n  };\n}\n/**\n * Removes `key` and its value from the map.\n *\n * @private\n * @name delete\n * @memberOf MapCache\n * @param {string} key The key of the value to remove.\n * @returns {boolean} Returns `true` if the entry was removed, else `false`.\n */\n\n\nfunction mapCacheDelete(key) {\n  return getMapData(this, key)['delete'](key);\n}\n/**\n * Gets the map value for `key`.\n *\n * @private\n * @name get\n * @memberOf MapCache\n * @param {string} key The key of the value to get.\n * @returns {*} Returns the entry value.\n */\n\n\nfunction mapCacheGet(key) {\n  return getMapData(this, key).get(key);\n}\n/**\n * Checks if a map value for `key` exists.\n *\n * @private\n * @name has\n * @memberOf MapCache\n * @param {string} key The key of the entry to check.\n * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n */\n\n\nfunction mapCacheHas(key) {\n  return getMapData(this, key).has(key);\n}\n/**\n * Sets the map `key` to `value`.\n *\n * @private\n * @name set\n * @memberOf MapCache\n * @param {string} key The key of the value to set.\n * @param {*} value The value to set.\n * @returns {Object} Returns the map cache instance.\n */\n\n\nfunction mapCacheSet(key, value) {\n  getMapData(this, key).set(key, value);\n  return this;\n} // Add methods to `MapCache`.\n\n\nMapCache.prototype.clear = mapCacheClear;\nMapCache.prototype['delete'] = mapCacheDelete;\nMapCache.prototype.get = mapCacheGet;\nMapCache.prototype.has = mapCacheHas;\nMapCache.prototype.set = mapCacheSet;\n/**\n *\n * Creates an array cache object to store unique values.\n *\n * @private\n * @constructor\n * @param {Array} [values] The values to cache.\n */\n\nfunction SetCache(values) {\n  var index = -1,\n      length = values ? values.length : 0;\n  this.__data__ = new MapCache();\n\n  while (++index < length) {\n    this.add(values[index]);\n  }\n}\n/**\n * Adds `value` to the array cache.\n *\n * @private\n * @name add\n * @memberOf SetCache\n * @alias push\n * @param {*} value The value to cache.\n * @returns {Object} Returns the cache instance.\n */\n\n\nfunction setCacheAdd(value) {\n  this.__data__.set(value, HASH_UNDEFINED);\n\n  return this;\n}\n/**\n * Checks if `value` is in the array cache.\n *\n * @private\n * @name has\n * @memberOf SetCache\n * @param {*} value The value to search for.\n * @returns {number} Returns `true` if `value` is found, else `false`.\n */\n\n\nfunction setCacheHas(value) {\n  return this.__data__.has(value);\n} // Add methods to `SetCache`.\n\n\nSetCache.prototype.add = SetCache.prototype.push = setCacheAdd;\nSetCache.prototype.has = setCacheHas;\n/**\n * Creates an array of the enumerable property names of the array-like `value`.\n *\n * @private\n * @param {*} value The value to query.\n * @param {boolean} inherited Specify returning inherited property names.\n * @returns {Array} Returns the array of property names.\n */\n\nfunction arrayLikeKeys(value, inherited) {\n  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.\n  // Safari 9 makes `arguments.length` enumerable in strict mode.\n  var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];\n  var length = result.length,\n      skipIndexes = !!length;\n\n  for (var key in value) {\n    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isIndex(key, length)))) {\n      result.push(key);\n    }\n  }\n\n  return result;\n}\n/**\n * Gets the index at which the `key` is found in `array` of key-value pairs.\n *\n * @private\n * @param {Array} array The array to inspect.\n * @param {*} key The key to search for.\n * @returns {number} Returns the index of the matched value, else `-1`.\n */\n\n\nfunction assocIndexOf(array, key) {\n  var length = array.length;\n\n  while (length--) {\n    if (eq(array[length][0], key)) {\n      return length;\n    }\n  }\n\n  return -1;\n}\n/**\n * The base implementation of methods like `_.difference` without support\n * for excluding multiple arrays or iteratee shorthands.\n *\n * @private\n * @param {Array} array The array to inspect.\n * @param {Array} values The values to exclude.\n * @param {Function} [iteratee] The iteratee invoked per element.\n * @param {Function} [comparator] The comparator invoked per element.\n * @returns {Array} Returns the new array of filtered values.\n */\n\n\nfunction baseDifference(array, values, iteratee, comparator) {\n  var index = -1,\n      includes = arrayIncludes,\n      isCommon = true,\n      length = array.length,\n      result = [],\n      valuesLength = values.length;\n\n  if (!length) {\n    return result;\n  }\n\n  if (iteratee) {\n    values = arrayMap(values, baseUnary(iteratee));\n  }\n\n  if (comparator) {\n    includes = arrayIncludesWith;\n    isCommon = false;\n  } else if (values.length >= LARGE_ARRAY_SIZE) {\n    includes = cacheHas;\n    isCommon = false;\n    values = new SetCache(values);\n  }\n\n  outer: while (++index < length) {\n    var value = array[index],\n        computed = iteratee ? iteratee(value) : value;\n    value = comparator || value !== 0 ? value : 0;\n\n    if (isCommon && computed === computed) {\n      var valuesIndex = valuesLength;\n\n      while (valuesIndex--) {\n        if (values[valuesIndex] === computed) {\n          continue outer;\n        }\n      }\n\n      result.push(value);\n    } else if (!includes(values, computed, comparator)) {\n      result.push(value);\n    }\n  }\n\n  return result;\n}\n/**\n * The base implementation of `_.flatten` with support for restricting flattening.\n *\n * @private\n * @param {Array} array The array to flatten.\n * @param {number} depth The maximum recursion depth.\n * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.\n * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.\n * @param {Array} [result=[]] The initial result value.\n * @returns {Array} Returns the new flattened array.\n */\n\n\nfunction baseFlatten(array, depth, predicate, isStrict, result) {\n  var index = -1,\n      length = array.length;\n  predicate || (predicate = isFlattenable);\n  result || (result = []);\n\n  while (++index < length) {\n    var value = array[index];\n\n    if (depth > 0 && predicate(value)) {\n      if (depth > 1) {\n        // Recursively flatten arrays (susceptible to call stack limits).\n        baseFlatten(value, depth - 1, predicate, isStrict, result);\n      } else {\n        arrayPush(result, value);\n      }\n    } else if (!isStrict) {\n      result[result.length] = value;\n    }\n  }\n\n  return result;\n}\n/**\n * The base implementation of `getAllKeys` and `getAllKeysIn` which uses\n * `keysFunc` and `symbolsFunc` to get the enumerable property names and\n * symbols of `object`.\n *\n * @private\n * @param {Object} object The object to query.\n * @param {Function} keysFunc The function to get the keys of `object`.\n * @param {Function} symbolsFunc The function to get the symbols of `object`.\n * @returns {Array} Returns the array of property names and symbols.\n */\n\n\nfunction baseGetAllKeys(object, keysFunc, symbolsFunc) {\n  var result = keysFunc(object);\n  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));\n}\n/**\n * The base implementation of `_.isNative` without bad shim checks.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a native function,\n *  else `false`.\n */\n\n\nfunction baseIsNative(value) {\n  if (!isObject(value) || isMasked(value)) {\n    return false;\n  }\n\n  var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;\n  return pattern.test(toSource(value));\n}\n/**\n * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.\n *\n * @private\n * @param {Object} object The object to query.\n * @returns {Array} Returns the array of property names.\n */\n\n\nfunction baseKeysIn(object) {\n  if (!isObject(object)) {\n    return nativeKeysIn(object);\n  }\n\n  var isProto = isPrototype(object),\n      result = [];\n\n  for (var key in object) {\n    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {\n      result.push(key);\n    }\n  }\n\n  return result;\n}\n/**\n * The base implementation of `_.pick` without support for individual\n * property identifiers.\n *\n * @private\n * @param {Object} object The source object.\n * @param {string[]} props The property identifiers to pick.\n * @returns {Object} Returns the new object.\n */\n\n\nfunction basePick(object, props) {\n  object = Object(object);\n  return basePickBy(object, props, function (value, key) {\n    return key in object;\n  });\n}\n/**\n * The base implementation of  `_.pickBy` without support for iteratee shorthands.\n *\n * @private\n * @param {Object} object The source object.\n * @param {string[]} props The property identifiers to pick from.\n * @param {Function} predicate The function invoked per property.\n * @returns {Object} Returns the new object.\n */\n\n\nfunction basePickBy(object, props, predicate) {\n  var index = -1,\n      length = props.length,\n      result = {};\n\n  while (++index < length) {\n    var key = props[index],\n        value = object[key];\n\n    if (predicate(value, key)) {\n      result[key] = value;\n    }\n  }\n\n  return result;\n}\n/**\n * The base implementation of `_.rest` which doesn't validate or coerce arguments.\n *\n * @private\n * @param {Function} func The function to apply a rest parameter to.\n * @param {number} [start=func.length-1] The start position of the rest parameter.\n * @returns {Function} Returns the new function.\n */\n\n\nfunction baseRest(func, start) {\n  start = nativeMax(start === undefined ? func.length - 1 : start, 0);\n  return function () {\n    var args = arguments,\n        index = -1,\n        length = nativeMax(args.length - start, 0),\n        array = Array(length);\n\n    while (++index < length) {\n      array[index] = args[start + index];\n    }\n\n    index = -1;\n    var otherArgs = Array(start + 1);\n\n    while (++index < start) {\n      otherArgs[index] = args[index];\n    }\n\n    otherArgs[start] = array;\n    return apply(func, this, otherArgs);\n  };\n}\n/**\n * Creates an array of own and inherited enumerable property names and\n * symbols of `object`.\n *\n * @private\n * @param {Object} object The object to query.\n * @returns {Array} Returns the array of property names and symbols.\n */\n\n\nfunction getAllKeysIn(object) {\n  return baseGetAllKeys(object, keysIn, getSymbolsIn);\n}\n/**\n * Gets the data for `map`.\n *\n * @private\n * @param {Object} map The map to query.\n * @param {string} key The reference key.\n * @returns {*} Returns the map data.\n */\n\n\nfunction getMapData(map, key) {\n  var data = map.__data__;\n  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;\n}\n/**\n * Gets the native function at `key` of `object`.\n *\n * @private\n * @param {Object} object The object to query.\n * @param {string} key The key of the method to get.\n * @returns {*} Returns the function if it's native, else `undefined`.\n */\n\n\nfunction getNative(object, key) {\n  var value = getValue(object, key);\n  return baseIsNative(value) ? value : undefined;\n}\n/**\n * Creates an array of the own enumerable symbol properties of `object`.\n *\n * @private\n * @param {Object} object The object to query.\n * @returns {Array} Returns the array of symbols.\n */\n\n\nvar getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;\n/**\n * Creates an array of the own and inherited enumerable symbol properties\n * of `object`.\n *\n * @private\n * @param {Object} object The object to query.\n * @returns {Array} Returns the array of symbols.\n */\n\nvar getSymbolsIn = !nativeGetSymbols ? stubArray : function (object) {\n  var result = [];\n\n  while (object) {\n    arrayPush(result, getSymbols(object));\n    object = getPrototype(object);\n  }\n\n  return result;\n};\n/**\n * Checks if `value` is a flattenable `arguments` object or array.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.\n */\n\nfunction isFlattenable(value) {\n  return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);\n}\n/**\n * Checks if `value` is a valid array-like index.\n *\n * @private\n * @param {*} value The value to check.\n * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.\n * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.\n */\n\n\nfunction isIndex(value, length) {\n  length = length == null ? MAX_SAFE_INTEGER : length;\n  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;\n}\n/**\n * Checks if `value` is suitable for use as unique object key.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is suitable, else `false`.\n */\n\n\nfunction isKeyable(value) {\n  var type = _typeof(value);\n\n  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;\n}\n/**\n * Checks if `func` has its source masked.\n *\n * @private\n * @param {Function} func The function to check.\n * @returns {boolean} Returns `true` if `func` is masked, else `false`.\n */\n\n\nfunction isMasked(func) {\n  return !!maskSrcKey && maskSrcKey in func;\n}\n/**\n * Checks if `value` is likely a prototype object.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.\n */\n\n\nfunction isPrototype(value) {\n  var Ctor = value && value.constructor,\n      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;\n  return value === proto;\n}\n/**\n * This function is like\n * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)\n * except that it includes inherited enumerable properties.\n *\n * @private\n * @param {Object} object The object to query.\n * @returns {Array} Returns the array of property names.\n */\n\n\nfunction nativeKeysIn(object) {\n  var result = [];\n\n  if (object != null) {\n    for (var key in Object(object)) {\n      result.push(key);\n    }\n  }\n\n  return result;\n}\n/**\n * Converts `value` to a string key if it's not a string or symbol.\n *\n * @private\n * @param {*} value The value to inspect.\n * @returns {string|symbol} Returns the key.\n */\n\n\nfunction toKey(value) {\n  if (typeof value == 'string' || isSymbol(value)) {\n    return value;\n  }\n\n  var result = value + '';\n  return result == '0' && 1 / value == -INFINITY ? '-0' : result;\n}\n/**\n * Converts `func` to its source code.\n *\n * @private\n * @param {Function} func The function to process.\n * @returns {string} Returns the source code.\n */\n\n\nfunction toSource(func) {\n  if (func != null) {\n    try {\n      return funcToString.call(func);\n    } catch (e) {}\n\n    try {\n      return func + '';\n    } catch (e) {}\n  }\n\n  return '';\n}\n/**\n * Performs a\n * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)\n * comparison between two values to determine if they are equivalent.\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to compare.\n * @param {*} other The other value to compare.\n * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\n * @example\n *\n * var object = { 'a': 1 };\n * var other = { 'a': 1 };\n *\n * _.eq(object, object);\n * // => true\n *\n * _.eq(object, other);\n * // => false\n *\n * _.eq('a', 'a');\n * // => true\n *\n * _.eq('a', Object('a'));\n * // => false\n *\n * _.eq(NaN, NaN);\n * // => true\n */\n\n\nfunction eq(value, other) {\n  return value === other || value !== value && other !== other;\n}\n/**\n * Checks if `value` is likely an `arguments` object.\n *\n * @static\n * @memberOf _\n * @since 0.1.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is an `arguments` object,\n *  else `false`.\n * @example\n *\n * _.isArguments(function() { return arguments; }());\n * // => true\n *\n * _.isArguments([1, 2, 3]);\n * // => false\n */\n\n\nfunction isArguments(value) {\n  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.\n  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);\n}\n/**\n * Checks if `value` is classified as an `Array` object.\n *\n * @static\n * @memberOf _\n * @since 0.1.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is an array, else `false`.\n * @example\n *\n * _.isArray([1, 2, 3]);\n * // => true\n *\n * _.isArray(document.body.children);\n * // => false\n *\n * _.isArray('abc');\n * // => false\n *\n * _.isArray(_.noop);\n * // => false\n */\n\n\nvar isArray = Array.isArray;\n/**\n * Checks if `value` is array-like. A value is considered array-like if it's\n * not a function and has a `value.length` that's an integer greater than or\n * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is array-like, else `false`.\n * @example\n *\n * _.isArrayLike([1, 2, 3]);\n * // => true\n *\n * _.isArrayLike(document.body.children);\n * // => true\n *\n * _.isArrayLike('abc');\n * // => true\n *\n * _.isArrayLike(_.noop);\n * // => false\n */\n\nfunction isArrayLike(value) {\n  return value != null && isLength(value.length) && !isFunction(value);\n}\n/**\n * This method is like `_.isArrayLike` except that it also checks if `value`\n * is an object.\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is an array-like object,\n *  else `false`.\n * @example\n *\n * _.isArrayLikeObject([1, 2, 3]);\n * // => true\n *\n * _.isArrayLikeObject(document.body.children);\n * // => true\n *\n * _.isArrayLikeObject('abc');\n * // => false\n *\n * _.isArrayLikeObject(_.noop);\n * // => false\n */\n\n\nfunction isArrayLikeObject(value) {\n  return isObjectLike(value) && isArrayLike(value);\n}\n/**\n * Checks if `value` is classified as a `Function` object.\n *\n * @static\n * @memberOf _\n * @since 0.1.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a function, else `false`.\n * @example\n *\n * _.isFunction(_);\n * // => true\n *\n * _.isFunction(/abc/);\n * // => false\n */\n\n\nfunction isFunction(value) {\n  // The use of `Object#toString` avoids issues with the `typeof` operator\n  // in Safari 8-9 which returns 'object' for typed array and other constructors.\n  var tag = isObject(value) ? objectToString.call(value) : '';\n  return tag == funcTag || tag == genTag;\n}\n/**\n * Checks if `value` is a valid array-like length.\n *\n * **Note:** This method is loosely based on\n * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.\n * @example\n *\n * _.isLength(3);\n * // => true\n *\n * _.isLength(Number.MIN_VALUE);\n * // => false\n *\n * _.isLength(Infinity);\n * // => false\n *\n * _.isLength('3');\n * // => false\n */\n\n\nfunction isLength(value) {\n  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;\n}\n/**\n * Checks if `value` is the\n * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)\n * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)\n *\n * @static\n * @memberOf _\n * @since 0.1.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is an object, else `false`.\n * @example\n *\n * _.isObject({});\n * // => true\n *\n * _.isObject([1, 2, 3]);\n * // => true\n *\n * _.isObject(_.noop);\n * // => true\n *\n * _.isObject(null);\n * // => false\n */\n\n\nfunction isObject(value) {\n  var type = _typeof(value);\n\n  return !!value && (type == 'object' || type == 'function');\n}\n/**\n * Checks if `value` is object-like. A value is object-like if it's not `null`\n * and has a `typeof` result of \"object\".\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is object-like, else `false`.\n * @example\n *\n * _.isObjectLike({});\n * // => true\n *\n * _.isObjectLike([1, 2, 3]);\n * // => true\n *\n * _.isObjectLike(_.noop);\n * // => false\n *\n * _.isObjectLike(null);\n * // => false\n */\n\n\nfunction isObjectLike(value) {\n  return !!value && _typeof(value) == 'object';\n}\n/**\n * Checks if `value` is classified as a `Symbol` primitive or object.\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.\n * @example\n *\n * _.isSymbol(Symbol.iterator);\n * // => true\n *\n * _.isSymbol('abc');\n * // => false\n */\n\n\nfunction isSymbol(value) {\n  return _typeof(value) == 'symbol' || isObjectLike(value) && objectToString.call(value) == symbolTag;\n}\n/**\n * Creates an array of the own and inherited enumerable property names of `object`.\n *\n * **Note:** Non-object values are coerced to objects.\n *\n * @static\n * @memberOf _\n * @since 3.0.0\n * @category Object\n * @param {Object} object The object to query.\n * @returns {Array} Returns the array of property names.\n * @example\n *\n * function Foo() {\n *   this.a = 1;\n *   this.b = 2;\n * }\n *\n * Foo.prototype.c = 3;\n *\n * _.keysIn(new Foo);\n * // => ['a', 'b', 'c'] (iteration order is not guaranteed)\n */\n\n\nfunction keysIn(object) {\n  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);\n}\n/**\n * The opposite of `_.pick`; this method creates an object composed of the\n * own and inherited enumerable string keyed properties of `object` that are\n * not omitted.\n *\n * @static\n * @since 0.1.0\n * @memberOf _\n * @category Object\n * @param {Object} object The source object.\n * @param {...(string|string[])} [props] The property identifiers to omit.\n * @returns {Object} Returns the new object.\n * @example\n *\n * var object = { 'a': 1, 'b': '2', 'c': 3 };\n *\n * _.omit(object, ['a', 'c']);\n * // => { 'b': '2' }\n */\n\n\nvar omit = baseRest(function (object, props) {\n  if (object == null) {\n    return {};\n  }\n\n  props = arrayMap(baseFlatten(props, 1), toKey);\n  return basePick(object, baseDifference(getAllKeysIn(object), props));\n});\n/**\n * This method returns a new empty array.\n *\n * @static\n * @memberOf _\n * @since 4.13.0\n * @category Util\n * @returns {Array} Returns the new empty array.\n * @example\n *\n * var arrays = _.times(2, _.stubArray);\n *\n * console.log(arrays);\n * // => [[], []]\n *\n * console.log(arrays[0] === arrays[1]);\n * // => false\n */\n\nfunction stubArray() {\n  return [];\n}\n\nmodule.exports = omit;\n\n//# sourceURL=webpack://__ember_auto_import__/./node_modules/lodash.omit/index.js?");

/***/ })

}]);//# sourceMappingURL=test-support.map
