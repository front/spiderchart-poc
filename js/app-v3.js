

function retrieveQuestions (entries) {
  var raw = entries[0];
  var questions = [];

  var i = 1, k;
  while(true) {
    k = 'gsx$presentsituation' + (i === 1 ? '' : '_' + i);
    if(!raw[k]) {
      break;
    }
    questions.push(raw[k].$t);
    i++;
  }
  return questions;
}


function getValue (entry, prefix, q) {
  var suffix = !q ? '' : '_' + (q+1);
  var k = prefix + suffix;
  if(entry[k].$t) {
    return entry[k].$t;
  }
  return 0;
}


function normalizeData (entries, questions) {
  var normalized = {
    now: [],
    desired: [],
    nowTotal: [],
    desTotal: []
  };
  var i, j, k, l, s, k1, k2, m, n;

  for (i = 1, l = entries.length; i<l; i++ ) {
    var entry = entries[i];
    //console.log( entry );

    for(j = 0, k = questions.length; j < k; j++) {
      n = parseInt(getValue(entry, 'gsx$presentsituation', j),10);
      m = parseInt(getValue(entry, 'gsx$desiredsituation', j),10);

      if(n) {
        normalized.now[j] = (normalized.now[j] || 0) + n - 1;
        normalized.nowTotal[j] = (normalized.nowTotal[j] || 0) + 1;
      }

      if(m) {
        normalized.desired[j] = (normalized.desired[j] || 0) + m - 1;
        normalized.desTotal[j] = (normalized.desTotal[j] || 0) + 1;
      }
    }
  }
  return normalized;
}


function convertToD3 (normalized, questions) {
  var d = [[],[]];
  var x = [], small = [[],[]], smallIdx = [], large = [[],[]], largeIdx = [], seven = [[],[]], sevenIdx = [], i;
  var k, l, vnow, vdes, gap;

  for(k = 0, l = questions.length; k < l; k++) {
    vnow = (normalized.now[k] / normalized.nowTotal[k]).toFixed(2);
    vdes = (normalized.desired[k] / normalized.desTotal[k]).toFixed(2);
    gap = (vdes - vnow).toFixed(2);

    d[0].push({
      axis: (k+1) + ' (' + gap + ')',
      value: vnow
    });
    d[1].push({
      axis: (k+1) + ' (' + gap + ')',
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

  // Selected the 5 smallest gaps, 5 largest gaps, and 8 largest gaps
  for(i = 0, l = x.length; i < 8 && i < l ; i++) {
    if(i<5) {
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

    // 8 large
    k = x[l-i-1].idx;
    seven[0].push( d[0][k] );
    seven[1].push( d[1][k] );
    sevenIdx.push(k);
  }

  return {
    all: d,
    small: small,
    smallIdx: smallIdx,
    large: large,
    largeIdx: largeIdx,
    seven: seven,
    sevenIdx: sevenIdx
  };
}


function buildChart(div, d, legendTxt) {
  //Options for the Radar chart, other than default
  var w = 500, h = 500;

  var mycfg = {
    w: w,
    h: h,
    maxValue: 4,
    levels: 4,
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
      addLegend( (i+1) + '. ' +questions[i] );
    }
  }
  else {
    for(i = 0, l = indexes.length; i < l; i++) {
      addLegend( (indexes[i]+1) + '. ' +questions[indexes[i]] );
    }
  }
}


function buildSpiderChart (data) {
  var legend = ['Present situation','Desired situation'];
  var entries = data.feed.entry;
  console.log('Entries:', entries, entries.length);


  // 0. Retrieve the question names
  var questions = retrieveQuestions(entries);
  console.log('Questions', questions, questions.length);
  // return;

  //1. Parse the entries into a data structure
  var normalized = normalizeData(entries, questions);
  console.log('Normalized:', normalized);
  // return;


  //2. Convert the data structure To D3 format
  var d = convertToD3(normalized, questions);
  console.log('D3 data:', d);


  //3. Build graph
  buildChart('#chart-1', d.all, legend);

  buildChart('#chart-2', d.small, legend);

  buildChart('#chart-3', d.large, legend);

  buildChart('#chart-4', d.seven, legend);


  //4. Build legend
  buildLegend('#legend-1', questions);

  buildLegend('#legend-2', questions, d.smallIdx);

  buildLegend('#legend-3', questions, d.largeIdx);

  buildLegend('#legend-4', questions, d.sevenIdx);
}
