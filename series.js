"use strict";

var _ = require("underscore")
  , DriverScope = require("./driver_scope")
  , async = require("async");


var boundSeries = function(scope, fns, finalCb) {
  var modFns = [];
  _.each(fns, function(fn) {
    var modFn = function() {
      var args = Array.prototype.slice.call(arguments, 0);
      if (args.length === 2) {
        scope.next = args[1];
        scope.res = args[0];
      } else if (args.length > 2) {
        scope.next = args[args.length - 1];
        scope.res = args.slice(0, args.length - 1);
      } else {
        scope.next = args[0];
      }
      scope.convertElements();
      try {
        fn.apply(scope);
      } catch (e) {
        scope.next(e);
      }
    };
    modFns.push(modFn);
  });
  return async.waterfall(modFns, finalCb);
};

module.exports.boundSeries = boundSeries;

module.exports.driverSeries = function(driver, fns, finalCb) {
  var scope = new DriverScope(driver);
  return boundSeries(scope, fns, finalCb);
};


