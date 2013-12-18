describe('Set', function(){

  var DataObject = require('playback/lib/data_object')
    , Set        = require('playback/lib/set')
    , assert     = require('assert')
    , equals     = require('equals');

  function TestClass(model, id, value) {
      DataObject.call(this, model);
      this.id = id;
      this.value = value;
  }
  TestClass.prototype = new DataObject();
  TestClass.prototype.constructor = TestClass;
  TestClass.prototype.clone = function(model) {
      return new TestClass(model, this.id, this.value);
  }


  var set = null;

  beforeEach(function() {
    set = new Set();
  });

  describe('#find()', function(){
    it('should retrieve existing element by id', function(){
      var element = {id:1};
      set.add(element);
      assert(set.find(1) === element);
    });

    it('should return null for missing element', function(){
      set.add({id:1});
      assert(set.find(2) === null);
    });

    it('should find using a filter function', function(){
      set.add({id:1});
      set.add({id:2});
      set.add({id:3});
      set.add({id:4});
      assert(set.find(function(item) { if (item.id === 2) return true; }).id === 2);
    });
  });

  describe('#contains()', function(){
    it('should return true if element exists', function(){
      set.add({id:1});
      assert(set.contains({id:1}) === true);
    });

    it('should return false for missing element', function(){
      set.add({id:1});
      assert(set.contains({id:2}) === false);
    });
  });

  describe('#create()', function(){
    it('should create a new element with a given id', function(){
      set.clazz(TestClass);
      assert(set.create(1).id === 1);
    });

    it('should return existing element if exists', function(){
      set.clazz(TestClass);
      var el = set.create(2);
      assert(set.create(2) === el);
    });
  });

  describe('#add()', function(){
    it('should return the set', function(){
      assert(set.add({id:1}) === set);
    });

    it('should add an element to the set', function(){
      set.add({id:100});
      set.add({id:200});
      assert(set.size() === 2);
      assert(set.toArray()[0].id === 100);
      assert(set.toArray()[1].id === 200);
    });

    it('should not add a duplicate element to the set', function(){
      set.add({id:100});
      set.add({id:100});
      assert(set.size() === 1);
    });
  });

  describe('#remove()', function(){
    it('should remove a matching element', function(){
      set.add({id:1});
      set.remove({id:1});
      assert(set.size() === 0);
    });

    it('should not remove a non-matching element', function(){
      set.add({id:1});
      set.remove({id:2});
      assert(set.size() === 1);
    });
  });

  describe('#remove()', function(){
    it('should remove all elements', function(){
      set.add({id:1});
      set.add({id:2});
      set.removeAll();
      assert(set.size() === 0);
    });
  });

  describe('#filter()', function(){
    it('should filter elements', function(){
      set.add({id:1, value:100});
      set.add({id:2, value:200});
      set.filter(function(el) { return el.value === 200; });
      assert(set.find(100) === null);
      assert(set.find(200) === null);
    });
  });

  describe('#clone()', function(){
    it('should clone all elements', function(){
      set.add(new TestClass(set.model(), 1, 100));
      set.add(new TestClass(set.model(), 2, 200));
      var clone = set.clone();
      set.find(1).value = 300;
      assert(clone.size() === 2);
      assert(clone.find(1) !== null);
      assert(clone.find(2) !== null);
      assert(clone.find(3) === null);
    });
  });
});
