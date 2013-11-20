describe('EventDispatcher', function(){

  var EventDispatcher = require('playback/lib/event_dispatcher')
    , Event    = require('playback/lib/event')
    , assert   = require('assert')
    , equals   = require('equals');

  var dispatcher = null;

  beforeEach(function() {
    dispatcher = new EventDispatcher();
  });

  describe('dispatchEvent()', function(){
    it('should do nothing with no listeners', function(){
      dispatcher.dispatchEvent(new Event("bar"));
    });

    it('should dispatch events to listeners by type', function(done){
      dispatcher.addEventListener("foo", function() { assert(false) });
      dispatcher.addEventListener("bar", function() { done() });
      dispatcher.dispatchEvent(new Event("bar"));
    });

    it('should dispatch events to multiple listeners', function(){
      var x = 0;
      dispatcher.addEventListener("foo", function() { x += 10 });
      dispatcher.addEventListener("bar", function() { x += 100 });
      dispatcher.addEventListener("bar", function() { x += 1000 });
      dispatcher.dispatchEvent(new Event("bar"));
      assert(x === 1100);
    });
  });
});
