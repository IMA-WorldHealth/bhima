const _ = require('lodash');
const util = require('./util');

module.exports = {
  barChart,
  renderChart,
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
    showLegend,
    uniqueColor,
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
  const defaultColor = `rgba(0, 0, 255, 0.7)`;
  const items = Object.keys(_.groupBy(data, item.uuid));
  chart.labels.forEach(day => {

    items.forEach(invt => {
      let dataset = {};
      if (serieMap[invt]) {
        dataset = serieMap[invt];
      } else {
        serieMap[invt] = dataset;
        dataset.backgroundColor = uniqueColor ? defaultColor : util.getRandomColor();
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

  const dataParameter = {
    labels : chart.labels,
    datasets : chart.data,
  };

  const options = {
    chart_canvas_id : canvasId,
    chart_data : dataParameter,
    chart_x_axis_label : xAxesLabelString,
    chart_y_axis_label : yAxesLabelString,
    chart_enable_legend : showLegend,
  };

  return renderChart(options);
}

/**
 * @method renderChart
 * @param {object} options global settings for the chart
 * @description the options parameter must have some of these properties
 * {
 *  chart_canvas_id : ..., (required) the canvas id
 *  chart_data : ..., (required) the chartjs data structure
 *  chart_x_axis_label : ..., the x axis label
 *  chart_y_axis_label : ..., the y axis label
 *  chart_enable_legend : ..., enable or not the legend
 *  chart_type : ..., the type of chart : 'bar', 'horizontalBar'
 *  chart_option : ... the chartjs option
 * }
 */
function renderChart(options) {
  const canvasId = options.chart_canvas_id;
  const data = options.chart_data;
  const option = options.chart_option || {};
  const xAxesLabelString = options.chart_x_axis_label || '';
  const yAxesLabelString = options.chart_y_axis_label || '';
  const showLegend = options.chart_enable_legend || false;
  const type = options.chart_type || 'bar';

  const defaultOption = {
    responsiveAnimationDuration : 0,
    animation : { duration : 0 },
    hover : { animationDuration : 0 },

    legend :  {
      position : 'bottom',
      display : showLegend,
    },

    scales : {
      yAxes : [{
        scaleLabel : {
          display : true,
          labelString : `${yAxesLabelString}`,
        },
        ticks : {
          beginAtZero : true,
        },
      }],
      xAxes : [{
        scaleLabel : {
          display : true,
          labelString : `${xAxesLabelString}`,
        },
      }],
    },

    plugins : {
      datalabels : {
        align : 'end',
        anchor : 'end',
        color() {
          return 'rgb(0, 0, 0)';
        },
        font(context) {
          const w = context.chart.width;
          return {
            size : w < 512 ? 12 : 14,
          };
        },
        formatter(value) {
          return value || '';
        },
      },
    },
  };

  const _option_ = _.assign({}, defaultOption, option);

  return `
    window.addEventListener('load', function () {
      var ctx = document.getElementById('${canvasId}').getContext('2d');

      var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: '${type}',

          // The data structure for our dataset
          // https://www.chartjs.org/docs/master/general/data-structures/
          data: ${JSON.stringify(data)},
          
          // Configuration options go here
          options: ${JSON.stringify(_option_)}
      });
    });
  `;
}
