var GraphMLViewer = GraphMLViewer || {};

GraphMLViewer.Loader = function(xmlDoc) {
  var json = XMLObjectifier.xmlToJSON(xmlDoc);
  this.doc = GraphMLViewer.parseGraphml(json);
  this.graphs = this.doc.graphs;

  // Transform the graph into a view model
  this.viewModel = this.graphs[0].tranformToViewModel();

  // Render the graph -- yay :)
  loadGraph(this.viewModel);

};

Float32Array.prototype.clear = function() {
  for(var i = 0; i < this.length; i++) {
    this[i] = 0.0;
  }
}

GraphMLViewer.GmlDoc = function() {
    this.keys = [];
    this.graphs = [];
    this.datas = [];
};

GraphMLViewer.GmlGraph = function(id, edgedefault) {
    this.id = id;
    this.edgedefault = edgedefault;
    this.nodes = [];
    this.edges = [];
    this.datas = [];
    this.parent;
};

GraphMLViewer.GmlGraph.prototype.tranformToViewModel = function() {
  return GraphMLViewer.graphs[0].nodes.map(function(n) {
    return {
      id: n.id,
      x: parseFloat(n.datas.filter(function(a) { return a.key == "V-X"; })[0].value || 0.0),
      y: parseFloat(n.datas.filter(function(a) { return a.key == "V-Y"; })[0].value || 0.0),
      z: parseFloat(n.datas.filter(function(a) { return a.key == "V-Followers"; })[0].value || 0.0),
      edges: n.sourceOf.map(function(a) { return a.target.id; }).getUnique()
    };
  });
}

Array.prototype.getUnique = function(){
  var u = {}, a = [];
  for(var i = 0, l = this.length; i < l; ++i){
    if(u.hasOwnProperty(this[i])) {
      continue;
    }
    a.push(this[i]);
    u[this[i]] = 1;
  }
  return a;
}

GraphMLViewer.GmlGraph.prototype.getEdgesById = function(id) {
  for(var i=0;i<this.nodes.length;i++) {
    if (this.nodes[i].id == id) {
      return this.nodes[i];
    }
    for(var j=0;j<this.nodes[i].graphs.length;j++) {
      var res = this.nodes[i].graphs[j].getEdgesById(id);
      if (res) {
        return res;
      }
    }
  }
  return undefined;
};

GraphMLViewer.GmlGraph.prototype.getNodeById = function(id) {
    for(var i=0;i<this.nodes.length;i++) {
        if (this.nodes[i].id == id) {
            return this.nodes[i];
        }
        for(var j=0;j<this.nodes[i].graphs.length;j++) {
            var res = this.nodes[i].graphs[j].getNodeById(id);
            if (res) {
                return res;
            }
        }
    }
    return undefined;
};



GraphMLViewer.GmlEdge = function(id, src, target, directed) {
    this.id = id;
    this.src = src;
    this.target = target;
    this.directed = directed;
    this.datas = [];
    this.parent;
    this.path = {'sx': 0, 'sy': 0, 'tx': 0, 'ty': 0};
};

GraphMLViewer.GmlNode = function(id) {
    this.id = id;
    this.datas = [];
    this.graphs = [];
    this.sourceOf = [];
    this.targetOf = [];
    this.parent;
    this.position = {};
    this.geometry = {'width': 10, 'height': 10};
};

GraphMLViewer.GmlKey = function(id, fortype, attr_name, attr_type) {
    this.id = id;
    this.fortype = fortype;
    this.attr_name = attr_name;
    this.attr_type = attr_type;
};

GraphMLViewer.GmlData = function(key, value) {
    this.key = key;
    this.value = value;
    this.parent;
};
