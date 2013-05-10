wd-series
=========

Async wrapper for admc/wd (the Node WebDriver client).

With vanilla Wd.js, you can create amazing pyramids with tons of boilerplate.
Like this!

```js
var wd = require('wd'),
    should = require('should'),
    driver = wd.remote(),
    desiredCaps = {/* desired caps here */},
    postTest = function(err) {
      console.log("Test " + (err ? "failed" : "passed") + ". Time for beer");
    };

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

Hooray pyramids! Using wd-series, you can make it line up more nice-like:

```
npm install wd-series
```

```js
var wd = require('wd'),
    should = require('should'),
    driverSeries = require('wd-series');
    driver = wd.remote(),
    desiredCaps = {/* desired caps here */},
    postTest = function(err) {
      console.log("Test " + (err ? "failed" : "passed") + ". Time for beer");
    };

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
wd = require 'wd'
driverSeries = require 'wd-series'
should = require 'should'
driver = wd.remote()
desiredCaps = {}
postTest = (err) ->
    console.log "Test #{if err then 'failed' else 'passed'}. Time for beer"

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

Enjoy. Pull requests. Etc.
