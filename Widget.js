
module.exports = Widget

function Widget( name, define ){
  this.name = name
  var definition = new WidgetDefinition()
  define(definition)
  var proto = window.document.registerElement(name, {
    prototype: Object.create(definition._extends.prototype, definition._prototype)
  })
  if( definition._is ){
    proto.extend = definition._is
  }
  this.Constructor = window.document.registerElement(name, proto)
}
Widget.prototype.construct = function(  ){
  var element = new this.Constructor()
  this.onCreate.apply(element, arguments)
  return element
}

function WidgetDefinition(  ){
  this._extends = window.HTMLElement
  this._onCreate = null
  this._is = null
  this._prototype = {}
}
WidgetDefinition.prototype.is = function( tagName ){
  this._is = tagName
  return this
}
WidgetDefinition.prototype.extend = function( element ){
  this._extends = element
  return this
}
WidgetDefinition.prototype.onCreate = function( onCreate ){
  this._onCreate = onCreate
  return this
}
WidgetDefinition.prototype.proto = function( prototype ){
  this._prototype = prototype
  return this
}