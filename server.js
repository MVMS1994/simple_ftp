var path        = require('path');
var express     = require('express');
var serveIndex  = require('serve-index')
var serveStatic = require('serve-static')
var ftpd        = require('ftpd');


try {
  var args      = require('cli.args')(['ftp:', 'http:', 'help', 'h']);  
} catch(err) {
  help();
  return;
}

if(args.help || args.h) {
  help();
  return; 
}

var app 			  = express();

var http_options = {
  port: args.http || 80
}

var ftp_options = {
  host: '127.0.0.1',
  port: args.ftp || 21,
  tls: null
};

app.use("/", serveIndex(path.join('./')));
app.use("/", serveStatic(path.join('./')));

app.listen(http_options.port, function() {
	console.log("HTTP Listening at port " + http_options.port);
});



ftp_server = new ftpd.FtpServer(ftp_options.host, {
  getInitialCwd: function() {
    return './';
  },
  getRoot: function() {
    return process.cwd();
  },
  pasvPortRangeStart: 1025,
  pasvPortRangeEnd: 1050,
  tlsOptions: ftp_options.tls,
  useReadFile: false
});

ftp_server.on('error', function(error) {
  console.log('FTP Server error:', error);
});

ftp_server.on('client:connected', function(connection) {
  var username = null;
  console.log('client connected: ' + connection.remoteAddress);
  connection.on('command:user', function(user, success, failure) {
    if (user) {
      username = user;
      success();
    } else {
      failure();
    }
  });

  connection.on('command:pass', function(pass, success, failure) {
    if (pass) {
      success(username);
    } else {
      failure();
    }
  });
});

function help() {
  console.log("[sudo] ftp_server [--ftp port] [--http port]");
}

ftp_server.debugging = 4;
ftp_server.listen(ftp_options.port);
console.log('FTP Listening at port ' + ftp_options.port);