if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var myWorker = {};

myWorker.eventMessage = {};

myWorker.settings = {
  container: undefined,
  stats: undefined,
  mesh: undefined,
  camera: undefined,
  scene: undefined,
  renderer: undefined,
  fov : 45,
  particleSystem: undefined,
  geometry: undefined,
  cloud_count:50000,
  particles:0,
  lineParticles:0,
  positions:new Float32Array(50000 * 3),
  colors:new Float32Array(50000 * 3),
  positionsLine:new Float32Array(5000000 * 3),
  colorsLine:new Float32Array(5000000 * 3),
  controls:undefined,
  mouse:undefined,
  mouseHelper:undefined,
  color:undefined,
  colorLine:undefined,
  n: 1000,
  n2: 500
}

var nodeItems = [];

function addParticles() {
  myWorker.eventMessage.postMessage(nodeItems.slice(messageCount * 1000, (messageCount * 1000) + 1000));
}

function initParticles(nodes) {
  nodeItems = nodes;
  addParticles();
  myWorker.settings.camera.position.x = 1800;
  myWorker.settings.camera.position.y = 1800;
}

function init() {

  myWorker.settings.container = document.getElementById( 'container' );
  myWorker.settings.geometry = new THREE.BufferGeometry();
  myWorker.settings.mouse = new THREE.Vector2();
  myWorker.settings.color = new THREE.Color();
  myWorker.settings.colorLine = new THREE.Color();

  myWorker.settings.scene = new THREE.Scene();
  myWorker.settings.scene.fog = new THREE.Fog( 0x050505, 100000, 100000 );
  myWorker.settings.sprite = THREE.ImageUtils.loadTexture( "/assets/textures/ball.png" );

  myWorker.settings.renderer = new THREE.WebGLRenderer( { antialias: false } );
  myWorker.settings.renderer.setClearColor( myWorker.settings.scene.fog.color );
  myWorker.settings.renderer.setPixelRatio( window.devicePixelRatio );
  myWorker.settings.renderer.setSize( window.innerWidth, window.innerHeight );
  myWorker.settings.container.appendChild( myWorker.settings.renderer.domElement );

  myWorker.settings.camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 100000 );

  myWorker.settings.camera.position.z = 10000;

  myWorker.settings.camera.target = new THREE.Vector3();

  myWorker.settings.controls = new THREE.OrbitControls( myWorker.settings.camera, myWorker.settings.renderer.domElement );
  myWorker.settings.controls.minDistance = 0;
  myWorker.settings.controls.maxDistance = 100000;


  myWorker.settings.geometry.addAttribute( 'position', new THREE.BufferAttribute( myWorker.settings.positions, 3));
  myWorker.settings.geometry.addAttribute( 'color', new THREE.BufferAttribute(myWorker.settings.colors, 3 ));
  myWorker.settings.geometry.computeBoundingSphere();

  var material = new THREE.PointCloudMaterial( { size: 200, map: myWorker.settings.sprite, vertexColors: THREE.VertexColors, alphaTest: .5, transparent: true } );
  myWorker.settings.particleSystem = new THREE.PointCloud( myWorker.settings.geometry, material );
  myWorker.settings.scene.add( myWorker.settings.particleSystem );

  var segments = 200000;
  myWorker.settings.geometryLine = new THREE.BufferGeometry();
  myWorker.settings.geometryLine.addAttribute( 'position', new THREE.BufferAttribute( myWorker.settings.positionsLine, 3));
  myWorker.settings.geometryLine.addAttribute( 'color', new THREE.BufferAttribute(myWorker.settings.colorsLine, 3 ));
  myWorker.settings.geometryLine.computeBoundingSphere();

  var materialLine = new THREE.PointCloudMaterial( { size: .5, vertexColors: THREE.VertexColors } );
  myWorker.settings.particleSystemLine = new THREE.PointCloud( myWorker.settings.geometryLine, materialLine );
  myWorker.settings.scene.add( myWorker.settings.particleSystemLine );

  // myWorker.settings.lines = new THREE.BufferGeometry();
  // myWorker.settings.linesMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
  //
  // myWorker.settings.linesPositions = new Float32Array( segments * 3 );
  // myWorker.settings.linesColors = new Float32Array( segments * 3 );
  //
  // myWorker.settings.lines.addAttribute( 'position', new THREE.BufferAttribute(   myWorker.settings.linesPositions, 3 ) );
  // myWorker.settings.lines.addAttribute( 'color', new THREE.BufferAttribute( myWorker.settings.linesColors, 3 ) );

  // myWorker.settings.lines.computeBoundingSphere();

  //myWorker.settings.linesMesh = new THREE.Line(   myWorker.settings.lines,   myWorker.settings.linesMaterial );

        //myWorker.settings.scene.add(myWorker.settings.linesMesh);

  myWorker.settings.mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
  myWorker.settings.mouseHelper.visible = false;
  myWorker.settings.scene.add( myWorker.settings.mouseHelper );

  myWorker.settings.stats = new Stats();
  myWorker.settings.stats.domElement.style.position = 'absolute';
  myWorker.settings.stats.domElement.style.top = '0px';
  myWorker.settings.container.appendChild( myWorker.settings.stats.domElement );
  window.addEventListener( 'resize', onWindowResize, false );var moved = false;

  myWorker.settings.controls.addEventListener( 'change', function() {

    moved = true;

  } );

  window.addEventListener( 'mousedown', function () {

    moved = false;

  }, false );

  window.addEventListener( 'mousemove', onTouchMove );
  window.addEventListener( 'touchmove', onTouchMove );

  function onTouchMove( event ) {

    if( event.changedTouches ) {
      x = event.changedTouches[ 0 ].pageX;
      y = event.changedTouches[ 0 ].pageY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    myWorker.settings.mouse.x = ( x / window.innerWidth ) * 2 - 1;
    myWorker.settings.mouse.y = - ( y / window.innerHeight ) * 2 + 1;

  }
}

