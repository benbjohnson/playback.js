Playback.js
============

## Overview

TODO


## Usage

To use Playback.js, simply create a new player to manage your timeline:

```js
var player = playback.player()
```

The player maintains its own playhead that can move independent of the wall clock.


## API

### Timeline Control

The player maintains an internal timeline that moves in relation to the wall clock based on the playback rate.

* `player.rate(value)` - The playback rate.

* `player.pause()` - Sets the playback rate to `0`.

* `player.play()` - Sets the playback rate to `1`.

* `player.playing()` - Returns a boolean for whether the playback rate is non-`0`.


### Frame Control

Playback is separated into individual sections called frames.
A frame is basically a section of your timeline.
For example, if you're doing a presentation then each frame might be a slide.

* `player.next()` - Moves to the next frame.

* `player.prev()` - Moves to the previous frame.


### Data

The timeline is record as it is generated so it's important to know the state of the timeline as it previously occurred.
To do this, you must use Playback data objects.
The values of properties on the playback data objects:

* `player.map()` - Creates a new key/value data object.

* `player.array()` - Creates a new array data object.




