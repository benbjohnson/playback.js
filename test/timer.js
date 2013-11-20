describe('Timer', function(){

  var Timer   = require('playback/lib/timer')
    , Frame   = require('playback/lib/frame')
    , assert   = require('assert')
    , equals   = require('equals');

  var timer = null,
      frame = null;

  beforeEach(function() {
    frame = new Frame(function() {});
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
      assert(timer.startTime() == 200);
    });
  });

  describe('#interval()', function(){
    it('should set and retrieve the interval', function(){
      timer = new Timer(null, function() {}).interval(100);
      assert(timer.interval() == 100);
    });

    it('should not allow a zero interval', function(){
      timer = new Timer(null, function() {}).interval(0);
      assert(timer.interval() === undefined);
    });

    it('should not allow a negative interval', function(){
      timer = new Timer(null, function() {}).interval(-100);
      assert(timer.interval() === undefined);
    });
  });

  describe('#then()', function(){
    it('should create a new timer linked to the frame', function(){
      var t0 = frame.timer(function() {}).endTime(200);
      var t1 = t0.then(function() {});
      assert(t1.frame() == frame);
    });

    it('should offset the new timers times based on the first timers end time', function(){
      var t0 = frame.timer(function() {}).endTime(200);
      var t1 = t0.then(function() {}).endTime(300);
      frame.playhead(301);
      assert(t1.startTime() === 201);
      assert(t1.endTime() === 501);
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
      assert(timer.until(1000) === null);
    });

    it('should return start time if t is before start time', function(){
      timer = new Timer(null, function() {}).startTime(2000).interval(100);
      assert(timer.until(500) === 2000);
    });

    it('should return time on an interval', function(){
      timer = new Timer(null, function() {}).startTime(200).interval(100);
      assert(timer.until(500) === 500);
    });

    it('should return end time if there is no interval', function(){
      timer = new Timer(null, function() {}).endTime(500);
      assert(timer.until(200) === 500);
    });

    it('should return null if after end time', function(){
      timer = new Timer(null, function() {}).endTime(500);
      assert(timer.until(700) === null);
    });

    it('should return time to next interval', function(){
      timer = new Timer(null, function() {}).startTime(200).interval(100);
      assert(timer.until(501) === 600);
      assert(timer.until(599) === 600);
    });
  });

});
