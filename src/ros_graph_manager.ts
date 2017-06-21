import { DataSet, Network } from 'vis';
import { Ros } from 'roslib'

export class RosGraphManager {
  private _ros: Ros;
  private _excluded = ['rosout', 'rosapi', 'rosout_agg'];

  private _nodes_t: any[];
  private _edges_t: any[];

  private _network: Network;

  public nodes: DataSet;
  public edges: DataSet;

  constructor(ip:string, container:any) {
    this._run_ros(ip);
    this.nodes = new DataSet([]);
    this.edges = new DataSet([]);

    let data = {
        nodes: this.nodes,
        edges: this.edges
    };
    let options = {}
    this._network = new Network(container, data, options);

  }

  private _run_ros(ip:string) {
    this._ros = new Ros({
      url : ip
    });
    this._ros.on('connection', () => {
      console.log('Connected to websocket server.');
      this._update_ros_graph();
      setInterval(() => {this._update_ros_graph()}, 1000);
    });

    this._ros.on('error', (error) => {
      console.log('Error connecting to websocket server: ', error);
    });

    this._ros.on('close', () => {
      console.log('Connection to websocket server closed.');
    });
  }

  private _get_nodes_info (nodes: any) {

    return nodes.reduce( (promiseChain, node) => {
        this._nodes_t.push({
          id: node+'_n', label: node
        });


        return promiseChain.then(() => new Promise( (resolve) => {
          this._ros.getNodeDetails(node, (res) => {
            res.publishing.forEach((topic) => {
              if (this._nodes_t.map(e => e.id).indexOf(topic+'_t') < 0)
                this._nodes_t.push({
                  id: topic+'_t', label: topic, shape: 'box'
                });
              this._edges_t.push({
                from: node+'_n',
                to: topic+'_t',
                arrows:"to"

              });
            });
            res.subscribing.forEach((topic) => {
              if (this._nodes_t.map(e => e.id).indexOf(topic+'_t') < 0)
                this._nodes_t.push({
                  id: topic+'_t', label: topic, shape: 'box'
                });
              this._edges_t.push({
                to: node+'_n',
                from: topic+'_t',
                arrows:"to"
              });
            });
            resolve();
          });
        }));
      }, Promise.resolve());
  }

  private _update_ros_graph() {
    this._nodes_t = [];
    this._edges_t = [];


    this._ros.getNodes( (nodes)=>{
      let request_nodes = this._get_nodes_info(nodes);

      request_nodes.then(() => {

        this.nodes.forEach(node => {
            if (this._nodes_t.map(e=>e.id).indexOf(node.id) < 0) {
             this.nodes.remove(node);
            }
        });

        this._nodes_t.forEach(node => {
          if (this.nodes.map(e=>e.id).indexOf(node.id) < 0) {
            this.nodes.add(node);
          }
        });

        this.nodes.forEach(node => {
            if (this._excluded.indexOf(node.label.split('/').slice(-1)[0]) >= 0) {
              this.nodes.remove(node);
            }
        });

        this.edges.forEach(edge => {
          if (this._edges_t.map(e=>e.id).indexOf(edge.id) < 0) {
            this.edges.remove(edge);
          }
        });

        this._edges_t.forEach(edge => {
          if (this.edges.map(e=>e.id).indexOf(edge.id) < 0) {
            this.edges.add(edge);
          }
        });
      });
    });
  }
}