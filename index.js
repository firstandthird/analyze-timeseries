var formatTimeseries = require('./lib/timeseries');
var getMetrics = require('./lib/metrics');

module.exports = function(data, options) {

  var timeseries = formatTimeseries(data, options);

  //metrics
  var metrics = {
    daily: {
      today: getMetrics.today(timeseries),
      latest: getMetrics.latest(timeseries),
      daysAgo7: getMetrics.daysAgo(timeseries, 7),
      daysAgo14: getMetrics.daysAgo(timeseries, 14),
      daysAgo21: getMetrics.daysAgo(timeseries, 21)
    },
    weekly: {
      thisWeek: getMetrics.weekAgo(timeseries, 0),
      weekAgo1: getMetrics.weekAgo(timeseries, 1),
      weekAgo2: getMetrics.weekAgo(timeseries, 2),
      weekAgo3: getMetrics.weekAgo(timeseries, 3)
    },
    overall: {
      total: 0,
      average: 0,
      maximum: 0,
      minimum: 0
    }
  };

  return {
    timeseries: timeseries,
    metrics: metrics
  };

};
