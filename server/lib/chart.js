const _ = require('lodash');
const util = require('./util');

module.exports = {
  barChar,
};

/**
 * @function barChar
 * This function help to skip some manipulation for respecting chartjs lib format...
 */

function barChar(params) {
  const {
    label, data, item, yAxesLabelString,
    xAxesLabelString, canvasId,
  } = params;

  const chart = {
    labels : [],
    data : [],
  };
  const serieMap = {};

  const dailyData = _.groupBy(data, label);
  chart.labels = Object.keys(dailyData).sort((a, b) => {
    return a.localeCompare(b);
  });

  const items = Object.keys(_.groupBy(data, item.uuid));
  chart.labels.forEach(day => {
    items.forEach(invt => {
      let dataset = {};
      if (serieMap[invt]) {
        dataset = serieMap[invt];
      } else {
        serieMap[invt] = dataset;
        dataset.backgroundColor = util.getRandomColor();
      }
      dataset.data = dataset.data || [];
      let found = false;
      dailyData[day].forEach(dayItem => {
        if (invt === dayItem[item.uuid]) {
          found = true;
          dataset.data.push(dayItem[item.value]);
          dataset.label = dataset.label || dayItem[item.name];
        }
      });
      if (!found) dataset.data.push(0);
    });
  });

  const keys = Object.keys(serieMap);
  if (keys.length > 0) {
    keys.forEach(k => {
      chart.data.push(serieMap[k]);
    });
  }

  return `
    window.addEventListener('load', function () {
      const series = ${JSON.stringify(chart.data)};
      var ctx = document.getElementById('${canvasId}').getContext('2d');

      var chart = new Chart(ctx, {
        // The type of chart we want to create
          type: 'bar',
          // The data for our dataset
          data: {
            labels: ${JSON.stringify(chart.labels)},
            datasets: series,
          },
          
          // Configuration options go here
          options: {
            animation: {
              duration: 0,            
            },
            hover: {
              animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0,
            legend:  {
              position : 'bottom',
            },
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString:  "${yAxesLabelString}"
                },
                ticks: {
                  beginAtZero: true
                }
              }],
            xAxes: [{
            scaleLabel: {
              display: true,
              labelString: "${xAxesLabelString}"
            }
            }]
          },
          plugins: {
            datalabels: {
              align: 'end',
                anchor: 'end',
                  color: function(context) {
                    return 'rgb(0, 0, 0)';
                  },
              font: function(context) {
                var w = context.chart.width;
                return {
                  size: w < 512 ? 12 : 14
                };
              },
              formatter: function(value, context) {

                return value ?  value : '';
              }
            }
          },
        }
      });
    });
    
  `;
}