function crossProduct(v1, v2, vR) {
  vR[0] =   ( (v1[1] * v2[2]) - (v1[2] * v2[1]) );
  vR[1] = - ( (v1[0] * v2[2]) - (v1[2] * v2[0]) );
  vR[2] =   ( (v1[0] * v2[1]) - (v1[1] * v2[0]) );
}

function normalize(v1, vR) {
  var fMag = Math.sqrt( Math.pow(v1[0], 2) +
                        Math.pow(v1[1], 2) +
                        Math.pow(v1[2], 2)
                      );

  vR[0] = v1[0] / fMag;
  vR[1] = v1[1] / fMag;
  vR[2] = v1[2] / fMag;

}

// Add edge, from and to
function addEdge(e) {

  var x1 = (parseInt(e.from.x) / 2) - 500;
  var y1 = (parseInt(e.from.y) / 2) - 500;
  var z1 = Math.min((parseInt(e.from.z) / 12) - 500, 1000);

  var x2 = (parseInt(e.to.x) / 2) - 500;
  var y2 = (parseInt(e.to.y) / 2) - 500;
  var z2 = Math.min((parseInt(e.to.z) / 12) - 500, 1000);

  //getMidPoint();
  // var linePoints = subtractVector({x: x1, y: y1, z: z1}, {x: x2, y: y2, z: z2}); //
  var linePoints = getIntermediatePoints([x1, y1, z1], [x2, y2, z2], 8);
  for(var i = 0; i < linePoints.length; i++) {
    // if(!(isNaN(linePoints[i][0]) || isNaN(linePoints[i][1]) || isNaN(linePoints[i][2])))
      addParticleLine({ data: linePoints[i] });
  }


  // var lvx1 = .3;
  // var lvy1 = .3;
  // var lvz1 = .3;
  //
  // // var lvx2 = ( x2 / myWorker.settings.n ) + 0.20;
  // // var lvy2 = ( y2 / myWorker.settings.n ) + 0.20;
  // // var lvz2 = ( z2 / myWorker.settings.n ) + 0.20;
  //
  //   myWorker.settings.linesPositions[edgeCount] = x1;
  //   myWorker.settings.linesPositions[edgeCount + 1] = y1;
  //   myWorker.settings.linesPositions[edgeCount + 2] = z1;
  //
  //   myWorker.settings.linesPositions[edgeCount + 3] = x2;
  //   myWorker.settings.linesPositions[edgeCount + 4] = y2;
  //   myWorker.settings.linesPositions[edgeCount + 5] = z2;
  //
  //   myWorker.settings.color.setRGB( lvx1, lvy1, lvz1 );
  //
  //   myWorker.settings.linesColors[edgeCount] = myWorker.settings.color.r;
  //   myWorker.settings.linesColors[edgeCount + 1] = myWorker.settings.color.g;
  //   myWorker.settings.linesColors[edgeCount + 2] = myWorker.settings.color.b;
  //   edgeCount += 6;
}

function angleBetweenTwoVectors(p1, p2, n) {
  // Store some information about them for below
var angle = jStat.angle(p1, p2);
return jStat.multiply([Math.cos(angle), Math.sin(angle), 0], n);
}

function addParticleLine(e) {
  // positions

  var x = e.data[0];
  var y = e.data[1];
  var z = e.data[2];

  // colors

  var vx = .8;
  var vy = .8;
  var vz = .8;



  myWorker.settings.colorLine.setRGB( vx, vy, vz );


  myWorker.settings.positionsLine[myWorker.settings.lineParticles] = x;
  myWorker.settings.positionsLine[myWorker.settings.lineParticles + 1] = y;
  myWorker.settings.positionsLine[myWorker.settings.lineParticles + 2] = z;

  myWorker.settings.colorsLine[myWorker.settings.lineParticles] = myWorker.settings.colorLine.r;
  myWorker.settings.colorsLine[myWorker.settings.lineParticles + 1] = myWorker.settings.colorLine.g;
  myWorker.settings.colorsLine[myWorker.settings.lineParticles + 2] = myWorker.settings.colorLine.b;



  myWorker.settings.lineParticles += 3;
}

