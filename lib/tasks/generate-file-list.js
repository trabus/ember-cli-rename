/*jshint quotmark: false*/

'use strict';

var fs            = require('fs-extra');
var path          = require('path');
var chalk         = require('chalk');
var Promise       = require('ember-cli/lib/ext/promise');
var Task          = require('ember-cli/lib/models/task');
var parseOptions  = require('ember-cli/lib/utilities/parse-options');
var merge         = require('lodash/object/merge');
var SilentError   = require('silent-error');

module.exports = Task.extend({
  run: function(options) {
    var ui = options.ui;
    var dryRun = options.dryRun;
    this.sourcepath = options.source;
    this.destpath = options.dest;
    this.blueprints = options.blueprints;
    options.dryRun = true;
    options.inRepoAddon = null;
    var promises = this.blueprints.map(this.getBlueprintLocals.bind(this,options));
    return Promise.all(promises).then(function(results){
      return results.reduce(function(a,b){
        return a.concat(b);
      }).filter(function(filePath) {
        return path.extname(filePath) !== '';
      });
    })
    .then(function(result){
      options.dryRun = dryRun;
      return result;
    });
  },
  
  generateFileList: function(blueprint, locals) {
    // console.log(blueprint)
    var fileList = blueprint.files().map(function(file) {
      // console.log('mapping',file)
      return blueprint.mapFile(file, locals);
    }.bind(this));
    // console.log(fileList);
    return fileList;
  },
  
  getBlueprintLocals: function(options, blueprint) {
    // console.log('blueprint',blueprint);
    // console.log('options', options);
    var ui = options.ui;
    var mockui = {
      writeLine: function(text){
        if (ui.writeLevelVisible('DEBUG')){
          ui.writeLine(text);
        }
        return;
      }
    };
    
    var entity = {
      name: options.entityName,
      options: parseOptions(options.args.slice(2))
    };
    
    var blueprintOptions = {
      target: this.project.root,
      entity: entity,
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      settings: this.settings,
      testing: this.testing,
      taskOptions: options
    };
    
    blueprintOptions = merge(blueprintOptions, options || {});
    // silence blueprint generate
    blueprintOptions.ui = mockui;
    // reject early with locals so we can use them to generate the lists
    blueprint.beforeInstall = function(options, locals) {
      return Promise.reject(locals);
    };
    // console.log(this.project.name(), this.project.isEmberCLIAddon())
    return blueprint.install(blueprintOptions)
      .catch(function(locals){
        // console.log('caught',locals);
        if (typeof locals === 'error'){
          throw locals;
        }
        this.locals = locals;
        return locals;
      }.bind(this))
      
      .then(function(locals) {
        return this.generateFileList(blueprint, locals);
      }.bind(this));
  }
});