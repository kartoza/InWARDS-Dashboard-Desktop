<template>
  <div>
     <div class="card">
        <div class="card-header">Catchments</div>
        <div class="card-body jstree-container">
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
        $('#jstree-div').on('changed.jstree', callback).jstree({
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
      }
    }
  };
</script>