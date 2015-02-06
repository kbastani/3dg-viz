onmessage = function(e) {
  // console.log('Message received from main script');
  // console.log('Posting message back to main script');
  // // var i = 0;
  // var timerVar = setInterval(function() {
  //   if(i < 50) {
      var particleBuffer = [];

      for(var j = 0; j < e.data.length; j++) {
        var x = (parseInt(e.data[j].x)) - 500;
        var y = (parseInt(e.data[j].y)) - 500;
        var z = Math.min((parseInt(e.data[j].z) * 1000) - 500, 5000);
        if(e.data[j].edges.length > 0)
          particleBuffer.push({ pos: [x, y, z], ref: e.data[j] });
      }
      postMessage(particleBuffer);
  //   i++;
  // } else { clearInterval(this); }
// }, 100);
}
