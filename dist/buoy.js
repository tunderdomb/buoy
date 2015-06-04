(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Intent = require("./lib/Intent")
var Component = require("./lib/Component")
var Channel = require("./lib/Channel")
var Radio = require("./lib/Radio")

module.exports.Component = Component
module.exports.component = function( name ){
  return new Component(name)
}

module.exports.Intent = Intent
module.exports.intent = function( data ){
  return new Intent(data)
}

module.exports.Channel = Channel
module.exports.channel = function( data ){
  return new Channel(data)
}

module.exports.Radio = Radio
module.exports.radio = function(){
  return new Radio()
}

},{"./lib/Channel":2,"./lib/Component":3,"./lib/Intent":4,"./lib/Radio":6}],2:[function(require,module,exports){
module.exports = Channel

function Channel( name ){
  this.name = name || ""
}

Channel.prototype = []
Channel.prototype.constructor = Channel

Channel.prototype.broadcast = Channel.prototype.publish = function(  ){
  var listeners = this.slice()
  var l = listeners.length
  if( !l ){
    return false
  }

  var err = null
  var i = -1
  var listener

  while( ++i < l ){
    listener = listeners[i]
    if( listener.proxy ) listener = listener.proxy
    err = listener.apply(null, arguments)
    if( err != null ) return err
  }

  return false
}
Channel.prototype.subscribe = function( listener ){
  if( typeof listener != "function" ){
    console.warn("Listener is not a function", listener)
    return this
  }

  if( !this.isSubscribed(listener) ) {
    this.push(listener)
  }

  return this
}
Channel.prototype.unsubscribe = function( listener ){
  var i = this.indexOf(listener)
  if( ~i ) this.splice(i, 1)
  return this
}
Channel.prototype.peek = function( listener ){
  var channel = this

  // piggyback on the listener
  listener.proxy = function proxy(  ){
    var ret = listener.apply(null, arguments)
    channel.unsubscribe(listener)
    return ret
  }
  this.subscribe(listener)

  return this
}
Channel.prototype.isSubscribed = function( listener ){
  return !!(listener && ~this.indexOf(listener))
}
Channel.prototype.hasSubscribers = function(  ){
  return this.length > 0
}
Channel.prototype.empty = function(){
  this.splice(0)
  return this
}

},{}],3:[function(require,module,exports){
var Channel = require("./Channel")
var Intent = require("./Intent")
var Operation = require("./Operation")
var Transmission = require("./Transmission")
var Radio = require("./Radio")

module.exports = Component

function Component( name, parent ){
  this.name = name || ""
  this.parent = parent || null
  this.active = true
  this._componentList = []
  this._components = {}
  this._services = {}
  this._lazyClients = {}
  this._intentFilters = {}
  Radio.call(this)
}

// private functions

/**
 * Get the root of a component tree
 * */
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
 * 3. relay service notifications globally
 * */
function registerService( component, name, handler ){
  var rootComponent = root(component)
  if( !rootComponent.serviceExists(name) ){
    rootComponent._services[name] = handler
    callLazyClients(component, name, handler)
    rootComponent.relay("service", {name: name, handler: handler})
    rootComponent.relay("service:"+name, {name: name, handler: handler})
  }
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
      l = components.length
    }
    // restore state/progress to previous component list
    else restoreStack()
  }

  function restoreStack(){
    while( i + 1 == l && stack.length ){
      i = stack.pop()
      components = i[1]
      i = i[0]
      l = components.length
    }
  }

  return true
}

// PROTOTYPE

Component.prototype = Object.create(Radio.prototype)

Object.defineProperty(Component.prototype, "root", {
  get: function(  ){
    return root(this)
  }
})

// COMPONENTS

/**
 * Define a sub component
 * */
