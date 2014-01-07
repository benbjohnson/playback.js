Playback.js
============

## Overview

Using data to tell a story is a powerful tool. However, most data visualizations simply display a chart and expect users to figure out the meaning. We can do better.

The idea of Playback.js is to guide users through the data story. Sometimes you want to be in control and step them through parts of a story. Other times you may want to let the user control the story and explore. Playback.js aims to give you the tools to do this.

The library is a collection of tools for easily and safely providing this storytelling capability. The most important tool is a player that allows you to control the flow of time using deterministic timers. Normal wall clock timers (e.g. `setTimeout()`) don't provide many guarantees about when they will execute. They can skip over executions and are difficult to chain. Playback.js timers guarantee their ordering and guarantee how many times they will execute relative to the Playback.js timer.

For an example of playback.js in action check out the [Raft Distributed Consensus Protocol visualization](http://thesecretlivesofdata.com/raft/) on the [Secret Lives of Data](https://github.com/benbjohnson/thesecretlivesofdata) project.


## Architecture

Playback.js is broken up into a few classes:

1. Player - manages the playhead, playback rate and the current frame.

2. Frame - an isolated section of the simulation.

3. Model - the representation of your simulation data.

4. Timer - executes a function one or more times based on a start time, interval and duration.


## Usage

### Creating the Player

To use Playback.js, simply create a new player to manage your timeline:

```js
var player = playback.player();
```

The player maintains its own playhead that can move independent of the wall clock. The playhead will move forward on each animation frame execute any timers that occurred between the previous and current playhead positions. The playhead can stop prematurely if one of the timers sets the player's rate to zero.


### Setting up the Model

The player needs a model to run the simulation off of so let's create a model subclass and add it to the player:

```js
function MyModel() {
    playback.Model.call(this);
}

MyModel.prototype = new playback.Model();
MyModel.prototype.constructor = MyModel;
}

player.model(new MyModel());
```


### Separate your simulation into frames

Once the player is ready, simply add frames to it. A frame has an id, title and function associated with it:

```js
player.frame("intro", "Introduction", function(frame) {
    ...
});
```

Each frame runs independent of other frames. Whenever a frame is run, a new model is cloned and attached to it.

Within our frame function, we can begin adding timers:

```js
player.frame("intro", "Introduction", function(frame) {
    frame.after(0, function() {
        alert("This happens immediately!");
    })
    .after(1000, function() {
        alert("This happens 1 second later.");
    })
    .at(frame.model(), "myevent", function() {
        // Wait until model.dispatchEvent({type:"myevent"}) is called.
    })
    .after(1000, function() {
        alert("We can pause the player here.");
        player.pause();
    })
    .after(1000, function() {
        // This will not execute because the player is paused.
    })
});
```

By combining these features with UI elements that pause and resume the player, we can create interactive simulations.


## Need Help?

If you need a hand getting started, please add a Github issue or find me on Twitter as [@benbjohnson](https://twitter.com/benbjohnson).
