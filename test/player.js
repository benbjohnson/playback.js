describe('Player', function(){

  var Player = require('d3.player/lib/player')
    , assert = require('assert')
    , equals = require('equals');

  var player = null;
  beforeEach(function() {
    player = new Player();
  });

  describe('#refresh()', function(){
    it('should set the refresh function and call it', function(){
      var spy = sinon.spy();
      player.refresh(spy);
      assert(spy.called)
    });

    it('should execute refresh function when called', function(){
      var spy = sinon.spy();
      player.refresh(spy);
      spy.reset()
      assert(!spy.called)
      player.refresh();
      assert(spy.called)
    });

    it('should do nothing when refresh is not set', function(){
      player.refresh();
    });
  });
});
