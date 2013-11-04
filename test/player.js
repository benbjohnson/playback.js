describe('Player', function(){

  var Player   = require('d3.player/lib/player')
    , assert   = require('assert')
    , equals   = require('equals')
    , nextTick = require('next-tick');

  var player = null, svg = null, g = null;
  beforeEach(function() {
    player = new Player();
    $("#scratch").empty();
    svg = d3.select("#scratch").append("svg");
    g = svg.append("g");
  });

  describe('Player()', function(){
    it('should set the selector', function(){
      player = new Player("div");
      assert(player.selector() == "div");
    });
  });

  describe('#selector()', function(){
    it('should set and get the selector', function(){
      assert(player.selector("rect") == player);
      assert(player.selector() == "rect");
    });
  });

  describe('#play()', function(){
    beforeEach(function() {
      player.pause();
    });

    it('should update the player to playing', function(){
      player.play();
      assert(player.playing());
    });
  });

  describe('#pause()', function(){
    beforeEach(function() {
      player.play();
    });

    it('should update the player to a paused state', function(){
      player.pause();
      assert(!player.playing());
    });

    it('should remove transitions on selection', function(done){
      var data = [{r:1}, {r:2}];
      player.selector("circle");
      g.selectAll("circle").data(data)
        .call(function() {
          this.enter().append("circle").attr("r", 0);
          this.transition().attr("r", function(d) { return d.r; });
        });
      player.pause();
      setTimeout(function() {
        g.selectAll("circle").each(function(e) {
          assert(this.__transition__ === undefined);
        });
        done();
      }, 50);
    });
  });
});
