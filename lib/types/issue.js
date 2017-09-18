const {EOL} = require('os');
const {resolve} = require('url');
const {multiByteSlice} = require('../utils');

module.exports = class Issue {
  constructor({key, fields, ghURL, jiraURL = ''}) {
    const {
      issuetype, priority, status, summary, creator, assignee, resolution,
    } = fields;
    this._key = key;
    this._summary = summary;
    this._issueType = issuetype.name;
    this._priority = priority.name;
    this._status = status.name;
    this._statusKey = status.statusCategory.key;
    this._creator = creator ? creator.name : '';
    this._assignee = assignee ? assignee.name : '';
    this._resolution = resolution ? resolution.name : '';
    this._ghURL = ghURL;
    this._jiraURL = resolve(jiraURL, `browse/${key}`);
  }

  priority() {
    switch (this._priority) {
      case 'Highest':
        return '▲'.bold.red;
      case 'High':
        return '▲'.bold.magenta;
      case 'Medium':
        return '-'.bold.yellow;
      case 'Low':
        return '▼'.bold.cyan;
      case 'Lowest':
        return '▼'.bold.green;
      default:
        return 'X'.bold.grey;
    }
  }

  issueType() {
    switch (this._issueType) {
      case 'Task':
        return 'T'.bold.cyan;
      case 'Sub-task':
        return 'T'.bold.underline.cyan;
      case 'Epic':
        return 'E'.bold.magenta;
      case 'Story':
        return 'S'.bold.green;
      case 'Bug':
        return 'B'.bold.red;
      default:
        return 'X'.bold.grey;
    }
  }

  status(short = false) {
    const status = short ? this._status.slice(0, 1) : this._status;
    switch (this._status) {
      case 'Backlog':
      case 'To Do':
        return status.grey.bgWhite;
      case 'In Progress':
      case 'In Review':
        return status.grey.bgYellow;
      case 'Done':
        return status.grey.bgGreen;
      default:
        return '-';
    }
  }

  creator() {
    return this._creator.grey;
  }

  assignee() {
    return this._assignee.white;
  }

  key() {
    return this._key.green;
  }

  /* eslint max-len: 0 */
  title() {
    return `${this.issueType()} ${this.key()} ${this.priority()} ${this.status()} ${this.creator()} ${this.assignee()}`;
  }

  summary() {
    if (this._status === 'Done') {
      return this._summary.grey;
    }
    return this._summary;
  }

  links() {
    if (this._ghURL) {
      return `${this._ghURL}${this._key}${EOL}  ${this._jiraURL}`.grey;
    }
    return `${this._jiraURL}`.grey;
  }

  oneLiner() {
    const key = this._key.length >= 8 ?
      this._key.green :
      this._key.green + new Array(8 - this._key.length).join(' ');
    const summary = this._summary.length >= 30 ?
      multiByteSlice(this._summary, 60) :
      this._summary;
    return `${this.issueType()} ${key} ${this.priority()} ${this.status(true)} ${summary}`;
  }
};
