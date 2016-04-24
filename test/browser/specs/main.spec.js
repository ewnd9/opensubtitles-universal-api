import 'babel-polyfill';
import OpenSubtitles from '../../../src/index';

describe('OpenSubtitles', () => {
  it('should fetch subtitles', done => {
    const api = new OpenSubtitles('OSTestUserAgent');

    const query = {
      imdbid: 'tt0411008', // lost abc
      season: '1',
      episode: '1'
    };

    api.searchEpisode(query)
      .then(result => {
        expect(result['en'].length).toBeGreaterThan(0);
        expect(Object.keys(result['en'][0])).toEqual([
          'url',
          'lang',
          'downloads',
          'score',
          'subFilename',
          'releaseFilename',
          'date',
          'encoding'
        ]);

        done();
      })
      .catch(err => {
        console.log(err.stack || err);
        done(err);
      });
  });
});
