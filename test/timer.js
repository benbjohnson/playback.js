describe('Timer', function(){

  var Timer   = require('playback/lib/timer')
    , Frame   = require('playback/lib/frame')
    , Event   = require('playback/lib/event')
    , EventDispatcher = require('playback/lib/event_dispatcher')
    , assert  = require('assert')
    , equals  = require('equals');

  var timer = null,
      frame = null;

  beforeEach(function() {
    frame = new Frame("x", "a", function() {});
  });

  describe('Timer()', function(){
    it('should initialize to a running state', function(){
      timer = new Timer(null, function() {});
      assert(timer.running());
    });
  });

  describe('#startTime()', function(){
    it('should set and retrieve the start time', function(){
      timer = new Timer(null, function() {}).startTime(200);
      assert.equal(200, timer.startTime());
    });
  });

  describe('#interval()', function(){
    it('should set and retrieve the interval', function(){
      timer = new Timer(null, function() {}).interval(100);
      assert.equal(100, timer.interval());
    });

    it('should not allow a zero interval', function(){
      timer = new Timer(null, function() {}).interval(0);
      assert.strictEqual(undefined, timer.interval());
    });

    it('should not allow a negative interval', function(){
      timer = new Timer(null, function() {}).interval(-100);
      assert.strictEqual(undefined, timer.interval());
    });
  });

  describe('#then()', function(){
    it('should create a new timer linked to the frame', function(){
      var t0 = frame.timer(function() {}).startTime(200);
      var t1 = t0.then(function() {});
      assert.equal(frame, t1.frame());
    });

    it('should offset the new timer based on the first timer end time', function(){
      var t0 = frame.timer(function() {}).startTime(200);
      var t1 = t0.then(function() {}).delay(400);
      frame.playhead(300);
      assert.equal(600, t1.startTime());
    });
  });

  describe('#after()', function(){
    it('should offset the new timer based on the first timer', function(){
      var t0 = frame.timer(function() {}).startTime(200);
      var t1 = t0.after(300, function() {});
      frame.playhead(200);
      assert.equal(500, t1.startTime());
    });

    it('should execute all timers even if start times are skipped', function(){
      var count = 0;
      var t0 = frame.after(100, function() { count++; });
      var t1 = t0.after(100, function() { count++; });
      var t2 = t1.after(100, function() { count++; });
      frame.playhead(99);
      frame.playhead(1000);
      assert.equal(count, 3);
    });
  });

  describe('#at()', function(){
    it('should execute timer when an event happens on a target', function(done){
      var target = new EventDispatcher();
      var t0 = frame.timer(function() {}).startTime(200);
      var t1 = t0.at(target, "myEvent", function() {});
      var t2 = t1.after(100, function() { done(); });
      frame.playhead(200);
      target.dispatchEvent(new Event("myEvent"));
      frame.playhead(frame.playhead() + 100);
    });

    it('should continue to receive events if returning false', function(done){
      var counter = 0, finished = false;
      var target = new EventDispatcher();
      var t0 = frame.timer(function() {}).startTime(200);
      var t1 = t0.at(target, "myEvent", function() { return counter++ > 2; });
      var t2 = t1.after(100, function() { finished = true; done(); });
      frame.playhead(201);
      target.dispatchEvent(new Event("myEvent"));
      frame.playhead(frame.playhead() + 101);
      assert(!finished);
      target.dispatchEvent(new Event("myEvent"));
      frame.playhead(frame.playhead() + 101);
      assert(!finished);
      target.dispatchEvent(new Event("myEvent"));
      frame.playhead(frame.playhead() + 101);
      assert(!finished);
      target.dispatchEvent(new Event("myEvent"));
      frame.playhead(frame.playhead() + 101);
      assert(finished);
    });
  });

  describe('#run()', function(){
    it('should execute the callback function', function(done){
      timer = new Timer(null, function() { done(); });
      timer.run();
    });
  });

  describe('#stop()', function(){
    it('should stop running', function(){
      timer = new Timer(null, function() {});
      timer.stop();
      assert(!timer.running());
    });
  });

  describe('#until()', function(){
    it('should return null if stopped', function(){
      timer = new Timer(null, function() {}).startTime(200).interval(100).stop();
      assert.strictEqual(null, timer.until(1000));
    });

    it('should return start time if t is before start time', function(){
      timer = new Timer(null, function() {}).startTime(2000).interval(100);
      assert.equal(2000, timer.until(500));
    });

    it('should return time on an interval', function(){
      timer = new Timer(null, function() {}).startTime(200).interval(100);
      assert.equal(500, timer.until(500));
    });

    it('should return time to next interval', function(){
      timer = new Timer(null, function() {}).startTime(200).interval(100);
      assert.equal(600, timer.until(501));
      assert.equal(600, timer.until(599));
    });

    it('should return null if after end time', function(){
      timer = new Timer(null, function() {}).startTime(100).interval(50).duration(200);
      assert.strictEqual(300, timer.until(300));
      assert.strictEqual(null, timer.until(301));
    });
  });

});
