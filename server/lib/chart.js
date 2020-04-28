const _ = require('lodash');
const util = require('./util');

module.exports = {
  barChart,
};

/**
 * @function barChart
 * This function help to skip some manipulation for respecting chartjs lib format...

 To explain these parameters better, let take a cool example
 -----------------------------------------------------------
 If we want to create a bar chart for stock consumption
 the goal is to show in the graph the quantity(Y axe) consumed each day (X axe) for inventories(items)

 params.label  = 'date'
 param.item = {
   uuid : 'inventory_uuid',
   name : 'inventory_name', // this will appear in the legend
   value : 'quantity'
 },
 yAxesLabelString : 'Quantity' // simple, the label to display for Y axe
 xAxesLabelString : 'Days' // simple, the label to display for X axe
 canvasId : 'Your html canvas id'

 data is the collection where items will be picked up
 for our example it's stock movements
 data : [
   {
     inventory_uuid : '01',
     inventory_name : 'ivent1',
     quantity : 10,
     date : '2020-04-01'
   },
  {
     inventory_uuid : '02',
     inventory_name : 'ivent2',
     quantity : 5,
     date : '2020-04-01'
   },
   ...
 ];
*/
function barChart(params) {
  const {
    label, data, item, yAxesLabelString,
    xAxesLabelString, canvasId,
  } = params;

  const chart = {
    labels : [],
    data : [],
  };
  const serieMap = {};

  const labelsData = _.groupBy(data, label);

  // Let get labels fot the graph
  chart.labels = Object.keys(labelsData).sort((a, b) => {
    return a.localeCompare(b);
  });

  // formating datasets
  /**
   *Let take an example to understand what is done here

   labels = ['01','02'];
   items = ['inventory1', 'inventory2', 'inventory3']
   the series (datasets) should be
   [{
      label : 'inventory1',
      data : [10, 3]
    },
    {
      label : 'inventory2',
      data : [5, 45]
    },
    {
      label : 'inventory3',
      data : [20, 0]
    }];

    each dataset should have the an array(data) that contains the value for each label
    so the array's length must be equals to label's length

   */
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
      labelsData[day].forEach(dayItem => {
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
