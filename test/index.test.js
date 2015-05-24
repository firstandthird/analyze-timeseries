/* global describe, it */
var aT = require('../');
var chai = require('chai');
var expect = chai.expect;
var moment = require('moment');

describe('analyzeTimeseries', function() {

  it('should have a timeseries and metrics object', function() {

    var data = [
      { date: new Date(), value: 1 }
    ];

    var out = aT({ values: data });

    expect(out.timeseries).to.be.instanceof(Array);
    expect(out.metrics).to.be.an('object');

  });

  it('should strip time and use timestamp', function() {

    var data = [
      { date: new Date(), value: 1 }
    ];

    var out = aT({ values: data });

    expect(out.timeseries.length).to.equal(1);
    expect(out.timeseries[0].date).to.equal(parseInt(moment().startOf('day').format('x'), 10));

  });

  it('should group by days', function() {

    var data = [
      { date: new Date(), value: 1 },
      { date: new Date(), value: 2 }
    ];

    var out = aT({ values: data });

    expect(out.timeseries.length).to.equal(1);
    expect(out.timeseries[0].value).to.equal(3);
    expect(out.timeseries[0].date).to.equal(parseInt(moment().startOf('day').format('x'), 10));

  });

  it('should sort dates oldest to newest', function() {

    var data = [
      { date: new Date(), value: 1 },
      { date: moment().subtract(1, 'day').toDate(), value: 2 }
    ];

    var out = aT({ values: data });

    expect(out.timeseries.length).to.equal(2);
    expect(out.timeseries[0].value).to.equal(2);
    expect(out.timeseries[1].value).to.equal(1);

  });

  it('should auto fill 0s in place of empty data', function() {

    var data = [
      { date: new Date(), value: 1 },
      { date: moment().subtract(2, 'day').toDate(), value: 2 }
    ];

    var out = aT({ values: data });

    expect(out.timeseries.length).to.equal(3);
    expect(out.timeseries[0].value).to.equal(2);
    expect(out.timeseries[1].value).to.equal(0);
    expect(out.timeseries[2].value).to.equal(1);

  });

  it.skip('should add % change', function() {
    var data = [
      { date: new Date(), value: 100 },
      { date: moment().subtract(1, 'day').toDate(), value: 50 }
    ];

    var out = aT({ values: data });

    expect(out.timeseries.length).to.equal(2);
    expect(out.timeseries[0].change).to.equal('-');
    expect(out.timeseries[1].change).to.equal(-1);
  });

  describe('options', function() {

    it('should backfill for all days requested', function() {

      var data = [{
        date: new Date(),
        value: 1
      }];

      var out = aT({ values: data }, { days: 5 });

      expect(out.timeseries.length).to.equal(5);
      expect(out.timeseries[0].value).to.equal(0);
      expect(out.timeseries[4].value).to.equal(1);

    });

    it('should backfill starting at latest day', function() {

      var data = [{
        date: moment().subtract(1, 'day').toDate(),
        value: 1
      }];

      var out = aT({ values: data }, { days: 5 });

      expect(out.timeseries.length).to.equal(5);
      expect(out.timeseries[0].value).to.equal(0);
      expect(out.timeseries[4].value).to.equal(1);
      expect(out.timeseries[4].date).to.equal(parseInt(moment().startOf('day').subtract(1, 'day').format('x'), 10));

    });

    it('should have latest day as today if latestToday: true', function() {
      var data = [{
        date: moment().subtract(30, 'day').toDate(),
        value: 1
      }];

      var out = aT({ values: data }, { latestToday: true });

      expect(out.timeseries.length).to.equal(31);
      expect(out.timeseries[30].date).to.equal(parseInt(moment().startOf('day').format('x'), 10));
    });

    describe.skip('aggregates', function() {
      it('should not calculate average nor total if aggregates option is false', function() {
        var data = [
          { date: new Date(), value: 90 },
          { date: moment().subtract(1, 'day').toDate(), value: 80 }
        ];

        var out = aT({ values: data }, { aggregates: false });
        expect(out.metrics.aggregates.total).to.be.an('undefined');
        expect(out.metrics.aggregates.average).to.be.an('undefined');
      });

      it('should not calculate weekly data if aggregates option is false', function() {
        var data = [
          { date: new Date(), value: 90 },
          { date: moment().subtract(1, 'day').toDate(), value: 80 }
        ];

        var out = aT({ values: data }, { aggregates: false });
        expect(out.metrics.aggregates).to.equal(undefined);
        expect(out.metrics.aggregates).to.equal(null);
      });
    });
    describe('ranking', function() {
      var data, out;

      before(function() {
        data = [
          { value: 433, date: '2015-03-30' },
          { value: 520, date: '2015-03-31' },
          { value: 195, date: '2015-04-08' },
          { value: 346, date: '2015-04-09' },
          { value: 515, date: '2015-04-11' },
          { value: 418, date: '2015-04-10' }
        ];

        out = aT({ values: data }, { ranking: true });
      });

      it('should reverse the values', function() {
        expect(out.timeseries[0].value).to.equal(-433);
      });

      it('should fill empty dates with null', function() {
        expect(out.timeseries[2].value).to.equal(null);
      });

      it.skip('should not aggregate data', function() {
        expect(out.metrics.aggregates.last30days).to.be.an('undefined');
        expect(out.metrics.aggregates.average).to.be.an('undefined');
        expect(out.metrics.aggregates).to.equal(null);
        expect(out.metrics.aggregates).to.equal(null);
      });
    });
  });

  describe('metrics', function() {
    describe('daily', function() {

      it('should have today', function() {

        var data = [{
          date: new Date(),
          value: 1
        }];

        var out = aT({ values: data });

        var today = out.metrics.daily.today;
        expect(today.description).to.equal('Today');
        expect(today.value).to.equal(1);
      });

      it('should have - for today if no value', function() {

        var data = [{
          date: moment().subtract(1, 'day').toDate(),
          value: 1
        }];

        var out = aT({ values: data });

        var today = out.metrics.daily.today;
        expect(today.description).to.equal('Today');
        expect(today.value).to.equal('-');
      });

      it('should have yesterday', function() {
        var data = [
          { date: new Date(), value: 1 },
          { date: moment().subtract(1, 'day').toDate(), value: 2 },
          { date: moment().subtract(2, 'day').toDate(), value: 3 }
        ];

        var out = aT({ values: data });

        var yesterday = out.metrics.daily.yesterday;
        expect(yesterday.description).to.equal('Yesterday');
        expect(yesterday.value).to.equal(2);
      });

      it('should have day before', function() {
        var data = [
          { date: new Date(), value: 1 },
          { date: moment().subtract(1, 'day').toDate(), value: 2 },
          { date: moment().subtract(2, 'day').toDate(), value: 3 }
        ];

        var out = aT({ values: data });

        var dayBefore = out.metrics.daily.dayBefore;
        expect(dayBefore.description).to.equal('Yesterday');
        expect(dayBefore.value).to.equal(2);
      });

      it('should have latest', function() {

        var data = [{
          date: moment().subtract(1, 'day').toDate(),
          value: 1
        }];

        var out = aT({ values: data });

        var metric = out.metrics.daily.latest;
        expect(metric.description).to.equal('Yesterday');
        expect(metric.value).to.equal(1);
        expect(metric.change).to.equal('-');
        //expect(today.prettyValue).to.equal('1');
      });

      it('should have daysAgo7', function() {

        var data = [
          { date: new Date(), value: 100 },
          { date: moment().subtract(1, 'days').toDate(), value: 25 },
          { date: moment().subtract(7, 'days').toDate(), value: 50 }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.daily.daysAgo7;
        expect(metric.description).to.equal('7 days ago');
        expect(metric.value).to.equal(50);
      });

      it('should have daysAgo14', function() {

        var data = [
          { date: new Date(), value: 100 },
          { date: moment().subtract(1, 'days').toDate(), value: 25 },
          { date: moment().subtract(14, 'days').toDate(), value: 100 }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.daily.daysAgo14;
        expect(metric.description).to.equal('14 days ago');
        expect(metric.value).to.equal(100);
      });

      it('should have daysAgo21', function() {

        var data = [
          { date: new Date(), value: 100 },
          { date: moment().subtract(1, 'days').toDate(), value: 25 },
          { date: moment().subtract(21, 'days').toDate(), value: 100 }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.daily.daysAgo21;
        expect(metric.description).to.equal('21 days ago');
        expect(metric.value).to.equal(100);
      });
    });

    describe('week', function() {
      var data, out;

      before(function() {
        data = [
          { date: new Date(), value: 2 },
          { date: moment().subtract(1, 'week').toDate(), value: 4 },
          { date: moment().subtract(2, 'week').toDate(), value: 6 },
          { date: moment().subtract(3, 'week').toDate(), value: 24 },
          { date: moment().subtract(4, 'week').toDate(), value: 12 }
        ];

        out = aT({ values: data });
      });

      it('should have thisWeek', function() {
        var metric = out.metrics.aggregates.week;
        expect(metric.description).to.equal('This week');
        expect(metric.value).to.equal(2);
        expect(metric.change).to.equal(-1);
      });
      it('should have 1 week ago', function() {
        var metric = out.metrics.aggregates.weekAgo1;
        expect(metric.description).to.equal('1 week ago');
        expect(metric.value).to.equal(4);
        expect(metric.change).to.equal(-0.5);
      });
      it('should have 2 weeks ago', function() {
        var metric = out.metrics.aggregates.weekAgo2;
        expect(metric.description).to.equal('2 weeks ago');
        expect(metric.value).to.equal(6);
        expect(metric.change).to.equal(-3);
      });
      it('should have 3 weeks ago', function() {
        var metric = out.metrics.aggregates.weekAgo3;
        expect(metric.description).to.equal('3 weeks ago');
        expect(metric.value).to.equal(24);
        expect(metric.change).to.equal(0.5);
      });
    });

    describe('last30days', function() {
      it('should output the last 30 days for a given data', function() {
        var data = [
          { date: new Date(), value: 0 },
          { date: moment().subtract(1, 'day').toDate(), value: 1 },
          { date: moment().subtract(2, 'day').toDate(), value: 2 },
          { date: moment().subtract(3, 'day').toDate(), value: 3 },
          { date: moment().subtract(4, 'day').toDate(), value: 4 }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.aggregates.last30days;
        expect(metric.description).to.equal('Last 30 days');
        expect(metric.value).to.equal(10);
      });
      it('should ignore non numeric values', function() {
        var data = [
          { date: new Date(), value: 5 },
          { date: moment().subtract(1, 'day').toDate(), value: 'a' },
          { date: moment().subtract(2, 'day').toDate(), value: NaN },
          { date: moment().subtract(3, 'day').toDate(), value: null },
          { date: moment().subtract(4, 'day').toDate(), value: undefined }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.aggregates.last30days;
        expect(metric.description).to.equal('Last 30 days');
        expect(metric.value).to.equal(5);
      });
    });
    describe('max', function() {
      it('should output the max for given data', function() {
        var data = [
          { date: new Date(), value: 0 },
          { date: moment().subtract(1, 'day').toDate(), value: 1 },
          { date: moment().subtract(2, 'day').toDate(), value: 2 },
          { date: moment().subtract(3, 'day').toDate(), value: 3 },
          { date: moment().subtract(4, 'day').toDate(), value: 73 }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.aggregates.maximum;
        expect(metric.description).to.equal('Maximum');
        expect(metric.value).to.equal(73);
      });
    });
    describe('average', function() {
      it('should output the average for given data', function() {
        var data = [
          { date: new Date(), value: 90 },
          { date: moment().subtract(1, 'day').toDate(), value: 80 },
          { date: moment().subtract(2, 'day').toDate(), value: 25 },
          { date: moment().subtract(3, 'day').toDate(), value: 3 },
          { date: moment().subtract(4, 'day').toDate(), value: 44 }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.aggregates.minimum;

        expect(metric.description).to.equal('Minimum');
        expect(metric.value).to.equal(3);
      });
    });

    describe('Format', function() {
      it('should output values and change with a pretty value', function() {
        var data = [
          { date: new Date(), value: 9000.125 },
          { date: moment().subtract(1, 'day').toDate(), value: 27000.50606 }
        ];

        var out = aT({ values: data });

        var today = out.metrics.daily.today;
        expect(today.prettyValue).to.equal('9,000');
        expect(today.prettyChange).to.equal('-200');
      });
      it('should be possible to alter the format with an option', function() {
        var data = [
          { date: new Date(), value: 9000.125 },
          { date: moment().subtract(1, 'day').toDate(), value: 27000.50606 }
        ];

        var out = aT({ values: data }, { format: '0,0.00' });

        var today = out.metrics.daily.today;
        expect(today.prettyValue).to.equal('9,000.13');
        expect(today.prettyChange).to.equal('-200');
      });
    });
  });

});
