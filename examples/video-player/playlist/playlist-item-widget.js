var tangible = require("../../../index")

// see the widget documentation or source to see what happens here
module.exports = tangible.widget("video-item", VideoItem)

function VideoItem( name ){
  this.textContent = name
}

VideoItem.prototype.highlighted = tangible.widget.boolAttribute("highlighted")