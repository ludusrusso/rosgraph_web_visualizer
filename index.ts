import { Network } from 'vis';
import { RosGraphManager } from './ros_graph_manager'


function connect() {
  let container = document.getElementById('mynetwork');
  let ip = document.getElementById('input_ip').value;

  let manager = new RosGraphManager(ip, container);
}

  document.querySelector('#connect_btn').addEventListener('click', connect);
