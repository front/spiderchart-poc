
(async function () {
  'use strict';

  // Fetch data
  const data = await (await fetch('./data.json')).json();
  const all = [];

  // Parse Data
  for(let i = 0, l = data.length; i < l; i += 8) {
    const _p = data[i + 2];
    const _p2 = [ _p.C, _p.E, _p.G, _p.I, _p.K, /* _p.M */ ];
    const present =
      Math.round(
        100 *
        _p2.reduce((a,n,i) => { return a + n * (i + 1); }, 0) /
        _p2.reduce((a,n) => { return a + n; }, 0)
      ) / 100;

    const _d = data[i + 3];
    const _d2 = [ _d.C, _d.E, _d.G, _d.I, _d.K, /* _d.M */ ];
    const desired =
      Math.round(
        100 *
        _d2.reduce((a,n,i) => { return a + n * (i + 1); }, 0) /
        _d2.reduce((a,n) => { return a + n; }, 0)
      ) / 100;

    const question = data[i].A
    const gap = desired - present;
    all.push({ question, present, desired, gap });

    // console.log(question);
    // console.log(present);
    // console.log(desired);
  }
  console.log('All questions', all);

  // Build subsets
  const small5 = [ ...all].sort((a,b) => { return a.gap - b.gap; }).slice(0, 5);
  console.log('5 smallest gaps', small5);

  const small8 = [ ...all].sort((a,b) => { return a.gap - b.gap; }).slice(0, 8);
  console.log('8 smallest gaps', small8);

  const large5 = [ ...all].sort((a,b) => { return b.gap - a.gap; }).slice(0, 5);
  console.log('5 largest gaps', large5);

  const large8 = [ ...all].sort((a,b) => { return b.gap - a.gap; }).slice(0, 8);
  console.log('8 largest gaps', large8);


  // Build charts
  function buildChart (data, n) {
    var d = [[],[]];

    // Prepare Data
    const ids = data.map(i => i.question.split('.')[0]);
    const now = data.map(i => (i.present - 1).toFixed(2));
    const des = data.map(i => (i.desired - 1).toFixed(2));
    const gap = data.map(i => i.gap.toFixed(2));

    for(let i = 0, l = ids.length; i<l; i++) {
      d[0].push({
        axis: ids[i] + ' (' + gap[i] + ')',
        value: now[i],
      });
      d[1].push({
        axis: ids[i] + ' (' + gap[i] + ')',
        value: des[i],
      });
    }

    // Draw the Radar chart
    RadarChart.draw(`#chart-${n}`, d, {
      w: 500,
      h: 500,
      ExtraWidthX: 150,
      maxValue: 4,
      levels: 4,
      opacityArea: 0
    });


    // Add legend
    const svg = d3.select(`#chart-${n}`).selectAll('svg')
      .append('svg')
      .attr('width', 650).attr('height', 600);

    const legend = svg.append('g')
      .attr('width', 200).attr('height', 100)
      .attr('transform', 'translate(100,10)');

    // Create colour squares
    const colorscale = d3.scale.category10();
    legend.selectAll('rect')
      .data(['Present situation','Desired situation']).enter()
      .append('rect')
      .attr('x', 435).attr('y', (d, i) => i * 20)
      .attr('width', 10).attr('height', 10).style('fill', (d, i) => colorscale(i));

    // Create text next to squares
    legend.selectAll('text')
      .data(['Present situation','Desired situation']).enter()
      .append('text').text(d => d)
      .attr('x', 450).attr('y', (d, i) => i * 20 + 9)
      .attr('font-size', '11px').attr('fill', '#666666');


    // Add question list
    const ul = $(`#legend-${n}`);
    const qs = data.map(i => i.question);
    qs.forEach(q => ul.append(`<li>${q}</li>`));
  }

  buildChart(all, 0);
  buildChart(small5, 1);
  buildChart(small8, 2);
  buildChart(large5, 3);
  buildChart(large8, 4);
})();
