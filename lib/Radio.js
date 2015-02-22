var Channel = require("./Channel")

module.exports = Radio

function Radio( name ){
  this.name = name || ""
  this._channels = {}
}

Radio.prototype.channelExists = function( channel ){
  return this._channels.hasOwnProperty(channel)
}
Radio.prototype.channel = function( channel ){
  return this._channels[channel]
    || (this._channels[channel] = new Channel(channel))
}
Radio.prototype.deleteChannel = function( channel ){
  if( channel instanceof Channel ){
    return delete this._channels[channel.name]
  }
  return delete this._channels[channel]
}
Radio.prototype.hasSubscribers = function( channel ){
  return this.channelExists(channel) && this.channel(channel).hasSubscribers()
}
Radio.prototype.isSubscribed = function( channel, listener ){
  channel = this._channels[channel]
  return channel && channel.isSubscribed(listener)
}
Radio.prototype.broadcast = function( channel ){
  if( this.channelExists(channel) ){
    var args = [].slice.call(arguments, 1)
    return channel.broadcast.apply(channel, args)
  }
  return false
}
Radio.prototype.subscribe = function( channel, listener ){
  this.channel(channel).subscribe(listener)
  return this
}
Radio.prototype.unsubscribe = function( channel, listener ){
  if( this.channelExists(channel) ) {
    this.channel(channel).unsubscribe(listener)
  }
  return this
}
Radio.prototype.peek = function( channel, listener ){
  this.channel(channel).peek(listener)
  return this
}
Radio.prototype.empty = function( channel ){
  if( this.channelExists(channel) ) {
    this.channel(channel).empty()
  }
  return this
}