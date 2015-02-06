onmessage = function(e) {
  var k1 = nodeMap[edgeList[i].points.from.id];
  var k2 = nodeMap[edgeList[i].points.to.id];
  var x1 = myWorker.settings.positions[k1.position];
  var y1 = myWorker.settings.positions[k1.position + 1];
  var z1 = myWorker.settings.positions[k1.position + 2];
  var x2 = myWorker.settings.positions[k2.position];
  var y2 = myWorker.settings.positions[k2.position + 1];
  var z2 = myWorker.settings.positions[k2.position + 2];

  edgeList[i].line.geometry.vertices[0].x = x1;
  edgeList[i].line.geometry.vertices[0].y = y1;
  edgeList[i].line.geometry.vertices[0].z = z1;
  edgeList[i].line.geometry.vertices[1].x = x2;
  edgeList[i].line.geometry.vertices[1].y = y2;
  edgeList[i].line.geometry.vertices[1].z = z2;
  edgeList[i].line.geometry.verticesNeedUpdate = true;
}
