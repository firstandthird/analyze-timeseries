var _ = require('lodash');
var numeral = require('numeral');
var moment = require('moment');

var change = function(v1, v2) {
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

var getDayTimestamp = function(offset) {
  return parseInt(
    moment().startOf('day').subtract(offset, 'day').format('x'), 10
  );
};

var metrics = function(format) {
  this.format = format || '0,0';
};

metrics.prototype.prettifyValues = function(result) {
  result.prettyChange = result.change;
  result.prettyValue = result.value;

  if (result.change && result.change !== '-') {
    result.prettyChange = numeral(result.change * 100).format('0,0');
  }

  if (result.value && result.value !== '-') {
    result.prettyValue = numeral(result.value).format(this.format);
  }

  return result;
};

metrics.prototype.sumDays = function(timeseries, dayStart, dayEnd) {
  var sum = 0;
  var i = 0;
  var day = moment(timeseries[0].date);

  while (day && day.isBefore(dayEnd)) {
    if (day.clone().add('1', 'second').isBetween(dayStart, dayEnd)) {
      if (_.isNumber(timeseries[i].value) && !_.isNaN(timeseries[i].value)) {
        sum += timeseries[i].value;
      }
    }

    i++;
    day = timeseries[i] ? moment(timeseries[i].date) : null;
  }

  return sum;
};

metrics.prototype.getDay = function(offset, description, timeseries) {
  var timestamp = getDayTimestamp.call(this, offset);
  var dayIndex = _.findIndex(timeseries, { date: timestamp });

  if (dayIndex != -1) {
    return this.getDayByIndex(dayIndex, description, timeseries);
  }

  return this.prettifyValues({
    description: description,
    value: '-',
    change: '-'
  });
};

metrics.prototype.getDayByIndex = function(index, description, timeseries) {
  var day = timeseries[index];
  var dayBefore = timeseries[index - 1];

  return this.prettifyValues({
    description: description,
    value: day.value,
    change: change(day, dayBefore)
  });
};

metrics.prototype.today = function(timeseries) {
  return this.getDay(0, 'Today', timeseries);
};

metrics.prototype.yesterday = function(timeseries) {
  return this.getDay(1, 'Yesterday', timeseries);
};

metrics.prototype.dayBefore = function(timeseries) {
  return this.getDay(2, 'Day Before', timeseries);
};

metrics.prototype.latest = function(timeseries) {
  return this.getDayByIndex(timeseries.length - 1, 'Latest', timeseries);
};

metrics.prototype.daysAgo = function(timeseries, days) {
  var latest = timeseries[timeseries.length - 1];
  var ago = timeseries[timeseries.length - days - 1];

  return this.prettifyValues({
    description: days + ' days ago',
    value: ago ? ago.value : '-',
    change: change(latest, ago)
  });
};

metrics.prototype.weekAgo = function(timeseries, offset) {
  offset = offset || 0;
  var week1Start = moment().startOf('week').subtract(offset, 'week');
  var week1End = week1Start.clone().endOf('week');
  var week2Start = week1Start.clone().subtract(1, 'week');
  var week2End = week1End.clone().subtract(1, 'week');
  var week1 = this.sumDays(timeseries, week1Start, week1End);
  var week2 = this.sumDays(timeseries, week2Start, week2End);
  var weekWord = offset === 1 ? 'week' : 'weeks';

  return this.prettifyValues({
    description: offset === 0 ? 'This Week' : offset + ' ' + weekWord + ' ago',
    value: week1,
    change: change(week1, week2)
  });
};

metrics.prototype.total = function(timeseries) {
  return this.prettifyValues({
    description: 'Total',
    value: _.sum(timeseries, 'value'),
    change: null
  });
};

metrics.prototype.average = function(timeseries) {
  var average = this.total(timeseries).value / timeseries.length;
  average = parseFloat(average.toFixed(2));

  return this.prettifyValues({
    description: 'Average',
    value: average,
    change: null
  });
};

metrics.prototype.max = function(timeseries) {
  return this.prettifyValues({
    description: 'Max',
    value: _.max(timeseries, 'value').value,
    change: null
  });
};

metrics.prototype.min = function(timeseries) {
  return this.prettifyValues({
    description: 'Min',
    value: _.min(timeseries, 'value').value,
    change: null
  });
};

module.exports = metrics;
