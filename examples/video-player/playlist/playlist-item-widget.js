var tangible = require("../../../index")

module.exports = tangible.widget("video-item", VideoItem)

function VideoItem( name ){
  this.textContent = name
}

VideoItem.prototype.highlighted = tangible.widget.boolAttribute("highlighted")