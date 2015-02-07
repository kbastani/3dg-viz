if (!Detector.webgl) Detector.addGetWebGLMessage();

var myWorker = {};

myWorker.eventMessage = {};

function initGraphSettings() {
  myWorker.settings = {
    fov: 45,
    cloud_count: 50000,
    particles: 0,
    lineParticles: 0,
    positions: new Float32Array(50000 * 3),
    colors: new Float32Array(50000 * 3),
    positionsLine: new Float32Array(800000 * 3),
    colorsLine: new Float32Array(900000 * 3),
    graphScale: 500,
    n: 8000,
    n2: 8000 / 2
  }
}

function resetGraphSettings() {
  messageCount = 0;
  nodeItems = [];
  nodeMap = {};
  edgeList = [];
  edgeCount = 0;
  myWorker.settings.particles = 0;
  myWorker.settings.lineParticles = 0;
  myWorker.settings.positions.clear();
  myWorker.settings.colors.clear();
  myWorker.settings.positionsLine.clear();
  myWorker.settings.colorsLine.clear();
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

    myWorker.settings.container = document.getElementById('container');
    myWorker.settings.geometry = new THREE.BufferGeometry();
    myWorker.settings.mouse = new THREE.Vector2();
    myWorker.settings.color = new THREE.Color();
    myWorker.settings.colorLine = new THREE.Color();

    myWorker.settings.scene = new THREE.Scene();
    myWorker.settings.scene.fog = new THREE.Fog(0x050505, 5000000, 10000000);
    myWorker.settings.sprite = THREE.ImageUtils.loadTexture("/assets/textures/ball.png");

    myWorker.settings.renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    //myWorker.settings.renderer.gammaInput = true;
    //myWorker.settings.renderer.gammaOutput = true;

    myWorker.settings.renderer.setClearColor(myWorker.settings.scene.fog.color);
    myWorker.settings.renderer.setPixelRatio(window.devicePixelRatio);
    myWorker.settings.renderer.setSize(window.innerWidth, window.innerHeight);
    myWorker.settings.container.appendChild(myWorker.settings.renderer.domElement);
    myWorker.settings.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 5, 10000000);
    myWorker.settings.camera.position.z = 40000;
    myWorker.settings.camera.position.x = myWorker.settings.camera.position.x + 5000;
    myWorker.settings.camera.position.y = myWorker.settings.camera.position.y + 5000;
    myWorker.settings.camera.target = new THREE.Vector3();
    myWorker.settings.controls = new THREE.OrbitControls(myWorker.settings.camera, myWorker.settings.renderer.domElement);
    myWorker.settings.controls.minDistance = 1000;
    myWorker.settings.controls.maxDistance = 10000000;
    myWorker.settings.geometry.addAttribute('position', new THREE.BufferAttribute(myWorker.settings.positions, 3));
    myWorker.settings.geometry.addAttribute('color', new THREE.BufferAttribute(myWorker.settings.colors, 3));
    myWorker.settings.geometry.computeBoundingSphere();

    var material = new THREE.PointCloudMaterial({
        size: 700,
        map: myWorker.settings.sprite,
        vertexColors: THREE.VertexColors,
        alphaTest: .05,
        transparent: true
    });

    myWorker.settings.particleSystem = new THREE.PointCloud(myWorker.settings.geometry, material);
    myWorker.settings.scene.add(myWorker.settings.particleSystem);

    myWorker.settings.geometryLine = new THREE.BufferGeometry();
    myWorker.settings.geometryLine.addAttribute('position', new THREE.BufferAttribute(myWorker.settings.positionsLine, 3));
    myWorker.settings.geometryLine.addAttribute('color', new THREE.BufferAttribute(myWorker.settings.colorsLine, 3));
    myWorker.settings.geometryLine.computeBoundingSphere();
    myWorker.settings.geometryLine.drawcalls.push( {
          start: 0,
          count: edgeList.length,
          index: 0
        } );

        // color — Line color in hexadecimal. Default is 0xffffff.
        // linewidth — Line thickness. Default is 1.
        // scale — The scale of the dashed part of a line. Default is 1.
        // dashSize — The size of the dash. Default is 3.
        // gapSize - The size of the gap. Default is 1.
        // vertexColors — Define how the vertices gets colored. Default is THREE.NoColors.
        // fog — Define whether the material color is affected by global fog settings. Default is false.

    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xFFFFFF,
      linewidth: .4,
      scale: 1,
      dashSize: 3,
      gapSize: 1,
      vertexColors: THREE.VertexColors,
      transparent: true,
      fog: myWorker.settings.scene.fog,
      opacity: .4});

    myWorker.settings.linesMesh = new THREE.Line( myWorker.settings.geometryLine, lineMaterial, THREE.LinePieces );
    myWorker.settings.scene.add(myWorker.settings.linesMesh);
    myWorker.settings.mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
    myWorker.settings.mouseHelper.visible = false;
    myWorker.settings.scene.add(myWorker.settings.mouseHelper);

    var uiPanel = document.getElementById('stats-container');
    myWorker.settings.stats = new Stats();
    myWorker.settings.stats.domElement.style.position = 'absolute';
    myWorker.settings.stats.domElement.style.top = '0';
    myWorker.settings.stats.domElement.style.left = '80';
    uiPanel.appendChild(myWorker.settings.stats.domElement);
    window.addEventListener('resize', onWindowResize, false);
    var moved = false;

    myWorker.settings.controls.addEventListener('change', function () {

        moved = true;

    });

    window.addEventListener('mousedown', function () {

        moved = false;

    }, false);

    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('touchmove', onTouchMove);

    function onTouchMove(event) {

        if (event.changedTouches) {
            x = event.changedTouches[0].pageX;
            y = event.changedTouches[0].pageY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }

        myWorker.settings.mouse.x = (x / window.innerWidth) * 2 - 1;
        myWorker.settings.mouse.y = -(y / window.innerHeight) * 2 + 1;

    }
}

