
function buildSpiderChart (data) {
  var numQuestions = 8;
  var maxQuestion = 6;
  var legendOptions = ['NÅ-situasjon','Ønsket situasjon'];
  var w = 500, h = 500;


  var entries = data.feed.entry;
  console.log('Entries:', data.feed.entry);

  //1. Parse the entries into a data structure
  var normalized = {
    now: [], desired: []
  };

  for (var i = entries.length - 1; i >= 0; i--) {
    var entry = entries[i];
    // console.log( entry );

    for(var j = 0; j < numQuestions; j++) {
      var sufx = !j ? '' : '_' + (j+1);
      var k0 = 'gsx$nå-situasjon' + sufx;
      var k1 = 'gsx$ønsketsituasjon' + sufx;

      normalized.now[j] = (normalized.now[j] || 0) + parseInt(entry[k0].$t);
      normalized.desired[j] = (normalized.desired[j] || 0) + parseInt(entry[k1].$t);
    }
  }
  console.log('Normalized:', normalized);


  //2. Convert the data structure To D3 format
  var maxValue = entries.length * maxQuestion;

  var d = [[],[]];
  for(var k = 0; k < 8; k++) {
    d[0].push({
      axis: 'Question ' + (k+1),
      value: normalized.now[k] / maxValue
    });
    d[1].push({
      axis: 'Question ' + (k+1),
      value: normalized.desired[k] / maxValue
    });
  }
  console.log('D3 data:', d);

  //Options for the Radar chart, other than default
  var mycfg = {
    w: w,
    h: h,
    maxValue: 1,
    levels: 6,
    ExtraWidthX: 150
  };

  //Call function to draw the Radar chart
  RadarChart.draw("#chart", d, mycfg);


  //3. Style the chart
  var colorscale = d3.scale.category10();

  var svg = d3.select('.wrapper')
  .selectAll('svg')
  .append('svg')
  .attr("width", w+150)
  .attr("height", h);

  //Initiate Legend
  var legend = svg.append("g")
  .attr("class", "legend")
  .attr("height", 100)
  .attr("width", 200)
  .attr('transform', 'translate(90,20)')
  ;
  //Create colour squares
  legend.selectAll('rect')
    .data(legendOptions)
    .enter()
    .append("rect")
    .attr("x", w - 65)
    .attr("y", function(d, i){ return i * 20;})
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d, i){ return colorscale(i);})
    ;
  //Create text next to squares
  legend.selectAll('text')
    .data(legendOptions)
    .enter()
    .append("text")
    .attr("x", w - 52)
    .attr("y", function(d, i){ return i * 20 + 9;})
    .attr("font-size", "11px")
    .attr("fill", "#737373")
    .text(function(d) { return d; })
    ;

}
