# opensubtitles-universal-api

[![Build Status](https://travis-ci.org/ewnd9/opensubtitles-universal-api.svg?branch=master)](https://travis-ci.org/ewnd9/opensubtitles-universal-api)

Universal API for opensubtitles.org, works both in Node.js and browsers.

Fork of https://github.com/SlashmanX/OpenSRTJS

## Install

```
$ npm install --save opensubtitles-universal-api
```

## Usage

```js
import OpenSubtitles from 'opensubtitles-universal-api';
const api = new OpenSubtitles('OSTestUserAgent');

const episodeQuery = {
  imdbid: 'tt0411008', // lost-2004 abc
  season: 1,
  episode: 1
};

api.search(episodeQuery)
  .then(result => {
    Object.keys(result) //=> ['en', 'ru', ...]
    Object.keys(result.en[0]) //=> ['url', 'lang', 'downloads', 'score', 'subFilename', 'releaseFilename', 'date', 'encoding'];
  });

const movieQuery = {
  imdbid: 'tt0152930' // taxi 1998
};

api.search(movieQuery)
  .then(result => {
    Object.keys(result) //=> ['en', 'ru', ...]
    Object.keys(result.en[0]) //=> ['url', 'lang', 'downloads', 'score', 'subFilename', 'releaseFilename', 'date', 'encoding'];
  });
```

:warning: 'OSTestUserAgent' is intended only for the test usage. Use the [instruction](https://trac.opensubtitles.org/projects/opensubtitles/wiki/DevReadFirst) to get your own token.

Webpack example is available in [`/examples/browser-webpack`](./examples/browser-webpack)

## License

MIT © [ewnd9](http://ewnd9.com)
