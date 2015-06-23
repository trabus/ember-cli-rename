'use strict';

var fs                = require('fs-extra');
var chalk             = require('chalk');
var Promise           = require('rsvp');
var SilentError       = require('silent-error');
var GenerateFileList  = require('../tasks/generate-file-list');
var GenerateMovePaths = require('../tasks/generate-move-paths');
var LookupBlueprint   = require('../tasks/lookup-blueprint');
var ProcessMoveFiles  = require('../tasks/process-move-files');
var move              = require('ember-cli-mv/lib/commands/move');
var merge             = require('lodash/object/merge');
var debug             = require('debug')('ember-cli:mv');

module.exports = {
  name: 'rename',
  description: 'Moves files in an ember-cli project and updates path references.',
  aliases: ['mv'],
  works: 'insideProject',
  availableOptions: [
    { name: 'dry-run', type: Boolean, default: false, aliases: ['d'] },
    { name: 'verbose', type: Boolean, default: false, aliases: ['v'] },
    { name: 'force', type: Boolean, default: false, aliases: ['f'] },
    // TODO: after 0.2.8 we can use arrays for type
    // { name: 'structure', type: ['basic', 'pod'], default: 'basic', aliases: [{'b':'basic'},{'p':'pod'}]}
  ],
  anonymousOptions: [
    '<blueprint>',
    '<source>',
    '<destination>'
  ],
  
  run: function(commandOptions, rawArgs){
    var ui = this.ui;
    var taskObject = {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      testing: this.testing,
      settings: this.settings
    };
    var taskArgs = {
      ui: this.ui,
      project: this.project,
      args: rawArgs
    };
    var taskOptions = merge(taskArgs, commandOptions || {});
    var lookupBlueprintTask   = new LookupBlueprint(taskObject);
    var generateFileListTask  = new GenerateFileList(taskObject);
    var generateMovePathsTask = new GenerateMovePaths(taskObject);
    var processMoveFilesTask  = new ProcessMoveFiles(taskObject);
    console.log('running', taskOptions);
    
    return Promise.resolve(this.beforeRun(taskOptions))
      .then(function() {
        return lookupBlueprintTask.run(taskOptions);
      })
      
      .then(function(result) {
        taskOptions.blueprintInfo = result;
        return generateFileListTask.run(taskOptions);
      })
      
      .then(this.afterBlueprintInfo.bind(this, taskOptions))
      
      .then(function(result) {
        taskOptions.pathList = result;
        return generateMovePathsTask.run(taskOptions);
      })
      
      .then(this.afterMoveList.bind(this, taskOptions))
      
      .then(function(result) {
        taskOptions.movePaths = result;
        // ui.writeLine(chalk.green('Updated all paths!'));
        return processMoveFilesTask.run(taskOptions);
      })
      
      .catch(function(e) {
        ui.writeLine(chalk.red('The rename command failed: ') + e.message);
        return;
      });
      return Promise.resolve(true);
/* tasks

lookup blueprint
generate file list
generate move source paths
generate move dest paths
run queue of move commmands -> move.validateAndRun(commandArgs);
*/
  },
  
  beforeRun: function() {
  },
  
  afterBlueprintInfo: function() {
  },
  
  afterMoveList: function() {
  }
};