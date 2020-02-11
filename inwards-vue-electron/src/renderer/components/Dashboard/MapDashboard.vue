<template>
    <div>
    <div class="card">
        <div class="card-header">Map</div>
            <div class="card-body">
                <div id="dashboard-map"></div>
            </div>
        </div>
    </div>
</template>
<style>
  #dashboard-map {
    width: 100%;
    height: 350px;
  }
</style>
<script>
  import Map from 'ol/Map';
  import View from 'ol/View';
  import {Group as LayerGroup, Tile as TileLayer} from 'ol/layer';
  import XYZ from 'ol/source/XYZ';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import GeoJSON from 'ol/format/GeoJSON';
  import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
  import * as Extent from 'ol/extent';

  export default {
    data () {
      return {
        selectedStyle: new Style({
          stroke: new Stroke({
            color: [51, 204, 51, 0.6],
            width: 8
          }),
          fill: new Fill({
            color: [51, 204, 51, 0.2]
          }),
          zIndex: 1
        }),
        selectedFeatures: [],
        featureDict: {},
        selectedWMA: [],
        defaultExtent: null,
        map: null,
        layerGroup: new LayerGroup({
          layers: []
        }),
        stationsVectorLayer: new VectorLayer({
          source: new VectorSource(),
          style: function (feature) {
            return new Style({
              image: new CircleStyle({
                radius: 3,
                fill: new Fill({color: 'rgba(255,0,0,0.5)'}),
                stroke: new Stroke({color: 'red', width: 1})
              })
            });
          }
        })
      };
    },
    mounted () {
      this.map = new Map({
        target: 'dashboard-map',
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
      this.map.addLayer(this.layerGroup);
      this.map.addLayer(this.stationsVectorLayer);
    },
    methods: {
      showSelectedWMA (data) {
        this.defaultExtent = Extent.createEmpty();
        for (let i = 0; i < data.length; i++) {
          let wma = data[i];
          let wmaJsonFile = `${wma}_wma.json`;
          let vectorLayer = new VectorLayer({
            source: new VectorSource({
              features: (new GeoJSON({
                defaultDataProjection: 'EPSG:4326'
              })).readFeatures(require(`../../assets/${wmaJsonFile}`), {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
              })
            }),
            updateWhileAnimating: true,
            updateWhileInteracting: true
          });
          Extent.extend(this.defaultExtent, vectorLayer.getSource().getExtent());
          this.layerGroup.getLayers().push(vectorLayer);
        }
        this.map.getView().fit(this.defaultExtent);
      },
      loadStationsToMap (stationsGeoJSONData) {
        this.stationsVectorLayer.setSource(new VectorSource({
          features: (new GeoJSON({
            defaultDataProjection: 'EPSG:4326'
          })).readFeatures(stationsGeoJSONData, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        }));
      },
      styleCatchments (catchments) {
        // Style a feature based on selected catchment name
        // catchments = ['X33C', 'X33A', ...]
        for (let f = 0; f < this.selectedFeatures.length; f++) {
          this.selectedFeatures[f].setStyle(undefined);
        }
        this.selectedFeatures = [];
        if (catchments.length === 0) {
          this.map.getView().fit(this.defaultExtent);
          return;
        }
        let extent = Extent.createEmpty();
        for (let i = 0; i < catchments.length; i++) {
          let catchment = catchments[i];
          let feature = this.featureDict[catchment];
          feature.setStyle(this.selectedStyle);
          this.selectedFeatures.push(feature);
          Extent.extend(extent, feature.getGeometry().getExtent());
        }
        this.map.getView().fit(extent);
      },
      getCatchmentsData () {
        // Return catchment data as dict of dict
        // e.g {'X': {'X2': { 'X23': ['X231']}}}
        let catchmentsData = {};
        let layers = this.layerGroup.getLayers().getArray();
        for (let i = 0; i < layers.length; i++) {
          let layer = layers[i];
          let features = layer.getSource().getFeatures();
          for (let f = 0; f < features.length; f++) {
            let feature = features[f];
            let catchmentName = feature.get('NAME');
            // Store feature in local dictionary
            if (!this.featureDict[catchmentName]) {
              this.featureDict[catchmentName] = feature;
            }
            let primaryCatchmentName = catchmentName.slice(0, 1);
            let secondaryCatchmentName = catchmentName.slice(0, 2);
            let tertiaryCatchmentName = catchmentName.slice(0, 3);

            if (!catchmentsData.hasOwnProperty(primaryCatchmentName)) {
              catchmentsData[primaryCatchmentName] = {};
            }
            if (!catchmentsData[primaryCatchmentName].hasOwnProperty(secondaryCatchmentName)) {
              catchmentsData[primaryCatchmentName][secondaryCatchmentName] = {};
            }
            if (!catchmentsData[primaryCatchmentName][secondaryCatchmentName].hasOwnProperty(tertiaryCatchmentName)) {
              catchmentsData[primaryCatchmentName][secondaryCatchmentName][tertiaryCatchmentName] = [];
            }
            if (catchmentsData[primaryCatchmentName][secondaryCatchmentName][tertiaryCatchmentName].indexOf(catchmentName) === -1) {
              catchmentsData[primaryCatchmentName][secondaryCatchmentName][tertiaryCatchmentName].push(catchmentName);
            }
          }
        }
        return catchmentsData;
      }
    }
  };
</script>