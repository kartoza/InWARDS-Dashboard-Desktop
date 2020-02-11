<template>
  <div>
    <Header/>
    <div class="map-container">
      <div class="container-fluid">
        <div class="col-md-12">
          <div id="map"></div>
          <button class="btn btn-success my-2 my-sm-0 save-selection" disabled @click="saveSelection()" type="button">Save Selection</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
  .map-container {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  #map {
    display: block;
    width: 100%;
    height: 500px;
  }
  .save-selection {
    position: absolute;
    margin-top: -45px !important;
    margin-left: 8px;
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
  import Header from './Header';
  import $ from 'jquery';
  import router from '../router/index';

  export default {
    data () {
      return {
        selectedWMA: [],
        selectedFeatures: {}
      };
    },
    mounted () {
      let self = this;
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
      let highlightedFeature = null;
      map.addLayer(vectorLayer);
      map.getView().fit(vectorLayer.getSource().getExtent());
      map.on('pointermove', function (e) {
        if (highlightedFeature !== null && !self.selectedFeatures.hasOwnProperty(highlightedFeature.ol_uid)) {
          highlightedFeature.setStyle(undefined);
          highlightedFeature = null;
        };
        map.forEachFeatureAtPixel(e.pixel, function (f) {
          if (!self.selectedFeatures.hasOwnProperty(f.ol_uid)) {
            highlightedFeature = f;
            f.setStyle(highlightStyle);
            return true;
          }
        });
      });
      // When map selected update the style
      let selectedStyle = new Style({
        stroke: new Stroke({
          color: [51, 204, 51, 0.6],
          width: 8
        }),
        fill: new Fill({
          color: [51, 204, 51, 0.2]
        }),
        zIndex: 1
      });
      // Check selected map from db
      self.$db.find({}, function (err, docs) {
        if (err) {
          return;
        }
        for (let i = 0; i < docs.length; i++) {
          self.selectedWMA.push(docs[i]['selected_wma']);
        }
        let features = vectorLayer.getSource().getFeatures();
        for (let i = 0; i < features.length; i++) {
          let feature = features[i];
          if (self.selectedWMA.indexOf(feature.get('wma')) !== -1) {
            feature.setStyle(selectedStyle);
            self.selectedFeatures[feature.ol_uid] = feature;
          }
        }
        if (Object.keys(self.selectedFeatures).length > 0) {
          $('.save-selection').attr('disabled', false);
        }
      });
      map.on('click', function (e) {
        // Check if there is a feature
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
          if (!self.selectedFeatures.hasOwnProperty(feature.ol_uid)) {
            self.selectedFeatures[feature.ol_uid] = feature;
            feature.setStyle(selectedStyle);
          } else {
            delete self.selectedFeatures[feature.ol_uid];
            feature.setStyle(undefined);
          }
          if (Object.keys(self.selectedFeatures).length > 0) {
            $('.save-selection').attr('disabled', false);
          } else {
            $('.save-selection').attr('disabled', true);
          }
          return true;
        });
      });
    },
    methods: {
      saveSelection () {
        let self = this;
        self.$db.remove({}, { multi: true }, function (err, numDeleted) {
          if (err) {
            console.log(err);
            return;
          }
          console.log('Deleted', numDeleted, 'feature(s)');
          for (let id in self.selectedFeatures) {
            self.$db.insert({
              'selected_wma': self.selectedFeatures[id].get('wma')
            });
          }
          self.selectedFeatures = {};
          router.push({ path: 'dashboard' });
        });
      }
    },
    components: {
      Header
    }
  };
</script> 