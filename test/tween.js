describe('Tween', function(){

  var Tween   = require('playback/lib/tween')
    , assert   = require('assert')
    , equals   = require('equals');

  var tween = null;

  describe('Tween()', function(){
    it('should initialize with scalar', function(){
      tween = new Tween(null, 5, 12, 100, 200);
      assert(tween.startTime() === 100);
      assert(tween.endTime() === 200);
      assert(tween.startValue() === 5);
      assert(tween.endValue() === 12);
    });

    it('should initialize with value function', function(){
      tween = new Tween(null, function() { return 10; }, function(t) { return 20 }, 100, 200);
      assert(tween.startTime() === 100);
      assert(tween.endTime() === 200);
      assert(tween.startValue() === 10);
      assert(tween.endValue() === 20);
    });
  });

  describe('#value()', function(){
    beforeEach(function() {
      tween = new Tween(null, 0, 12, 100, 200);
    });

    it('should calculate the value before start time', function(){
      assert(tween.value(99) === 0);
    });

    it('should calculate the value on start time', function(){
      assert(tween.value(100) === 0);
    });

    it('should calculate the value within duration', function(){
      assert(tween.value(150) === 6);
    });

    it('should calculate the value at end time', function(){
      assert(tween.value(200) === 12);
    });

    it('should calculate the value after end time', function(){
      assert(tween.value(300) === 12);
    });
  });

  describe('#update()', function(){
    it('should ignore null functions', function(){
      tween = new Tween(null, 0, 12, 100, 200);
      tween.update(150);
    });

    it('should execute the associated function', function(){
      var x = 0;
      tween = new Tween(function(v) { x = v; return 10; }, 0, 12, 100, 200);
      var y = tween.update(150);
      assert(x === 6);
      assert(y === 10);
    });
  });
});
