import test from 'ava';

import 'babel-core/register';
import 'babel-polyfill';

import OpenSubtitles from '../../src/index';

test('true', async t => {
  const api = new OpenSubtitles('OSTestUserAgent');

  const query = {
    imdbid: 'tt0411008', // lost abc
    season: '1',
    episode: '1'
  };

  const result = await api.searchEpisode(query);

  t.truthy(result['en'].length > 0);
  t.deepEqual(Object.keys(result['en'][0]), [
    'url',
    'lang',
    'downloads',
    'score',
    'subFilename',
    'releaseFilename',
    'date',
    'encoding'
  ]);
});
