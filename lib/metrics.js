var _ = require('lodash');
var utils = require('./utils');
var moment = require('moment-timezone');

module.exports = function(timeseries, options) {

  var data = {
    daily: {
      today: {
        value: utils.getDay(timeseries, 0, options.timezone).value,
        description: 'Today'
      },
      yesterday: {
        value: utils.getDay(timeseries, 1, options.timezone).value,
        description: 'Yesterday'
      },
      daysAgo7: {
        value: utils.getDay(timeseries, 7, options.timezone).value,
        description: '7 days ago'
      },
      daysAgo14: {
        value: utils.getDay(timeseries, 14, options.timezone).value,
        description: '14 days ago'
      },
      daysAgo21: {
        value: utils.getDay(timeseries, 21, options.timezone).value,
        description: '21 days ago'
      },
      daysAgo28: {
        value: utils.getDay(timeseries, 28, options.timezone).value,
        description: '28 days ago'
      }
    }
  };
  if (timeseries.length > 0) {
    data.daily.latest = {
      value: timeseries[timeseries.length - 1].value,
      description: utils.getFriendlyDate(timeseries[timeseries.length - 1].date, options.timezone)
    };
  }
  if (timeseries.length > 1) {
    data.daily.dayBefore = {
      value: timeseries[timeseries.length - 2].value,
      description: utils.getFriendlyDate(timeseries[timeseries.length - 2].date, options.timezone)
    };
  }

  //calc % change
  data.daily.today.change = utils.calcChange(data.daily.today, data.daily.yesterday);
  data.daily.yesterday.change = utils.calcChange(data.daily.yesterday, utils.getDay(timeseries, 3, options.timezone));
  if (data.daily.latest && data.daily.dayBefore) {
    data.daily.latest.change = utils.calcChange(data.daily.latest, data.daily.dayBefore);
  }

  //prettify
  _.forIn(data.daily, function(value) {
    utils.prettifyMetric(value, options.format);
  });

  if (options.aggregates !== false && !options.ranking) {
    data.aggregates = {
      week: {
        value: utils.getWeekSum(timeseries, 0, options.timezone),
        description: 'This week'
      },
      weekAgo1: {
        value: utils.getWeekSum(timeseries, 1, options.timezone),
        description: '1 week ago'
      },
      weekAgo2: {
        value: utils.getWeekSum(timeseries, 2, options.timezone),
        description: '2 weeks ago'
      },
      weekAgo3: {
        value: utils.getWeekSum(timeseries, 3, options.timezone),
        description: '3 weeks ago'
      },
      weekAgo4: {
        value: utils.getWeekSum(timeseries, 4, options.timezone),
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

  return data;
};
