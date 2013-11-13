describe('Layout', function(){

  var Layout   = require('playback/lib/layout')
    , Player   = require('playback/lib/player')
    , assert   = require('assert')
    , equals   = require('equals');

  var layout = null;

  beforeEach(function() {
    layout = new Layout();
  });

  describe('#player()', function(){
    it('should set the player', function(){
      var player = new Player();
      assert(layout.player(player) === layout);
      assert(layout.player() === player);
    });
  });

  describe('#current()', function(){
    it('should retrieve the players current frame', function(){
      var player = new Player();
      player.frame(function() {});
      layout.player(player);
      assert(layout.current() === player.current());
    });
  });

  describe('#current()', function(){
    it('should retrieve the current frames model', function(){
      var player = new Player();
      player.model({});
      player.frame(function() {});
      layout.player(player);
      assert(layout.model() === player.current().model());
    });
  });
});
