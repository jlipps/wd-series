"use strict";

var SeriesScope = require("./scope")
  , _ = require("underscore");

var DriverScope = function(driver) {
  this.driver = driver;
  this.init(driver);
};

_.extend(DriverScope.prototype, SeriesScope.prototype);

DriverScope.prototype.getProxiedElement = function(el) {
  var me = this;
  var newEl = {};
  var makeProxyForElement = function(key) {
    newEl[key] = function() {
      var args = Array.prototype.slice.call(arguments, 0);
      args.push(me.next);
      el[key].apply(el, args);
    };
  };
  for (var key in el) {
    if (typeof el[key] === "function") {
      makeProxyForElement(key);
    } else {
      newEl[key] = el[key];
    }
  }

  return newEl;
};

DriverScope.prototype.convertElements = function() {
  var me = this;
  var checkPossibleEl = function(possibleEl) {
    if (typeof possibleEl !== "undefined" && possibleEl !== null &&
        possibleEl.value && possibleEl.browser) {
      return me.getProxiedElement(possibleEl);
    }
    return possibleEl;
  };
  if (this.res instanceof Array) {
    for (var i = 0; i < this.res.length; i++) {
      this.res[i] = checkPossibleEl(this.res[i]);
    }
  } else {
    this.res = checkPossibleEl(this.res);
  }
};

module.exports = DriverScope;
