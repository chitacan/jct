require('colors');
const {Observable} = require('rxjs');
const cmd = require('commander');
const show = require('./lib/cmd/show');
const login = require('./lib/cmd/login');
const logout = require('./lib/cmd/logout');
const release = require('./lib/cmd/release');
const releases = require('./lib/cmd/releases');
const {version, description} = require('./package');

cmd.version(version)
  .description(description);

cmd.command('login')
  .description('login')
  .action(() => {
    Observable.of(null)
      .let(login.run)
      .subscribe(login.subscriber);
  });

cmd.command('logout')
  .description('logout')
  .action(() => logout());

cmd.command('show [issue]')
  .alias('s')
  .description('output jira issue')
  .action((issue, options) => {
    Observable.of({issue, options})
      .let(show.run)
      .subscribe(show.subscriber);
  });

cmd.command('release [version]')
  .alias('r')
  .option('-l --latest', 'show latest 5 releaes status')
  .option('-k --key [key]', 'project key')
  .option('-i --identifier [identifier]',
          'next version identifier',
          /^(major|minor|patch)$/i, 'patch')
  .description('output jira release(s)')
  .action((version, options) => {
    if (options.latest) {
      return Observable.of({options})
        .let(releases.run)
        .subscribe(releases.subscriber);
    }
    return Observable.of({version, options})
      .let(release.run)
      .subscribe(release.subscriber);
  });

cmd.command('*').action(() => cmd.help());

cmd.parse(process.argv);

if (!cmd.args.length) cmd.help();
