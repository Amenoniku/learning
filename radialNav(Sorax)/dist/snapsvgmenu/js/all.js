(function () {
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../bower_components/almond/almond", function(){});

(function() {
  var GUI, RadialNav, animate, describeArc, describeSector, gui, iconsPath, polarToCartesian, random, toggleContext;

  iconsPath = 'icons.svg';

  Snap.plugin(function(Snap, Element) {
    return Element.prototype.hover = function(f_in, f_out, s_in, s_out) {
      return this.mouseover(f_in, s_in).mouseout(f_out || f_in, s_out || s_in);
    };
  });

  polarToCartesian = function(cx, cy, r, angle) {
    angle = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  describeArc = function(x, y, r, startAngle, endAngle, continueLine, alter) {
    var end, start;
    start = polarToCartesian(x, y, r, startAngle %= 360);
    end = polarToCartesian(x, y, r, endAngle %= 360);
    return "" + (continueLine ? 'L' : 'M') + start.x + " " + start.y + " A" + r + " " + r + ", 0, " + (endAngle - startAngle >= 180 ? 1 : 0) + ", " + (alter ? 0 : 1) + ", " + end.x + " " + end.y;
  };

  describeSector = function(x, y, r, r2, startAngle, endAngle) {
    return (describeArc(x, y, r, startAngle, endAngle)) + " " + (describeArc(x, y, r2, endAngle, startAngle, true, true)) + "Z";
  };

  random = function(min, max) {
    return Math.random() * (max - min) + min;
  };

  animate = function(obj, index, start, end, duration, easing, fn, cb) {
    var ref;
    if ((ref = (obj.animation != null ? obj.animation : obj.animation = [])[index]) != null) {
      ref.stop();
    }
    return obj.animation[index] = Snap.animate(start, end, fn, duration, easing, cb);
  };

  toggleContext = function() {
    return document.body.classList.toggle('context');
  };

  GUI = (function() {
    function GUI(buttons) {
      this.paper = Snap(window.innerWidth, window.innerHeight);
      Snap.load(iconsPath, (function(_this) {
        return function(icons) {
          _this.nav = new RadialNav(_this.paper, buttons, icons);
          return _this._bindEvents();
        };
      })(this));
    }

    GUI.prototype._bindEvents = function() {
      window.addEventListener('resize', (function(_this) {
        return function() {
          return _this.paper.attr({
            width: window.innerWidth,
            height: window.innerHeight
          });
        };
      })(this));
      this.paper.node.addEventListener('mousedown', this.nav.show.bind(this.nav));
      return this.paper.node.addEventListener('mouseup', this.nav.hide.bind(this.nav));
    };

    return GUI;

  })();

  RadialNav = (function() {
    function RadialNav(paper, buttons, icons) {
      this.area = paper.svg(0, 0, this.size = 500, this.size).addClass('radialnav');
      this.c = this.size / 2;
      this.r = this.size * .25;
      this.r2 = this.r * .35;
      this.animDuration = 300;
      this.angle = 360 / buttons.length;
      this.container = this.area.g();
      this.container.transform("s0");
      this.updateButtons(buttons, icons);
    }

    RadialNav.prototype._animateContainer = function(start, end, duration, easing) {
      return animate(this, 0, start, end, duration, easing, (function(_this) {
        return function(val) {
          return _this.container.transform("r" + (90 - 90 * val) + "," + _this.c + "," + _this.c + "s" + val + "," + val + "," + _this.c + "," + _this.c);
        };
      })(this));
    };

    RadialNav.prototype._animateButtons = function(start, end, min, max, easing) {
      var anim, el, i, ref, results;
      anim = (function(_this) {
        return function(i, el) {
          return animate(el, 0, start, end, random(min, max), easing, function(val) {
            return el.transform("r" + (_this.angle * i) + "," + _this.c + "," + _this.c + "s" + val + "," + val + "," + _this.c + "," + _this.c);
          });
        };
      })(this);
      ref = this.container;
      results = [];
      for (i in ref) {
        el = ref[i];
        if (!Number.isNaN(+i)) {
          results.push(anim(i, el));
        }
      }
      return results;
    };

    RadialNav.prototype._animateButtonHover = function(button, start, end, duration, easing, cb) {
      return animate(button, 1, start, end, duration, easing, ((function(_this) {
        return function(val) {
          button[0].attr({
            d: describeSector(_this.c, _this.c, _this.r - val * 10, _this.r2, 0, _this.angle)
          });
          return button[2].transform("s" + (1.1 - val * .1) + "," + (1.1 - val * .1) + "," + _this.c + "," + _this.c);
        };
      })(this)), cb);
    };

    RadialNav.prototype._sector = function() {
      return this.area.path(describeSector(this.c, this.c, this.r, this.r2, 0, this.angle)).addClass('radialnav-sector');
    };

    RadialNav.prototype._icon = function(btn, icons) {
      var bbox, icon;
      icon = icons.select("#" + btn.icon).addClass('radialnav-icon');
      icon.transform("T" + (this.c - (bbox = icon.getBBox()).x - bbox.width / 2) + ", " + (this.c - bbox.y - this.r + this.r2 - bbox.height / 2 - 5) + " R" + (this.angle / 2) + "," + this.c + "," + this.c + "S.7");
      return icon;
    };

    RadialNav.prototype._hint = function(btn) {
      var hint;
      hint = this.area.text(0, 0, btn.icon).addClass('radialnav-hint hide').attr({
        textpath: describeArc(this.c, this.c, this.r, 0, this.angle)
      });
      hint.select('*').attr({
        startOffset: '50%'
      });
      return hint;
    };

    RadialNav.prototype._button = function(btn, sector, icon, hint) {
      return this.area.g(sector, icon, hint).data('cb', btn.action).mouseup(function() {
        var base;
        return typeof (base = this.data('cb')) === "function" ? base() : void 0;
      }).hover(function() {
        var el, j, len, ref, results;
        ref = [this[0], this[1], this[2]];
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          el = ref[j];
          results.push(el.toggleClass('active'));
        }
        return results;
      }).hover(this._buttonOver(this), this._buttonOut(this));
    };

    RadialNav.prototype._buttonOver = function(nav) {
      return function() {
        nav._animateButtonHover(this, 0, 1, 200, mina.easeinout);
        return this[2].removeClass('hide');
      };
    };

    RadialNav.prototype._buttonOut = function(nav) {
      return function() {
        return nav._animateButtonHover(this, 1, 0, 2000, mina.elastic, (function() {
          return this.addClass('hide');
        }).bind(this[2]));
      };
    };

    RadialNav.prototype.updateButtons = function(buttons, icons) {
      var btn, j, len, results;
      this.container.clear();
      results = [];
      for (j = 0, len = buttons.length; j < len; j++) {
        btn = buttons[j];
        results.push(this.container.add(this._button(btn, this._sector(), this._icon(btn, icons), this._hint(btn))));
      }
      return results;
    };

    RadialNav.prototype.show = function(e) {
      this.area.attr({
        x: e.clientX - this.c,
        y: e.clientY - this.c
      });
      toggleContext();
      this._animateContainer(0, 1, this.animDuration * 8, mina.elastic);
      return this._animateButtons(0, 1, this.animDuration, this.animDuration * 8, mina.elastic);
    };

    RadialNav.prototype.hide = function() {
      toggleContext();
      this._animateContainer(1, 0, this.animDuration, mina.easeinout);
      return this._animateButtons(1, 0, this.animDuration, this.animDuration, mina.easeinout);
    };

    return RadialNav;

  })();

  gui = new GUI([
    {
      icon: 'pin',
      action: function() {
        return humane.log('Pinning...');
      }
    }, {
      icon: 'search',
      action: function() {
        return humane.log('Opening Search...');
      }
    }, {
      icon: 'cloud',
      action: function() {
        return humane.log('Connecting to Cloud...');
      }
    }, {
      icon: 'settings',
      action: function() {
        return humane.log('Opening Settings...');
      }
    }, {
      icon: 'rewind',
      action: function() {
        return humane.log('Rewinding...');
      }
    }, {
      icon: 'preview',
      action: function() {
        return humane.log('Preview Activated');
      }
    }, {
      icon: 'delete',
      action: function() {
        return humane.log('Deleting...');
      }
    }
  ]);

  humane.timeout = 1000;

}).call(this);

define("main", function(){});

require(["main"]);
}());