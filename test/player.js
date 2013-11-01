describe('Player', function(){

  var Player = require('d3.player/lib/player')
    , assert = require('assert')
    , equals = require('equals');

  var player = null;
  beforeEach(function() {
    player = new Player();
  });

  describe('#initialize()', function(){
    it('should be initialized', function(){
      player.initialize();
      assert(player.initialized == true);
    });
  });
});
