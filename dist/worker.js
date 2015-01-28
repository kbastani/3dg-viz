onmessage = function(e) {
  console.log('Message received from main script');
  console.log('Posting message back to main script');
  // var i = 0;
  // var timerVar = setInterval(function() {
  //   if(i < 50) {
      var particleBuffer = [];

      for(var j = 0; j < e.data.length; j++) {
        var x = (parseInt(e.data[j].x) * 4) - 2000;
        var y = (parseInt(e.data[j].y) * 4) - 2000;
        var z = Math.min((parseInt(e.data[j].z) * 2) - 1000, 50000);

        particleBuffer.push([x, y, z]);
      }
      postMessage(particleBuffer);
  //   i++;
  // } else { clearInterval(this); }
// }, 100);
}
