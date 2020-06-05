<template>
    <div>
      <div id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content" class="ol-popup-content"></div>
      </div>
      <template v-for="(child) in popups">
        <component :is="child" :key="child.name" :ref="child.id"></component>
      </template>
      <div class="card rounded-0">
        <div class="card-header inwards_card"><h6 style="color: white;"><i class="fa fa-map" style="padding-right: 10px;"></i>Map</h6></div>
        <div class="card-body">
          <div id="dashboard-map"></div>
        </div>
      </div>
    </div>
</template>
<style>
  .ol-popup {
    opacity: 0.7;
    font-weight: bold;
    position: absolute;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    padding: 5px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -40px;
    min-width: 75px;
  }
  .card-body {
    padding: 0
  }
  .ol-popup:after, .ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  .ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 38px;
    margin-left: -10px;
  }
  .ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 38px;
    margin-left: -11px;
  }
  .ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
  }
  .ol-popup-closer:after {
    content: "✖";
  }
  .ol-popup-content {
    font-size: 12px;
  }
  .ol-popup-content p {
    max-width: 90px;;
    margin-bottom: 0 !important;
  } 
  #dashboard-map {
    width: 100%;
    height: 350px;
  }
</style>
<script>
  /* eslint-disable no-unused-vars */
  import Vue from 'vue';
  import Map from 'ol/Map';
  import View from 'ol/View';
  import {transform} from 'ol/proj';
  import {Group as LayerGroup, Tile as TileLayer} from 'ol/layer';
  import XYZ from 'ol/source/XYZ';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import GeoJSON from 'ol/format/GeoJSON';
  import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
  import Overlay from 'ol/Overlay';
  import * as Extent from 'ol/extent';
  export default {
    data () {
      return {
        popups: [],
        keys: {
          selected: 'selected',
          station: 'station'
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
        connectedToTree: true,
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
      let container = document.getElementById('popup');
      let closer = document.getElementById('popup-closer');
      let self = this;
      /**
      * Add a click handler to hide the popup.
      * @return {boolean} Don't follow the href.
      */
      closer.onclick = function () {
        self.overlay.setPosition(undefined);
        closer.blur();
        return false;
      };
      /**
       * Create an overlay to anchor the popup the map
       */
      this.overlay = new Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 20
        }
      });

      this.map = new Map({
        target: 'dashboard-map',
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          })
        ],
        overlays: [this.overlay],
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
        this.selectStation(e.pixel);
      },
      getSelectedStations () {
        let _selectedStationsId = [];
        for (let i = 0; i < this.selectedStations.length; i++) {
          _selectedStationsId.push(this.selectedStations[i].split(' ')[0]);
        }
        return _selectedStationsId;
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
        console.log(stationsGeoJSONData);
        this.stationsVectorLayer.setSource(new VectorSource({
          features: (new GeoJSON({
            defaultDataProjection: 'EPSG:4326'
          })).readFeatures(stationsGeoJSONData, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        }));
      },
      selectCatchments (catchments) {
        // Style a feature based on selected secondary catchment name
        // catchments = ['X3', 'X4', ...]
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
          let features = this.featureDict[catchment];
          for (let f = 0; f < features.length; f++) {
            let feature = features[f];
            feature.setStyle(this.selectedStyle);
            this.selectedFeatures.push(feature);
            Extent.extend(extent, feature.getGeometry().getExtent());
          }
        }
        this.map.getView().fit(extent);
      },
      toggleSelectedStationsByStationNames (selectedStationNames, unselectedStationNames) {
        let self = this;
        this.stationsVectorLayer.getSource().forEachFeature(function (feature) {
          let station = feature.get(self.keys.station);
          const index = self.selectedStations.indexOf(station);
          if (selectedStationNames.indexOf(station) !== -1) {
            feature.set(self.keys.selected, true);
            feature.setStyle(self.stationsSelectedStyle);
            if (index === -1) {
              self.selectedStations.push(station);
            }
          } else if (unselectedStationNames.indexOf(station) !== -1) {
            feature.set(self.keys.selected, false);
            feature.setStyle(self.stationsDefaultStyle);
            if (index > -1) {
              self.selectedStations.splice(index, 1);
            }
          }
        });
      },
      selectStation (pixel) {
        // Select and style stations from map based on ol.pixel
        let content = document.getElementById('popup-content');
        let self = this;
        self.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
          let station = feature.get(self.keys.station);
          let isStationSelected = feature.get(self.keys.selected);
          if (!self.connectedToTree) {
            // Just show popup
            content.innerHTML = `<p>${station.split(' ')[0]}</p>`;
            self.overlay.setPosition(feature.getGeometry().getCoordinates());
            return false;
          }
          if (!station) return false;
          if (!isStationSelected) {
            feature.set(self.keys.selected, true);
            feature.setStyle(self.stationsSelectedStyle);
            self.selectedStations.push(station);
            content.innerHTML = `<p>${station.split(' ')[0]}</p>`;
            self.overlay.setPosition(feature.getGeometry().getCoordinates());
          } else {
            feature.set(self.keys.selected, false);
            feature.setStyle(self.stationsDefaultStyle);
            const index = self.selectedStations.indexOf(station);
            if (index > -1) {
              self.selectedStations.splice(index, 1);
            }
          }
          self.$bus.$emit('stationSelectedFromMap', station, !isStationSelected);
          return true;
        });
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
            let secondaryCatchmentName = catchmentName.slice(0, 2);
            // Store feature in local dictionary
            if (!this.featureDict[secondaryCatchmentName]) {
              this.featureDict[secondaryCatchmentName] = [feature];
            } else {
              this.featureDict[secondaryCatchmentName].push(feature);
            }
            if (!catchmentsData.hasOwnProperty(secondaryCatchmentName)) {
              catchmentsData[secondaryCatchmentName] = [];
            }
          }
        }
        let orderedCatchmentsData = {};
        Object.keys(catchmentsData).sort().forEach(function (key) {
          orderedCatchmentsData[key] = catchmentsData[key];
        });
        return orderedCatchmentsData;
      }
    }
  };
</script>