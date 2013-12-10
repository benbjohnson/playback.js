describe('Player', function(){

  var Player   = require('playback/lib/player')
    , Layout   = require('playback/lib/layout')
    , Model    = require('playback/lib/model')
    , assert   = require('assert')
    , nextTick = require('next-tick');

  function TestModel() { this.foo = "bar"; }
  TestModel.prototype = new Model();
  TestModel.prototype.clone = function() {
    var clone = new TestModel();
    clone.foo = this.foo;
    return clone;
  };

  var player = null, svg = null, g = null;
  beforeEach(function() {
    player = new Player();
    player.model(new Model());
  });

  afterEach(function() {
    player.stop();
  });

  describe('#rate()', function(){
    it('should set the rate', function(){
      player.rate(0.5);
      assert.equal(0.5, player.rate());
    });

    it('should not allow negative rates', function(){
      player.rate(-1);
      assert(player.rate() == 0);
    });
  });

  describe('#play()', function(){
    beforeEach(function() {
      player.pause();
    });

    it('should update the player to playing', function(){
      player.play();
      assert(player.playing());
    });
  });

  describe('#pause()', function(){
    beforeEach(function() {
      player.play();
    });

    it('should update the player to a paused state', function(){
      player.pause();
      assert(!player.playing());
    });
  });

  describe('#frame()', function(){
    it('should append a new frame', function(){
      player.frame("x", "y", function() {});
      assert(player.frames().length == 1);
    });

    it('should associate frame with player', function(){
      player.frame("x", "y", function() {});
      assert(player.frame(0).player() === player);
    });

    it('should execute function argument', function(done){
      player.frame("x", "y", function() {
        done();
      });
    });

    it('should pass frame to function', function(){
      player.frame("x", "y", function(frame) {
        assert(this == player.frame(0));
        assert(frame == player.frame(0));
      });
    });
  });

  describe('#current()', function(){
    it('should retrieve current frame', function(){
      player.frame("x", "y", function() {});
      assert(player.current() == player.frame(0));
    });

    it('should return null if there are no frames', function(){
      assert(player.current() === null);
    });
  });

  describe('#model()', function(){
    it('should set and retrieve the model', function(){
      var model = new Model();
      assert(player.model(model) === player);
      assert(player.model() == model);
    });
  });

  describe('#layout()', function(){
    it('should set and retrieve the layout', function(){
      var layout = new Layout();
      assert(player.layout(layout) === player);
      assert(player.layout() == layout);
      assert(layout.player() == player);
    });

    it('should associate layout to player', function(){
      var layout = new Layout();
      player.layout(layout);
      assert(layout.player() == player);
    });

    it('should disassociate old layout from player', function(){
      var layout = new Layout();
      player.layout(layout);
      player.layout(null);
      assert(layout.player() === null);
    });
  });

  describe('#next()', function(){
    it('should move to the next frame', function(){
      player.frame("x", "a", function() {});
      player.frame("y", "b", function() {});
      assert(player.next() === player);
      assert(player.current() === player.frame(1));
    });

    it('should not move past the last frame', function(){
      player.frame("x", "y", function() {});
      assert(player.next() === player);
      assert(player.current() === player.frame(0));
    });

    it('should do nothing if there are no frames', function(){
      assert(player.next() === player);
    });

    it('should end the previous frame', function(done){
      player.frame("x", "y", function(frame) {
        frame.addEventListener("end", function() {
          done();
        })
      });
      player.frame("x", "y", function() {});
      player.next();
    });
  });

  describe('#currentIndex()', function(){
    it('should clone the player model', function(){
      player.model(new TestModel());
      player.frame("x", "a", function(frame) {
        frame.model().foo += "xxx";
      });
      player.frame("y", "b", function(frame) {
        frame.model().foo += "yyy";
      });
      player.frame("z", "c", function(frame) {
        frame.model().foo += "zzz";
      });
      player.next();
      player.next();
      assert.equal("bar", player.model().foo);
      assert.equal("barxxx", player.frame(0).model().foo);
      assert.equal("baryyy", player.frame(1).model().foo);
      assert.equal("barzzz", player.frame(2).model().foo);
    });

    it('should set the current frame model if called in reverse order', function(){
      player = new Player();
      player.frame("x", "a", function(frame) {
        frame.model().foo += "xxx";
      });
      player.model(new TestModel());
      assert(player.current().model().foo === "barxxx");
    });

    it('should reinitialize frame when moving back', function(){
      player.model(new TestModel());
      player.frame("x", "a", function(frame) {
        frame.model().foo += "xxx";
      });
      player.frame("y", "b", function(frame) {
        frame.model().foo += "yyy";
      });
      player.next();
      player.prev();
      assert(player.current().model().foo === "barxxx");
    });
  });

  describe('#prev()', function(){
    it('should move to the previous frame', function(){
      player.frame("x", "a", function() {});
      player.frame("y", "b", function() {});
      assert(player.next() === player);
      assert(player.prev() === player);
      assert(player.current() == player.frame(0));
    });

    it('should not move before the first frame', function(){
      player.frame("x", "a", function() {});
      assert(player.prev() === player);
      assert(player.current() == player.frame(0));
    });

    it('should do nothing if there are no frames', function(){
      assert(player.prev() === player);
    });

    it('should end the previous frame', function(done){
      var done2 = function() {};
      player.frame("x", "a", function() {});
      player.frame("y", "b", function(frame) {
        frame.addEventListener("end", function() {
          done2();
        })
      });
      player.next();
      done2 = done;
      player.prev();
    });
  });

  describe('#resizeable()', function(){
    it('should call original resize function', function(done){
      window.onresize = function() { done(); }
      assert(player.resizeable(true) === player);
      window.onresize()
      window.onresize = null;
    });

    it('should invalidate the layout on resize', function(done){
      var _done = function() {};
      function TestLayout() {}
      TestLayout.prototype = new Layout();
      TestLayout.prototype.invalidateSize = function() { _done(); }
      player.layout(new TestLayout());
      _done = done;
      player.resizeable(true);
      window.onresize()
      window.onresize = null;
    });

    it('should allow disabling resize', function(){
      var fn = function() {};
      function TestLayout() {}
      TestLayout.prototype = new Layout();
      TestLayout.prototype.invalidateSize = function() { fn() }
      player.layout(new TestLayout());
      player.resizeable(true);
      player.resizeable(false);
      fn = function() { assert(false); };
      window.onresize();
      window.onresize = null;
    });
  });

  describe('#tick()', function(){
    // FIX: Having issues getting the requestAnimationFrame() polyfill
    // to work in PhantomJS.
    if (!window.mochaPhantomJS) {
      it('should move the playhead', function(done){
        player.frame("x", "a", function() {});
        player.play();
        setTimeout(function() {
          assert(Math.abs(player.current().playhead() - 300) < 50);
          done();
        }, 310);
      });
    }
  });

  describe('framechange', function(){
    it('should dispatch on initial frame', function(done){
      player.addEventListener("framechange", function() { done() });
      player.frame("x", "a", function() {});
    });

    it('should dispatch on next', function(done){
      player.frame("x", "a", function() {});
      player.frame("y", "b", function() {});
      player.addEventListener("framechange", function() { done() });
      player.next();
    });

    it('should dispatch on prev', function(done){
      player.frame("x", "a", function() {});
      player.frame("y", "b", function() {});
      player.next();
      player.addEventListener("framechange", function() { done() });
      player.prev();
    });

    it('should not dispatch on prev at first frame', function(){
      player.frame("x", "a", function() {});
      player.addEventListener("framechange", function() { assert(false) });
      player.prev();
    });

    it('should not dispatch on next at last frame', function(){
      player.frame("x", "a", function() {});
      player.frame("y", "b", function() {});
      player.next();
      player.addEventListener("framechange", function() { assert(false) });
      player.next();
    });
  });
});
