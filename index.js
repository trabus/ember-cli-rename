/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-rename',
  includedCommands: function() {
    return {
      rename: require('./lib/commands/rename')
    };
  }
};
