const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const { stdin: input, stdout: output } = require('process');
const ac = new AbortController();
const signal = ac.signal;


const ignoreDirs = ['node_modules', '.git', 'assets'];
const ignoreFiles = ['.DS_Store', 'translate.js'];


const regexBase =
  /(?:this\.\$t\(\')([a-zA-Z0-9.\-_]+)(?:\'\))|(?:{{$t\(')([a-zA-Z0-9.\-_]+)(?:'\)}})|(?:\$t\(\n?\s*[`'"]{1}([\s\S]*?)[`'"]{1}\n?\s*\))/g;

const regexNew =
  /(?:this\.\$p\(\')([a-zA-Z0-9.\-_]+)(?:\'\))|(?:{{$p\(')([a-zA-Z0-9.\-_]+)(?:'\)}})|(?:\$p\(\n?\s*[`'"]{1}([\s\S]*?)[`'"]{1}\n?\s*\))/g;

const regexFuc =
  /(?:{{$f\(')([a-zA-Z0-9.\-_]+)(?:'\)}})|(?:\$f\(\n?\s*[`'"]{1}([\s\S]*?)[`'"]{1}\n?\s*\))/g;

const regexTx = /\$p\((['"])(.*?)\1\)/g;

const language = 'en';
const dirPath = './src';
let i18nFilePath = `./src/locales/${language}.json`;

function readDirRecursive(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);

    if (ignoreDirs.includes(file) || ignoreFiles.includes(file)) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      readDirRecursive(filePath, fileList);
    } else if (path.extname(filePath) === '.vue' || path.extname(filePath) === '.ts') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const getReplacement = (str) => Promise.resolve(`$t('${str}')`);
const getBaseReplacement = (str) => Promise.resolve(`'${str}'`);

// i18n
async function extractConversion(fileList) {
  const conversionMap = {};

  for (const fileDir of fileList) {
    const content = fs.readFileSync(fileDir, 'utf8');

    
    let bakContent = {};
    try {
      const res = await doReadExitFile(i18nFilePath);
      bakContent = res ?? {};
    } catch (error) {
      console.log('创建报错了');
      const res = await doReadExitFile(i18nFilePath);
      bakContent = res ?? {};
    }

    const pathName = path
      .dirname(fileDir)
      .replace(/^src[\\/]?/, '') 
      .replace(/^views[\\/]?/, '')
      .replace(/[\\/]/g, '_') 
      .toLocaleLowerCase();

    await replaceContent(fileDir, content, regexFuc, pathName, conversionMap, bakContent);
    // 
    const newContent = fs.readFileSync(fileDir, 'utf8');
    await replaceContent(fileDir, newContent, regexNew, pathName, conversionMap, bakContent);
  }

  return conversionMap;
}

async function replaceContent(fileDir, fileContent, regex, pathName, conversionMap, bakContent) {
  let index = 1;
  const promises = [];
  const key = 'base';
  // 
  fileContent.replace(regex, async (match, p1, p2, p3) => {
    conversionMap[key] = { ...conversionMap[key] } || {};

    // 
    if (conversionMap[key] || bakContent[key]) {
      conversionMap[key] = { ...bakContent[key], ...conversionMap[key] };
      index = Object.keys(conversionMap[key]).length + 1;
    }
    // 
    if (!Object.values(conversionMap[key]).includes(p1 || p2 || p3)) {
      conversionMap[key][index] = p1 || p2 || p3;
    } else {
      // 
      for (const [inx, value] of Object.entries(conversionMap[key])) {
        if ([p1, p2, p3].includes(value)) {
          index = inx;
        }
      }
    }

    if (regex === regexNew) {
      promises.push(getReplacement(`${key}.${index}`));
    } else {
      promises.push(getBaseReplacement(`${key}.${index}`));
    }
  });

  const promiseRes = await Promise.all(promises);
  if (promiseRes.length) {
    console.log('output...[1,2]', promiseRes);
    const output = fileContent.replace(regex, () => promiseRes.shift());
    await writeFileAsync(fileDir, output, 'utf-8');
  }
  return conversionMap[key];
}


function doReadExitFile(path_way) {
  return new Promise((resolve, reject) => {
    fs.access(path_way, async (err) => {
      if (err) {
        await writeFileAsync(path_way, '{}', 'utf-8', (e) => {
          reject(false);
        });
      } else {
        const bakContent_file = fs.readFileSync(path_way, 'utf8');
        const bakContent = JSON.parse(bakContent_file);
        resolve(bakContent);
      }
    });
  });
}

async function writeConversionToFile(conversion, filePath) {
  const curFile = fs.readFileSync(filePath, 'utf8');
  const fileContent = JSON.parse(curFile);
  const data = { ...fileContent, ...conversion };
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData);
}

async function readInpJsonDir() {
  const rl = readline.createInterface({ input, output });
  const timeoutInSeconds = 10;
  setTimeout(() => ac.abort(), timeoutInSeconds * 1000);
  try {
    const lang = await rl.question(
      'What is the language you want to translate? (Default English)',
      { signal }
    );

    if (lang) {
      i18nFilePath = `./src/locales/${lang}.json`;
      console.log(`The generated directory will be ${`./src/locales/${lang}.json`}`);
    }
  } catch (err) {
    let message = 'Error: ';
    if (err.code === 'ABORT_ERR') {
      message = `You took too long. Try again within ${timeoutInSeconds} seconds.`;
    }
  } finally {
    rl.close();
  }

  // listen for close event
  rl.on('close', () => {
    console.log('Start to replace...');

    // exit the process
    process.exit(1);
  });
}

// test
async function main() {
  await readInpJsonDir();

  const fileList = readDirRecursive(dirPath);
  console.log('fileList...', fileList);
  const conversion = await extractConversion(fileList);
  await writeConversionToFile(conversion, i18nFilePath);

  console.log('Done');
}

main();
