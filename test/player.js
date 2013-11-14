describe('Player', function(){

  var Player   = require('playback/lib/player')
    , Layout   = require('playback/lib/layout')
    , assert   = require('assert')
    , equals   = require('equals')
    , nextTick = require('next-tick');

  var player = null, svg = null, g = null;
  beforeEach(function() {
    player = new Player();
  });

  describe('#rate()', function(){
    it('should set the rate', function(){
      player.rate(0.5);
      assert(player.rate() == 0.5);
    });

    it('should not allow negative rates', function(){
      player.rate(-1);
      assert(player.rate() == 0);
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
  });

  describe('#frame()', function(){
    it('should append a new frame', function(){
      player.frame(function() {});
      assert(player.frames().length == 1);
    });

    it('should associate frame with player', function(){
      player.frame(function() {});
      assert(player.frame(0).player() === player);
    });

    it('should execute function argument', function(done){
      player.frame(function() {
        done();
      });
    });

    it('should pass frame to function', function(){
      player.frame(function(frame) {
        assert(this == player.frame(0));
        assert(frame == player.frame(0));
      });
    });
  });

  describe('#current()', function(){
    it('should retrieve current frame', function(){
      player.frame(function() {});
      assert(player.current() == player.frame(0));
    });

    it('should return null if there are no frames', function(){
      assert(player.current() === null);
    });
  });

  describe('#model()', function(){
    it('should set and retrieve the model', function(){
      var model = {};
      assert(player.model(model) === player);
      assert(player.model() == model);
    });
  });

  describe('#layout()', function(){
    it('should set and retrieve the layout', function(){
      var layout = new Layout();
      assert(player.layout(layout) === player);
      assert(player.layout() == layout);
      assert(layout.player() == player);
    });

    it('should associate layout to player', function(){
      var layout = new Layout();
      player.layout(layout);
      assert(layout.player() == player);
    });

    it('should disassociate old layout from player', function(){
      var layout = new Layout();
      player.layout(layout);
      player.layout(null);
      assert(layout.player() === null);
    });
  });

  describe('#next()', function(){
    it('should move to the next frame', function(){
      player.frame(function() {});
      player.frame(function() {});
      assert(player.next() === player);
      assert(player.current() === player.frame(1));
    });

    it('should not move past the last frame', function(){
      player.frame(function() {});
      assert(player.next() === player);
      assert(player.current() === player.frame(0));
    });

    it('should do nothing if there are no frames', function(){
      assert(player.next() === player);
    });
  });

  describe('#prev()', function(){
    it('should move to the previous frame', function(){
      player.frame(function() {});
      player.frame(function() {});
      assert(player.next() === player);
      assert(player.prev() === player);
      assert(player.current() == player.frame(0));
    });

    it('should not move before the first frame', function(){
      player.frame(function() {});
      assert(player.prev() === player);
      assert(player.current() == player.frame(0));
    });

    it('should do nothing if there are no frames', function(){
      assert(player.prev() === player);
    });
  });

  describe('#tick()', function(){
    it('should move the playhead', function(done){
      player.frame(function() {});
      player.play();
      setTimeout(function() {
        assert(Math.abs(player.current().playhead() - 300) < 10);
        done();
      }, 310);
    });
  });
});
