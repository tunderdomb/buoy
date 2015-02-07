synapse
========

**WIP NOTICE: This code is in active development and the API and concepts are subject to change.**

> In the nervous system, a synapse is a structure that permits a neuron
> to pass an electrical or chemical signal to another cell.
> [...] neurons are not continuous throughout the body,
> yet still communicate with each other [...]

[Excerpt from Wikipedia](http://en.m.wikipedia.org/wiki/Synapse)

## Quick reference

  - [Getting started](docs/Getting started.md)
  - [Api docs](docs/api/)
  - [Examples](examples/)

## About

Synapse is a tool for application state management and inter-component communication.
It provides a solution to a common problem in MV* architectures
[described really well in this article](http://www.code-experience.com/why-you-might-not-need-mvc-with-reactjs/):

> MVC helps you to manage state. But only a specific type of state, namely data state.
> Loading data from the server and visualize it in a view is easy with Backbone.
> You can display as much data as you want without creating a mess.
>
> [...]
>
> Let's contrast this with a type of state that I call application state:
> The application state defines what data is displayed in what way at the moment.
>
> [...]
>
> It does not define how communication flows.

Synapse solves this by design.

It provides a network that centralizes communication, not interaction.
This detaches direct references and dependencies across views/controllers and everything.

The network enables hierarchical branching, so that components can define their children/parent,
and also providing a way for responsibility encapsulation.

The messaging across components of a network flows top-to-bottom.
This means a higher order component should know where to direct an incoming intent.

**NOTE**:This is in contrast to the event model in a browser - where events have a capture and bubble phase.

### Architecture agnostic

The concept of components is no more than a convention.
By itself a network component doesn't represent or even capable of more than simply
transmitting and receiving messages.

It's implementation that gives components logical meaning.

For example a component can serve as many things:

  - a rendering hub
  - a factory
  - a single service
  - a widget/view controller

All logic is defined by the user; a component acts only as the communication interface.

# Overview

## Create a network

```js
var network = synapse()
```

## Define components of a network

```js
var component = network.component("some name")
```

## Transmit intents to components

```js
network.transmit("type", {...})
```

## Receive intents

```js
network.receive("type", function(intent){ ... })
```

## Interact with components directly

```js
var component = network.interact("some name")
```

## Hierarchical branching

```js
var a = network.component("a")
var b = a.component("a:b")
```
`b` is now a sub component of `a`.

Transmitting a message to `a` will cascade down to `b`.

```js
a.receive("message", function(){
  console.log("I'm a")
})
b.receive("message", function(){
  console.log("I'm b")
})
a.transmit("message")
```
Yields:
```
> I'm a
> I'm b
```
and
```js
b.transmit("message")
```
Yields:
```
> I'm b
```

This way you can encapsulate message scopes.

## Licence

MIT; run with it