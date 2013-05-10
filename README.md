wd-series
=========

Async wrapper for [Wd.js](https://github.com/admc/wd) (the Node WebDriver client).

Easy install:

```
npm install wd-series
```

The idea
--------

Let's say we have a WebDriver test we want to write. Here's the preamble:
```js
var wd = require('wd'),
    should = require('should'),
    driver = wd.remote(),
    desiredCaps = {/* desired caps here */},
    postTest = function(err) {
      console.log("Test " + (err ? "failed" : "passed") + ". Time for beer");
    };
```

With vanilla Wd.js, you can create amazing pyramids with tons of boilerplate.
Like this!

```js
driver.init(desiredCaps, function(err, sessionId) {
  if (err) return postTest(err);
  driver.get("http://mysite.com", function(err) {
    if (err) return postTest(err);
    driver.elementById("someId", function(err, el) {
      if (err) return postTest(err);
      el.click(function(err) {
        if (err) return postTest(err);
        driver.elementById("anotherThing", function(err, el2) {
          if (err) return postTest(err);
          el2.text(function(err, text) {
            if (err) return postTest(err);
            text.should.equal("What the text should be");
            driver.quit(postTest);
          });
        });
      });
    });
  });
});
```

Hooray pyramids! I mean, Boo Pyramids! Using wd-series, you can make it line up
more nice-like:

```js
driverSeries(driver, [
  function() { this.init(desiredCaps); },
  function() { this.get("http://mysite.com"); },
  function() { this.elementById("someId"); },
  function() { this.res.click(); },
  function() { this.elementById("anotherThing"); },
  function() { this.res.text() },
  function() { this.res.should.equal("What the text should be"); this.next(); },
  function() { this.quit(); }
], postTest);
```

It looks even more compact in coffeescript!

```coffee
driverSeries driver, [
    -> @init desiredCaps
    -> @get "http://mysite.com"
    -> @elementById "someId"
    -> @res.click()
    -> @elementById "anotherThing"
    -> @res.text()
    -> @res.should.equal "What the text should be"; @next
    -> @quit()
], postTest
```

Enjoy. Send pull requests. Create Issues. Etc.

Control Flow
-----------

You can even do some common control flowage.

### Pause execution

```js
driverSeries(driver, [
  function() { this.sleep(10); }
], cb);
```

### Run a block multiple times synchronously with different inputs

```js
driverSeries(driver, [
  function() { this.elementsByTagName("option"); },
  function() { this.each(this.res, [
    function() { this.res.text(); },
    function() { console.log(this.res); this.next(); }
  ]); }
], cb);
```

The above example finds all the 'option' elements and gets the text of each
one, printing it out in succession.

### Run a block only if another block is successful

```js
driverSeries(driver, [
  function() { this.iff([
    function() { this.elementById("idThatExists"); }
  ], [
    // Element exists, this block will get run
    function() { this.res.text(); },
    function() { console.log(this.res); this.next(); }
  ]); }
], cb);
```

```js
driverSeries(driver, [
  function() { this.iff([
    function() { this.elementById("idThatDoesntExist"); }
  ], [
    // Element doesn't exist, this block won't get run
    function() { console.log("I'm sad, I'll never get run"); this.next(); }
  ]); }
], cb);
```

### Run a block and continue execution even if the block fails

[Honey badger don't care](http://www.youtube.com/watch?v=4r7wHMg5Yjg) if the
block fails!

```js
driverSeries(driver, [
  function() { this.honeyBadger([
    function() { this.next(new Error("This would normally cause us to quit the series")); }
  ]); },
  function() { console.log("This will run anyway."); this.next(); }
], cb);
```
