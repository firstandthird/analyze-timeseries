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

  it('should add % change', function() {
    var data = [
      { date: new Date(), value: 100 },
      { date: moment().subtract(1, 'day').toDate(), value: 50 }
    ];

    var out = aT({ values: data });

    expect(out.timeseries.length).to.equal(2);
    expect(out.timeseries[0].change).to.equal('-');
    expect(out.timeseries[1].change).to.equal(1);
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

    it('should have latest day as today if latestToday: true');

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
        //expect(today.prettyValue).to.equal('1');
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
        //expect(today.prettyValue).to.equal('1');
      });

      it('should have latest', function() {

        var data = [{
          date: moment().subtract(1, 'day').toDate(),
          value: 1
        }];

        var out = aT({ values: data });

        var metric = out.metrics.daily.latest;
        expect(metric.description).to.equal('Latest');
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
        expect(metric.change).to.equal(-0.5);
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
        expect(metric.change).to.equal(0);
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
        expect(metric.change).to.equal(0);
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
        var metric = out.metrics.weekly.thisWeek;
        expect(metric.description).to.equal('This Week');
        expect(metric.value).to.equal(2);
        expect(metric.change).to.equal(1);
      });
      it('should have 1 week ago', function() {
        var metric = out.metrics.weekly.weekAgo1;
        expect(metric.description).to.equal('1 week ago');
        expect(metric.value).to.equal(4);
        expect(metric.change).to.equal(0.5);
      });
      it('should have 2 weeks ago', function() {
        var metric = out.metrics.weekly.weekAgo2;
        expect(metric.description).to.equal('2 weeks ago');
        expect(metric.value).to.equal(6);
        expect(metric.change).to.equal(3);
      });
      it('should have 3 weeks ago', function() {
        var metric = out.metrics.weekly.weekAgo3;
        expect(metric.description).to.equal('3 weeks ago');
        expect(metric.value).to.equal(24);
        expect(metric.change).to.equal(-0.5);
      });
    });

    describe('total', function() {
      it('should output the total for a given data', function() {
        var data = [
          { date: new Date(), value: 0 },
          { date: moment().subtract(1, 'day').toDate(), value: 1 },
          { date: moment().subtract(2, 'day').toDate(), value: 2 },
          { date: moment().subtract(3, 'day').toDate(), value: 3 },
          { date: moment().subtract(4, 'day').toDate(), value: 4 }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.overall.total;
        expect(metric.description).to.equal('Total');
        expect(metric.value).to.equal(10);
        expect(metric.change).to.equal(null);
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

        var metric = out.metrics.overall.total;
        expect(metric.description).to.equal('Total');
        expect(metric.value).to.equal(5);
        expect(metric.change).to.equal(null);
      });
    });
    describe('average', function() {
      it('should output the average for given data', function() {
        var data = [
          { date: new Date(), value: 0 },
          { date: moment().subtract(1, 'day').toDate(), value: 1 },
          { date: moment().subtract(2, 'day').toDate(), value: 2 },
          { date: moment().subtract(3, 'day').toDate(), value: 3 },
          { date: moment().subtract(4, 'day').toDate(), value: 4 }
        ];

        var out = aT({ values: data });

        var metric = out.metrics.overall.average;
        expect(metric.description).to.equal('Average');
        expect(metric.value).to.equal(2);
        expect(metric.change).to.equal(null);
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

        var metric = out.metrics.overall.maximum;
        expect(metric.description).to.equal('Max');
        expect(metric.value).to.equal(73);
        expect(metric.change).to.equal(null);
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

        var metric = out.metrics.overall.minimum;

        expect(metric.description).to.equal('Min');
        expect(metric.value).to.equal(3);
        expect(metric.change).to.equal(null);
      });
    });
    describe('aggregates', function() {
      it('should not calculate average nor total if aggregates option is false', function() {
        var data = [
          { date: new Date(), value: 90 },
          { date: moment().subtract(1, 'day').toDate(), value: 80 }
        ];

        var out = aT({ values: data }, { aggregates: false });
        expect(out.metrics.overall.total).to.be.an('undefined');
        expect(out.metrics.overall.average).to.be.an('undefined');
      });
    });
  });

});