function crossProduct(v1, v2, vR) {
    vR[0] = ((v1[1] * v2[2]) - (v1[2] * v2[1]));
    vR[1] = -((v1[0] * v2[2]) - (v1[2] * v2[0]));
    vR[2] = ((v1[0] * v2[1]) - (v1[1] * v2[0]));
}

function normalize(v1, vR) {
    var fMag = Math.sqrt(Math.pow(v1[0], 2) +
        Math.pow(v1[1], 2) +
        Math.pow(v1[2], 2)
    );

    vR[0] = v1[0] / fMag;
    vR[1] = v1[1] / fMag;
    vR[2] = v1[2] / fMag;

}

// Add edge, from and to
function addEdge(e) {

    var x1 = (parseInt(e.from.x) * 1.5) - myWorker.settings.n2  * 2;
    var y1 = (parseInt(e.from.y) * 1.5) - myWorker.settings.n2;
    var z1 = Math.min((parseInt(e.from.z)) - myWorker.settings.n2, myWorker.settings.n);

    var x2 = (parseInt(e.to.x) * 1.5) - myWorker.settings.n2  * 2;
    var y2 = (parseInt(e.to.y) * 1.5) - myWorker.settings.n2;
    var z2 = Math.min((parseInt(e.to.z)) - myWorker.settings.n2, myWorker.settings.n);



        addParticleLine({
            data: { from: [x1, y1, z1], to: [x2, y2, z2] }
        });

}

function angleBetweenTwoVectors(p1, p2, n) {
    // Store some information about them for below
    var angle = jStat.angle(p1, p2);
    return jStat.multiply([Math.cos(angle), Math.sin(angle), 0], n);
}

