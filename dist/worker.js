onmessage = function(e) {
      var particleBuffer = [];
      var n2 = 8000 / 2;
      for(var j = 0; j < e.data.length; j++) {
        var x = (parseInt(e.data[j].x) * 1.5) - (n2 * 2);
        var y = (parseInt(e.data[j].y) * 1.5) - n2;
        var z = Math.min((parseInt(e.data[j].z)) - n2, 8000);

        particleBuffer.push([x, y, z, parseInt(e.data[j].w)]);
      }
      postMessage(particleBuffer);
}
