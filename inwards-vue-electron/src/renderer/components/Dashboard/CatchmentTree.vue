<template>
  <div>
     <div class="card rounded-0">
        <div class="card-header inwards_card"><h6 style="color: white;"><i class="fa fa-map-marker" style="padding-right: 10px;"></i>Stations<i class="fa fa-refresh" style="float:right; color: white"></i></h6>
          <div style="float:right" class="input-group mb-2 mr-sm-2">
            <div class="input-group-prepend">
                <div class="input-group-text"><i class="fa fa-search" aria-hidden="true"></i></div>
              </div>
            <input type="text" class="form-control" id="catchmentSearchInput" placeholder="Search">
          </div>
        </div>
        <div class="card-body jstree-container" style="max-height:300px; height: 300px;">
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
      toggleMultipleNodes (nodes, selected) {
        for (let i = 0; i < nodes.length; i++) {
          this.toggleNode(nodes[i], selected);
        }
      },
      toggleNode (node, selected) {
        let nodeBehaviour = selected ? 'select_node' : 'deselect_node';
        let $jsTreeDiv = $('#jstree-div');
        if (!$jsTreeDiv) {
          return false;
        }
        $jsTreeDiv.jstree(nodeBehaviour, node);
        $jsTreeDiv.jstree(true).get_node(node, true).children('.jstree-anchor').focus();
      },
      createTree (jsonData, treeClicked, treeReady) {
        for (let i = 0; i < jsonData.length; i++) {
          if (jsonData[i]['children'].length > 0) {
            for (let j = 0; j < jsonData[i]['children'].length; j++) {
              jsonData[i]['children'][j]['id'] = jsonData[i]['children'][j]['id'].split(':')[0];
            }
          }
        }
        this.loading = false;
        let iconTree = require('@/assets/iconfinder_layer_37228.png');
        setTimeout(function () {
          let $jsTreeDiv = $('#jstree-div');
          let $searchInputDiv = $('#catchmentSearchInput');
          $jsTreeDiv.on('changed.jstree', treeClicked).jstree({
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
          $jsTreeDiv.on('ready.jstree', treeReady);
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