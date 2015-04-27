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
  if (_.isUndefined(v1) || _.isUndefined(v2)) {
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
  var i = 0;
  var day = moment(timeseries[0].date);

  while (day && day.isBefore(dayEnd)) {
    if (day.isBetween(dayStart, dayEnd)) {
      if (_.isNumber(timeseries[i].value) && !_.isNaN(timeseries[i].value)) {
        sum += timeseries[i].value;
      }
    }

    i++;
    day = timeseries[i] ? moment(timeseries[i].date) : null;
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
  var week1Start = moment().startOf('week').subtract(offset, 'week');
  var week1End = week1Start.clone().endOf('week');

  week1Start.subtract(1, 'second');
  week1End.add(1, 'second');

  var week2Start = week1Start.clone().subtract(1, 'week');
  var week2End = week1End.clone().subtract(1, 'week');
  var week1 = sumDays(timeseries, week1Start, week1End);
  var week2 = sumDays(timeseries, week2Start, week2End);
  var weekWord = offset === 1 ? 'week' : 'weeks';

  return {
    description: offset === 0 ? 'This Week' : offset + ' ' + weekWord + ' ago',
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
