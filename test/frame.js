describe('Frame', function(){

  var Frame   = require('playback/lib/frame')
    , assert   = require('assert')
    , equals   = require('equals');

  var frame = null;
  beforeEach(function() {
    frame = new Frame();
  });

  describe('#playhead()', function(){
    it('should set and retrieve the playhead', function(){
      frame.playhead(100);
      assert(frame.playhead() == 100);
    });

    it('should increase the duration', function(){
      frame.playhead(100);
      frame.playhead(200);
      frame.playhead(150);
      assert(frame.duration() == 200);
    });
  });

  describe('#timer()', function(){
    it('should create a new timer', function(){
      frame.playhead(100);
      var timer = frame.timer(function() {}, 200);
      assert(timer.startTime() == 100);
      assert(timer.interval() == 200);
    });

    it('should create a new timer with a delay', function(){
      frame.playhead(100);
      var timer = frame.timer(function() {}, 200, 300);
      assert(timer.startTime() == 400);
    });

    it('should not allow a negative delay', function(){
      frame.playhead(100);
      var timer = frame.timer(function() {}, 200, -300);
      assert(timer.startTime() == 100);
    });
  });
});
