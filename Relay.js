var define = new (require("backyard/object/Descriptor"))
var Intent = require("./Intent")

module.exports = Relay

/**
 * @constructor Relay
 * @param {Relay} [parent=null]
 * @property {Relay} parent the parent relay
 * @property {Relay} root the root of this relay network
 * @property {Boolean} active
 * @property {Object} connections
 * @property {Object} intents
 * */
function Relay(parent) {
  this.parent = parent || null
  this.active = true

  this.connections = []
  this.intents = {}
}

define.getter(Relay.prototype, "root", function() {
  var relay = this
  if (!relay.parent) return relay

  while (relay.parent) {
    relay = relay.parent
  }

  return relay
})

/**
 * Sets active to true
 * */
Relay.prototype.activate = function() {
  this.active = true
}

/**
 * Sets active to false
 * */
Relay.prototype.deactivate = function() {
  this.active = false
}

/**
 * Check if a relay can connect with this one.
 *
 * @param {Relay} relay
 * @return {boolean}
 * */
Relay.prototype.canConnect = function(relay) {
  if (!(relay instanceof Relay)) {
    // Not a Relay
    return false
  }

  if (this === relay) {
    // Connecting to self
    return false
  }

  if (relay.parent != null) {
    // checking for a parent should cover transfer from the same network
    // Transferring relays is not supported
    return false
  }

  return !this.isConnected(relay)
}

/**
 * Check if a relay is connected to this one.
 *
 * @param {Relay} relay
 * @return {boolean}
 * */
Relay.prototype.isConnected = function(relay) {
  return !!~this.connections.indexOf(relay) && relay.parent === this
}

/**
 * Connect a relay to this one.
 *
 * @param {Relay} relay
 * */
Relay.prototype.connect = function(relay) {
  if (this.canConnect(relay)) {
    relay.parent = this
    this.connections.push(relay)
  }
}

/**
 * Disconnect a relay form this network.
 *
 * @param {Relay} relay
 * */
Relay.prototype.disconnect = function(relay) {
  if (this.isConnected(relay)) {
    relay.parent = null
    var i = this.connections.indexOf(relay)
    if (~i) this.connections.splice(relay, i, 1)
  }
}

/**
 * Registers an intent handler on this relay.
 *
 * @alias receive
 * @param {String} name
 * @param {Function} handler
 * @return {Relay}
 * */
Relay.prototype.intent = function(name, handler) {
  var handlers = this.intents[name]
  if (!handlers) {
    handlers = this.intents[name] = []
  }
  handlers.push(handler)
  return this
}
Relay.prototype.receive = Relay.prototype.intent

/**
 * Transmit an intent on this relay.
 * The transmitted intent will propagate according to the intent's direction
 * and call handlers that listen to this intent.
 * Handlers receive an intent with the provided data as their only argument.
 * Handlers may return a promise.
 *
 * @alias transmit
 * @param {String} name
 * @param {Intent|*} [data=null]
 * @return {Promise}
 * */
Relay.prototype.relay = function(name, data) {
  var intent = data instanceof Intent ? data : new Intent(data, this)
  var promise = Promise.resolve(intent)
  var interruption = new Error("Transmission interrupted: '" + name + "'")

  switch (intent.direction) {
    case "bubble":
      handle(this)
      var parent = this.parent
      while (parent) {
        handle(parent)
        parent = parent.parent
      }
      break
    case "capture":
    default:
      this.walk(handle)
  }

  function handle(relay) {
    var handlers = relay.intents[name]
    if (!Array.isArray(handlers) || !handlers.length) {
      return
    }

    handlers = handlers.map(function(handler) {
      return Promise.resolve(intent).then(function() {
        return handler.call(relay, intent)
      }).then(function() {
        if (intent.interrupted) {
          throw interruption
        }
      })
    })

    promise = promise.then(function() {
      return Promise.all(handlers)
    })
  }

  return promise.then(function() {
    return intent
  }).catch(function(err) {
    if (err === interruption) {
      return intent
    }
    throw err
  })
}
Relay.prototype.transmit = Relay.prototype.relay

/**
 * @callback walkCallback
 * @param {Relay} relay
 * */
/**
 * Traverse this relay network starting from this one.
 * The callback can break out from the traversal by returning `false`.
 *
 * @param {walkCallback} cb
 * @return {boolean} `true` if the traversal was complete.
 * */
Relay.prototype.walk = function(cb) {
  var relay = this

  if (cb(relay) === false) {
    return false
  }

  var connections = relay.connections
  var l = connections.length

  if (!l) {
    return true
  }

  var stack = []
  var i = -1

  while (++i < l) {
    relay = connections[i]
    if (cb(relay) === false) {
      return false
    }

    // save state/progress and change list to sub components
    if (relay.connections.length) {
      stack.push([i, connections])
      connections = relay.connections
      i = -1
      l = connections.length
    }
    // restore state/progress to previous relay list
    else {
      restoreStack()
    }
  }

  function restoreStack() {
    while (i + 1 == l && stack.length) {
      i = stack.pop()
      connections = i[1]
      i = i[0]
      l = connections.length
    }
  }

  return true
}
