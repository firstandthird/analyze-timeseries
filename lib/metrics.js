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

  //TODO
  var week1 = 0;
  var week2 = 0;
  return {
    description: offset === 0 ? 'This Week' : offset + ' weeks ago',
    value: week1,
    change: change(week1, week2)
  };
};
