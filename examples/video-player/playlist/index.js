var tangible = require("../../../index")

require("./playlist-item-widget")

module.exports = function( app ){

  /**
   * The playlist component is here for just reference
   * it serves no purpose in this demonstration
   * */
  app.component("playlist")

  /**
   * The playlist reacts to open intents
   * and adds the new file to the playlist automatically
   * */
  app.reactTo("menu:open", function( openIntent ){
    // we receive the intent
    // and append a file item to the playlist
    appendPlaylistItem(openIntent.data)
  })

  /**
   * This function can be called to append
   * a file entry to the playlist
   * */
  function appendPlaylistItem( videoFile ){
    // we receive a videoFile resource
    // and could make use of the .name property
    // to display a list item in the playlist
    createPlaylistItem(videoFile.name)
  }

  function createPlaylistItem( name ){
    var videoItem = tangible.widget.render("video-item", name)
    // append the element to the DOM ...
  }

}