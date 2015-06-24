'use strict';

var fs                = require('fs-extra');
var chalk             = require('chalk');
var Promise           = require('ember-cli/lib/ext/promise');
var SilentError       = require('silent-error');
var Blueprint         = require('ember-cli/lib/models/blueprint');
var GenerateFileList  = require('../tasks/generate-file-list');
var GenerateMovePaths = require('../tasks/generate-move-paths');
var ProcessMoveFiles  = require('../tasks/process-move-files');
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
    { name: 'pod', type: Boolean, default: false, aliases: ['p'] },
    { name: 'dummy', type: Boolean, default: false, aliases: ['dum','id']},
    { name: 'in-repo-addon', type: String, default: null, aliases: ['in-repo', 'ir']}
    // TODO: after 0.2.8 we can use arrays for type
    // { name: 'structure', type: ['basic', 'pod'], default: 'basic', aliases: [{'b':'basic'},{'p':'pod'}]}
  ],
  anonymousOptions: [
    '<blueprint>',
    '<source>',
    '<destination>'
  ],
  beforeRun: function(rawArgs){
    // lookup blueprint and merge in blueprint availableOptions
    this.blueprints = [];
    var blueprintName = rawArgs[0];
    var blueprint     = this.lookupBlueprint(blueprintName);
    var testBlueprint = this.lookupBlueprint(blueprintName + '-test', true);
    if (blueprint) {
      this.blueprints.push(blueprint);
    }
    if (testBlueprint) {
      this.blueprints.push(testBlueprint);
    }
    try{
      blueprint = this.lookupBlueprint(rawArgs[0]);
      this.registerOptions( blueprint );
    }
    catch(e) {
      SilentError.debugOrThrow('ember-cli/commands/generate', e);
    }
  },
  
  run: function(commandOptions, rawArgs){
    var ui = this.ui;
    var source = rawArgs[1];
    var dest   = rawArgs[2];
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
      args: rawArgs,
      blueprintName: rawArgs[0],
      source: source,
      dest: dest,
      blueprints: this.blueprints
    };

    var taskOptions = merge(taskArgs, commandOptions || {});
    var generateFileListTask  = new GenerateFileList(taskObject);
    var generateMovePathsTask = new GenerateMovePaths(taskObject);
    var processMoveFilesTask  = new ProcessMoveFiles(taskObject);
    // console.log('running', taskOptions);
    /* tasks

    lookup blueprint
    generate file list
    generate move source paths
    generate move dest paths
    run queue of move commmands -> move.validateAndRun(commandArgs);
    */
    return Promise.resolve(this.beforeFileList(taskOptions))
      .then(function() {
        taskOptions.entityName = source;
        return generateFileListTask.run(taskOptions);
      })
      .then(function(result) {
        // console.log('result', result)
        taskOptions.sourceList = result;
        taskOptions.entityName = dest;
        return generateFileListTask.run(taskOptions);
      })
      
      .then(function(result) {
        taskOptions.destList = result;
        // console.log('result', result)
        return;
      })
      
      .then(this.afterBlueprintInfo.bind(this, taskOptions))
      
      .then(function() {
        return generateMovePathsTask.run(taskOptions);
      })
      .then(function(result) {
        taskOptions.moveList = result;
        return;
      })
      
      .then(this.afterMoveList.bind(this, taskOptions))
      
      .then(function(){
        // console.log(taskOptions.moveList)
        ui.writeLine(chalk.green('Generated all paths!'));
        return processMoveFilesTask.run(taskOptions);
      })
      
      .then(function() {
        ui.writeLine(chalk.green('All done!'));
        return;
      })
      
      .catch(function(e) {
        ui.writeLine(chalk.red('The rename command failed: ') + e.message);
        throw e;
      });
  },
  beforeFileList: function() {
    
  },
  afterBlueprintInfo: function() {
  },
  
  afterMoveList: function() {
  },
  
  lookupBlueprint: function(name, ignoreMissing) {
    return Blueprint.lookup(name, {
      paths: this.project.blueprintLookupPaths(),
      ignoreMissing: ignoreMissing
    });
  }
};