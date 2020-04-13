<template>
  <div class="card rounded-0 box" v-bind:style="styleObject">
    <div class="card-header inwards_card">
   <div class="row">
    <div class="col-md-12">  
    <h6 id="stationTitle" style="color: white; margin-top: 10px; width: 50%; float: left;"></h6>
      <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups" style="float: right;">
        <div class="btn-group mr-2" role="group" aria-label="First group">
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Zoom"><i class="fa fa-search-plus" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Tooltip"><i class="fa fa-question-circle" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Download"><i class="fa fa-download" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Savee"><i class="fa fa-floppy-o" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Add to your dashboard"><i class="fa fa-plus" style="padding-right: 10px;"></i></button>
          </div>
    </div>
    </div>
    </div>
    </div>
    <div class="card-body station-container">
        <img id="stationDiv" style= "height: 400px; width:100%;">
    </div>
  </div>
</template>
<style>
  .station-container {
    max-height: 400px;
    height: 400px;
    overflow-y: auto;
  }
</style>
<script>
  export default {
    data () {
      return {
        errored: false,
        loading: true,
        styleObject: {
          display: 'none'
        }
      };
    },
    methods: {
      displayStationImages (stations) {
        this.styleObject.display = 'block';
        console.log('http://inwards.award.org.za/images/' + stations[0] + '.jpg');
        var title = document.getElementById('stationTitle');
        title.innerHTML = 'Gauging station:' + stations[0];
        var img = document.getElementById('stationDiv');
        img.src = 'http://inwards.award.org.za/images/' + stations[0] + '.jpg';
      }
    }
  };
</script>