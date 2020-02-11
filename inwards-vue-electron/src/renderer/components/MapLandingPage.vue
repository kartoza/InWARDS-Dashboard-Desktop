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

  let selectedFeatures = {};
  let selectedWMA = [];

  let styleFunction = (feature, resolution) => {
    let property = feature.get('wma');
    let found = selectedWMA.indexOf(property);
    console.log(found);
    if (found === 1) {
      return new Style({
        stroke: new Stroke({
          color: [51, 204, 51, 0.6],
          width: 8
        }),
        fill: new Fill({
          color: [51, 204, 51, 0.2]
        }),
        zIndex: 1
      });
    }
    return new Style({
      fill: new Fill({
        color: [250, 250, 250, 1]
      }),
      stroke: new Stroke({
        color: [220, 220, 220, 1],
        width: 1
      })
    });
  };

  export default {
    mounted () {
      console.log(styleFunction);
      // Get selected from db
      this.$db.find({}, function (error, docs) {
        if (error) {
          return;
        }
        for (let i = 0; i < docs.length; i++) {
          selectedWMA.push(docs[i]['selected_wma']);
        }
      });

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
      let highlightedFeature = null;
      map.addLayer(vectorLayer);
      map.getView().fit(vectorLayer.getSource().getExtent());
      map.on('pointermove', function (e) {
        if (highlightedFeature !== null && !selectedFeatures.hasOwnProperty(highlightedFeature.ol_uid)) {
          highlightedFeature.setStyle(undefined);
          highlightedFeature = null;
        };
        map.forEachFeatureAtPixel(e.pixel, function (f) {
          if (!selectedFeatures.hasOwnProperty(f.ol_uid)) {
            highlightedFeature = f;
            f.setStyle(highlightStyle);
            return true;
          }
        });
      });
      map.on('click', function (e) {
        // Check if there is a feature
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
          if (!selectedFeatures.hasOwnProperty(feature.ol_uid)) {
            selectedFeatures[feature.ol_uid] = feature;
            feature.setStyle(selectedStyle);
          } else {
            delete selectedFeatures[feature.ol_uid];
            feature.setStyle(undefined);
          }
          if (Object.keys(selectedFeatures).length > 0) {
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
        });
        for (let id in selectedFeatures) {
          self.$db.find({ selected_wma: selectedFeatures[id].getProperties().wma }, function (error, docs) {
            if (error) {
              console.log(error);
              return;
            }
            // If no document is found, docs is equal to []
            if (docs.length === 0) {
              console.log(docs.length);
              self.$db.insert({
                'selected_wma': selectedFeatures[id].getProperties().wma
              });
            }
          });
        }
        router.push({ path: 'dashboard' });
      }
    },
    components: {
      Header
    }
  };
</script> 