function addParticleLine(e) {
    // positions

    var x1 = e.data.from[0] - myWorker.settings.n2 / 2;
    var y1 = e.data.from[1] - myWorker.settings.n2 / 1.5;
    var z1 = e.data.from[2];

    var x2 = e.data.to[0] - myWorker.settings.n2 / 2;
    var y2 = e.data.to[1] - myWorker.settings.n2 / 1.5;
    var z2 = e.data.to[2];

    // colors

    var vx = 1;
    var vy = 1;
    var vz = 1;

    myWorker.settings.colorLine.setRGB(vx, vy, vz);
    myWorker.settings.positionsLine[myWorker.settings.lineParticles] = x1;
    myWorker.settings.positionsLine[myWorker.settings.lineParticles + 1] = y1;
    myWorker.settings.positionsLine[myWorker.settings.lineParticles + 2] = z1;

    myWorker.settings.colorLine.setRGB(vx, vy, vz);
    myWorker.settings.positionsLine[myWorker.settings.lineParticles + 3] = x2;
    myWorker.settings.positionsLine[myWorker.settings.lineParticles + 4] = y2;
    myWorker.settings.positionsLine[myWorker.settings.lineParticles + 5] = z2;

    myWorker.settings.colorsLine[myWorker.settings.lineParticles] = myWorker.settings.colorLine.r;
    myWorker.settings.colorsLine[myWorker.settings.lineParticles + 1] = myWorker.settings.colorLine.g;
    myWorker.settings.colorsLine[myWorker.settings.lineParticles + 2] = myWorker.settings.colorLine.b;
    myWorker.settings.colorsLine[myWorker.settings.lineParticles + 3] = myWorker.settings.colorLine.r;
    myWorker.settings.colorsLine[myWorker.settings.lineParticles + 4] = myWorker.settings.colorLine.g;
    myWorker.settings.colorsLine[myWorker.settings.lineParticles + 5] = myWorker.settings.colorLine.b;
    myWorker.settings.lineParticles += 6;
}

function addParticle(e) {
    // positions

    var x = e.data[0];
    var y = e.data[1];
    var z = e.data[2];

    // colors

    var vx = (((x + myWorker.settings.n2) - 1000) / 1000) + .05;
    var vy = (((y + myWorker.settings.n2) - 1000) / 1000) + .05;
    var vz = (((z + myWorker.settings.n2) - 1000) / 1000) + .05;

    // var vx = ((myWorker.settings.particles / 3) / nodeItems.length) + (x / myWorker.settings.n);
    // var vy = ((myWorker.settings.particles / 3) / nodeItems.length) + (y / myWorker.settings.n);
    // var vz = ((myWorker.settings.particles / 3) / nodeItems.length) + (z / myWorker.settings.n);

    myWorker.settings.color.setRGB(vx, vy, vz);
    myWorker.settings.positions[myWorker.settings.particles] = x - myWorker.settings.n2 / 2;
    myWorker.settings.positions[myWorker.settings.particles + 1] = y - myWorker.settings.n2 / 1.5;
    myWorker.settings.positions[myWorker.settings.particles + 2] = z;

    myWorker.settings.colors[myWorker.settings.particles] = myWorker.settings.color.r;
    myWorker.settings.colors[myWorker.settings.particles + 1] = myWorker.settings.color.g;
    myWorker.settings.colors[myWorker.settings.particles + 2] = myWorker.settings.color.b;
    myWorker.settings.particles += 3;

}

