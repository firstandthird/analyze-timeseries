var moment = require('moment');
var _ = require('lodash');

var prepareReturn = function(description, item) {

  if (!item) {
    return {
      description: description,
      value: '-',
      prettyValue: '-',
      change: '-'
    };
  }

  item = _.clone(item);
  item.description = description;
  return item;

};

var change = function(v1, v2) {
  if (typeof v1 == 'undefined' || typeof v2 == 'undefined') {
    return '-';
  }
  v1 = typeof v1 === 'number' ? v1 : v1.value;
  v2 = typeof v2 === 'number' ? v2 : v2.value;
  if (v1 == v2) {
    return 0;
  }
  return ((v2 - v1) / v1 * 100) / 100;
};

var sumDays = function(timeseries, dayStart, dayEnd) {
  var sum = 0;
  var i = dayStart;
  var day;

  while (i <= dayEnd) {
    day = timeseries[i];
    if (day && _.isNumber(timeseries[i].value) && !_.isNaN(timeseries[i].value)) {
      sum += timeseries[i].value;
    }

    i++;
  }

  return sum;
};

exports.today = function(timeseries) {

  var timestamp = parseInt(moment().startOf('day').format('x'), 10);

  var todayIndex = _.findIndex(timeseries, { date: timestamp });

  if (todayIndex != -1) {
    var today = timeseries[todayIndex];
    var yesterday = timeseries[todayIndex - 1];
    return {
      description: 'Today',
      value: today.value,
      change: change(today, yesterday)
    };
  }
  return {
    description: 'Today',
    value: '-',
    change: '-'
  };
};

exports.latest = function(timeseries) {
  return prepareReturn('Latest', timeseries[timeseries.length - 1]);
};

exports.daysAgo = function(timeseries, days) {
  var latest = timeseries[timeseries.length - 1];
  var ago = timeseries[timeseries.length - days - 1];

  return {
    description: days + ' days ago',
    value: ago ? ago.value : '-',
    change: change(latest, ago)
  };
};

exports.weekAgo = function(timeseries, offset) {
  offset = offset || 0;
  var startOfDay = moment().startOf('day');
  var week1Start = offset ? startOfDay.diff(
    moment().endOf('week').subtract(offset, 'week').startOf('day'),
    'days'
  ) : 0;
  var week1End = offset ? startOfDay.diff(
    moment().startOf('week').subtract(offset, 'week'),
    'days'
  ) : 0;
  var week2Start = week1End + 1;
  var week2End = week2Start + 6;
  var week1 = sumDays(timeseries, week1Start, week1End);
  var week2 = sumDays(timeseries, week2Start, week2End);

  return {
    description: offset === 0 ? 'This Week' : offset + ' weeks ago',
    value: week1,
    change: change(week1, week2)
  };
};

exports.total = function(timeseries) {
  return {
    description: 'Total',
    value: _.sum(timeseries, 'value'),
    change: null
  };
};

exports.average = function(timeseries) {
  var average = exports.total(timeseries).value / timeseries.length;
  average = parseFloat(average.toFixed(2));

  return {
    description: 'Average',
    value: average,
    change: null
  };
};

exports.max = function(timeseries) {
  return {
    description: 'Max',
    value: _.max(timeseries, 'value').value,
    change: null
  };
};

exports.min = function(timeseries) {
  return {
    description: 'Min',
    value: _.min(timeseries, 'value').value,
    change: null
  };
};
