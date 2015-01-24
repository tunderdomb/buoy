module.exports = function( app ){

  /**
   * This component is here just for reference
   * */
  var videoScreen = app.component("video-screen", function onActivate(  ){
    // initialize component when activated
  })


  /**
   * THe video screen handles displaying video content
   * it needs to react to the open file intent
   * */
  app.reactTo("menu:open", function( openIntent ){
    // we're notified about a file open intent
    // we should start playing a video
    // pass in the intent's data
    playVideo(openIntent.data)
  })

  /**
   * This function initiates video playback
   * such logic is entirely up to the user
   * */
  function playVideo( videoFile ){
    // we receive the videoFile from the openIntent
    // we could use the src attribute to play a file with a `<video>` element
    // stop the currently playing video (if any)
    // start playing the new file
  }

  /**
   * Player controls will be a sub component of the video screen
   * it's completely arbitrary
   * done this way to show a way of organizing components
   * */
  require("./player-controls")(app, videoScreen)

  /**
   * Player controls relay an intent when the play button is clicked
   * we react to it here and start playing the video
   * */
  app.reactTo("controls:play", function(  ){
    // handle play intent here
    // for example start the video if it's stopped,
    // or restart it if it's playing
    // or do nothing if we don't have an active video in the player
  })

}