# remarkable-sudoku
A simple tool to parse [Sudoku](https://www.nytimes.com/puzzles/sudoku/easy) from [New York Times](https://www.nytimes.com/) and 
upload to [Remarkable tablet](https://remarkable.com/).

## Dependencies
Parsing and generating the Sudoku board is implemented with [puppeteer](https://github.com/puppeteer/puppeteer). Communication with ReMarkable is done through
[remarkable-typescript](https://github.com/Ogdentrod/reMarkable-typescript).

## Registering your Client
Before you can upload to your reMarkable, first, you would need to register your client. In order to do so, first, visit 
[reMarkable's page to connect new device](https://my.remarkable.com/connect/remarkable), and generate a code to pair your
client.
Then post it to the end point `/remarkable/register`
```
$ curl -d "token=GENERATED_TOKEN" http://yourhost.com/remarkable/register
```
And it would connect your client, generate device token, and store it in postgres.

## Setup in Heroku

### Database
Enable a postgres instance for your app. Run scripts in [sql/](https://github.com/sidky/remarkable-sudoku/tree/master/sql) directory.
This needs two tables, `remarkable_config` to store the device id, and `sudoku_hash` to keep track of hashcode of all sudoku tables
generated.

### Buildpacks
Heroku can detect this is a node.js application. However, [default dynos don't have dependencies required for puppeteer](https://github.com/puppeteer/puppeteer/issues/758).
To fix that, you would need to add an additional buildpack.
```
$ heroku buildpacks:add jontewks/puppeteer
```

### Scheduler
To have it schedule to populate fresh copies of sudoko, delivered to your tablet, attach a heroku scheduler, and schedule to run
```
node tools/updateSudoku.js 
```
