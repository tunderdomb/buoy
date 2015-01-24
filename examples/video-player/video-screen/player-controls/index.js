module.exports = function( app, videoScreen ){

  /**
   * Player controls are a sub component of the video screen
   * They don't have to, but here we demonstrate a way to organize
   * different parts of an app
   * */
  videoScreen.component("player-controls", function onActivate(  ){
    // initialize component
  })

  /**
   * This function can be called when a user clicks on a play button
   * */
  function onPlay(  ){
    // simply relay the intent to the whole app
    // relay this intent globally so
    // the title bar can update the players status to "playing"
    // and the video screen can handle the playback
    // this way we don't have to reference these components directly here
    // no need to call methods on object and maintain reference integrity
    app.relay("controls:play")
  }

  /**
   * This function can be called when the progress bar is clicked
   * so the user can seek into parts of the video
   * */
  function onSeek(  ){
    // we need a timestamp or something that represents a playhead position
    var targetTime
    // relay this intent only to the video screen
    // effectively restricting this intent to the video screen
    // this can indicate that this action doesn't have a role or meaning
    // outside the video screen component
    videoScreen.relay("controls:seek", targetTime)
  }

}