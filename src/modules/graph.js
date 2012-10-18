(function(Graph) {
 
  // Dependencies
  var Node = Dataflow.module("node");
  var Edge = Dataflow.module("edge");

  Graph.Model = Backbone.Model.extend({
    initialize: function() {
      var i;

      // Set up nodes 
      var nodes = this.nodes = new Node.Collection();
      nodes.graph = this;
      // Node events
      nodes.on("all", function(){
        this.trigger("change");
      }, this);
      nodes.on("add", function(node){
        Dataflow.trigger("node:add", this, node);
      }, this);
      nodes.on("remove", function(node){
        // Remove related edges and unload running processes if defined
        node.remove();
        Dataflow.trigger("node:remove", this, node);
      }, this);
      // Convert nodes array to backbone collection
      var nodesArray = this.get("nodes");
      for(i=0; i<nodesArray.length; i++) {
        var node = nodesArray[i];
        node.graph = this;
        node = new Node.Model(node);
        nodes.add(node);
      }

      // Set up edges
      var edges = this.edges = new Edge.Collection();
      edges.graph = this;
      // Edge events
      edges.on("all", function(){
        this.trigger("change");
      }, this);
      edges.on("add", function(edge){
        Dataflow.trigger("edge:add", this, edge);
      }, this);
      edges.on("remove", function(edge){
        Dataflow.trigger("edge:remove", this, edge);
      }, this);
      // Convert edges array to backbone collection
      var edgesArray = this.get("edges");
      for(i=0; i<edgesArray.length; i++) {
        var edge = edgesArray[i];
        edge.graph = this;
        edge.id = edge.source.node+":"+edge.source.port+"→"+edge.target.node+":"+edge.target.port;
        edge = new Edge.Model(edge);
        edges.add(edge);
      }
      // Attach collections to graph
      this.set({
        nodes: nodes,
        edges: edges
      });

      // Pass events up to Dataflow global
      this.on("change", function(){
        Dataflow.trigger("change", this);
      }, this);
    },
    remove: function(){
      while(this.nodes.length > 0){
        this.nodes.remove(this.nodes.at(0));
      }
    }
  });

}(Dataflow.module("graph")) );
