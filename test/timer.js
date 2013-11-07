describe('Timer', function(){

  var Timer   = require('playback/lib/timer')
    , assert   = require('assert')
    , equals   = require('equals');

  var timer = null;

  describe('Timer()', function(){
    it('should initialize to a running state', function(){
      timer = new Timer(function() {}, 200, 100);
      assert(timer.running());
    });
  });

  describe('#startTime()', function(){
    it('should retrieve the start time', function(){
      timer = new Timer(function() {}, 200, 100);
      assert(timer.startTime() == 200);
    });
  });

  describe('#interval()', function(){
    it('should retrieve the interval', function(){
      timer = new Timer(function() {}, 200, 100);
      assert(timer.interval() == 100);
    });
  });

  describe('#run()', function(){
    it('should execute the callback function', function(done){
      timer = new Timer(function() { done(); }, 200, 100);
      timer.run();
    });
  });

  describe('#stop()', function(){
    it('should should running', function(){
      timer = new Timer(function() {}, 200, 100);
      timer.stop();
      assert(!timer.running());
    });
  });

  describe('#until()', function(){
    it('should return null if stopped', function(){
      timer = new Timer(function() {}, 200, 100).stop();
      assert(timer.until(1000) === null);
    });

    it('should return start time if t is before start time', function(){
      timer = new Timer(function() {}, 2000, 100);
      assert(timer.until(500) === 2000);
    });

    it('should return time on an interval', function(){
      timer = new Timer(function() {}, 200, 100);
      assert(timer.until(500) === 500);
    });

    it('should return time to next interval', function(){
      timer = new Timer(function() {}, 200, 100);
      assert(timer.until(501) === 600);
      assert(timer.until(599) === 600);
    });
  });

});
