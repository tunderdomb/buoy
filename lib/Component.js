var Radio = require("stations").Radio
var inherit = require("util").inherit

var Intent = require("./Intent")

module.exports = Component

function Component( name, onActivate ){
  Radio.call(name)
  this.name = name
  this.state = {}
  this._onActivate = onActivate
  this._activeComponents = []
  this._components = {}
  this._componentList = []
  this._receivers = {}
}

// inherit from Radio to enable flat events
inherit(Component, Radio)

/**
 * Define a sub component
 * */
Component.prototype.component = function( name, onActivate ){
  var subComponent = this._components[name] || new Component(name, onActivate)
  if( subComponent !== this._componentList[name] ){
    this._components[name] = subComponent
    this._componentList.push(subComponent)
  }
  return subComponent
}
/**
 * Activate a sub component.
 * This calls onActivate and registeres the component as an active one.
 * */
Component.prototype.activate = function( name, data, done ){
  var component = this
  var subComponent = this._components[name]
  var initialize = subComponent._onActivate
  initialize.call(subComponent, data, function(  ){
    done && done(subComponent)
  })
  subComponent.peek("destroy", function(  ){
    component._activeComponents.splice(component._activeComponents.indexOf(subComponent), 1)
  })
  component._activeComponents.push(subComponent)
  return subComponent
}
/**
 * Destroy this component
 * */
Component.prototype.destroy = function(  ){
  this.publish("destroy")
}
/**
 * Interact with the first active sub component with this name.
 * This method returns a direct reference to the sub component.
 * */
Component.prototype.interact = function( componentName ){
  if( !this._components.hasOwnProperty(componentName) ){
    return null
  }
  var component = null
  this._activeComponents.some(function( comp ){
    return comp.name == componentName ? !!(component=comp) : false
  })
  return component
}
/**
 * TODO: this method looks unnecessary since the component definitions are flat
 * */
Component.prototype.interactWithAll = function( componentName, processImmediately ){
  if( !this._components.hasOwnProperty(componentName) ){
    return null
  }
  if( processImmediately ){
    this._activeComponents.filter(function( comp ){
      return comp.name == componentName ? !!(processImmediately(comp)||true) : false
    })
  }
  else {
    return this._activeComponents.filter(function( comp ){
      return comp.name == componentName
    })
  }
}
/**
 * Relay an intent by this name with an arbitrary data
 * also passes around an onResult callback for immediate response
 *
 * Intent are delegated downwards in the component graph
 * starting from the one relay was called on.
 * */
Component.prototype.relay = function( name, data, onResult ){
  var relayIntent = new Intent(data)

  // intents are handled first on the root level
  if( this._receivers.hasOwnProperty(name) && typeof this._receivers == "function" ){
    this._receivers[name](relayIntent, onResult)
  }

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
  var receiver

  // walk the component tree
  while( ++i < l ){
    component = components[i]
    receiver = component._receivers[name]
    // handle local root
    if( typeof receiver == "function" ){
      receiver(relayIntent, onResult)
      // stop relaying it the intent was interrupted
      if( relayIntent.interrupted ){
        return relayIntent
      }
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
  relayIntent.publish("relayed")
  return relayIntent
}
/**
 * Register a receiver that reacts to intents with this name
 * */
Component.prototype.reactTo = function( name, receiver ){
  this._receivers[name] = receiver
}