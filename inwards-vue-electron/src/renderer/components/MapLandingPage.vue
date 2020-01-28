<template>
  <div>
    <h2>Welcome to InWARDS Landing Page</h2>
    <div class="container">
      <div id="map"></div>
    </div>
  </div>
</template>
<style>
  #map {
    display: block;
    width: 100%;
    height: 500px;
  }
</style>
<script>
  import Map from 'ol/Map';
  import View from 'ol/View';
  import TileLayer from 'ol/layer/Tile';
  import XYZ from 'ol/source/XYZ';

  export default {
    mounted () {
      let map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          })
        ],
        view: new View({
          center: [0, 0],
          zoom: 2
        })
      });
      console.log(map);
    }
  };
</script>