<template>
  <div>
     <div class="card">
        <div class="card-header">Catchments</div>
        <div class="card-body jstree-container">
             <div class="input-group mb-2 mr-sm-2">
              <div class="input-group-prepend">
                <div class="input-group-text"><i class="fa fa-search" aria-hidden="true"></i></div>
              </div>
              <input type="text" class="form-control" id="catchmentSearchInput" placeholder="Search">
            </div>
            <div id="jstree-div">
            </div>
        </div>
      </div>
  </div>
</template>
<script>
  import $ from 'jquery';
  export default {
    methods: {
      createTree (jsonData, callback) {
        let iconTree = require('@/assets/iconfinder_layer_37228.png');
        let $searchInputDiv = $('#catchmentSearchInput');
        let $jsTreeDiv = $('#jstree-div');
        $jsTreeDiv.on('changed.jstree', callback).jstree({
          'core': {
            'data': jsonData
          },
          'plugins': [ 'wholerow', 'checkbox', 'types', 'search' ],
          'types': {
            'layer': {
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
      }
    }
  };
</script>