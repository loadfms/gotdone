#! /usr/bin/env node
import chalk from 'chalk';
import barChart from 'bar-charts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import moment from 'moment';

function getUserRootFolder() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function getConfigFolder() {
  return `${getUserRootFolder()}/.config/gotdone/config`;
}

let dataPath = `${getUserRootFolder()}`;

function getDataFolder() {
  return `${dataPath}/data`;
}

function loadConfig() {
  return new Promise((resolve) => {
    const items = [];
    fs.readFile(getConfigFolder(), 'utf-8', (err, data) => {
      if (err) {
        return resolve(items);
      }

      data.split('\r\n').forEach((line) => {
        if (line.indexOf('data_path') > -1) {
          dataPath = line.split('=')[1].trim();
        }
      });

      return resolve();
    });
  });
}

async function writeData(description) {
  await loadConfig();
  return new Promise((resolve) => {
    fs.writeFile(
      getDataFolder(),
      `${moment(new Date()).format('DD/MM/YYYY')},${description}\r\n`,
      { flag: 'a+' },
      (err) => {
        if (err) return console.log(err);
        console.log(
          chalk.green('Awesome! Grab a cup of ') + chalk.magenta(''),
        );
        resolve();
        return null;
      },
    );
  });
}

function readCsv() {
  return new Promise((resolve) => {
    const items = [];
    fs.readFile(getDataFolder(), 'utf8', (err, data) => {
      if (err) {
        return resolve(items);
      }
      data.split('\r\n').forEach((line) => {
        const date = line.split(',')[0];
        const desc = line.split(',')[1];

        if (date.length > 0) {
          items.push({ date, desc });
        }
      });
      return resolve(items);
    });
  });
}

async function printSummary(detailed) {
  await loadConfig();
  const data = await readCsv();
  if (detailed) {
    data.forEach((item) => {
      console.log(`${chalk.blue(item.date)}  ${chalk.green(item.desc)}`);
    });
  } else {
    const map = new Map();
    data.forEach((item) => {
      const count = map.get(item.date) ?? 0;
      map.set(item.date, count + 1);
    });

    const finalSummary = [];

    map.forEach((value, key) => {
      finalSummary.push({ label: key, count: value });
    });

    console.log(chalk.green(barChart(finalSummary)));
  }
}

yargs(hideBin(process.argv))
  .command(
    'add [description]',
    'add thing done',
    (e) => e.positional('description', {
      describe: 'thing description',
    }),
    async (argv) => {
      await writeData(argv.description);
    },
  )
  .command(
    'summary',
    'display a chart to show your progress',
    (e) => e,
    () => {
      printSummary(false);
    },
  )
  .command(
    'list',
    'list all tasks done',
    (e) => e,
    () => {
      printSummary(true);
    },
  )
  .version(false)
  .parse();
