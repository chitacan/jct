const _ = require('lodash');
const m = require('moment');
const Issue = require('./issue');
const {pad} = require('../utils');

const DONE = 'done';
const IN_PROGRESS = 'inprogress';
const TODO = 'todo';
const TOTAL = 'total';

const STATUS = [TOTAL, DONE, IN_PROGRESS, TODO];
const TICKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

module.exports = class Summary {
  constructor(props) {
    this._version = props.version;
    this._key = props.key;
    this._description = props.description || '';
    this._issues = props.issues.map((issue) => new Issue(issue));
    this._count = _.chain(this._issues)
      .countBy((issue) => {
        if (issue._statusKey === 'done') {
          return DONE;
        } else if (issue._statusKey === 'indeterminate') {
          return IN_PROGRESS;
        }
        return TODO;
      })
      .assign({total: this._issues.length})
      .value();
    this._ordered = STATUS
      .map((status) => ({status, value: this._count[status] || 0}));
    this._started = props.startDate;
    this._released = props.releaseDate;
  }

  spark() {
    const max = _.maxBy(this._ordered, 'value').value;

    return this._ordered
      .map(({status, value}) => {
        if (!_.isFinite(value)) {
          return {status, tick: ' '};
        }
        let index = Math.ceil((value / max) * TICKS.length) - 1;
        if (max === 0 || index < 0) {
          index = 0;
        }
        return {status, tick: TICKS[index]};
      })
      .map(({status, tick}) => {
        switch (status) {
          case TOTAL:
            return tick.grey;
          case DONE:
            return tick.green;
          case IN_PROGRESS:
            return tick.yellow;
          case TODO:
            return tick.cyan;
          default:
            return tick.white;
        }
      })
      .join('');
  }

  count() {
    return _.map(this._ordered, ({status, value}) => {
      switch (status) {
        case DONE:
          return value.toString().green;
        case IN_PROGRESS:
          return value.toString().yellow;
        case TODO:
          return value.toString().cyan;
        default:
          return value.toString().grey;
      }
    }).join('/'.grey);
  }

  bar() {
    const max = this._count['total'] || 0;
    return [DONE, IN_PROGRESS, TODO]
      .map((status) => {
        const value = this._count[status] || 0;
        const ratio = value / max;
        let index = Math.ceil(ratio * 15);
        if (max === 0 || index < 0) {
          index = 0;
        }
        return {index, status};
      })
      .map(({index, status}, i, arr) => {
        if (status === TODO) {
          const val = arr.slice(0, 2).reduce((p, {index}) => p + index, 0);
          return {bar: pad(15 - val), status};
        }
        return {bar: pad(index), status};
      })
      .map(({bar, status}) => {
        switch (status) {
          case DONE:
            return bar.bgGreen;
          case IN_PROGRESS:
            return bar.bgYellow;
          case TODO:
            return bar.bgCyan;
        }
      })
      .join('');
  }

  desc() {
    return this._description.grey;
  }

  started() {
    return this._started ?
      `${m().diff(m(this._started), 'days')}d`.grey:
      'N/A'.red;
  }

  duration() {
    return this._started && this._released ?
      `${m(this._released).diff(m(this._started), 'days')}d`.grey:
      'N/A'.red;
  }

  oneLiner(summaries) {
    const count = this.count();
    const maxVersionLength = _.chain(summaries)
      .map((summary) => summary._version)
      .maxBy((version) => version.length)
      .value().length;
    const maxCountLength = _.chain(summaries)
      .map((summary) => summary.count())
      .maxBy((version) => version.length)
      .value().length;
    const pad1 = maxVersionLength - this._version.length;
    const pad2 = maxCountLength - count.length;
    return `${this._version.grey} ${pad(pad1)}${this.bar()} ${pad(pad2)}${count} ${this.desc()}`;
  }

  /* eslint max-len: 0 */
  report() {
    let result = [
      `  issues in ${this._key} ${this._version} ${this.spark()} ${this.count()} ${this.started()} ${this.duration()}`,
    ];
    if (this._description) {
      result = result.concat([`  ${this.desc()}`]);
    }
    result = result.concat([
      '',
      ...this._issues.map((issue) => `  ${issue.oneLiner()}`),
    ]);
    return result;
  }

  issues() {
    return this._issues.map((issue) => `  ${issue.oneLiner()}`);
  }
};
