var path        = require('path');
var express     = require('express');
var serveIndex  = require('serve-index')
var serveStatic = require('serve-static')
var ftpd        = require('ftpd');

var app 			  = express();

var ftp_options = {
  host: process.env.IP   || '127.0.0.1',
  port: process.env.PORT || 21,
  tls: null
};

app.use("/", serveIndex(path.join('./')));
app.use("/", serveStatic(path.join('./')));

app.listen(80, function() {
	console.log("Listening at port 80");
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

ftp_server.debugging = 4;
ftp_server.listen(ftp_options.port);
console.log('Listening on port ' + ftp_options.port);