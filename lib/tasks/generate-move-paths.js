/*jshint quotmark: false*/

'use strict';

var fs            = require('fs-extra');
var path          = require('path');
var chalk         = require('chalk');
var Promise       = require('rsvp');
var Task          = require('ember-cli/lib/models/task');
var SilentError   = require('silent-error');

module.exports = Task.extend({
  run: function(options) {
    var moveList = [];
    options.sourceList.forEach(function(item, index) {
      moveList.push({
        source: item,
        dest: options.destList[index]
      });
    });
    // this.moveInfo = options.moveInfo;
    // return this.moveFile(this.sourcepath, this.destpath, options);
    return Promise.resolve(moveList);
  }
});