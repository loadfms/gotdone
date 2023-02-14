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

function createDir(path) {
  fs.access(path, (error) => {
    if (error) {
      fs.mkdir(path, (error) => {
        if (error) {
          console.error(error);
        }
      });
    }
  });
}

let dataPath = `${getUserRootFolder()}/.config/gotdone`;
createDir(`${getUserRootFolder()}/.config`);
createDir(dataPath);

function getConfigPath() {
  const path = `${dataPath}/config`;
  createDir(path);
  return `${path}`;
}

function getDataPath() {
  const path = `${dataPath}/data`;
  createDir(path);
  return `${path}`;
}

function loadConfig() {
  return new Promise((resolve) => {
    const items = [];
    fs.readFile(getConfigPath(), 'utf-8', (err, data) => {
      if (err) {
        return resolve(items);
      }

      data.split('\r\n').forEach((line) => {
        if (line.indexOf('data_path') > -1) {
          dataPath = line.split('=')[1].trim();
          dataPath = dataPath.replace('$HOME', getUserRootFolder());
        }
      });

      return resolve();
    });
  });
}

async function writeData(description, points, tag, done) {
  await loadConfig();
  return new Promise((resolve) => {
    fs.writeFile(
      getDataPath(),
      `${uuidv4().substring(0, 4)},${moment(new Date()).format(
        'DD/MM/YYYY',
      )},${description},${points},${tag},${done}\r\n`,
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
    fs.readFile(getDataPath(), 'utf8', (err, data) => {
      if (err) {
        return resolve(items);
      }
      data.split('\r\n').forEach((line) => {
        const id = line.split(',')[0];
        const date = line.split(',')[1];
        const desc = line.split(',')[2];
        const points = parseInt(line.split(',')[3], 10);
        const tag = line.split(',')[4];
        const done = line.split(',')[5] === 'true';

        if (id.length > 0) {
          items.push({
            id,
            date,
            desc,
            points,
            tag,
            done,
          });
        }
      });
      return resolve(items);
    });
  });
}

async function printSummary(argv) {
  const onlyUncompleted = argv.u;
  const detailed = argv.d || argv.D;
  const showId = argv.D;
  await loadConfig();
  const data = await readCsv();
  const title = onlyUncompleted ? "Todo items" : "Done items";

  console.clear()
  console.log(`${chalk.red("------------------")}`)
  console.log(`${chalk.red("--")}  ${chalk.magenta(title)}  ${chalk.red("--")} `)
  console.log(`${chalk.red("------------------")}`)

  if (detailed) {
    data.forEach((item) => {
      if (item.done == !onlyUncompleted) {
        const idLabel = showId ? `${chalk.red(item.id)} - ` : '';
        console.log(
          `${idLabel}${chalk.blue(item.date)}  ${chalk.yellow(
            item.points,
          )} ${chalk.magenta(item.tag)} ${chalk.green(item.desc)}`,
        );
      }
    });
  } else {
    const map = new Map();
    data.forEach((item) => {
      if (item.done == !onlyUncompleted) {
        map.set(item.tag, (map.get(item.tag) ?? 0) + item.points);
      }
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
    newFile += `${item.id},${item.date},${item.desc},${item.points},${item.tag},${item.done}\r\n`;
  });

  return new Promise((resolve) => {
    fs.writeFile(getDataPath(), newFile, {}, (err) => {
      if (err) return console.log(err);
      console.log(chalk.green('Item removed! ') + chalk.magenta('﯊'));
      resolve();
      return null;
    });
  });
}

async function completeItem(id) {
  await loadConfig();
  const data = await readCsv();
  let newFile = '';

  for (let i = 0; i < data.length; i++) {
    if (data[i].id.toString() === id) {
      console.log(data[i].done = true)
    }
  }

  data.forEach((item) => {
    newFile += `${item.id},${item.date},${item.desc},${item.points},${item.tag},${item.done}\r\n`;
  });

  return new Promise((resolve) => {
    fs.writeFile(getDataPath(), newFile, {}, (err) => {
      if (err) return console.log(err);
      console.log(chalk.green('Item completed! ') + chalk.magenta('🎉'));
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
    completed: {
      type: 'boolean',
      alias: 'c',
      describe: 'Task completed',
      demandOption: true,
      default: true,
    },
  },
  handler: async (argv) => {
    await writeData(argv.description, argv.points, argv.tag, argv.completed);
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
    })
    .option('uncompleted', {
      alias: 'u',
      desc: 'List all uncompleted tasks',
      type: 'boolean',
      default: false
    })
};

const completeCommand = {
  command: 'complete',
  desc: 'Complete item',
  builder: {
    id: {
      type: 'string',
      demandOption: true,
      describe: 'Task id',
    },
  },
  handler: async (argv) => {
    await completeItem(argv.id);
  },
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
  .command(completeCommand)
  .wrap(null)
  .parse();
