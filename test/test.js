var assert    = require("assert")
var Neuralnet = require("../app/scripts/neuralnet.js");

describe('Neuralnet', function(){
  beforeEach(function() {
    n = new Neuralnet(2, 3, 4);
  });
  describe('#Neuralnet()', function(){
    it('should have 2 times 3 weights from input to hidden layer', function(){
      assert.equal(3, n.w_ih[0].length);
      assert.equal(3, n.w_ih[1].length);
      assert.throws(function() {n.w_ih[2].length;}, TypeError);
    });
    it('should have 3 times 4 weights from hidden to output layer', function(){
      assert.equal(4, n.w_ho[0].length);
      assert.equal(4, n.w_ho[1].length);
      assert.equal(4, n.w_ho[2].length);
      assert.throws(function() {n.w_ho[3].length;}, TypeError);
    });
    it('should have weights between -1 and 1', function() {
      for(var i=0; i<n.w_ih.length; i++) {
        for(var h=0; h<n.w_ih[i].length; h++) {
          assert(n.w_ih[i][h] <=  1);
          assert(n.w_ih[i][h] >= -1);
        }
      }
      for(var h=0; h<n.w_ho.length; h++) {
        for(var o=0; o<n.w_ho[h].length; o++) {
          assert(n.w_ho[h][o] <=  1);
          assert(n.w_ho[h][o] >= -1);
        }
      }
    })
  })

  describe('#sigma()', function() {
    it('should use a sigma function for activation', function() {
      assert.equal(0.5, n.sigma(0));
      assert(n.sigma(2)  > 0.88);
      assert(n.sigma(-2) < 0.12);
    });
    it('should be between 0 and 1', function() {
      for(var i=0; i<100; i++) {
        var y = n.sigma(Math.random()*100-50);
        assert(y >= 0 && y <= 1, "Sigma function yields " + y + " instead.");
      }
    })
  });

  describe('#apply(input)', function() {
    it('should not accept input of the wrong size', function() {
      assert.throws(function() {
        n.apply([1]);
      }, /size not correct/);
      assert.throws(function() {
        n.apply([1, 2, 3]);
      }, /size not correct/);
      assert.doesNotThrow(function() {
        n.apply([1, 2]);
      });
    });
    it('should have an output between 0 and 1', function() {
      for(var i=0; i<100; i++) {
        n = new Neuralnet(2, 5, 2);
        var output = n.apply([Math.random()*20-10, Math.random()*5-2.5]);
        output.forEach(function(o) {
          assert(o < 1 && o > 0, "Output is " + o + " instead of between 0 and 1");
        })

      }
    });
    it('should give the correct output on 0-weights', function() {
      n.w_ih = [[0, 0, 0], [0, 0, 0]];
      n.w_ho = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      assert.deepEqual([0.5, 0.5, 0.5, 0.5], n.apply([Math.random(), Math.random()]));
      n.w_ih = [[Math.random(), Math.random(), Math.random()],
                [Math.random(), Math.random(), Math.random()]];
      n.w_ho = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      assert.deepEqual([0.5, 0.5, 0.5, 0.5], n.apply([Math.random(), Math.random()]));
    });
    it('should only effect one output value on a single not-0-weight', function() {
      n.w_ih = [[0, 0, 0], [0, 0, 0]];
      n.w_ho = [[0, 0, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0]];
      assert(n.apply([1, 1])[0] === 0.5)
      assert(n.apply([1, 1])[1] === 0.5)
      assert(n.apply([1, 1])[2] === 0.5)
      assert(n.apply([1, 1])[3]  >  0.5)
      n.w_ho = [[0, 0, 0, 0], [0, -2, 0, 0], [0, 0, 0, 0]];
      assert(n.apply([1, 1])[0] === 0.5)
      assert(n.apply([1, 1])[1]  <  0.5)
      assert(n.apply([1, 1])[2] === 0.5)
      assert(n.apply([1, 1])[3] === 0.5)
      n.w_ho = [[0, 0, 0, 0], [0, -2, 0, 0], [0, 0, 0, 2]];
      assert(n.apply([1, 1])[0] === 0.5)
      assert(n.apply([1, 1])[1]  <  0.5)
      assert(n.apply([1, 1])[2] === 0.5)
      assert(n.apply([1, 1])[3]  >  0.5)
      n.w_ho = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 2, 2, 2]];
      assert(n.apply([1, 1])[0] === 0.5)
      assert(n.apply([1, 1])[1] === 0.5)
      assert(n.apply([1, 1])[2] === 0.5)
      assert(n.apply([1, 1])[3] === 0.5)
    });
  });
});