Component.prototype.component = function( component ){
  if( !component ){
    console.error("Can't define component from empty arguments")
    return null
  }
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

  if( typeof component == "string" ){
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

  for( name in lazyClients ){
    if( lazyClients.hasOwnProperty(name) ){
      if( Array.isArray(rootComponent._lazyClients[name]) ){
        rootComponent._lazyClients[name] = rootComponent._lazyClients[name].concat(lazyClients[name].slice())
      }
      else {
        rootComponent._lazyClients[name] = lazyClients[name].slice()
      }
      // call lazy clients if this network has this service already
      if( this.serviceExists(name) ){
        callLazyClients(component, name, this._services[name])
      }
    }
  }
  for( name in services ){
    if( services.hasOwnProperty(name) ){
      registerService(rootComponent, name, services[name])
    }
  }
  component._services = {}
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
  registerService(this, name, handler)
  return this
}
/**
 * Check if a service exists
 * */
Component.prototype.serviceExists = Component.prototype.serviceAvailable = function( name ){
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
Component.prototype.invokeLazy = Component.prototype.lazy = function( serviceName ){
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
/**
 * Calls a callback when a service becomes available, or immediately if it's available now
 * */
Component.prototype.whenAvailable = function( serviceName, handler ){
  if( this.serviceAvailable(serviceName) ){
    handler()
  }
  else {
    this.attempt("service:"+serviceName, function(  ){
      handler()
    })
  }
}

// INTENTS

/**
 * Capture an intent, registering an intent filter
 * */
Component.prototype.intent = function( intentName, handler, finalHandler ){
  var intentFilter = this._intentFilters[intentName]
  if( !intentFilter ){
    this._intentFilters[intentName] = []
  }
  this._intentFilters[intentName].push(new Operation(handler, finalHandler, false))
  return this
}
/**
 * Attempt is a one time intent
 * */
Component.prototype.attempt = function( intentName, handler, finalHandler ){
  var intentFilter = this._intentFilters[intentName]
  if( !intentFilter ){
    this._intentFilters[intentName] = []
  }
  this._intentFilters[intentName].push(new Operation(handler, finalHandler, true))
  return this
}
/**
 * Relay an intent that propagates downwards and spreads to sibling
 * components. If a component has a registered filter with this name
 * it will process it.
 *
 * The component tree is walked pre-order. See {@link walk}.
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

  walk(this, function( component ){
    var operations = component._intentFilters[name]
    if( Array.isArray(operations) && operations.length ){
      operations.some(function( operation ){
        transmission.handle(operation)
        return intent.interrupted
      })
    }
    // stop relaying if the intent was interrupted
    return !intent.interrupted
  })

  // don't finish if it was interrupted
  if( !intent.interrupted ){
    transmission.attemptFinish()
  }

  return intent
}
/**
 * The same as relayLocal, but it starts the relay at root of the component tree.
 * */
Component.prototype.relayGlobal = function( name, data, finishedCallback ){
  return Component.prototype.relay.apply(root(this), arguments)
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
Component.prototype.bubbleIntent = function( name, data, finalCallback ){
  var intent = new Intent(data)
  var transmission = new Transmission(intent, finalCallback)
  var parent = this.parent
  var operations

  while( parent ){
    operations = parent._intentFilters[name]
    if( Array.isArray(operations) && operations.length ){
      operations.some(function( operation ){
        transmission.handle(operation)
        return intent.interrupted
      })
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
 * This awkwardly named method triggers an intent directly on this component.
 * If the intent isn't registered on this component it returns `null`.
 * */
Component.prototype.triggerIntent = function( intentName, data ){
  var operations = this._intentFilters[intentName]

  if( Array.isArray(operations) && operations.length ){
    var intent = data instanceof Intent ? data : new Intent(data)
    var transmission = new Transmission(intent)

    operations.some(function( operation ){
      transmission.handle(operation)
      return intent.interrupted
    })

    return intent
  }

  return null
}
/**
 * Relay an async intent
 * */
Component.prototype.relayAsync = function( name, data, finishedCallback ){
  var intent = data instanceof Intent ? data : new Intent(data)
  var transmission = new Transmission(intent, finishedCallback)

  var ops = []

  walk(this, function( component ){
    var operations = component._intentFilters[name]
    if( Array.isArray(operations) && operations.length ){
      ops = ops.concat(operations)
    }
  })

  function next( err ){
    if( !ops.length || err || intent.interrupted ){
      finishedCallback(err)
    }
    else {
      transmission.handle(ops.shift(), next)
    }
  }

  next()

  return intent
}
/**
 * Relay an async intent globally
 * */
Component.prototype.relayAsyncGlobal = function( name, data, finishedCallback ){
  return Component.prototype.relayAsync.apply(root(this), arguments)
}

},{"./Channel":2,"./Intent":4,"./Operation":5,"./Radio":6,"./Transmission":7}],4:[function(require,module,exports){
var Radio = require("./Radio")

module.exports = Intent

/**
 * Intents carry data, they have an internal state and
 * can be rejected or interrupted.
 * Intent users can associate an intent object with an action
 * and let it propagate through handlers.
 * If an intent is interrupted it should stop being passed along.
 *
 * The internal state is a space where arbitrary data can be
 * stored. This data should be related to the propagation session,
 * not the carried content.
 * For instance a rejection/interruption can automatically set the internal state,
 * which may represent an error during propagation.
 * */
function Intent( data ){
  this.data = data
  this.rejected = false
  this.interrupted = false
  this.state = {}
}

Intent.prototype = Object.create(Radio.prototype)

/**
 * Reject is a simple built in mechanism to help
 * propagate errors and rejections.
 * Rejecting an intent will not stop its propagation.
 *
 * You can reject an intent many times.
 * */
Intent.prototype.reject = function( rejection, reason ){
  this.rejected = true
  this.state(rejection, reason)
}
/**
 * Interrupting an intent will halt its propagation.
 * It optionally accepts a reason that will automatically
 * refuse the intent.
 *
 * You can only interrupt an intent once.
 * Subsequent calls to interrupt will do nothing.
 * */
Intent.prototype.interrupt = function( interruption, reason ){
  if( this.interrupted ) return
  this.interrupted = true
  if( typeof reason != "undefined" ) this.reject(interruption, reason)
}

/**
 * Set the intents state
 * */
Intent.prototype.state = function( name, value ){
  if( typeof name == "string" && typeof value != "undefined" ){
    this.state[name] = value
  }
  else {
    for( var prop in name ){
      if( name.hasOwnProperty(prop) ) this.state[prop] = name[prop]
    }
  }
}
},{"./Radio":6}],5:[function(require,module,exports){
module.exports = Operation

/**
 * An operation is a general purpose wrapper
 * containing a handler and an optional onEnd callback.
 * */
function Operation( handler, onEnd, oneTime ){
  this.handler = handler
  this.onEnd = onEnd
  this.oneTime = !!oneTime
}

},{}],6:[function(require,module,exports){
var Channel = require("./Channel")

module.exports = Radio

function Radio(  ){
  this._channels = []
}

/**
 * Create a channel if it doesn't exist already
 * and return the channel.
 * */
Radio.prototype.channel = function( channel ){
  return this._channels[channel]
    || (this._channels[channel] = new Channel(channel))
}
/**
 * Check if a channel exists.
 * */
Radio.prototype.channelExists = function( channel ){
  return !!channel && (typeof channel == "string"
    ? this._channels.hasOwnProperty(channel)
    : this._channels.hasOwnProperty(channel.name))
}
/**
 * Delete a channel.
 * */
Radio.prototype.deleteChannel = function( channel ){
  if( channel instanceof Channel ){
    return delete this._channels[channel.name]
  }
  return delete this._channels[channel]
}
/**
 * Check if a channel has any subscribers.
 * If the channel doesn't exists it's `false`.
 * */
Radio.prototype.hasSubscribers = function( channel ){
  return this.channelExists(channel) && this.channel(channel).hasSubscribers()
}
/**
 * Check if a listener is subscribed to a channel.
 * If the channel doesn't exists it's `false`.
 * */
Radio.prototype.isSubscribed = function( channel, listener ){
  return this.channelExists(channel) && this.channel(channel).isSubscribed(listener)
}
/**
 * Send arguments on a channel.
 * If the channel doesn't exists nothing happens.
 * */
Radio.prototype.publish = Radio.prototype.broadcast = function( channel ){
  if( this.channelExists(channel) ){
    channel = this.channel(channel)
    var args = [].slice.call(arguments, 1)
    return channel.broadcast.apply(channel, args)
  }
  return false
}
/**
 * Subscribe to a channel with a listener.
 * It also creates the channel if it doesn't exists yet.
 * */
Radio.prototype.subscribe = function( channel, listener ){
  this.channel(channel).subscribe(listener)
  return this
}
/**
 * Unsubscribe a listener from a channel.
 * If the channel doesn't exists nothing happens.
 * */
Radio.prototype.unsubscribe = function( channel, listener ){
  if( this.channelExists(channel) ) {
    this.channel(channel).unsubscribe(listener)
  }
  return this
}
/**
 * Subscribe a listener to a channel
 * that unsubscribes after the first broadcast it receives.
 * It also creates the channel if it doesn't exists yet.
 * */
Radio.prototype.peek = function( channel, listener ){
  this.channel(channel).peek(listener)
  return this
}
/**
 * Empty a channel removing every subscriber it holds,
 * but not deleting the channel itself.
 * If the channel doesn't exists nothing happens.
 * */
Radio.prototype.emptyChannel = function( channel ){
  if( this.channelExists(channel) ) {
    this.channel(channel).empty()
  }
  return this
}

},{"./Channel":2}],7:[function(require,module,exports){
module.exports = Transmission

/**
 * A transmission is a manager for handling operations that deal with intents.
 * Transmissions handles common logic so users can maintain custom
 * structure of their operations (be it a list, a tree or anything).
 * A transmission handles interruptions and final callbacks automatically.
 * Users only need to iterate over their operations
 * and call `handle(operation)` each time.
 * At the end of the loop they may call `attemptFinish()` to
 * attempt calling the final callback.
 * */
function Transmission( intent, finalCallback ){
  this._onEndCallbacks = []
  this._intent = intent
  this._finalCallback = finalCallback
  this.finished = false
}

/**
 * @private Function handleInterruption
 * */
function handleInterruption( transmission ){
  transmission._onEndCallbacks = null
  transmission._intent = null
  transmission._finalCallback = null
  transmission.finished = true
}

/**
 * @private Function finish
 * */
function finish( transmission ){
  if( transmission.finished ){
    return
  }
  transmission.finished = true

  // notify receivers that everyone finished with the intent
  // transmission allows for a kind of "pass-the-hat-around-and-see-what-we-got" behaviour
  if( transmission._onEndCallbacks && transmission._onEndCallbacks.length ){
    var intent = transmission._intent
    transmission._onEndCallbacks.forEach(function( onEnd ){
      // this callback is meant to work on processed data
      // you really shouldn't modify the intent at this point
      // you had the chance for that in the handler
      onEnd(intent)
    })
  }
  // finally call back what initiated the transmission
  // (making a full circle with the intent)
  if( typeof transmission._finalCallback == "function" ){
    transmission._finalCallback(transmission._intent)
  }
}

/**
 * Handle an operation
 * */
Transmission.prototype.handle = function( operation, next ){
  var transmission = this
  if( transmission.finished ){
    return
  }

  var intent = transmission._intent
  if( intent.interrupted ){
    return
  }

  operation.handler.call(null, intent, next)

  if( intent.interrupted ){
    handleInterruption(transmission)
  }
  else if( operation.onEnd ){
    transmission._onEndCallbacks.push(operation.onEnd)
  }
}
/**
 * Attempt to finish the transmission
 * */
Transmission.prototype.attemptFinish = function(  ){
  finish(this)
}
},{}]},{},[1]);
