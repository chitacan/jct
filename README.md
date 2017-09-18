# jct

useful **j**ira **c**li **t**ools based on [jira api](https://docs.atlassian.com/jira/REST/cloud/).

## install

```
$ npm install -g jct
```

## commands

### login

### logout

### show

output jira issue. without issue id, `jct` will resolve it with **current working directory** or **branch**.
if `jct` cannot resolve issue id, output recently viewed 5 issues.

```shell
$ jct show YOUR-100
# jct will print issue 'YOUR-100'
```

```shell
$ pwd
.../YOUR-101
$ jct show
# jct will print issue 'YOUR-101'
```

```shell
$ git branch
* YOUR-102
$ jct show
# jct will print issue 'YOUR-102'
```

### release

output jira release(s). without version, `jct` will resolve it with latest git **tag**.

```shell
$ jct release 1.0.0
# jct will print '1.0.0' info
```

```shell
$ git tag
v1.0.0
$ jct release
# jct will print '1.1.0' info
```

## see how it works

![demo](https://raw.githubusercontent.com/chitacan/jct/master/img/demo.gif)

## License

MIT © Kyungyeol Kim
