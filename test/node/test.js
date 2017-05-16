import test from 'ava';

import 'babel-core/register';
import 'babel-polyfill';

import OpenSubtitles from '../../src/index';
const api = new OpenSubtitles('OSTestUserAgentTemp');

const schema = [
  'url',
  'lang',
  'downloads',
  'score',
  'subFilename',
  'releaseFilename',
  'date',
  'encoding'
];

test('lost 01x01', async t => {
  const query = {
    imdbid: 'tt0411008',
    season: 1,
    episode: 1
  };

  const result = await api.search(query);

  t.truthy(result['en'].length > 0);
  t.deepEqual(Object.keys(result['en'][0]), schema);
});

test('batman v superman', async t => {
  const query = {
    imdbid: 'tt2975590'
  };

  const result = await api.search(query);

  t.truthy(result['en'].length > 0);
  t.deepEqual(Object.keys(result['en'][0]), schema);
});

test('saving private ryan', async t => {
  const query = {
    imdbid: 'tt0120815'
  };

  const result = await api.search(query);

  t.truthy(result['en'].length > 0);
  t.deepEqual(Object.keys(result['en'][0]), schema);
});

test('saving private ryan by query', async t => {
  const query = {
    query: 'saving private ryan'
  };

  const result = await api.search(query);

  t.truthy(result['en'].length > 0);
  t.deepEqual(Object.keys(result['en'][0]), schema);
});
