"use strict";

var boundSeries = require('./series.js');

var SeriesScope = function(scopeObj) {
  this.init(scopeObj);
};

SeriesScope.prototype.init = function(scopeObj) {
  var me = this;
  me.scopeObj = scopeObj;
  for (var key in scopeObj) {
    if (typeof scopeObj[key] === "function") {
      me.makeProxyForScopeObj(key);
    }
  }
  this.next = null;
  this.res = null;
};

SeriesScope.prototype.makeProxyForScopeObj = function(key) {
  var me = this;
  this[key] = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.push(me.next);
    me.scopeObj[key].apply(me.scopeObj, args);
  };
};

SeriesScope.prototype.ensure = function(obj) {
  if (obj === null || typeof obj === "undefined") {
    this.next(new Error("Expected object to exist that didn't"));
  } else {
    this.next(null, obj);
  }
};

SeriesScope.prototype.sleep = function(secs) {
  var ms = secs * 1000
    , me = this;
  var next = function() {
    me.next(null, me.res);
  };
  setTimeout(next, ms);
};

SeriesScope.prototype.retry = function(timeout, fns) {
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

SeriesScope.prototype.each = function(objs, fns) {
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

SeriesScope.prototype.iff = function(ifFns, thenFns) {
  var me = this;
  var origNext = me.next;
  boundSeries(me, ifFns, function(err) {
    if (err) return origNext();
    boundSeries(me, thenFns, origNext);
  });
};

// honeybadger don't care! (if the series fails)
SeriesScope.prototype.honeyBadger = function(fns) {
  console.log("about to hb");
  var origNext = this.next;
  boundSeries(this, fns, function() {
    origNext();
  });
};

module.exports = SeriesScope;
