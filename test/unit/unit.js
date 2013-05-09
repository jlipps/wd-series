/*global describe:true, it:true */
"use strict";

var should = require('should')
  , wd = require('wd')
  , driver = wd.remote()
  , driverSeries = require('../../series').driverSeries;

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

describe("Series binding", function() {

  it('should proxy methods from driver', function(done) {
    driverSeries(driver, [
      function() { (typeof this.init).should.equal("function"); this.next(); }
    ], done);
  });
});

