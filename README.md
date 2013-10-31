d3.player.js
============

## Overview

[D3.js](http://d3js.org) is awesome.
It gives you the power to easily visualize data in amazing ways.
Unfortunately there's no way to pause the global state of the transitions.

With d3.player.js, you can pause and resume transitions in D3!


## Usage

To use the player, you need to do a few things:

1. Create an instance of d3.player.

2. Use the player to wrap your update code.

3. Tag elements which will be managed by the player by adding the `resumable` class.

Then you can use the player API to control the transition state of the nodes.


## API

The following API is available on the player object:

* `player.pause()` - Pauses all transitions on all player-managed elements.

* `player.play()` - Resumes all transitions on all player-managed elements.

* `player.playing()` - Checks whether transitions are currently allowed to play.


## Example

```js
var player = d3.player();
var data = [{name:"john"}, {name:"mary"}]
var svg = d3.select("svg");

player(function {
    svg.selectAll("myNode").data(data)
        .call(function() {
            var enter = this.enter(), exit = this.exit();
            enter.append("text")
                .attr("class", "resumable")
                .attr("x", 0)
                .attr("y", 0)
                .text(function(d) { return d.name })
            ;
            
            this.transition()
                .attr("x", Math.random() * 500)
                .attr("y", Math.random() * 500)
            ;
        })
    ;
});

// Play button starts the transitions.
$(document).on("click", "#play-button", function() {
    player.play();
});

// Pause button stops the transitions.
$(document).on("click", "#pause-button", function() {
    player.pause();
});

// Or make a play/pause toggle button.
$(document).on("click", "#toggle-button", function() {
    if player.playing() {
        player.pause();
    } else {
        player.play();
    }
});
```
