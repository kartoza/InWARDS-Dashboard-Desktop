<template>
  <div>
     <div class="card">
        <div class="card-header bg-secondary"><h6 style="color: white;"><i class="fa fa-map-marker" style="padding-right: 10px;"></i>Stations</h6>
          <div style="float:right" class="input-group mb-2 mr-sm-2">
            <div class="input-group-prepend">
                <div class="input-group-text"><i class="fa fa-search" aria-hidden="true"></i></div>
              </div>
            <input type="text" class="form-control" id="catchmentSearchInput" placeholder="Search">
          </div>
        </div>
        <div class="card-body jstree-container">
          <div v-if='loading'>Loading...</div>
          <div v-else>
              <div id="jstree-div" style="font-size: 14px;">
              </div>
          </div>
        </div>
      </div>
  </div>
</template>
<script>
  import $ from 'jquery';
  import 'jstree/dist/themes/default/style.min.css';
  import 'jstree/dist/jstree.min.js';

  export default {
    data () {
      return {
        loading: true
      };
    },
    methods: {
      toggleNode (node, selected) {
        let nodeBehaviour = selected ? 'select_node' : 'deselect_node';
        let $jsTreeDiv = $('#jstree-div');
        $jsTreeDiv.jstree(nodeBehaviour, node);
        $jsTreeDiv.jstree(true).get_node(node, true).children('.jstree-anchor').focus();
      },
      createTree (jsonData, callback) {
        this.loading = false;
        let iconTree = require('@/assets/iconfinder_layer_37228.png');
        setTimeout(function () {
          let $jsTreeDiv = $('#jstree-div');
          let $searchInputDiv = $('#catchmentSearchInput');
          $jsTreeDiv.on('changed.jstree', callback).jstree({
            'core': {
              'data': jsonData
            },
            'plugins': [ 'wholerow', 'checkbox', 'types', 'search' ],
            'types': {
              'layer': {
                'icon': iconTree
              },
              'station': {
                'icon': iconTree
              }
            }
          });
          let to = false;
          $searchInputDiv.keyup(function () {
            if (to) { clearTimeout(to); };
            to = setTimeout(function () {
              let v = $searchInputDiv.val();
              $jsTreeDiv.jstree(true).search(v);
            }, 250);
          });
        }, 100);
      }
    }
  };
</script>