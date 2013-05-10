/*global describe:true, it:true */
"use strict";

var should = require('should')
  , wd = require('wd')
  , driver = wd.remote()
  , driverSeries = require('../../lib/main');

describe("Series", function() {
  it('should make this.next() available', function(done) {
    driverSeries(driver, [
      function() { (typeof this.next).should.equal("function"); this.next(); }
    ], done);
  });

  it('should make this.res available', function(done) {
    driverSeries(driver, [
      function() { (typeof this.res).should.not.equal("undefined"); this.next(); },
    ], done);
  });

  it('should put result of callback into this.res', function(done) {
    driverSeries(driver, [
      function() { this.next(null, "why hello there"); },
      function() { this.res.should.equal("why hello there"); this.next(); }
    ], done);
  });

  it('should put plural result of callback into this.res as array', function(done) {
    driverSeries(driver, [
      function() { this.next(null, "res1", "res2", 5); },
      function() { this.res.should.eql(["res1", "res2", 5]); this.next(); }
    ], done);
  });
});

describe("Control flow", function() {

  it('should be able to pause execution', function(done) {
    driverSeries(driver, [
      function() { this.startTime = Date.now(); this.next(); },
      function() { this.sleep(1); },
      function() { (Date.now() - 1000).should.be.above(this.startTime); this.next(); }
    ], done);
  });

  it('should be able to retry a block', function(done) {
    var startTime = Date.now();
    driverSeries(driver, [
      function() { this.retry(2, [
        function() { this.next(); }
      ]); }
    ], function(err) {
      should.exist(err);
      (Date.now() - 2000).should.be.above(startTime);
      done();
    });
  });

  it('should be able to execute a conditional blocks with true protasis', function(done) {
    var myVal = "foo";
    driverSeries(driver, [
      function() { this.iff([
        function() { this.next(); }
      ], [
        function() { myVal = "bar"; this.next(); }
      ]); }
    ], function(err) {
      should.not.exist(err);
      myVal.should.equal("bar");
      done();
    });
  });

  it('should be able to execute a conditional blocks with true apodosis', function(done) {
    var myVal = "foo";
    driverSeries(driver, [
      function() { this.iff([
        function() { this.next(new Error("asdf")); }
      ], [
        function() { myVal = "bar"; this.next(); }
      ]); }
    ], function(err) {
      should.not.exist(err);
      myVal.should.equal("foo");
      done();
    });
  });

  it('should be able to honey-badger through a broken series', function(done) {
    driverSeries(driver, [
      function() { this.honeyBadger([
        function() { this.next(new Error("oh noes!")); }
      ]); }
    ], function(err) {
      should.not.exist(err);
      done();
    });
  });
});

describe("Driver binding", function() {

  // monkey-patch driver
  driver.elementById = function(id, cb) {
    var getName = function(cb2) {
      cb2(null, "monkeyPatchedElementName");
    };
    cb(null, {value: 1, browser: driver, getName: getName});
  };

  it('should proxy methods from driver', function(done) {
    driverSeries(driver, [
      function() { (typeof this.init).should.equal("function"); this.next(); }
    ], done);
  });

  it('should proxy methods from elements', function(done) {
    driverSeries(driver, [
      function() { this.elementById('foo'); },
      function() {
        (typeof this.res.getName).should.equal("function");
        this.res.getName();
      },
      function() { this.res.should.equal("monkeyPatchedElementName"); this.next(); }
    ], done);
  });
});

