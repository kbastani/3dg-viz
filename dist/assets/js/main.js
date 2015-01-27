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
  positions:new Float32Array(50000 * 3),
  colors:new Float32Array(50000 * 3),
  controls:undefined,
  mouse:undefined,
  mouseHelper:undefined,
  color:undefined,
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
}

function init() {

  myWorker.settings.container = document.getElementById( 'container' );
  myWorker.settings.geometry = new THREE.BufferGeometry();
  myWorker.settings.mouse = new THREE.Vector2();
  myWorker.settings.color = new THREE.Color();

  myWorker.settings.scene = new THREE.Scene();
  myWorker.settings.scene.fog = new THREE.Fog( 0x050505, 3500, 3500 );
  myWorker.settings.sprite = THREE.ImageUtils.loadTexture( "/assets/textures/ball.png" );

  myWorker.settings.renderer = new THREE.WebGLRenderer( { antialias: false } );
  myWorker.settings.renderer.setClearColor( myWorker.settings.scene.fog.color );
  myWorker.settings.renderer.setPixelRatio( window.devicePixelRatio );
  myWorker.settings.renderer.setSize( window.innerWidth, window.innerHeight );
  myWorker.settings.container.appendChild( myWorker.settings.renderer.domElement );

  myWorker.settings.camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );

  myWorker.settings.camera.position.z = 2750;
  myWorker.settings.camera.target = new THREE.Vector3();

  myWorker.settings.controls = new THREE.OrbitControls( myWorker.settings.camera, myWorker.settings.renderer.domElement );
  myWorker.settings.controls.minDistance = 0;
  myWorker.settings.controls.maxDistance = 5000;


  myWorker.settings.geometry.addAttribute( 'position', new THREE.BufferAttribute( myWorker.settings.positions, 3));
  myWorker.settings.geometry.addAttribute( 'color', new THREE.BufferAttribute(myWorker.settings.colors, 3 ));
  myWorker.settings.geometry.computeBoundingSphere();

  var material = new THREE.PointCloudMaterial( { size: 45, map: myWorker.settings.sprite, vertexColors: THREE.VertexColors, alphaTest: 0.5, transparent: true } );
  myWorker.settings.particleSystem = new THREE.PointCloud( myWorker.settings.geometry, material );
  myWorker.settings.scene.add( myWorker.settings.particleSystem );


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

function addParticle(e) {
  // positions

  var x = e.data[0];
  var y = e.data[1];
  var z = e.data[2];

  // colors

  var vx = ( x / myWorker.settings.n ) + 0.5;
  var vy = ( y / myWorker.settings.n ) + 0.5;
  var vz = ( z / myWorker.settings.n ) + 0.5;

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

function render() {

   var time = Date.now() * 0.001;
  //
  // myWorker.settings.particleSystem.rotation.x = time * 0.25;
   myWorker.settings.particleSystem.rotation.y = time * 0.5;

  myWorker.settings.renderer.render( myWorker.settings.scene, myWorker.settings.camera );

}

var messageCount = 0;

function mainInit() {

  init();
  animate();

  myWorker.eventMessage = new Worker("worker.js");

  // Get JSON data
  $.getJSON( "/data.json", function( data ) {
    var items = data.nodes;

    initParticles(items);
  });

  myWorker.eventMessage.onmessage = function(e) {
    for(var i = 0; i < e.data.length; i++) {
      addParticle({ data: e.data[i] });
    }
    myWorker.settings.geometry.computeBoundingSphere();
    myWorker.settings.particleSystem.geometry.attributes.position.needsUpdate = true;
    myWorker.settings.particleSystem.geometry.attributes.color.needsUpdate = true;
    myWorker.settings.stats.update();
    messageCount++;
    if(messageCount < 25)
      addParticles();
  }



}

mainInit();
