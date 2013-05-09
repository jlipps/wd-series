"use strict";

var boundSeries = require("./series").boundSeries;

var DriverScope = function(driver) {
  var me = this;
  this.driver = driver;
  for (var key in driver) {
    if (typeof driver[key] === "function") {
      me.makeProxyForDriver(key);
    }
  }
  this.next = null;
  this.res = null;
};

DriverScope.prototype.ensure = function(obj) {
  if (obj === null || typeof obj === "undefined") {
    this.next(new Error("Expected object to exist that didn't"));
  } else {
    this.next(null, obj);
  }
};

DriverScope.prototype.sleep = function(secs) {
  var ms = secs * 1000
    , me = this;
  var next = function() {
    me.next(null, me.res);
  };
  setTimeout(next, ms);
};

DriverScope.prototype.makeProxyForDriver = function(key) {
  var me = this;
  this[key] = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.push(me.next);
    me.driver[key].apply(me.driver, args);
  };
};

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
    if (possibleEl !== null && possibleEl.value && possibleEl.browser) {
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

DriverScope.prototype.retry = function(timeout, fns) {
  if (timeout instanceof Array) {
    fns = timeout;
    timeout = 10;
  }
  var me = this;
  var cb = this.next;
  timeout *= 1000;
  var intMs = 500;
  var now = Date.now();
  var doTry = function() {
    boundSeries(me, fns, function(err) {
      if (!err) {
        return cb();
      } else if (err && ((Date.now() - timeout) < now)) {
        setTimeout(doTry, intMs);
      } else {
        cb(err);
      }
    });
  };
  doTry();
};

DriverScope.prototype.each = function(objs, fns) {
  var me = this;
  var origNext = me.next;
  var seriesForObj = function() {
    var obj = objs.shift();
    if (typeof obj !== "undefined") {
      me.res = obj;
      boundSeries(me, fns, function(err) {
        if (err) return origNext(err);
        seriesForObj();
      });
    } else {
      origNext();
    }
  };
  seriesForObj();

};

DriverScope.prototype.iff = function(ifFns, thenFns) {
  var me = this;
  var origNext = me.next;
  boundSeries(me, ifFns, function(err) {
    if (err) return origNext();
    boundSeries(me, thenFns, origNext);
  });
};

// honeybadger don't care! (if the series fails)
DriverScope.prototype.honeyBadger = function(fns) {
  var origNext = this.next;
  boundSeries(this, fns, function() {
    origNext();
  });
};

module.exports = DriverScope;
