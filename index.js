#! /usr/bin/env node
import chalk from 'chalk';
import barChart from 'bar-charts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

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

async function writeData(description, points, tag) {
  await loadConfig();
  return new Promise((resolve) => {
    fs.writeFile(
      getDataFolder(),
      `${uuidv4().substring(0, 4)},${moment(new Date()).format(
        'DD/MM/YYYY',
      )},${description},${points},${tag}\r\n`,
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
        const id = line.split(',')[0];
        const date = line.split(',')[1];
        const desc = line.split(',')[2];
        const points = parseInt(line.split(',')[3], 10);
        const tag = line.split(',')[4];

        if (id.length > 0) {
          items.push({
            id,
            date,
            desc,
            points,
            tag,
          });
        }
      });
      return resolve(items);
    });
  });
}

async function printSummary(argv) {
  const detailed = argv.d || argv.D;
  const showId = argv.D;
  await loadConfig();
  const data = await readCsv();

  if (detailed) {
    data.forEach((item) => {
      const idLabel = showId ? `${chalk.red(item.id)} - ` : '';
      console.log(
        `${idLabel}${chalk.blue(item.date)}  ${chalk.yellow(
          item.points,
        )} ${chalk.magenta(item.tag)} ${chalk.green(item.desc)}`,
      );
    });
  } else {
    const map = new Map();
    data.forEach((item) => {
      map.set(item.tag, (map.get(item.tag) ?? 0) + item.points);
    });

    const finalSummary = [];

    map.forEach((value, key) => {
      finalSummary.push({ label: key, count: value });
    });

    finalSummary.sort((a, b) => b.count - a.count);
    console.log(chalk.green(barChart(finalSummary)));
  }
}

async function removeItem(id) {
  await loadConfig();
  const data = await readCsv();

  const newList = data.filter((x) => x.id.toString() !== id.toString());
  let newFile = '';

  newList.forEach((item) => {
    newFile += `${item.id},${item.date},${item.desc},${item.points},${item.tag}\r\n`;
  });

  return new Promise((resolve) => {
    fs.writeFile(getDataFolder(), newFile, {}, (err) => {
      if (err) return console.log(err);
      console.log(chalk.green('Item removed! ') + chalk.magenta('﯊'));
      resolve();
      return null;
    });
  });
}

const addCommand = {
  command: 'add',
  describe: 'Add thing done',
  builder: {
    description: {
      type: 'string',
      alias: 'd',
      demandOption: true,
      describe: 'Task description',
    },
    points: {
      type: 'number',
      alias: 'p',
      describe: 'Task points',
      demandOption: true,
    },
    tag: {
      type: 'string',
      alias: 't',
      describe: 'Task tag',
      demandOption: true,
    },
  },
  handler: async (argv) => {
    await writeData(argv.description, argv.points, argv.tag);
  },
};

const listCommand = {
  command: 'list',
  desc: 'List all tasks done',
  handler: (argv) => {
    printSummary(argv);
  },
  builder: (y) => y
    .option('details', {
      alias: 'd',
      desc: 'List all tasks details',
      type: 'boolean',
    })
    .option('all-details', {
      alias: 'D',
      desc: 'List all tasks details',
      type: 'boolean',
    }),
};

const removeCommand = {
  command: 'remove',
  desc: 'Remove item',
  builder: {
    id: {
      type: 'string',
      demandOption: true,
      describe: 'Task id',
    },
  },
  handler: async (argv) => {
    await removeItem(argv.id);
  },
};

yargs(hideBin(process.argv))
  .command(addCommand)
  .command(listCommand)
  .command(removeCommand)
  .wrap(null)
  .parse();
