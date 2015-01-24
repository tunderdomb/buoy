var widgets = {}

module.exports = widget

function widget( name, Constructor, extend, is ){
  if( typeof extend == "string" ){
    is = extend
    extend = null
  }
  extend = extend || window.HTMLElement

  var base = extend.prototype || extend
  var proto = {
    prototype: Object.create(base, createPrototype(Constructor.prototype))
  }
  // for this: <div is="my-element">
  if( is ){
    proto.extend = is
  }
  widgets[name] = Constructor
  // register constructor
  window.document.registerElement(name, proto)
  // TODO: decide what to return: factory function or constructor
  return widget.render.bind(null, name)
}

/**
 * Render a widget by this name with the rest of the arguments passed to the init constructor
 * */
widget.render = function( name ){
  var element = window.document.createElement(name)
  widgets[name].call(element, [].slice(arguments, 1))
  return element
}

/**
 * Helper function to create boolean attributes on elements
 * */
widget.boolAttribute = function( name, onGet, onSet ){
  return {
    get: onGet || function(  ){
      return this.hasAttribute(name)
    },
    set: onSet || function( isSet ){
      if( isSet ) this.setAttribute(name, "")
      else this.removeAttribute(name)
    }
  }
}

/**
 * Normalize an object into a descriptor
 * that can be passed to Object.create()
 *
 * This allows for an object to have immediate members
 * and describe a prototype in a more readable manner
 * and later use the object to create a constructor prototype
 * where instance members are defined with Object.create()
 *
 * @example
 *
 * var proto = {
 *    onCreatedCallback: function(){ ... },
 *    someCustomMethod: function(){ ... }
 * }
 *
 * var normalizedProto = Object.create(HTMLElement.prototype, createPrototype(proto))
 * var MyElement = document.registerElement("my-element", normalizedProto)
 * var myElement = new MyElement()
 *
 * myElement.someCustomMethod is now non-enumerable,
 * non-configurable and non-writable on the prototype
 * */
function createPrototype( proto ){
  var member
  for( var name in proto ){
    if( proto.hasOwnProperty(name) ){
      member = proto[name]
      if( typeof member == "function" || member.constructor === Object ){
        proto[name] = {
          value: member
        }
      }
    }
  }
  return proto
}