var Component = require("./Component")

function App( name ){
  Component.apply(this, arguments)
  this._componentStack = []
  this.top = null
}

//apps are also components
App.prototype = new Component("root")

/**
 * Activate a component on the top of the application stack
 * */
App.prototype.activateOnTop = function( name, data ){
  var app = this
  var component = this.activate(name, data)
  component.peek("destroy", function(  ){
    app._componentStack.splice(app._componentStack.indexOf(component), 1)
  })
  app._componentStack.push(component)
  app.top = component
  return component
}