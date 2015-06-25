var momentTz = require('moment-timezone');
var formatTimeseries = require('./lib/timeseries');
var metrics = require('./lib/metrics');

module.exports = function(data, options) {
  options = options || {};

  var moment = function() {
    var args = Array.prototype.slice.call(arguments);
    args.push(options.timezone);

    return momentTz.tz.apply(this, args);
  };

  if (options.type &&
    (options.type === 'totals' || options.type === 'percentage')) {
    options.aggregates = false;
  }

  var timeseries = formatTimeseries(data, options, moment);

  return {
    timeseries: timeseries,
    metrics: metrics(timeseries, options)
  };

};
