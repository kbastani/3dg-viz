var GraphMLViewer = GraphMLViewer || {};

GraphMLViewer.parseGraphml = function(doc) {
  var object = new GraphMLViewer.GmlDoc();
  parseRec(doc, object);
  return object;

  function parseRec(elem, parent) {
    for(var i=0, e=elem.key;e!=undefined && i<e.length;i++) {
      var k = new GraphMLViewer.GmlKey(e[i].id, e[i]['for'], getAttributeContaining(e[i], ".name"), getAttributeContaining(e[i],".type"));
      parent.keys.push(k);
    }
    for(i=0, e=elem.data;e!=undefined && i<e.length;i++) {
      var d = new GraphMLViewer.GmlData(e[i].key);
      if (e[i]._children && e[i]._children.length > 0) {
        d.value = {};
        d.value[e[i]._children[0]] = e[i][e[i]._children[0]];
      } else {
        d.value = e[i].Text;
      }
      parent.datas.push(d);
      d.parent = parent;
    }
    for(i=0, e=elem.node;e!=undefined && i<e.length;i++) {
      var n = new GraphMLViewer.GmlNode(e[i].id);
      parseRec(e[i],n);
      parent.nodes.push(n);
      n.parent = parent;
    }
    for(i=0, e=elem.graph;e!=undefined && i<e.length;i++) {
      var g = new GraphMLViewer.GmlGraph(e[i].id, e[i].edgedefault);
      parseRec(e[i],g);
      parent.graphs.push(g);
      g.parent = parent;
    }
    for(i=0, e=elem.edge;e!=undefined && i<e.length;i++) {
      var ed = new GraphMLViewer.GmlEdge(e[i].id, parent.getNodeById(e[i].source), parent.getNodeById(e[i].target), e[i].directed);
      parseRec(e[i],ed);
      parent.edges.push(ed);
      parent.getNodeById(e[i].source).sourceOf.push(ed);
      parent.getNodeById(e[i].target).targetOf.push(ed);
      ed.parent = parent;
    }
  }
  function getAttributeContaining(el, string) {
    for (var i=0, attrs=el._attributes, l=attrs.length; i<l; i++){
      if (attrs[i].indexOf(string) !== -1  ) {
        return el[attrs[i]];
      }
    }
    return "";
  }
};
