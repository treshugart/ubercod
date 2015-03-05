# ubercod

Tiny JavaScript DI container that automatically resolves dependencies based on simple naming conventions.

Soo... "ubercod"? That's right! Lenovo injected Superfish into their computers, so Ubercod is going to inject dependencies into your dependencies. Cool? Whatever...

## Installing

    npm install ubercod

## Including

    require('ubercod');

## Usage

The API consists of a single function that takes an object. The keys are the dependency names and values can be any value, but most of the time you'll use a constructor or function.

```js
var uber = require('ubercod');

function Phrase (hello) {
  this.hello = hello;
}

function exclamation (str) {
  return str + '!';
}

// "exclamation" will resolve to a dependency and be automatically injected.
// This means that you can call it like "app.hello({ str: 'string' })" and
// "string" would be passed as the second argument automatically.
function hello (exclamation, str) {
  return 'Hello, ' + exclamation(str);
}

var app = uber({
  // The dollar "$" means "singleton", or not transient.
  // Uppercase "P" means "Constructor", do not call as a function.
  // "$Phrase" becomes "phrase" because the name is normalised after parsing
  // for meaningful tokens.
  $Phrase: Phrase,

  // Lowercase "e" means "function", or "not constructible".
  exclamation: exclamation,

  // Same semantics as "exclamation".
  hello: hello
});

// "Hello, World!"
app.phrase.hello({ str: 'World' });
```

You can even chain containers:

```js
var cont1 = uber({
  dep1: function () {
    ...
  }
});

var cont2 = uber(cont1, {
  dep2: function () {
    ...
  }
});

// function
cont1.dep1;

// undefined
cont1.dep2;

// function
cont2.dep1;

// function
cont2.dep2;
```
