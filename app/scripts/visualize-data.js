/* global d3, Perceptron, $ */
/* exported d3percp */

var d3percp = (function(d3, Perceptron, $) {

  var width = 300,
      height = 300;

  var expose     = {};

  var nodes      = [];
  var iterations = [];

  var p    = new Perceptron(2);
  var real = {
    m : 0.1,
    b : 1,
    f : function(x) { return this.m * x + this.b; }
  };
  var realAnswer = function(x, y) {
    return y > real.f(x) ? 1 : -1;
  };

  // Returns the css classes of the given node
  // which depends on its current s
  var getNodeClass = function(node) {
    var classes = ['node'];
    if(node.wrong) {
      classes.push('wrong');
    } else {
      classes.push(node.answer > 0 ? "positive" : "negative"); 
    }
    return classes.join(' ');
  };

  // Counts the current errors caused by the perceptron
  var countErrors = function() {
    var errors = 0;
    for(var k=0; k<nodes.length; k++) {
      if(nodes[k].wrong) {
        errors++;
      }
    }
    return errors;
  };

  // Updates the percetage of the error in percentage 
  // with regard to the number of nodes
  var updateErrorStatus = function(errors) {
    $('#error-percentage').val(Math.round(errors/nodes.length * 100));
  };

  // All nodes will be applied to the current perceptron
  // and the according d3 data set will be updated
  // with information about the guess, answer and error.
  // Also, an update and redrawing of d3 will be triggered.
  var applyAndUpdate = function(p) {
    // apply and ...
    var errors = 0;
    for(var i=0; i<nodes.length; i++) {
      var node    = nodes[i];
      var x       = node.cx;
      var y       = node.cy;

      var answer  = realAnswer(x, y);
      var guess   = p.apply([x, y]);

      node.answer = answer;
      node.guess  = guess;
      node.wrong  = (guess!==answer);

      if(node.wrong) {
        errors++;
      }
    }
    // ... update color of existing ...
    nodeSVGroup.selectAll(".node")
        .data(nodes)
        .attr("class", getNodeClass);
    // .. and append new nodes
    nodeSVGroup.selectAll(".node")
        .data(nodes).enter().append('circle')
        .attr("class", getNodeClass)
        .attr("cx", function(d) { return d.cx; })
        .attr("cy", function(d) { return d.cy; })
        .attr("r",  function() { return 0.01; })
        .transition().ease("elastic").delay(10).duration(1000)
        .attr("r",     function(d) { return d.r; });

    updateErrorStatus(errors);
  };

  var showSlider = function() {
    $("#sliders .iterations span.value").html(iterations.length -1); 
    $("#sliders").slideDown(1000);
    $(function() {
      $("#sliders .iterations > div.slider").slider({
        min: 0,
        max: iterations.length - 1,
        value: iterations.length - 1,
        slide: function(event, ui) { 
          var i           = ui.value;
          var currentPerp = iterations[i];
          $("#sliders .iterations span.value").html(i); 
          rerenderPerceptronFunction(currentPerp);
          applyAndUpdate(currentPerp);
        }
      });
    });
  };

  // Learn all the data at once until we have no more errors
  // Also, save all learned iterations.
  var learn = function() {
    var timer = setInterval(function(){
      iterations.push(p.clone());

      // single iteration
      for(var i=0; i<nodes.length; i++) {
        var x      = nodes[i].cx;
        var y      = nodes[i].cy;
        var answer = realAnswer(x, y);

        p.train([x, y], answer);
      }
      rerenderPerceptronFunction(p);
      applyAndUpdate(p);

      if(countErrors() === 0) {
        iterations.push(p.clone());
        clearInterval(timer);
        showSlider();
      }
    }, 300);
  };
  expose.learn = learn;

  var updatePercpFunction = function(p) {
    $("#percp-m").val(p.m().toFixed(3));
    $("#percp-b").val(p.b().toFixed(3));
  };

  // Updates the learned function in the
  // d3.js visualization and displays it.
  var rerenderPerceptronFunction = function(p) {
    linesSVGroup.selectAll("#pline")
      .data([{"x1":-1, "y1": p.f(-1), "x2":4, "y2": p.f(4)}])
      .transition().duration(1000).ease('elastic')
      .attr("x1", function(d) { return d.x1; })
      .attr("y1", function(d) { return d.y1; })
      .attr("x2", function(d) { return d.x2; })
      .attr("y2", function(d) { return d.y2; });
    updatePercpFunction(p);
  };

  // Updates the function which we wanna learn in the
  // d3.js visualization and displays it.
  var rerenderRealFunction = function() {
    linesSVGroup.selectAll("#rline")
      .data([{"x1":-1, "y1": real.f(-1), "x2":4, "y2": real.f(4)}])
      .transition()
      .attr("x1", function(d) { return d.x1; })
      .attr("y1", function(d) { return d.y1; })
      .attr("x2", function(d) { return d.x2; })
      .attr("y2", function(d) { return d.y2; });
  };

  // Adding a node without any updating of the d3 visualization.
  var addNode = function(x, y) {
    nodes.push({"cx":x, "cy":y, "r": 0.08, "group": 6});
  };

  // Generates 100 random data points, applies and renderes them
  var generateData = function() {
    for(var i=0; i<100; i++) {
      var x = Math.random() * 3;
      var y = Math.random() * 3;
      addNode(x, y);
    }
    applyAndUpdate(p);
  };
  expose.generate = generateData;

  $("#real-m").val(real.m);
  $("#real-b").val(real.b);

  // Manipulation of the real function by the user
  $("#real-m").change(function() { 
    real.m = parseFloat($(this).val());
    rerenderRealFunction();
  });
  $("#real-b").change(function() {
    real.b = parseFloat($(this).val());
    rerenderRealFunction();
  });

  // Show inital perceptron state
  updatePercpFunction(p);

  var svg = d3.select("div#data .canvas").append("svg")
                .attr("width", width)
                .attr("height", height);

  var nodeSVGroup  = svg.append('g').attr("id", "nodes-svg-group");
  var linesSVGroup = svg.append('g').attr("id", "lines-svg-group");

  svg.on('click', function() {
    // Scaling the returned coordiantes according
    // to the scaling of the line/circles
    // (see css file)
    var x = d3.mouse(this)[0]/100;
    var y = d3.mouse(this)[1]/100 * -1 + 3;
    addNode(x, y);
    applyAndUpdate(p);
  }); 

  // Adding the "real" function as a line
  linesSVGroup.append("svg:line")
      .attr("x1", -1)
      .attr("y1", real.f(-1))
      .attr("x2", 4)
      .attr("y2", real.f(4))
      .attr("id", "rline")
      .attr("class", "line");

  // Adding the learned function as a line
  linesSVGroup.selectAll("#pline")
      .data([{"x1":-1, "y1": p.f(-1), "x2":4, "y2": p.f(4)}])
    .enter().append('line').transition().duration(500)
      .attr("x1", function(d) { return d.x1; })
      .attr("y1", function(d) { return d.y1; })
      .attr("x2", function(d) { return d.x2; })
      .attr("y2", function(d) { return d.y2; })
      .attr("id", "pline")
      .attr("class", "line");

  return expose;
} (d3, Perceptron, $));
