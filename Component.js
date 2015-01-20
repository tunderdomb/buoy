
var Intent = require("./Intent")

module.exports = Component

function Component( name, onCreate ){
  this.name = name
  this.onCreate = onCreate
  this.state = {}
  this.activeComponents = []
  this._components = {}
  this._componentList = []
  this._receivers = {}
}

// nouns

Component.prototype.component = function( name, onCreate ){
  this._componentList.push(this._components[name] = new Component(name, onCreate))
}

// verbs

Component.prototype.activate = function( name, data, onResult ){
  var component = this
  var subComponent = this._components[name]
  var createIntent = new Intent(data)
  subComponent.onCreate.call(subComponent, createIntent, function sendResult(  ){
    component.activeComponents.splice(component.activeComponents.indexOf(subComponent), 1)
    onResult.apply(this, arguments)
  })
  component.activeComponents.push(subComponent)
  return createIntent
}
Component.prototype.interact = function( componentName ){
  if( !this._components.hasOwnProperty(componentName) ){
    return null
  }
  var component
  this.activeComponents.some(function( comp ){
    return comp.name == componentName ? !!(component=comp) : false
  })
  return component
}
Component.prototype.interactWithAll = function( componentName, immediate ){
  if( !this._components.hasOwnProperty(componentName) ){
    return null
  }
  if( immediate ){
    this.activeComponents.filter(function( comp ){
      return comp.name == componentName ? !!(immediate(comp)||true) : false
    })
  }
  else {
    return this.activeComponents.filter(function( comp ){
      return comp.name == componentName
    })
  }
}
Component.prototype.relay = function( name, data, onResult ){
  var relayIntent = new Intent(data)

  // intents are handled first on the root level
  if( this._receivers.hasOwnProperty(name) && typeof this._receivers == "function" ){
    this._receivers[name](relayIntent, onResult)
  }

  if( relayIntent.interrupted ){
    return relayIntent
  }

  var components = this._componentList
  var component
  var stack = []
  var i = -1
  var l = components.length

  while( ++i < l ){
    component = components[i]
    // handle local root
    if( typeof component._receivers[name] == "function" ){
      component._receivers[name](relayIntent, onResult)
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

  return relayIntent
}
Component.prototype.receiver = function( name, receiver ){
  this._receivers[name] = receiver
}