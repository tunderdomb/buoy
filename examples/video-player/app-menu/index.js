module.exports = function( app ){

  /**
   * This component does nothing now
   * it doesn't even need to be defined
   * it's here just for reference
   * */
  app.component("menu")

  /**
   * This function is called when a new file is opened
   * this could be called from an `<input>` element's change event for example
   * */
  function onOpenFile( filePath ){
    // we define a video descriptor resource from the inputted file path
    // with a file name and src path
    // this is completely arbitrary by design
    // and only represents a way to relay data through intents
    var videoFile = {
      name: "<figure out from filePath>",
      src: filePath
    }

    // when we open a file, notify everyone below the app about it
    // we set a convention when we define a relay
    // this convention serves as a decoupled API
    // that other components can `reactTo()`
    var relayIntent = app.relay("menu:open", videoFile)
  }

}