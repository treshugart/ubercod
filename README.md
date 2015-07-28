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
var app = uber({
  // Uppercase "P" means "Constructor", do not call as a function.
  // "Phrase" becomes "phrase" because the name is normalised after parsing
  // for meaningful tokens. The "hello" argument resolves to the "hello"
  // dependency since their names match.
  // When an argument is prefixed with "$" it means that it should look for a
  // dependency with the same name.
  Phrase: function ($hello) {
    this.hello = $hello;
  },

  // The dollar "$" means "transient", or not a singleton.
  // Lowercase "e" means "function", or "not constructible".
  $exclamation: function (str) {
    return '¡' + str + '!';
  },

  // Same naming semantics as "exclamation".
  // The "exclamation" argument will resolve to a dependency because its name
  // matches a dependency with the same name will and be automatically injected.
  // This means that you can call it like "app.hello('string')" and
  // "string" would be passed as the second argument automatically.
  $hello: function ($exclamation, str) {
    return $exclamation('Hello, ' + str);
  }
});

// "¡Hello, World!"
app.phrase.hello('World');
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
