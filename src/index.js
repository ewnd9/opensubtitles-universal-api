import isNode from 'detect-node';
import pify from 'pify';

const clientOptions = {
  host: 'api.opensubtitles.org',
  port: 80,
  path: '/xml-rpc'
};

const callRpcFn = isNode ?
  (function() {
    const client = require('xmlrpc').createClient(clientOptions);
    return client.methodCall.bind(client);
  }()) :
  (function() {
    var $ = jQuery = require('./bower_components/jquery/jquery.min.js');
    require('./bower_components/jquery-xmlrpc/jquery.xmlrpc.min.js');

    return function(method, params, cb) {
      $.xmlrpc({
        url: 'http://' + clientOptions.host + clientOptions.path,
        methodName: method,
        params: params,
        success: function(response, status, jqXHR) {
          cb(null, response[0]);
        },
        error: function(jqXHR, status, error) {
          cb(error);
        }
      });
    };
  })();

const callRpc = pify(callRpcFn);

const Api = function(userAgent, token) {
  this.userAgent = userAgent;
  this.token = token;

  if (!userAgent) {
    throw new Error('User Agent must be supplied');
  }
};

Api.prototype.getToken = function() {
  return callRpc('LogIn', ['', '', 'en', this.userAgent])
    .then(res => {
      if (res.status === '414 Unknown User Agent') {
        throw new Error('Unknown User Agent');
      }

      this.token = res.token;
      return this.token;
    });
},

Api.prototype.searchEpisode = function(query) {
  return ((!this.token) ? this.getToken() : Promise.resolve())
    .then(() => {
      const opts = {};
      opts.sublanguageid = "all";

      if (query.hash) {
        opts.moviehash = query.hash;
      }

      if (!query.filename) {
        opts.imdbid = query.imdbid.replace("tt", "");
        opts.season = query.season + '';
        opts.episode = query.episode + '';
      } else {
        opts.tag = query.filename;
      }

      return callRpc('SearchSubtitles', [ this.token, [opts] ]);
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
          return sub.SubFormat === 'srt' &&
                 parseInt(sub.SeriesIMDBParent) === parseInt(query.imdbid.replace('tt', '')) &&
                 sub.SeriesSeason === query.season &&
                 sub.SeriesEpisode === query.episode;
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
