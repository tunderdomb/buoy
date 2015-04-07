buoy
========

**WIP NOTICE: This code is in active development and the API and concepts are subject to change.**

**NOTE: The documentation is also work in progress. For the time being, if you'd like to discover the library, check out the code!**

Buoy is a component library that provides a high level communication layer with services and a message hub.

## Quick overview

### components

Buoy is based on a component architecture,
which lets you partition your code into logical blocks.
Components can join together in a tree as sub-components and form a network.

A sub component joins a network:

```js
var app = buoy.component("root")
var sub = buoy.component("sub")
app.component(sub)
```

components can define sub-components right away too:

```js
var app = buoy.component("root")
var sub = app.component("sub")
```

### services

Services are simple handler functions you can define on any component,
but are available to all in a network.
Services are automatically hoisted to the root component after a sub-component joins a network.

```js
// register service handlers
app.service("app:do-something", function( num, str ){})
sub.service("sub:sub-service", function( arr ){})

// invoke services
app.invoke("app:do-something", 1, "hello")
sub.invoke("sub:sub-service", [])
```

It's also possible to invoke a service lazily, which means registering a list of arguments
to call a service when it is registered, or right aways if it's available.

### intents

Buoy includes an intent based messaging hub that lets you communicate between components.
Intents can be transmitted from top-down (relay), or bottom-up (bubble).
Relays can be initiated from the root, or a specific sub-component.

A sub component relays an intent globally, which will travel down on the component tree.

```js
// listen to an intent
app.intent("app:something-happened", function( intent ){
  console.log(intent.data)
  // > { hey: "ho" }
})
// relay an intent globally
sub.relayGlobal("app:something-happened", { hey: "ho" })
```

### events

In addition to inter-component messaging, ever component acts as a publish/subscribe event bus.
You can listen to or broadcast events specific to a component.

```js
sub.subscribe("some:event", function( arg1, arg2 ){})
sub.broadcast("some:event", 1, "something")
```

## Licence

MIT; run with it
