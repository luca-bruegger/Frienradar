#!/usr/bin/env node
const fs = require('fs');
require('dotenv').config();

const projectId = FRIENRADAR_PROJECT_ID;

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;

// Instantiates a client
const translates = new Translate({projectId});
translates.key = process.env.TRANSLATE_KEY;

async function quickStart() {
  // The text to translate
  const text = 'Hello, world!';

  // The target language
  const target = 'ru';

  // Translates some text into Russian
  const [translation] = await translates.translate(text, target);
  console.log(`Text: ${text}`);
  console.log(`Translation: ${translation}`);
}

const i18Dir = './src/assets/i18n';
const defaultSourceLang = 'en';
const codes = {
  Italian: 'it',
  English: 'en',
  French: 'fr',
  German: 'de',
  Danish: 'da',
  Polish: 'pl',
  Dutch: 'nl',
  Japanese: 'ja',
  Korean: 'ko',
  Spanish: 'es'
};

let createLocalFiles = () => {
  Object.values(codes).forEach((local) => {
    if (local === defaultSourceLang) return;
    const p = `./src/assets/i18n/${local}.json`;
    if (fs.existsSync(p)) {
      console.log('exists ' + p);
    } else {
      fs.writeFileSync(p, '', {encoding: 'utf8', flag: 'w'});
    }
  });
};

//createLocalFiles();

let sourceFile = (local) => {
  try {
    return JSON.parse(fs.readFileSync(`./src/assets/i18n/${local}.json`, 'utf8'));
  } catch (e) {
    return null;
  }

};

let getLocals = () => {
  return new Promise((resolve, reject) => {
    const locals = [];
    fs.readdir(i18Dir, (err, files) => {
      files.forEach(file => {
        if (file === `${defaultSourceLang}.json`) return;
        file = file.replace(/\.json/, '');
        locals.push(file);
      });
      resolve(locals);
    });
  });
};

let translate = (word, local) => {
  return new Promise((resolve, reject) => {
    // Translates some text into Russian
    translates.translate(word, local).then((translation) => {
      if (translation === undefined) {
        console.log('>> google error ' + err + ' ' + word + ' ' + local);
      } else {
        resolve(translation[0]);
      }
    });

  });
};

const cleanProbCharactersV2 = (i_string) => {
  i_string = i_string.replace(/'/ig, "");
  i_string = i_string.replace(/"/ig, "");
  i_string = i_string.replace(/}/ig, "");
  i_string = i_string.replace(/{/ig, "");
  i_string = i_string.replace(/\)/ig, "");
  i_string = i_string.replace(/\r/ig, "");
  i_string = i_string.replace(/\n/ig, "");
  i_string = i_string.replace(/()/ig, "");
  return i_string;
};

const localSource = sourceFile(defaultSourceLang);

(async function asyncConnect() {
  try {
    const languages = await getLocals(3000);
    for (let i = 0; i < languages.length; i++) {
      let final = {};
      const local = languages[i];
      console.log('processing local ' + local + ' >>>');
      const destlSource = sourceFile(local);
      if (destlSource) {
        final = destlSource;
      }
      for (section in localSource) {
        if (!final[section])
          final[section] = {};
        const words = localSource[section];
        for (word in words) {
          if (destlSource && destlSource[section] && destlSource[section][word]) {
            final[section][word] = destlSource[section][word]
          } else {
            console.log('   >>> ' + section + ' ' + words[word]);
            const newWord = await translate(words[word], local);
            console.log('       ### translated to ' + newWord);
            final[section][word] = newWord;
          }
        }
      }
      const f = i18Dir + '/' + local + '.json';
      try {
        fs.writeFileSync(f, JSON.stringify(final, null, '\t'), {encoding: 'utf8', flag: 'w'});
      } catch (err) {
        console.error(err);
      }

    }
  } catch (err) {
    console.log('problem encountered ' + err);
    //client.end()
  }
})();
