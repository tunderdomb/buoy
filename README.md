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

**Note:** the root network is also a `Component` instance.

```js
var component = network.component("some component")
```

## Register services on components

```js
var component = component.service("some service", function( intent ){
  // process the intent here
})
```

## Relay intents to services

```js
network.relay("some service", {...})
```

## Bubble intents to parents

```js
component.bubble("some service", {...})
```

## Call services directly on a component

```js
component.run("some service", {...})
```

## Component hierarchy

```js
var a = network.component("a")
var b = a.component("a:b")
```
`b` is now a sub component of `a`.

Relaying a message to `a` will propagate down to `b`.

```js
a.service("message", function(){
  console.log("I'm a")
})
b.service("message", function(){
  console.log("I'm b")
})
a.relay("message")
```
Yields:
```
> I'm a
> I'm b
```
and
```js
b.relay("message")
```
Yields:
```
> I'm b
```
but
```js
b.bubble("message")
```
Yields:
```
> I'm a
```
also
```js
a.bubble("message")
```
Yields nothing:
```
>
```
because it is assumed that relays are activated on high up
on the component graph, meaning it is expected the intent
to trigger a service on the receiving end;
but bubbles are intended to be called on a host component possibly
to propagate state upwards so they shouldn't trigger any service
on the host because it can just do that before or after the bubble is sent.


This way you can encapsulate message scopes.

## Licence

MIT; run with it