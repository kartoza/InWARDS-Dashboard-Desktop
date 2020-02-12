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
        keys: {
          selected: 'selected',
          station: 'Station'
        },
        selectedStyle: new Style({
          stroke: new Stroke({
            color: [51, 204, 51, 0.4],
            width: 4
          }),
          fill: new Fill({
            color: [51, 204, 51, 0.1]
          }),
          zIndex: 1
        }),
        selectedFeatures: [],
        featureDict: {},
        selectedWMA: [],
        selectedStations: [],
        defaultExtent: null,
        map: null,
        layerGroup: new LayerGroup({
          layers: []
        }),
        stationsSelectedStyle: new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({color: [51, 204, 51, 0.8]}),
            stroke: new Stroke({color: 'green', width: 1})
          })
        }),
        stationsDefaultStyle: new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({color: 'rgba(255,0,0,0.5)'}),
            stroke: new Stroke({color: 'red', width: 1})
          })
        }),
        stationsVectorLayer: new VectorLayer({
          source: new VectorSource(),
          style: function (feature) {
            return new Style({
              image: new CircleStyle({
                radius: 5,
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
      this.map.on('click', this._mapClicked);
    },
    methods: {
      _mapClicked (e) {
        // Clicked map event handler
        let self = this;
        self.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
          let station = feature.get(self.keys.station);
          let selected = feature.get(self.keys.selected);
          if (!station) return false;
          if (!selected) {
            feature.set(self.keys.selected, true);
            feature.setStyle(self.stationsSelectedStyle);
            self.selectedStations.push(station);
          } else {
            feature.set(self.keys.selected, false);
            feature.setStyle(self.stationsDefaultStyle);
            const index = self.selectedStations.indexOf(station);
            if (index > -1) {
              self.selectedStations.splice(index, 1);
            }
          }
          console.log(self.selectedStations);
          return true;
        });
      },
      getSelectedStations () {
        return this.selectedStations;
      },
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