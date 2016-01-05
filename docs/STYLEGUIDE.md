Bhima Coding Style Guide
========================

#### Introduction

Software sustainability is only achieved by implimenting sustainable development
practices at every step of the development practice.  For bhima, IMA-WorldHealth
requires that all code be subject to proper formatting, static analysis (linting),
and adhere to this style guide.

Note: This is far from complete.  But it touches on some issues we've had thus far.

## Coding Conventions
- Indent: Two spaces, no tabs.
- All code must be linted, if possible
- mixedCase for all variables and functions, except Classes, which are capitalized or CamelCase 

## Javascript

##### Declarations

Always indent two spaces.  Do not use tabs.  If it possible, configure your editor
to use only two spaces when the tab key is pressed.

```javascript
// good
if (true) {
  // Two space indentation
}

// bad
if (false) {
    // Four spaces is bad
} else {
// No spaces is bad as well
}
```

Use mixedCase for all variable and function declarations, except classes.  Classes must
be declared using CamelCase.  Be as concise and descriptive as possible.

```javascript
// good
var rowBool = False || True;
function OperatorService(x) {
  // do something cool ...
};
var client = new OperatorService();

// bad
var Row = {};  // FIXME: not a class!
var T = new dbLogger({ log : false });  // this is a class. Use CamelCase!
```

Always declare variables using the `var` keyword.

```javascript
// good
var x = 7;
var y = "Some String",
    z = new Separator();

// bad
x = 7;
y = "Some String";
z = new Separator();
```

Using one `var` statement for a series of assignments is acceptable, but be sure to
indent properly.  Proper indentation aligns all the variable names to increase
readability.

```javascript
// good
var x = 7,
    y = "Some String";

// acceptable for hoisted variables
var x, y, z = 6; // x, y are undefined, z is 6.

// bad
var x = 7, y = "Some String";
```

Never use an operator (`+`, `-`, `=`, `?`, etc) as the first character in a line.  It is confusing -
is `+` the concat or the addition addition operator on the new line?  Additionally, other errors may
appear during minification.

```javascript
// good
var s = "I am a " +
        "multiline string!";
var sql =
      "SELECT * FROM `hello_word`;";
var lambda = angular.isString(s) ?    // Try to avoid this, but it is better than the alternative
              "It is!" :
              "It isn't";

// bad
var s = "I am a multiline"
  + "string";
var lamda = angular.isString(s)
         ? "It is!"
         : "It isn't";
```


##### Function Declarations

Anonymous functions are useful.  When declaring an anonymous function, insert a space
between the keyword `function` and the following parens.  For named function, do not
include the space.

```javascript
// good
function (a, b) { return a + b; }
function sum(a, b) { return a + b; }

// bad
function(a, b) { return a + b; }
function sum (a, b) { return a + b; }
```

Prefer named functions to assigning functions to a `var`.


```javascript
// good
function sum(a, b) { return a + b; }

// bad
var sum = function sum(a, b) { return a + b; }
```

Always terminate return statement with a semicolon (`;`).

```javascript
// good
function power(x, n) { return x * power(x, n-1); }

// bad
function power(x, n) { return x * power(x, n-1) }
```
Do not repeat yourself.  If you are using an element of an object, or
a function repeatedly, you should reference it and use the reference instead.

```javascript
// good
var location = data.location;
var res = {
  id : location.id,
  geo : computeGeoCoords(location.id),
  reference : '/location/' + location.reference,
};

// good, reuse a function
function condense(x,y) { return x + y; }
totalX = x.reduce(condense, 0);
totalY = y.reduce(condense, 0);

// excellent, prevent many declarations of a function.  Function defined once and
// used multiple times
var values, totals;
function totaler(x,y) { return x + y; }
values = [[1,2,3], [3,4,5], [5,4,1], [6,7,8]];
totals = values.map(function (v) {
  return v.reduce(totaler, 0);
});

// bad
var res = {
  id : data.location.id,                  // Too many calls to data! Sub-optimal!  Hard to read!
  geo : computeGeoCoords(data.location.id),
  reference : '/location/' + data.location.reference,
};

// bad, creates the same function more than once
totalX = x.reduce(function (x,y) { return x + y; }, 0);
totalY = y.reduce(function (x,y) { return x + y; }, 0);

// Terrible!  Creates n new functions for n datapoints!
var values, totals;
values = [[1,2,3], [3,4,5], [5,4,1], [6,7,8]];
totals = values.map(function (v) {
  return v.reduce(function (x,y) { return x + y; }, 0);
});
```

###### Objects

Always use object literal syntax.

```javascript
// good
var o = {};
var a = [];

// bad
var o = new Object();
var a = new Array();
```
