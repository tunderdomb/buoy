var Radio = require("./Radio")
var inherits = require("util").inherits

var Intent = require("./Intent")
var Service = require("./Service")
var Transmission = require("./Transmission")

module.exports = Component

function Component( name, parent ){
  Radio.call(this, name)
  this.parent = parent || null
  this._componentList = []
  this._components = {}
  this._services = {}
  this._lazyClients = {}
}

// inherit from Radio to enable flat events
inherits(Component, Radio)

/**
 * Define a sub component
 * */
Component.prototype.component = function( component ){
  if( !this.hasComponent(component) ){
    if( typeof component == "string" ){
      component = new Component(component, this)
    }
    else if( component.parent != null ) {
      component.parent.deleteComponent(component)
    }
    component.parent = this
    this._components[component.name] = component
    this._componentList.push(component)
  }
  return component
}
/**
 * Check if a sub component exists
 * */
Component.prototype.hasComponent = function( component ){
  return typeof component == "string"
    ? this._components.hasOwnProperty(component)
    : this._components.hasOwnProperty(component.name)
}
/**
 * Delete a sub component
 * */
Component.prototype.deleteComponent = function( component ){
  if( !this.hasComponent(component) ){
    return
  }
  if( typeof component == "string" ){
    delete this._components[component]
    this._componentList = this._componentList.filter(function( c ){
      return c.name != component
    })
  }
  else {
    delete this._components[component.name]
    this._componentList = this._componentList.filter(function( c ){
      return c.name != component.name
    })
  }
}
/**
 * Register a service that handles incoming intents.
 * Services can have an optional end callback which is called
 * whenever after every service is done processing an intent.
 * It acts as a feedback mechanism that a particular
 * transmission is done processing.
 * */
Component.prototype.service = function( name, handler, onEnd ){
  var service = this._services[name]

  if( !service ) {
    this._services[name] = new Service(handler, onEnd)

    var lazyClient = this._lazyClients[name]
    if( lazyClient && lazyClient.length ){
      var component = this
      lazyClient.forEach(function( args ){
        component.invoke(name, args[0], args[1])
      })
      this._lazyClients[name] = []
    }
  }

  return this
}
/**
 * Check if a service exists on this component
 * */
Component.prototype.serviceExists = function( name ){
  return this._services.hasOwnProperty(name)
}
/**
 * Delete a service on this component
 * */
Component.prototype.deleteService = function( name ){
  return delete this._services[name]
}
/**
 *  Interact directly with a service of this component
 * */
Component.prototype.invoke = function( serviceName, data, resultCallback ){
  var service = this._services[serviceName]
  if( !service ) {
    return null
  }

  var relayIntent = new Intent(data)
  var transmission = new Transmission(relayIntent, resultCallback)
  transmission.handleService(service, this)

  return relayIntent
}
/**
 * Invoke a service lazily
 * */
Component.prototype.lazyInvoke = function( serviceName, data, resultCallback ){
  var intent = this.invoke(serviceName, data, resultCallback)

  if( intent == null ){
    var lazyClient = this._lazyClients[serviceName] || []
    lazyClient.push([data, resultCallback])
  }

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

  transmission.attemptFinish()

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
  var service = this._services[name]

  if( service ) {
    // intents are handled first on the root level
    transmission.handleService(service, this)
  }

  if( relayIntent.interrupted ){
    return relayIntent
  }

  var components = this._componentList
  var l = components.length
  if( !l ){
    transmission.attemptFinish()
    return relayIntent
  }

  var component
  var stack = []
  var i = -1

  // walk the component tree
  while( ++i < l ){
    component = components[i]
    service = component._services[name]
    // handle local root
    transmission.handleService(service, component)
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

  transmission.attemptFinish()

  return relayIntent
}
