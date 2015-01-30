var Radio = require("stations").Radio
var inherits = require("util").inherits

var Intent = require("./Intent")

module.exports = Endpoint

function Endpoint( name ){
  Radio.call(this, name)
  this.name = name
  this._activeComponents = []
  this._components = {}
  this._componentList = []
  this._receivers = {}
}

// inherit from Radio to enable flat events
inherits(Endpoint, Radio)

/**
 * Define a sub component
 * */
Endpoint.prototype.endpoint = function( name ){
  var subComponent = this._components[name] || new Endpoint(name)
  if( subComponent !== this._componentList[name] ){
    this._components[name] = subComponent
    this._componentList.push(subComponent)
  }
  return subComponent
}
/**
 * Activate a sub component.
 * This calls onActivate and registers the component as an active one.
 * */
Endpoint.prototype.activate = function( name, data ){
  var component = this
  var subComponent = this._components[name]
  subComponent.peek("deactivate", function(){
    component._activeComponents.splice(component._activeComponents.indexOf(subComponent), 1)
  })
  component._activeComponents.push(subComponent)
  subComponent.publish("activate", data)
  return subComponent
}
/**
 * Deactivate this component
 * or a sub component by the given name
 * */
Endpoint.prototype.deactivate = function( name ){
  if( typeof name == "string" ){
    var subComponent = this._components[name]
    subComponent.deactivate()
  }
  else{
    this.publish("deactivate")
  }
}
/**
 * Interact with the first active sub component with this name.
 * This method returns a direct reference to the sub component.
 * */
Endpoint.prototype.interact = function( componentName ){
  if( !this._components.hasOwnProperty(componentName) ){
    return null
  }
  var component = null
  this._activeComponents.some(function( comp ){
    return comp.name == componentName ? !!(component = comp) : false
  })
  return component
}
/**
 * Relay an intent by this name with an arbitrary data
 * also passes around an onResult callback for immediate response
 *
 * Intent are delegated downwards in the component graph
 * starting from the one relay was called on.
 * */
Endpoint.prototype.transmit = function( name, data, onResult ){
  var relayIntent = new Intent(data)
  var onEndCallbacks = []

  function react( receivers ){
    if( !Array.isArray(receivers) ){
      return
    }
    var i = -1
      , l = receivers.length
      , onReceive
      , onEnd
    while( ++i < l ){
      onReceive = receivers[i][0]
      onEnd = receivers[i][1]
      onEndCallbacks.push(onEnd)
      onReceive(relayIntent, onResult)
      if( relayIntent.interrupted ){
        return
      }
    }
  }

  // intents are handled first on the root level
  react(this._receivers[name])

  if( relayIntent.interrupted ){
    return relayIntent
  }

  // only care about active components
  // inactive ones aren't even instantiated yet
  var components = this._activeComponents
  var component
  var stack = []
  var i = -1
  var l = components.length

  // walk the component tree
  while( ++i < l ){
    component = components[i]
    // handle local root
    react(component._receivers[name])
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

  // notify receivers that everyone finished with the intent
  // this allows for a kind of "pass-the-hat-around-and-see-what-we-got" behaviour
  onEndCallbacks.forEach(function( onEnd ){
    // this callback is meant to work on processed data
    // you really shouldn't modify the intent at this point
    // you had the chance for that in `onReceive`
    onEnd(relayIntent)
  })
  return relayIntent
}
/**
 * Register a receiver that reacts to intents with this name
 * */
Endpoint.prototype.receive = function( name, onReceive, onEnd ){
  if( this._receivers[name] ){
    this._receivers[name].push([onReceive, onEnd])
  }
  else {
    this._receivers[name] = [[onReceive, onEnd]]
  }
}