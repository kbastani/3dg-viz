onmessage = function(e) {
  console.log('Message received from main script');
  console.log('Posting message back to main script');
  var i = 0;
  var timerVar = setInterval(function() {
    if(i < 50) {
      var particleBuffer = [];

      for(var j = 0; j < 1000; j++) {
        var x = Math.random() * 1000 - 500;
        var y = Math.random() * 1000 - 500;
        var z = Math.random() * 1000 - 500;

        particleBuffer.push([x, y, z]);
      }
      postMessage(particleBuffer);
    i++;
  } else { clearInterval(this); }
}, 20);
}
