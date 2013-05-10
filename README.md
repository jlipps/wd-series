wd-series
=========

Async wrapper for admc/wd (the Node WebDriver client).

With vanilla Wd.js, you can do amazing things like this:

```js
var driver = wd.remote();
driver.init(desiredCaps, function(err, sessionId) {
  driver.get("http://mysite.com", function(err) {
    driver.elementById("someId", function(err, el) {
      el.click(function(err) {
        driver.elementById("anotherThing", function(err, el2) {
          el2.text(function(err, text) {
            // assert text is correct
          });
        });
      });
    });
  });
});
```

Using wd-series, you can make it line up more nice-like:

```
npm install wd-series
```

```js
var driver = wd.remote(),
    driverSeries = require('wd-series');

driverSeries(driver, [
  function() { this.init(desiredCaps); },
  function() { this.get("http://mysite.com"); },
  function() { this.elementById("someId"); },
  function() { this.res.click(); },
  function() { this.elementById("anotherThing"); },
  function() { this.res.text() },
  function() { /* assert text is correct */ this.next(); }
]);
```

It looks even more compact in coffee-script!

```coffee
driver = wd.remote()
driverSeries = require 'wd-series'

driverSeries driver,
    -> @init desiredCaps
    -> @get "http://mysite.com"
    -> @elementById "someId"
    -> @res.click()
    -> @res.text()
    -> @next() # assert text is correct
```

Enjoy. Pull requests. Etc.