function addParticle(e) {
  // positions

  var x = e.data[0];
  var y = e.data[1];
  var z = e.data[2];

  // colors

  var vx = ( x / myWorker.settings.n ) + 0.85;
  var vy = ( y / myWorker.settings.n ) + 0.85;
  var vz = ( z / myWorker.settings.n ) + 0.85;



  myWorker.settings.color.setRGB( vx, vy, vz );


  myWorker.settings.positions[myWorker.settings.particles] = x;
  myWorker.settings.positions[myWorker.settings.particles + 1] = y;
  myWorker.settings.positions[myWorker.settings.particles + 2] = z;

  myWorker.settings.colors[myWorker.settings.particles] = myWorker.settings.color.r;
  myWorker.settings.colors[myWorker.settings.particles + 1] = myWorker.settings.color.g;
  myWorker.settings.colors[myWorker.settings.particles + 2] = myWorker.settings.color.b;



  myWorker.settings.particles += 3;

}

function onWindowResize() {

  myWorker.settings.camera.aspect = window.innerWidth / window.innerHeight;
  myWorker.settings.camera.updateProjectionMatrix();

  myWorker.settings.renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {


  requestAnimationFrame( animate );

  render();
  myWorker.settings.stats.update();

}

function subtractVector(p1, p2) {
  var x1,y1,z1,x2,y2,z2;
  var m1,m2,m3;
  x1=p1.x;y1=p1.y;z1=p1.z;x2=p2.x;y2=p2.y;z2=p2.z;
  m1=(x2-x1);
  m2=(y2-y1);
  m3=(z2-z1);
  return [[m1, m2, m3]];
}

// Get n intermediate points
function getIntermediatePoints(p1, p2, n) {
    var i = 0;
    var arrPoints = [];
    getMidPoint(p1, p2, n, arrPoints, 0)
    return arrPoints;
}

function getMidPoint(p1, p2, n, arrPoints, i) {

  i = i || 0;
  if(i < n) {
    var m3 = getMidPointForVector(p1, p2);
    arrPoints.push(m3);
    getMidPoint(m3, p1, n, arrPoints, i + 1);
    getMidPoint(m3, p2, n, arrPoints, i + 1);
  }

  return arrPoints;
}

function getMidPointForVector(p1, p2) {
  var x1,y1,z1,x2,y2,z2;
  var m1,m2,m3;
  x1=parseFloat(p1[0]);y1=parseFloat(p1[1]);z1=parseFloat(p1[2]);x2=parseFloat(p2[0]);y2=parseFloat(p2[1]);z2=parseFloat(p2[2]);
  m1=(x1+x2)/2.0;
  m2=(y1+y2)/2.0;
  m3=(z1+z2)/2.0;
  var p3 = [m1, m2, m3];
  return p3;
}

function render() {

  var time = Date.now() * 0.001;

  //myWorker.settings.particleSystem.rotation.y = time * 0.25;
  // myWorker.settings.particleSystem.rotation.y = time * 0.5;
  // myWorker.settings.linesMesh.rotation.y = time * 0.25;
  // myWorker.settings.linesMesh.rotation.y = time * 0.5;

  myWorker.settings.renderer.render( myWorker.settings.scene, myWorker.settings.camera );

}

var edgeCount = 0;
var messageCount = 0;
var nodeMap = {};
var edgeList = [];

function mainInit() {

  init();
  animate();

  myWorker.eventMessage = new Worker("worker.js");

  // Get JSON data
  $.getJSON( "/data.json", function( data ) {
    var items = data.nodes;

    for(var i = 0; i < items.length; i++) {
      nodeMap[items[i].id] = items[i];
    }

    for(var i = 0; i < items.length; i++) {
      for(var j = 0; j < items[i].edges.length; j++) {
        edgeList.push({from: items[i], to: nodeMap[items[i].edges[j]]})
      }
    }

    for(var i = 0; i < edgeList.length; i++) {
      addEdge(edgeList[i]);
    }

    // Create edge map
    initParticles(items);
  });

  myWorker.eventMessage.onmessage = function(e) {
    for(var i = 0; i < e.data.length; i++) {
      addParticle({ data: e.data[i] });
    }
    myWorker.settings.geometry.computeBoundingSphere();
    myWorker.settings.particleSystem.geometry.attributes.position.needsUpdate = true;
    myWorker.settings.particleSystem.geometry.attributes.color.needsUpdate = true;
    myWorker.settings.particleSystemLine.geometry.computeBoundingSphere();
    myWorker.settings.particleSystemLine.geometry.attributes.position.needsUpdate = true;
    myWorker.settings.particleSystemLine.geometry.attributes.color.needsUpdate = true;
    myWorker.settings.stats.update();
    messageCount++;
    if(messageCount < 25)
      addParticles();
  }



}

mainInit();
