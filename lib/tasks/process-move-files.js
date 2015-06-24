/*jshint quotmark: false*/

'use strict';

var fs            = require('fs-extra');
var path          = require('path');
var chalk         = require('chalk');
var Promise       = require('ember-cli/lib/ext/promise');
var Task          = require('ember-cli/lib/models/task');
var Command       = require('ember-cli/lib/models/command');
var sequence      = require('ember-cli/lib/utilities/sequence');
var SilentError   = require('silent-error');
var move          = require('ember-cli-mv/lib/commands/move');
var merge         = require('lodash/object/merge');
var MoveCommand = Command.extend(move);

module.exports = Task.extend({
  run: function(options) {
    var moveCommand = new MoveCommand({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      settings: this.settings
    });
    var baseArgs = {
      dryRun:   options.dryRun,
      verbose:  options.verbose,
      force:    options.force,
      checkForUpdates: options.checkForUpdates,
      disableAnalytics: options.disableAnalytics,
      watcher:  options.watcher,
      ui:       options.ui,
      project:  options.project
    };
    // console.log(options)
    var optionArgs = options.args.slice(3);
    // this.moveInfo = options.moveInfo;
    // console.log('movefiles', optionArgs)
    var promises = options.moveList.map(function(fileNames) {
      // console.log(fileNames)
      var rawArgs = [fileNames.source, fileNames.dest].concat(optionArgs);
      if (options.dryRun) {
        rawArgs.push('-d');
      }
      if (options.force) {
        rawArgs.push('-f');
      }
      // var commandArgs = merge(baseArgs, args);
      // console.log('move',rawArgs)
      return moveCommand.validateAndRun.bind(moveCommand,rawArgs);
    });
    // console.log(promises)
    // return this.moveFile(this.sourcepath, this.destpath, options);
    return sequence(promises);
  }
});