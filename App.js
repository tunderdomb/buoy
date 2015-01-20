
var Component = require("./Component")
var Widget = require("./Widget")

function App( name, onCreate ){
  Component.apply(this, arguments)
  this.componentStack = []
  this.top = null
  this._widgets = {}
}

App.prototype = new Component("root")

App.prototype.start = function(  ){
  this.onCreate.apply(this, arguments)
}
App.prototype.invokeOnTop = function( name, data, onResult ){
  var app = this
  var component = this.invoke(name, data, function sendResult(){
    app.top = app.componentStack.pop()
    onResult.apply(this, arguments)
  })
  app.componentStack.push(component)
  app.top = component
  return component
}

App.prototype.widget = function( name, definition ){
  var widget = new Widget(name, definition)
  this._widgets[name] = widget
  return widget.Constructor
}
App.prototype.render = function( widget ){
  return this._widgets[widget].construct([].slice(arguments, 1))
}
