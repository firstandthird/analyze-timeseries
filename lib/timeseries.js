var _ = require('lodash');
var numeral = require('numeral');
var utils = require('./utils');

module.exports = function(data, options, moment) {
  options = options || {};

  var format = options.format || '0,0';
  var exclusiveTypes = ['percentage', 'totals'];

  //strip time
  var timeseries;

  if (!options.type || exclusiveTypes.indexOf(options.type) === -1) {
    timeseries = utils.stripTimeAndSum(data, moment);
  } else {
    timeseries = utils.stripTime(data, moment);
  }

  var maxDate = parseInt(_.max(_.keys(timeseries)), 10);
  var latest = new Date(maxDate);

  if (options.latestToday) {
    latest = moment().startOf('day').toDate();
  }

  var daysToFill = options.days || 0;
  if (!daysToFill) {
    var minDate = parseInt(_.min(_.keys(timeseries)), 10);
    var earliest = new Date(minDate);
    daysToFill = parseInt(moment(latest).format('DDD'), 10) - parseInt(moment(earliest).format('DDD'));
  }
  var dayFiller = options.ranking ? null : 0;

  for (var i = 0, c = daysToFill; i < c; i++) {
    var date = moment(latest).subtract(i, 'days').format('x');
    if (!timeseries[date]) {
      timeseries[date] = dayFiller;
    }
  }

  //back to array
  timeseries = _.values(_.map(timeseries, function(value, date) {
    if (options.ranking && _.isNumber(value)) {
      value *= -1;
    }
    var formatted = null;

    if (_.isNumber(value)) {
      formatted = numeral(value).format(format);
    }

    return {
      date: parseInt(date, 10),
      value: value,
      prettyValue: formatted
    };
  }));

  timeseries = _.sortBy(timeseries, 'date');

  return timeseries;
};
