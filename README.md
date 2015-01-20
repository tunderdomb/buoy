tangible
========

WIP

Tangible is designed around logical separation of components.

There are two main concepts to consider:

  - component architecture
  - Verbs/nouns


## Verbs & nouns

Tha API is designed to be intuitive and descriptive.
For example nouns describe a thing, and verbs can interact with things.

The following example first defines a component, and then interacts with it.
You wouldn't be able to interact with a component if it wasn't defined before.

```js
var app = new App()
app.component("my:component)
app.interact("my:component")
```

The only result of a noun call is the creation of a definition. Here, a component.
Verb calls, on the other hand, are actions and have immediate result.

You can think of verbs and nouns like constructors and methods.
Here just the two are separated and not part of the same instance.

There are, however, a way to define such a construct, and they are intents.
Intents are the messengers of data and events over the app and across components.

The only implied thing in the API vocab is the connection between verbs and nouns.
But that's what the docs are for, right?
