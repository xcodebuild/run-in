var promise = require('promise-polyfill');
var glob = require('glob-promise');
var fs = require('fs');
var spawn = require('child_process').spawn;
var colors = require('colors');

module.exports = function run(program, pattern, command) {
    var log = program.log;
    var info = log.info;
    var warn = log.warn;
    glob(pattern).then(function(list) {
        list = list.filter(function(item) {
            if (fs.lstatSync(item).isDirectory()) {
                return true;
            }
            warn(item + ' is not a directory, ignore');
        });
        list.forEach(function(path){
            info("Run command in " + path + ': ' + command);
            var pro = command.split(' ')[0];
            var args = command.split(' ').filter(function(item, index) {
                if (index === 0) return false;
                if (item === '') return false;
                return true;
            });
            var child = spawn(pro, args, {
                cwd: process.cwd() + '/' + path
            });
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', function(data) {
                process.stdout.write(path.green + '|' + data);
            });
            child.stderr.on('data', function(data) {
                process.stderr.write(path.red + '|' + data);
            });
            child.on('close', function(code) {
                console.log(path.green + ' exit with ' + code);
            });
        });
    })
}