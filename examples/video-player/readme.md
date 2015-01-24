video-player
============

This example demonstrates a simple video player
and how code could be organized with Tangible.

Note that business logic implementation is entirely up to the user.
Tangible only helps to define modules, and provides a way for them to communicate
without referencing each other.

## Video player components

  - app-menu
  - playlist
  - video-screen
    - player-controls


### app menu

Contains buttons like open file.
Responsible for relaying events about opening a file.
Does not care about incoming intents.

### playlist

A list if video items.
The list is automatically updated when a new file is openend.
So this component cares about intents from the app menu

### video screen

It contains the actual video display, and also the player controls as sub component.

### player controls

Such as play, stop, pause.
It relays intents when a user clicks on a player button.

Doesn't care about incoming events, although it could.
If the playlist is implements a way so that a click in a video item relays a play event,
the player controls may be updated to reflect the players state (switch the play icon to a pause one).

This demo demonstrates a way to decouple you app with Tangible.