function onWindowResize() {

    myWorker.settings.camera.aspect = window.innerWidth / window.innerHeight;
    myWorker.settings.camera.updateProjectionMatrix();

    myWorker.settings.renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {
    requestAnimationFrame(animate);

    render();
    myWorker.settings.stats.update();

}

function subtractVector(p1, p2) {
    var x1, y1, z1, x2, y2, z2;
    var m1, m2, m3;
    x1 = p1.x;
    y1 = p1.y;
    z1 = p1.z;
    x2 = p2.x;
    y2 = p2.y;
    z2 = p2.z;
    m1 = (x2 - x1);
    m2 = (y2 - y1);
    m3 = (z2 - z1);
    return [
        [m1, m2, m3]
    ];
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
    if (i < n) {
        var m3 = getMidPointForVector(p1, p2);
        arrPoints.push(m3);
        getMidPoint(m3, p1, n, arrPoints, i + 1);
        getMidPoint(m3, p2, n, arrPoints, i + 1);
    }

    return arrPoints;
}

function getMidPointForVector(p1, p2) {
    var x1, y1, z1, x2, y2, z2;
    var m1, m2, m3;
    x1 = parseFloat(p1[0]);
    y1 = parseFloat(p1[1]);
    z1 = parseFloat(p1[2]);
    x2 = parseFloat(p2[0]);
    y2 = parseFloat(p2[1]);
    z2 = parseFloat(p2[2]);
    m1 = (x1 + x2) / 2.0;
    m2 = (y1 + y2) / 2.0;
    m3 = (z1 + z2) / 2.0;
    var p3 = [m1, m2, m3];
    return p3;
}

var rotateTime = 711597378.477;
var frameCounter = 0;
var lastTime;
var onRender = false;

function render() {
  if(onRender) {
    lastTime = lastTime || Date.now();
    var thisTime = Date.now();
    var diff = (thisTime - lastTime) / 3000.0;

    if (rotateGraph) {
        myWorker.settings.linesMesh.geometry.drawcalls[ 0 ].count = myWorker.settings.lineParticles / 6;
        myWorker.settings.particleSystem.rotation.y = myWorker.settings.particleSystem.rotation.y + diff;
        myWorker.settings.linesMesh.rotation.y = myWorker.settings.linesMesh.rotation.y + diff;
        myWorker.settings.particleSystem.geometry.attributes.position.needsUpdate = true;
        myWorker.settings.linesMesh.geometry.attributes.position.needsUpdate = true;
    }
    myWorker.settings.renderer.render(myWorker.settings.scene, myWorker.settings.camera);

    lastTime = thisTime;
  }
}

var edgeCount = 0;
var messageCount = 0;
var nodeMap = {};
var edgeList = [];

var rotateGraph = false;

function mainInit() {

    var uiHidden = false;

    // Wire up UI
    $(".collapse-ui-btn").click(function () {
        if (uiHidden) {

            $(".collapse-ui-btn .glyphicon").removeClass("glyphicon glyphicon-arrow-right").addClass("glyphicon glyphicon-arrow-left");
            $("#panel").show();
            $("#ui-overlay").animate({
                left: "+=200"
            }, 200, function () {
                uiHidden = false;
            });
        } else {

            $(".collapse-ui-btn .glyphicon").removeClass("glyphicon glyphicon-arrow-left").addClass("glyphicon glyphicon-arrow-right");
            $("#panel").hide();
            $("#ui-overlay").animate({
                left: "-=200"
            }, 200, function () {
                uiHidden = true;
            });
        }
    });

    $("#rotate").click(function () {
        if (rotateGraph) {
            rotateGraph = false;
            $(".rotate-status").text("Off");
        } else {
            rotateGraph = true;
            $(".rotate-status").text("On");
        }
    });

    $("#rotate").click();
    //$(".collapse-ui-btn").click();

    initGraphSettings();
    init();
    animate();

    myWorker.eventMessage = new Worker("worker.js");

    // Get JSON data
    myWorker.eventMessage.onmessage = function (e) {
        for (var i = 0; i < e.data.length; i++) {
            addParticle({
                data: e.data[i]
            });
        }
        myWorker.settings.geometry.computeBoundingSphere();
        myWorker.settings.particleSystem.geometry.attributes.position.needsUpdate = true;
        myWorker.settings.particleSystem.geometry.attributes.color.needsUpdate = true;
        myWorker.settings.linesMesh.geometry.computeBoundingSphere();
        myWorker.settings.linesMesh.geometry.attributes.position.needsUpdate = true;
        myWorker.settings.linesMesh.geometry.attributes.color.needsUpdate = true;
        myWorker.settings.stats.update();
        messageCount++;
        if (messageCount < 25)
            addParticles();
    }
}

function loadGraph(graphTransform) {

  onRender = true;
  $("#container").show();

  var items = graphTransform;

  for (var i = 0; i < items.length; i++) {
    nodeMap[items[i].id] = items[i];
  }

  for (var i = 0; i < items.length; i++) {
    for (var j = 0; j < items[i].edges.length; j++) {
      edgeList.push({
        from: items[i],
        to: nodeMap[items[i].edges[j]]
      })
    }
  }

  for (var i = 0; i < edgeList.length; i++) {
    addEdge(edgeList[i]);
  }

  // Create edge map
  initParticles(items);
}

mainInit();
