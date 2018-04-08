////////////////////////////////////////////////////////////////////////////////
// Dependencies / Variables
////////////////////////////////////////////////////////////////////////////////

var path = require('path'),
    argv = require('minimist')(process.argv.slice(2)),
    fs = require('fs'),
    deepmerge = require('deepmerge');

var cwd = process.cwd();

////////////////////////////////////////////////////////////////////////////////
// Public Functions
////////////////////////////////////////////////////////////////////////////////

module.exports = function (envPath) {

  // Get the standard config.json file relative to the gulpfile.js file
  defaultConfigPath = path.join(cwd, 'config.json');
  var config = require(defaultConfigPath);

  if ( typeof(envPath) !== 'undefined' && typeof(envPath) == 'string' ) {

    // Check if any argument flags were pass, and grab the first one.
    var argument = Object.keys(argv)[1];

    if ( typeof argument !== 'undefined' ) {

      // Remove forward slash from envPath
      envPath = envPath.replace(/^\/|\/$/g, '');

      var files = fs.readdirSync(envPath);

      files.forEach(file => {

        var filePath = path.join(cwd, envPath, file);

        if(fs.statSync(filePath).isDirectory()) {

          // Check is all or part of the argument flag exists in one of the directories
          if (argument == file || file.indexOf(argument) !== -1) {

            // Deep merge all config settings.
            config = deepmerge(config, require(path.join(filePath, 'config.json')));
          }

        }
      });
    }
  }

  // Add trailing slashes to each path;
  for(let p in config.paths) {
    let value = config.paths[p];
    config.paths[p] = value.length ? value.replace(/\/?$/, '/') : value;
  }

  // Replace any dynamic variables defined in the paths array specifically;
  pathsConfig = JSON.stringify(config.paths);

  for(let p in Object.assign(config.paths, {"site":config.site})) {
    pathsConfig = pathsConfig.replace(new RegExp('{'+ p +'}', 'g'), config.paths[p]);
  }

  config.paths = JSON.parse(pathsConfig);

  // Replace any dynamic variables defined in the config files.
  tempConfig = JSON.stringify(config);

  for(let p in config.paths) {
    tempConfig = tempConfig.replace(new RegExp('{'+ p +'}', 'g'), config.paths[p]);
  }

  // Remove any double slashes
  tempConfig = tempConfig.replace(new RegExp('([^:])(\/\/+)', 'g'), '$1/');

  config = JSON.parse(tempConfig);

  return config;

}
