var express = require('express');
var app = express();
app.use(express.logger());

app.configure(function(){
  app.use('/dist/assets', express.static(__dirname + '/dist/assets'));
  app.use(express.static(__dirname + '/dist'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
