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
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import GeoJSON from 'ol/format/GeoJSON';
  import {Fill, Stroke, Style} from 'ol/style';
  import WmaJson from '@/assets/wma_merge.json';

  export default {
    mounted () {
      // Create a map
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

      // when we move the mouse over a feature, we can change its style to
      // highlight it temporarily
      let highlightStyle = new Style({
        stroke: new Stroke({
          color: [255, 0, 0, 0.6],
          width: 2
        }),
        fill: new Fill({
          color: [255, 0, 0, 0.2]
        }),
        zIndex: 1
      });
      let vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: (new GeoJSON({
            defaultDataProjection: 'EPSG:4326'
          })).readFeatures(WmaJson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true
      });

      let selected = null;
      map.addLayer(vectorLayer);
      map.getView().fit(vectorLayer.getSource().getExtent());
      map.on('pointermove', function (e) {
        if (selected !== null) {
          selected.setStyle(undefined);
          selected = null;
        };
        map.forEachFeatureAtPixel(e.pixel, function (f) {
          selected = f;
          f.setStyle(highlightStyle);
          return true;
        });
      });
    }
  };
</script>