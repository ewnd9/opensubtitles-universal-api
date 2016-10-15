import createRpcCall from './xmlrpc-client';

const rpcCall = createRpcCall('http://api.opensubtitles.org/xml-rpc');

const Api = function(userAgent, token) {
  this.userAgent = userAgent;
  this.token = token;

  if (!userAgent) {
    throw new Error('User Agent must be supplied');
  }
};

Api.prototype.getToken = function() {
  return rpcCall('LogIn', ['', '', 'en', this.userAgent])
    .then(res => {
      if (res.status === '414 Unknown User Agent') {
        throw new Error('Unknown User Agent');
      }

      this.token = res.token;
      return this.token;
    });
};

Api.prototype.search = function(query) {
  if (query.season && query.episode) {
    return this.searchEpisode(query);
  } else {
    return this.searchMovie(query);
  }
};

Api.prototype.searchEpisode = function(query) {
  return this._search(query, this.episodeFilterFn);
};

Api.prototype.episodeFilterFn = function(sub, query, imdbId) {
  return parseInt(sub.SeriesIMDBParent) === parseInt(imdbId) &&
    sub.SeriesSeason === String(query.season) &&
    sub.SeriesEpisode === String(query.episode);
};

Api.prototype.searchMovie = function(query) {
  return this._search(query, this.movieFilterFn);
};

Api.prototype.movieFilterFn = function(sub, query, imdbId) {
  return parseInt(sub.IDMovieImdb) === parseInt(imdbId);
};

Api.prototype._search = function(query, filterFn) {
  const imdbId = query.imdbid.replace('tt', '');

  return ((!this.token) ? this.getToken() : Promise.resolve())
    .then(() => {
      const opts = {};
      opts.sublanguageid = 'all';

      if (query.hash) {
        opts.moviehash = query.hash;
      }

      if (!query.filename) {
        opts.imdbid = imdbId;

        if (query.season) {
          opts.season = String(query.season);
        }

        if (query.episode) {
          opts.episode = String(query.episode);
        }
      } else {
        opts.tag = query.filename;
      }

      return rpcCall('SearchSubtitles', [ this.token, [opts] ]);
    })
    .then(res => {
      if (typeof res.data === 'undefined') {
        throw new Error('empty sub');
      }

      if (res.status === '414 Unknown User Agent') {
        throw new Error('Unknown User Agent');
      }

      const subs = res.data
        .filter(sub => {
          return sub.SubFormat === 'srt' && filterFn(sub, query, imdbId);
        })
        .reduce((total, curr) => {
          const sub = {};

          sub.url = curr.SubDownloadLink.replace('.gz', '.srt');
          sub.lang = curr.ISO639;

          sub.downloads = parseInt(curr.SubDownloadsCnt);

          sub.score = 0;
          sub.subFilename = curr.SubFileName.trim();
          sub.releaseFilename = curr.MovieReleaseName.trim();

          sub.date = curr.SubAddDate;
          sub.encoding = curr.SubEncoding;

          if (curr.MatchedBy == 'moviehash') {
            sub.score += 100;
          }

          if (curr.MatchedBy == 'tag') {
            sub.score += 50;
          }

          if (curr.UserRank == 'trusted') {
            sub.score += 100;
          }

          if (!total[sub.lang]) {
            total[sub.lang] = [sub];
          } else {
            total[sub.lang].push(sub);
          }

          return total;
        }, {});

      for (let lang in subs) {
        subs[lang].sort(function(s1, s2) {
          if (s1.score > s2.score || (s1.score == s2.score && s1.downloads > s2.downloads)) {
            return -1;
          } else {
            return 1;
          }
        });
      }

      return subs;
    });
};

module.exports = Api;
