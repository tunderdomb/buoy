var Radio = require("./Radio")
var inherits = require("util").inherits

var Intent = require("./Intent")
var Operation = require("./Operation")
var Transmission = require("./Transmission")

module.exports = Component

function Component( name, parent ){
  Radio.call(this, name)
  this.parent = parent || null
  this.active = true
  this._componentList = []
  this._components = {}
  this._services = {}
  this._lazyClients = {}
  this._intentFilters = {}
}

// private functions

function root( component ){
  if( !component.parent ) return component

  while( component.parent ){
    component = component.parent
  }

  return component
}

/**
 * 1. register service on the root
 * 2. call lazy services
 * */
function registerService( component, name, handler ){
  var rootComponent = root(component)
  rootComponent._services[name] = handler
  callLazyClients(component, name, handler)
}

/**
 * If the component has lazy clients for this service
 * call the provided service on every lazy client.
 * */
function callLazyClients( component, name, service ){
  var rootComponent = root(component)
  var lazyClient = rootComponent._lazyClients[name]
  if( lazyClient && lazyClient.length ){
    lazyClient.forEach(function( args ){
      service.apply(null, args)
    })
    rootComponent._lazyClients[name] = []
  }
}

/**
 * walk the component tree
 * */
function walk( component, cb ){
  if( cb(component) === false ){
    return false
  }

  var components = component._componentList
  var l = components.length

  if( !l ) return true

  var stack = []
  var i = -1

  while( ++i < l ){
    component = components[i]
    if( cb(component) === false ){
      return false
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

  return true
}

// PROTOTYPE

inherits(Component, Radio)

// COMPONENTS

/**
 * Define a sub component
 * */
Component.prototype.component = function( component ){
  if( this == component ){
    console.warn("Setting self as sub-component is not supported")
    return this
  }
  if( component instanceof Component && component.parent != null ){
    // checking for a parent should cover transfer from the same network
    console.warn("Transferring components is not supported")
    return component
  }

  if( this.isComponentDefined(component) ){
    return typeof component == "string"
      ? this._components[component]
      : this._components[component.name]
  }

  if( !component || typeof component == "string" ){
    component = new Component(component, this)
  }

  component.parent = this
  this._components[component.name] = component
  this._componentList.push(component)

  // hoist services and clients
  var rootComponent = root(this)
  var services = component._services
  var lazyClients = component._lazyClients
  var name

  for( name in services ){
    if( services.hasOwnProperty(name) ){
      rootComponent._services[name] = services[name]
    }
  }
  component._services = {}

  for( name in lazyClients ){
    if( lazyClients.hasOwnProperty(name) ){
      rootComponent._lazyClients[name] = lazyClients[name].slice()
    }
  }
  component._lazyClients = {}

  return component
}
/**
 * Check if a sub component exists
 * */
Component.prototype.isSubComponent = function( component ){
  return component != null && this._components[component.name] == component
}
/**
 * Check if a component is defined with this name
 * */
Component.prototype.isComponentDefined = function( component ){
  return component != null && (typeof component == "string"
      ? this._components.hasOwnProperty(component)
      : this._components.hasOwnProperty(component.name))
}
/**
 * Delete a sub component
 * */
Component.prototype.deleteComponent = function( component ){
  if( !this.isComponentDefined(component) ){
    return
  }
  if( typeof component == "string" ){
    delete this._components[component]
    this._componentList = this._componentList.filter(function( c ){
      return c.name != component
    })
  }
  else{
    delete this._components[component.name]
    this._componentList = this._componentList.filter(function( c ){
      return c.name != component.name
    })
  }
}
/**
 * Activate this component
 * */
Component.prototype.activate = function(  ){
  this.active = true
}
/**
 * Deactivate this component
 * */
Component.prototype.deactivate = function(  ){
  this.active = false
}

// SERVICES

/**
 * Register a service that handles incoming intents.
 * Services can have an optional end callback which is called
 * whenever after every service is done processing an intent.
 * It acts as a feedback mechanism that a particular
 * transmission is done processing.
 * */
Component.prototype.service = function( name, handler ){
  if( !this.serviceExists(name) ){
    registerService(this, name, handler)
  }

  return this
}
/**
 * Check if a service exists
 * */
Component.prototype.serviceExists = function( name ){
  return root(this)._services.hasOwnProperty(name)
}
/**
 * Delete a service
 * */
Component.prototype.deleteService = function( name ){
  return delete root(this)._services[name]
}
/**
 *  Interact directly with a service of this component
 * */
Component.prototype.invoke = function( serviceName ){
  var service = root(this)._services[serviceName]
  if( !service ){
    return null
  }

  var args = [].slice.call(arguments, 1)
  return service.apply(null, args)
}
/**
 * Invoke a service lazily
 * */
Component.prototype.invokeLazy = function( serviceName ){
  var args = [].slice.call(arguments, 1)
  var rootComponent = root(this)
  var service = rootComponent._services[serviceName]

  if( !service ){
    var lazyClient = rootComponent._lazyClients[serviceName] || (rootComponent._lazyClients[serviceName] = [])
    lazyClient.push(args)
    return null
  }

  return service.apply(null, args)
}

// INTENTS

/**
 * Capture an intent, registering an intent filter
 * */
Component.prototype.capture = function( intentName, handler, finalHandler ){
  var intentFilter = this._intentFilters[intentName]
  if( !intentFilter ){
    this._intentFilters[intentName] = new Operation(handler, finalHandler)
  }

  return this
}
/**
 * Relay an intent that propagates downward and spreads to sibling
 * components. If a component has a registered filter with this name
 * it will process it.
 *
 * A relay can have an optional final callback which will be called
 * whenever after every handler and their end callbacks are
 * done processing the intent.
 *
 * A handler can interrupt an intent which will be immediately
 * stop propagating.
 * An interrupted intent will neither trigger a finished callback,
 * further handlers or end callbacks.
 * */
Component.prototype.relay = function( name, data, finishedCallback ){
  var intent = data instanceof Intent ? data : new Intent(data)
  var transmission = new Transmission(intent, finishedCallback)

  walk(this, function( component, interrupt ){
    var operation = component._intentFilters[name]
    if( operation ){
      transmission.handle(operation)
    }
    // stop relaying if the intent was interrupted
    return !interrupt.interrupted
  })

  // don't finish if it was interrupted
  if( !intent.interrupted ){
    transmission.attemptFinish()
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
  var intent = new Intent(data)
  var transmission = new Transmission(intent, finalCallback)
  var parent = this.parent
  var operation

  while( parent ){
    operation = parent._intentFilters[name]
    if( operation ){
      transmission.handle(operation)
    }
    if( intent.interrupted ){
      return intent
    }
    parent = parent.parent
  }
  transmission.attemptFinish()

  return intent
}
/**
 * Notify this component about an intent
 * */
Component.prototype.notify = function( intentName, data ){
  var operation = this._intentFilters[intentName]

  if( !operation ){
    return null
  }

  var intent = data instanceof Intent ? data : new Intent(data)
  var transmission = new Transmission(intent)
  transmission.handle(operation)

  return intent
}
