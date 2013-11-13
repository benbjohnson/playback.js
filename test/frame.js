describe('Frame', function(){

  var Frame   = require('playback/lib/frame')
    , assert   = require('assert')
    , equals   = require('equals');

  var frame = null;
  beforeEach(function() {
    frame = new Frame(function() {});
  });

  describe('Frame()', function(){
    it('should throw error if missing frame function', function(done){
      try {
        new Frame();
      } catch (e) {
        assert(e == "Frame function required")
        done();
      }
    });
  });

  describe('#init()', function(){
    it('should run frame function', function(done){
      frame = new Frame(function() { done() });
      frame.init();
    });
  });

  describe('#end()', function(){
    it('should onend handler', function(done){
      frame.onend(function(f) {
        assert(f === frame);
        done();
      })
      frame.end();
    });

    it('should ignore missing onend handler', function(){
      frame.end();
    });
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

    it('should execute timers between playhead changes', function(){
      var log = [];
      frame.timer(function() { log.push([0, frame.playhead()].join(":"))}).interval(100);
      frame.playhead(100);
      frame.timer(function() { log.push([1, frame.playhead()].join(":"))}).interval(40);
      frame.timer(function() { log.push([2, frame.playhead()].join(":"))}).interval(50);
      frame.playhead(200);
      assert(log.shift() === "0:100");
      assert(log.shift() === "1:140");
      assert(log.shift() === "2:150");
      assert(log.shift() === "1:180");
      assert(log.shift() === "0:200");
      assert(log.shift() === "2:200");
      assert(log.shift() === undefined);
      assert(frame.playhead() == 200);
      assert(frame.duration() == 200);
    });

    it('should not execute timers after they have stopped', function(){
      var log = [];
      frame.playhead(100);
      frame.timer(function() {
        log.push([0, frame.playhead()].join(":"))
        if (frame.playhead() == 140) {
          this.stop();
        }
      }).interval(20);
      frame.playhead(200);
      assert(log.shift() === "0:120");
      assert(log.shift() === "0:140");
      assert(log.shift() === undefined);
      assert(frame.playhead() == 200);
      assert(frame.duration() == 200);
    });

    it('should update tweens', function(){
      var x;
      frame.playhead(100);
      frame.tween(function(v) { x = v; }, 0, 20, 50);
      frame.playhead(125);
      assert(x === 10);
    });
  });

  describe('#timer()', function(){
    it('should create a new timer', function(){
      frame.playhead(100);
      var timer = frame.timer(function() {});
      assert(timer.startTime() == 100);
    });

    it('should create a new timer with a delay', function(){
      frame.playhead(100);
      var timer = frame.timer(function() {}).delay(200);
      assert(timer.startTime() == 300);
    });
  });

  describe('#reset()', function(){
    it('should reset playhead', function(){
      frame.playhead(100);
      frame.reset();
      assert(frame.playhead() === 0);
    });

    it('should reset duration', function(){
      frame.playhead(100);
      frame.reset();
      assert(frame.duration() === 0);
    });

    it('should clear timers', function(){
      frame.timer(function() {});
      frame.reset();
      assert(frame.timers().length === 0);
    });
  });
});
