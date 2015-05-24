var _ = require('lodash');
var moment = require('moment');
var numeral = require('numeral');

exports.calcChange = function(v1, v2) {
  if (_.isUndefined(v1) || _.isUndefined(v2)) {
    return '-';
  }
  v1 = typeof v1 === 'number' ? v1 : v1.value;
  v2 = typeof v2 === 'number' ? v2 : v2.value;
  if (v1 == v2) {
    return 0;
  }
  return (((v2 - v1) / v1 * 100) / 100) * -1;

};

exports.getRangeSum = function(timeseries, start, end) {
  var filteredDates = _.filter(timeseries, function(item) {
    return (item.date >= start.valueOf() && item.date <= end.valueOf());
  });
  return _.sum(filteredDates, 'value');
};

exports.getWeekSum = function(timeseries, offset) {
  var start = moment().startOf('day').startOf('week').subtract(offset, 'week');
  var end = start.clone().endOf('week');

  return exports.getRangeSum(timeseries, start, end);
};

exports.getDayTimestamp = function(offset) {
  return parseInt(moment().startOf('day').subtract(offset, 'day').format('x'), 10);
};

exports.getDay = function(timeseries, offset) {
  return _.find(timeseries, { date: exports.getDayTimestamp(offset) }) || { value: '-' };
};

exports.getFriendlyDate = function(date) {
  if (date == exports.getDayTimestamp(0)) {
    return 'Today';
  } else if (date == exports.getDayTimestamp(1)) {
    return 'Yesterday';
  }
  return moment(date).format('MM/DD');
};

exports.prettifyMetric = function(metric, format) {
  format = format || '0,0';
  metric.prettyChange = metric.change;
  metric.prettyValue = metric.value;

  if (metric.change && metric.change !== '-') {
    metric.prettyChange = numeral(metric.change * 100).format('0,0');
  }

  if (metric.value && metric.value !== '-') {
    metric.prettyValue = numeral(metric.value).format(format);
  }

  return metric;
};
