describe('Frame', function(){

  var Frame    = require('playback/lib/frame')
    , Model    = require('playback/lib/model')
    , Player   = require('playback/lib/player')
    , assert   = require('assert')
    , equals   = require('equals');

  var frame = null;
  beforeEach(function() {
    frame = new Frame("x", "y", function() {});
  });

  function TestModel() { }
  TestModel.prototype = new Model();

  describe('#init()', function(){
    it('should run frame function', function(done){
      frame = new Frame("x", "y", function() { done() });
      frame.init();
    });
  });

  describe('#end()', function(){
    it('should dispatch "end" event', function(done){
      frame.addEventListener("end", function() {
        done();
      })
      frame.end();
    });
  });

  describe('#player()', function(){
    it('should set and retrieve the player', function(){
      var player = new Player();
      assert(frame.player(player) === frame);
      assert(frame.player() == player);
    });
  });

  describe('#playhead()', function(){
    it('should set and retrieve the playhead', function(){
      frame.playhead(100);
      assert(frame.playhead() == 100);
    });

    it('should execute timers between playhead changes', function(){
      var log = [];
      frame.timer(function() { log.push([0, frame.playhead()].join(":"))}).interval(100);
      frame.playhead(100);
      frame.timer(function() { log.push([1, frame.playhead()].join(":"))}).interval(40);
      frame.timer(function() { log.push([2, frame.playhead()].join(":"))}).interval(50);
      frame.playhead(200);
      assert.equal("0:0", log.shift());
      assert.equal("0:100", log.shift());
      assert.equal("1:100", log.shift());
      assert.equal("2:100", log.shift());
      assert.equal("1:140", log.shift());
      assert.equal("2:150", log.shift());
      assert.equal("1:180", log.shift());
      assert.equal("0:200", log.shift());
      assert.equal("2:200", log.shift());
      assert.equal(undefined, log.shift());
      assert.equal(200, frame.playhead());
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
      assert.equal("0:100", log.shift());
      assert.equal("0:120", log.shift());
      assert.equal("0:140", log.shift());
      assert.equal(undefined, log.shift());
      assert.equal(200, frame.playhead());
    });

    it('should not progress playhead if player has paused', function(done){
      var player = new Player();
      player.play();
      frame.player(player);
      frame.after(50, function() { player.pause(); })
        .after(20, function() { done(); });
      frame.playhead(100);
      assert.equal(50, frame.playhead());
      player.play();
      frame.playhead(100);
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

  describe('#clearTimer()', function(){
    it('should stop timer by reference with same id', function(){
      var timer = frame.timer(function () {}).delay(200),
          clone = timer.clone();
      frame.clearTimer(clone);
      assert(!timer.running());
    });

    it('should stop timer by id', function(){
      var timer = frame.timer(function () {}).delay(200);
      frame.clearTimer(timer.id());
      assert(!timer.running());
    });
  });

  describe('#reset()', function(){
    it('should rollback to specific snapshot', function(){
      var snapshot, value = "";
      frame.model(new TestModel());
      frame.after(100, function() {
        value += "A";
      })
      .after(100, function() {
        snapshot = frame.snapshot();
        value += "B";
      })
      .after(100, function() {
        value += "C";
      })
      .after(100, function() {
        value += "D";
      })
      frame.playhead(1000);
      assert.equal("ABCD", value);
      frame.restore(snapshot);
      frame.playhead(1000);
      assert.equal("ABCDBCD", value);
    });
  });

  describe('#reset()', function(){
    it('should reset playhead', function(){
      frame.playhead(100);
      frame.reset();
      assert(frame.playhead() === 0);
    });

    it('should clear timers', function(){
      frame.timer(function() {});
      frame.reset();
      assert(frame.timers().length === 0);
    });
  });
});
