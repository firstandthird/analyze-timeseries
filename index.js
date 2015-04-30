var momentNoTz = require('moment');
var momentTz = require('moment-timezone');
var formatTimeseries = require('./lib/timeseries');
var getMetrics = require('./lib/metrics');

module.exports = function(data, options) {
  var moment;
  options = options || {};

  if (options.timezone) {
    moment = function() {
      return momentTz.apply(this, arguments).tz(options.timezone);
    };
  } else {
    moment = momentNoTz;
  }

  var timeseries = formatTimeseries(data, options, moment);

  //metrics
  var metrics = {
    daily: {
      today: getMetrics.today(timeseries, moment),
      latest: getMetrics.latest(timeseries, moment),
      daysAgo7: getMetrics.daysAgo(timeseries, 7, moment),
      daysAgo14: getMetrics.daysAgo(timeseries, 14, moment),
      daysAgo21: getMetrics.daysAgo(timeseries, 21, moment)
    },
    weekly: null,
    overall: {
      maximum: getMetrics.max(timeseries, moment),
      minimum: getMetrics.min(timeseries, moment)
    }
  };

  if (options.aggregates !== false && !options.ranking) {
    metrics.overall.total = getMetrics.total(timeseries, moment);
    metrics.overall.average = getMetrics.average(timeseries, moment);
    metrics.weekly = {
      thisWeek: getMetrics.weekAgo(timeseries, 0, moment),
      weekAgo1: getMetrics.weekAgo(timeseries, 1, moment),
      weekAgo2: getMetrics.weekAgo(timeseries, 2, moment),
      weekAgo3: getMetrics.weekAgo(timeseries, 3, moment)
    };
  }

  return {
    timeseries: timeseries,
    metrics: metrics
  };

};
