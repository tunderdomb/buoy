tangible
========

**WIP NOTICE: This code is in active development and the API and concepts are subject to change.**

## About

Tangible is a work-in-progress tool for writing modular web applications.
It's designed to help decouple separate parts into components.

#### Motivation

There are more than enough javascript frameworks out there.
Every one of them tries to address some, or nearly all aspects of our workflows.
At the time of writing this tool the state of javascript is slowly descending from
monolithic solutions to modularized components.

For once, Tangible aims to be an advocate of this move.
Second, even with the vast amount of tools in our hands none of them
addresses code organization on a project level.
We have DOM manipulation tools, routers, templates, script loaders and all that in one,
but none provides a way to write maintainable and organized code.

Your choice is often comes with a compromise;
writing code in a specific way,
not being able to render on server side,
being tied to built in tools.

This is why Tangible is focusing on one thing:
help you create a maintainable and logical abstraction of business logic.

The goal is to provide a tool which supports intuitive and easy to understand code.
No matter how complex your app is, it should be transparent and easy to grasp.

#### Is this an MVC?

No. Tangible is not an MVC framework. It's missing two layers from the pattern.
It doesn't provide models and controllers.

By excluding models your application has the ability to use a dedicated model
library that can be changed any time during development.
This decision encourages modular codebase.

The controller layer by design is embodied by intents and relays,
but so indirect and incompatible with the term that it can't be considered one.

### Tangible **IS**

  - a single responsibility tool
  - a way to isolate code into larger, logical chunks
  - a way to decouple code
  - an integrated event bus
  - an intent relay network

### Tangible is **NOT**

  - a framework
  - monolithic
  - a DOM manipulation helper
  - a router
  - enforcing conventions
  - dictating how and where you write your code
  - tying you to built in tools


## The Concept

Tangible operates with these main concepts:

  - Components
  - App
  - Intents
  - Widgets

Check out the [examples](examples/) if you better understand code.

## Components

You may think of components as packages in static languages.
Where a class represents implementation of business logic (APIs),
a component (analogue of a package) represents separation of roles
in an application.

Packages can't be instantiated, but components can be activated.

A component is responsible for separating and encapsulating different parts
of an app and providing means to communicate with others.

Responsibilities of components are

  - creating and manage DOM elements
  - listening on relevant user actions
  - relay intents to other parts of the app
  - react to intents from outside

A component provides API in the form of intents and relays.
Intents are relayed through the component network and carry arbitrary information.
Much like events;
but intents are broadcasted to sub components by-default and bubble downwards.

### Component network

Components can defined under other components.
It's more of a way to indicate organization than actual logic.

For example the app can communicate through the global relay
and work perfectly well, but defining sub components can
indicate that some intents will never leave a specific scope.

This is a way to maintain separation of roles in the application.

From the video player example:

  The video control component relays information about video control buttons.
  Like play, pause, next, stop.

  The video screen may be interested in all of that,
  but other parts of the application don't necessarily need this information.
  For example the playlist wouldn't care if a play button is clicked.

  By defining the player controls as a sub component of the video screen,
  the controls have a way to restrict the relayed intents to the video screen.

  The app would still work if this separation wouldn't be there.
  But the intention is clear that some intents are scoped to a component.

## App

The app instance is just a subset of a `Component`.

## Intents

Intents are simple message object that carry arbitrary data.
They are created when a relay is called on a component.

Intents can be interrupted.

An interrupted intent immediately stops propagating.

## Widgets

Widgets are a thin wrapper around web components/custom elements.
They are not tied to an app instance in any way
and can be defined outside of any component code.


## Licence

MIT run with it