var Radio = require("stations").Radio
var inherits = require("util").inherits

var Intent = require("./Intent")
var Service = require("./Service")
var Transmission = require("./Transmission")

module.exports = Component

function Component( name, parent ){
  Radio.call(this, name)
  this.name = name
  this.parent = parent || null
  this._components = {}
  this._componentList = []
  this._services = {}
}

// inherit from Radio to enable flat events
inherits(Component, Radio)

/**
 * Define a sub component
 * */
Component.prototype.component = function( name ){
  var subComponent = this._components[name] || new Component(name, this)
  if( subComponent !== this._componentList[name] ){
    this._components[name] = subComponent
    this._componentList.push(subComponent)
  }
  return subComponent
}
/**
 *  Interact directly with a service of this component
 * */
Component.prototype.run = function( serviceName, data, resultCallback ){
  var service = this._services[serviceName]
  if( !service ){
    return null
  }
  var intent = new Intent(data)
  service(intent, resultCallback)
  return intent
}
/**
 * Propagate an intent upward on the parent chain.
 * Similarly to relay, bubbling an intent is subject to interruption
 * and can leverage a final callback.
 * The only difference is in direction. Bubbling will not spread to
 * sibling components, and the intent is only passed to parents.
 *
 * (Note however that any component can decide to spread an intent
 * through a relay once it received it.)
 * */
Component.prototype.bubble = function( name, data, finalCallback ){
  var bubbleIntent = new Intent(data)
  var transmission = new Transmission(bubbleIntent, finalCallback)
  var subject = this.parent

  while( subject ){
    transmission.handleService(subject._services[name])
    if( bubbleIntent.interrupted ){
      return bubbleIntent
    }
    subject = subject.parent
  }

  transmission.tryFinish()

  return bubbleIntent
}
/**
 * Relay an intent that propagates downward and spreads to sibling
 * components. If a component has a registered service with this name
 * it will process it.
 *
 * A relay can have an optional final callback which will be called
 * whenever after every service and their end callbacks are
 * done processing the intent.
 *
 * A service can interrupt an intent which will be immediately
 * stop propagating.
 * */
Component.prototype.relay = function( name, data, finalCallback ){
  var relayIntent = new Intent(data)
  var transmission = new Transmission(relayIntent, finalCallback)

  // intents are handled first on the root level
  transmission.handleService(this._services[name])

  if( relayIntent.interrupted ){
    return relayIntent
  }

  // only care about active components
  var components = this._componentList
  var component
  var stack = []
  var i = -1
  var l = components.length

  // walk the component tree
  while( ++i < l ){
    component = components[i]
    // handle local root
    transmission.handleService(component._services[name])
    // stop relaying it the intent was interrupted
    if( relayIntent.interrupted ){
      return relayIntent
    }

    // save state/progress and change list to sub components
    if( component._componentList.length ){
      stack.push([i, components])
      components = component._componentList
      i = -1
    }
    // restore state/progress to previous component list
    else if( i + 1 == l && stack.length ){
      i = stack.pop()
      components = i[1]
      i = i[0]
      l = components.length
    }
  }

  transmission.tryFinish()

  return relayIntent
}
/**
 * Register a service that handles incoming intents.
 * Services can have an optional end callback which is called
 * whenever after every service is done processing an intent.
 * It acts as a feedback mechanism that a particular
 * transmission is done processing.
 * */
Component.prototype.service = function( name, handler, onEnd ){
  this._services[name] = this._services[name] || new Service(handler, onEnd)
}
