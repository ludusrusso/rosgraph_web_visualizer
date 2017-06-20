import { DataSet, Network } from 'vis';
import { Ros } from 'roslib'

var ros = new Ros({
  url : 'ws://192.168.1.87:9090'
});

var ros_nodes = new DataSet([]);
var ros_edges = new DataSet([]);

function ros_graph() {
  var ros_nodes_t = [];
  var ros_edges_t = [];

  ros.getNodes( (nodes)=>{
    let request_nodes = nodes.reduce( (promiseChain, node) => {
      ros_nodes_t.push({
        id: node+'_n', label: node
      });
      return promiseChain.then(() => new Promise( (resolve) => {
        ros.getNodeDetails(node, (res) => {
          console.log('node', node);
          res.publishing.forEach((topic) => {
            if (ros_nodes_t.map(e => e.id).indexOf(topic+'_t') < 0)
              ros_nodes_t.push({
                id: topic+'_t', label: topic, shape: 'box'
              });
            ros_edges_t.push({
              from: node+'_n',
              to: topic+'_t',
              arrows:"to"

            });
          });
          res.subscribing.forEach((topic) => {
            if (ros_nodes_t.map(e => e.id).indexOf(topic+'_t') < 0)
              ros_nodes_t.push({
                id: topic+'_t', label: topic, shape: 'box'
              });
            ros_edges_t.push({
              to: node+'_n',
              from: topic+'_t',
              arrows:"to"
            });
          });

          console.log('\t subs', ros_nodes_t);
          console.log('\t pubs', res.subscribing);
          resolve();
        });
      }));
    }, Promise.resolve());

    request_nodes.then(() => {

      ros_nodes.forEach(node => {
          if (ros_nodes_t.map(e=>e.id).indexOf(node.id) < 0) {
            ros_nodes.remove(node);
            console.log('test1');
          }
      });

      ros_edges.forEach(edge => {
          if (ros_edges_t.map(e=>e.id).indexOf(edge.id) < 0) {
            ros_edges.remove(edge);
            console.log('test2');
          }
      });

      ros_nodes_t.forEach(node => {
        if (ros_nodes.map(e=>e.id).indexOf(node.id) < 0) {
          ros_nodes.add(node);
          console.log('test3');
        }
      });

      ros_edges_t.forEach(edge => {
        if (ros_edges.map(e=>e.id).indexOf(edge.id) < 0) {
          ros_edges.add(edge);
          console.log('test4');

        }
      });

      console.log('done');
    });
  });


}


ros.on('connection', function() {
  console.log('Connected to websocket server.');
  setInterval(ros_graph, 1000);
  ros_graph();
//  ros_graph();
});

ros.on('error', function(error) {
  console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
  console.log('Connection to websocket server closed.');
});




// create an array with nodes
var nodes = new DataSet([
  {id: '1c', label: 'Node 1'},
  {id: 2, label: 'Node 2'},
  {id: 3, label: 'Node 3'},
  {id: 4, label: 'Node 4'},
  {id: 5, label: 'Node 5'}
]);

// create an array with edges
var edges = new DataSet([
  {from: '1c', to: 3},
  {from: '1c', to: 2},
  {from: 2, to: 4},
  {from: 2, to: 5},
  {from: 3, to: 3},
  {from: 3, to: 5}
]);

// create a network
var container = document.getElementById('mynetwork');
var data = {
  nodes: ros_nodes,
  edges: ros_edges
};
var options = {};
var network = new Network(container, data, options);
