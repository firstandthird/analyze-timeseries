var _ = require('lodash');

module.exports = function(data, options, moment) {
  options = options || {};

  //strip time
  var timeseries = _.map(data.values, function(val) {
    val.date = moment(val.date).startOf('day').format('x');
    return val;
  });

  //group by date and sum
  timeseries = _.reduce(timeseries, function(result, n) {
    if (!result[n.date]) {
      result[n.date] = 0;
    }
    result[n.date] += n.value;
    return result;
  }, {});

  var maxDate = parseInt(_.max(_.keys(timeseries)), 10);
  var latest = new Date(maxDate);
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

    return {
      date: parseInt(date, 10),
      value: value
    };
  }));

  timeseries = _.sortBy(timeseries, 'date');

  //calculate % change
  for (var pi = timeseries.length - 1; pi >= 0; pi--) {
    if (pi === 0) {
      timeseries[pi].change = '-';
      continue;
    }
    var v2 = timeseries[pi].value;
    var v1 = timeseries[pi - 1].value;

    if (_.isNumber(v2) && _.isNumber(v1)) {
      if (v1 == v2) {
        timeseries[pi].change = 0;
      } else {
        timeseries[pi].change = ((v2 - v1) / v1 * 100) / 100;
      }
    } else {
      timeseries[pi].change = '-';
    }
  }

  return timeseries;
};
