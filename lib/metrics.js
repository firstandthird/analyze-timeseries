var _ = require('lodash');
var utils = require('./utils');

module.exports = function(timeseries, moment, options) {

  var data = {
    daily: {
      today: {
        value: utils.getDay(timeseries, 0).value,
        description: 'Today'
      },
      yesterday: {
        value: utils.getDay(timeseries, 1).value,
        description: 'Yesterday'
      },
      daysAgo7: {
        value: utils.getDay(timeseries, 7).value,
        description: '7 days ago'
      },
      daysAgo14: {
        value: utils.getDay(timeseries, 14).value,
        description: '14 days ago'
      },
      daysAgo21: {
        value: utils.getDay(timeseries, 21).value,
        description: '21 days ago'
      },
      daysAgo28: {
        value: utils.getDay(timeseries, 28).value,
        description: '28 days ago'
      }
    }
  };
  if (timeseries.length > 0) {
    data.daily.latest = {
      value: timeseries[timeseries.length - 1].value,
      description: utils.getFriendlyDate(timeseries[timeseries.length - 1].date)
    };
  }
  if (timeseries.length > 1) {
    data.daily.dayBefore = {
      value: timeseries[timeseries.length - 2].value,
      description: utils.getFriendlyDate(timeseries[timeseries.length - 2].date)
    };
  }

  //calc % change
  data.daily.today.change = utils.calcChange(data.daily.today, data.daily.yesterday);
  data.daily.yesterday.change = utils.calcChange(data.daily.yesterday, utils.getDay(timeseries, 3));
  data.daily.latest.change = utils.calcChange(data.daily.latest, data.daily.dayBefore);

  //prettify
  _.forIn(data.daily, function(value) {
    utils.prettifyMetric(value, options.format);
  });

  if (options.aggregates !== false && !options.ranking) {
    data.aggregates = {
      week: {
        value: utils.getWeekSum(timeseries, 0),
        description: 'This week'
      },
      weekAgo1: {
        value: utils.getWeekSum(timeseries, 1),
        description: '1 week ago'
      },
      weekAgo2: {
        value: utils.getWeekSum(timeseries, 2),
        description: '2 weeks ago'
      },
      weekAgo3: {
        value: utils.getWeekSum(timeseries, 3),
        description: '3 weeks ago'
      },
      weekAgo4: {
        value: utils.getWeekSum(timeseries, 4),
        description: '4 weeks ago'
      },
      month: {
        value: utils.getRangeSum(timeseries, moment().startOf('day').startOf('month'), moment().endOf('day')),
        description: 'This Month'
      },
      last30days: {
        value: utils.getRangeSum(timeseries, moment().startOf('day').subtract(30, 'days'), moment().endOf('day')),
        description: 'Last 30 days'
      },
      averge: {
        description: 'Average',
        value: _.sum(timeseries, 'value') / timeseries.length
      },
      maximum: {
        description: 'Maximum',
        value: _.max(timeseries, 'value').value
      },
      minimum: {
        description: 'Minimum',
        value: _.min(timeseries, 'value').value
      }
    };

    data.aggregates.week.change = utils.calcChange(data.aggregates.week, data.aggregates.weekAgo1);
    data.aggregates.weekAgo1.change = utils.calcChange(data.aggregates.weekAgo1, data.aggregates.weekAgo2);
    data.aggregates.weekAgo2.change = utils.calcChange(data.aggregates.weekAgo2, data.aggregates.weekAgo3);
    data.aggregates.weekAgo3.change = utils.calcChange(data.aggregates.weekAgo3, data.aggregates.weekAgo4);
    _.forIn(data.aggregates, function(value) {
      utils.prettifyMetric(value, options.format);
    });
  }

  //console.log(JSON.stringify(data, null, '  '));

  /*
  var data = {
    daily: {
      today: getMetrics.today(timeseries),
      latest: getMetrics.latest(timeseries),
      yesterday: getMetrics.yesterday(timeseries),
      dayBefore: getMetrics.dayBefore(timeseries),
      daysAgo7: getMetrics.daysAgo(timeseries, 7),
      daysAgo14: getMetrics.daysAgo(timeseries, 14),
      daysAgo21: getMetrics.daysAgo(timeseries, 21)
    },
    weekly: null,
    overall: {
      maximum: getMetrics.max(timeseries),
      minimum: getMetrics.min(timeseries)
    }
  };

  if (options.aggregates !== false && !options.ranking) {
    data.overall.total = getMetrics.total(timeseries);
    data.overall.average = getMetrics.average(timeseries);
    data.weekly = {
      thisWeek: getMetrics.weekAgo(timeseries, 0),
      weekAgo1: getMetrics.weekAgo(timeseries, 1),
      weekAgo2: getMetrics.weekAgo(timeseries, 2),
      weekAgo3: getMetrics.weekAgo(timeseries, 3)
    };
  }

  */
  return data;
};
