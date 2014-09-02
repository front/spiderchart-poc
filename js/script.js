

function retrieveQuestions (entries) {
  var raw = entries[0];
  var questions = [];

  var i = 1, k;
  while(true) {
    k = 'gsx$nå-situasjon' + (i === 1 ? '' : '_' + i);
    if(!raw[k]) {
      break;
    }
    questions.push(raw[k].$t);
    i++;
  }
  return questions;
}


function normalizeData (entries, questions) {
  var normalized = {
    now: [],
    desired: []
  };
  var i, j, k, l, s, k1, k2, m, n;

  for (i = 1, l = entries.length; i<l; i++ ) {
    var entry = entries[i];
    //console.log( entry );

    for(j = 0, k = questions.length; j < k; j++) {
      s = !j ? '' : '_' + (j+1);
      k1 = 'gsx$nå-situasjon' + s;
      k2 = 'gsx$ønsketsituasjon' + s;

      n = parseInt(entry[k1] && entry[k1].$t);
      m = parseInt(entry[k2] && entry[k2].$t);

      // if(!n) {
      //   console.log('Error (n)', n, entry[k1] && entry[k1].$t );
      // }
      // if(!m) {
      //   console.log('Error (m)', m, entry[k2] && entry[k2].$t );
      // }

      normalized.now[j] = (normalized.now[j] || 0) + (n || 0);
      normalized.desired[j] = (normalized.desired[j] || 0) + (m || 0);
    }
  }
  return normalized;
}


function convertToD3 (normalized, questions, maxValue, yAxisMaxValue) {
  var d = [[],[]];
  var x = [], small = [[],[]], smallIdx = [], large = [[],[]], largeIdx = [], i;
  var k, l, vnow, vdes, gap;

  for(k = 0, l = questions.length; k < l; k++) {
    vnow = ((normalized.now[k] / maxValue) * yAxisMaxValue).toFixed(2);
    vdes = ((normalized.desired[k] / maxValue) * yAxisMaxValue).toFixed(2)
    gap = (vdes - vnow).toFixed(2);

    d[0].push({
      axis: (k+1) + 'a (' + gap + ')',
      value: vnow
    });
    d[1].push({
      axis: (k+1) + 'a (' + gap + ')',
      value: vdes
    });

    // Save for sorting
    x.push({
      gap: gap,
      idx: k
    });
  }

  // Sort the array
  x.sort(function (a, b) {
    return a.gap - b.gap;
  });

  // Selected the 5 smallest gaps and the 5 largest gaps
  for(i = 0, l = x.length; i < 5 && i < l ; i++) {
    // Small
    k = x[i].idx;
    small[0].push( d[0][k] );
    small[1].push( d[1][k] );
    smallIdx.push(k);

    // Large
    k = x[l-i-1].idx;
    large[0].push( d[0][k] );
    large[1].push( d[1][k] );
    largeIdx.push(k);
  }

  return {
    all: d,
    small: small,
    smallIdx: smallIdx,
    large: large,
    largeIdx: largeIdx
  };
}


function buildChart(div, d, legendTxt) {
  //Options for the Radar chart, other than default
  var w = 500, h = 500;

  var mycfg = {
    w: w,
    h: h,
    maxValue: 5,
    levels: 5,
    ExtraWidthX: 150,
    opacityArea: 0
  };

  //Call function to draw the Radar chart
  RadarChart.draw(div, d, mycfg);


  //3. Style the chart
  var colorscale = d3.scale.category10();

  var svg = d3.select(div)
  .selectAll('svg')
  .append('svg')
  .attr('width', w+150)
  .attr('height', h);

  //Initiate Legend
  var legend = svg.append('g')
    .attr('class', 'legend')
    .attr('height', 100)
    .attr('width', 200)
    .attr('transform', 'translate(90,20)')
    ;
  //Create colour squares
  legend.selectAll('rect')
    .data(legendTxt)
    .enter()
    .append('rect')
    .attr('x', w - 65)
    .attr('y', function(d, i){ return i * 20;})
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d, i){ return colorscale(i);})
    ;
  //Create text next to squares
  legend.selectAll('text')
    .data(legendTxt)
    .enter()
    .append('text')
    .attr('x', w - 52)
    .attr('y', function(d, i){ return i * 20 + 9;})
    .attr('font-size', '11px')
    .attr('fill', '#737373')
    .text(function(d) { return d; })
    ;
}

function buildLegend (legend, questions, indexes) {
  var ul = $(legend);
  function addLegend(text) {
    ul.append('<li>' + text + '</li>');
  }

  var i, l;
  if(!indexes){
    for(i = 0, l = questions.length; i < l; i++) {
      addLegend( (i+1) + 'a. ' +questions[i] );
    }
  }
  else {
    for(i = 0, l = indexes.length; i < l; i++) {
      addLegend( (indexes[i]+1) + 'a. ' +questions[indexes[i]] );
    }
  }
}


function buildSpiderChart (data) {
  var maxQuestion = 5;
  var legend = ['NÅ-situasjon','Ønsket situasjon'];

  var entries = data.feed.entry;
  console.log('Entries:', data.feed.entry);


  // 0. Retrieve the question names
  var questions = retrieveQuestions(entries);
  console.log('Questions', questions, questions.length);
  // return;

  //1. Parse the entries into a data structure
  var normalized = normalizeData(entries, questions);
  console.log('Normalized:', normalized);


  //2. Convert the data structure To D3 format
  var maxValue = (entries.length-1) * maxQuestion;
  var d = convertToD3(normalized, questions, maxValue, maxQuestion);
  console.log('D3 data:', d);


  //3. Build graph
  buildChart('#chart-1', d.all, legend);

  buildChart('#chart-2', d.small, legend);

  buildChart('#chart-3', d.large, legend);


  //4. Build legend
  buildLegend('#legend-1', questions);

  buildLegend('#legend-2', questions, d.smallIdx);

  buildLegend('#legend-3', questions, d.largeIdx);
}
