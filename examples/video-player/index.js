var tangible = require("../../index")

var app = tangible.app("video-player")

require("./app-menu")(app)
require("./video-screen")(app)
require("./playlist")(app)