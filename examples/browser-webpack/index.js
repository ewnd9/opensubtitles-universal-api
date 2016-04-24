import OpenSubtitles from '../../src/index';

const api = new OpenSubtitles('OSTestUserAgent');

const query = {
  imdbid: 'tt0411008', // lost abc
  season: '1',
  episode: '1'
};

api.searchEpisode(query)
  .then(data => console.log(data))
  .catch(err => console.log(err.stack || err));
