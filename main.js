"use strict";

var DriverScope = require('./driver_scope')
  , boundSeries = require('./series');

module.exports = function(driver, fns, finalCb) {
  var scope = new DriverScope(driver);
  return boundSeries(scope, fns, finalCb);
};
