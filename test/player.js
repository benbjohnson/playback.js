describe('Player', function(){

  var Player   = require('playback/lib/player')
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
});
