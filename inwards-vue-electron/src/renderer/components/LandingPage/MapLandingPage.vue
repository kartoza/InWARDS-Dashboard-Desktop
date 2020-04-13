<template>
  <div style="width: 100%; height: 100%; margin: 0; padding: 0;">
    <Header/>
    <div id="overlay">
      <div class="row" style="height: 100%;">
      <div class="col-md-12">
      <div class="card rounded-0">
        <div class="card-header inwards_card"><h6 style="color: white;"><i class="fa fa-map" style="padding-right: 10px;"></i>Your selected WMAs</h6></div>
        <div class="card-body">
          <div class="row justify-content-md-center" style="margin-top: 5px; margin-bottom: 5px;">
                  <div class="col-md-12"> 
                     <label class="custom-control custom-checkbox" style="margin-left: 2px">
                      <input id="limpopo" type="checkbox" class="custom-control-input">Limpopo
                      <span class="custom-control-indicator"></span>
                  </label>
                  </div>
                  <div class="col-md-12">
                     <label class="custom-control custom-checkbox" style="margin-left: 2px">
                      <input id="olifants_letaba" type="checkbox" class="custom-control-input">Olifants-Letaba
                      <span class="custom-control-indicator"></span>
                  </label>
                  </div>
                  <div class="col-md-12"> 
                     <label class="custom-control custom-checkbox" style="margin-left: 2px">
                      <input id="inkomati_usuthu" type="checkbox" class="custom-control-input">Inkomati-Usuthu
                      <span class="custom-control-indicator"></span>
                  </label>
                </div>
                </div>
                <div class="row">
                <div class="col-md-12">
                  <div class="btn-group-vertical" style="width:100%">
                    <button class="btn inwards_button" style="width: 100%" @click="saveSelection()" type="button">Unverified Dashboard<i class="fa fa-chevron-right" style="padding-left: 10px;"></i></button>
                    <button class="btn inwards_button" style="width: 100%" @click="saveSelection()" type="button">Verified Dashboard<i class="fa fa-chevron-right" style="padding-left: 10px;"></i></button>
                    <button class="btn inwards_button" style="width: 100%" @click="saveSelection()" type="button">WQ Dashboard<i class="fa fa-chevron-right" style="padding-left: 10px;"></i></button>
                    <button class="btn inwards_button" style="width: 100%" @click="saveSelection()" type="button">Biodiversity Dashboard<i class="fa fa-chevron-right" style="padding-left: 10px;"></i></button>
                  </div>
                </div>
                </div>
            </div>
          </div>
        </div> 
      </div>
    </div>
    <div class="map-container">
      <div class="container-fluid" style="height: 1010px; width:100%">
        <div class="col-md-12" style="width: 100%; height: 100%; margin: 0; padding: 0;">
          <div id="map"></div>
          </div>
        </div>
      </div>
      <div class="modal rounded-0 fade modal_center" tabindex="-1" id="login" data-keyboard="false" data-backdrop="static">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Please Verify Access</h5>
            </div>
            <div class="modal-body">
              <form>
                <div class="form-group">
                  <label for="emailAddress">Email address</label>
                  <input type="email" class="form-control rounded-0" id="emailAddress" aria-describedby="emailHelp" placeholder="Enter email">
                  <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                </div>
                <div class="form-group">
                  <label for="uniqueCode">Unique Code</label>
                  <input type="text" class="form-control rounded-0" id="uniqueCode" placeholder="Unique Code">
                </div>
                <button id="verifyCode" type="submit" class="btn rounded-0 inwards_button">Submit</button>
                <button href="mailto:hugo@award.org.za" type="submit" class="btn rounded-0 inwards_button">Request Access</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
  import Map from 'ol/Map';
  import View from 'ol/View';
  import TileLayer from 'ol/layer/Tile';
  import XYZ from 'ol/source/XYZ';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import GeoJSON from 'ol/format/GeoJSON';
  import {Fill, Stroke, Style} from 'ol/style';
  import knpJson from '@/assets/knp.json';
  import WmaJson from '@/assets/wma_merge.json';
  import Header from '@/components/Header';
  import $ from 'jquery';
  import router from '@/router/index';

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
      let knpLayer = new VectorLayer({
        source: new VectorSource({
          features: (new GeoJSON({
            defaultDataProjection: 'EPSG:4326'
          })).readFeatures(knpJson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true
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
      map.addLayer(knpLayer);
      let knpStyle = new Style({
        stroke: new Stroke({
          color: [51, 204, 51, 0.6],
          width: 1
        }),
        fill: new Fill({
          color: [51, 204, 51, 0.2]
        }),
        zIndex: 1
      });
      knpLayer.setStyle(knpStyle);
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
          color: [76, 175, 80, 0.6],
          width: 2
        }),
        fill: new Fill({
          color: [76, 175, 80, 0.2]
        }),
        zIndex: 1
      });
      $(document).ready(function () {
        $('#login').modal('show');
      });
      document.getElementById('verifyCode').addEventListener('click', function (element) {
        let email = document.getElementById('emailAddress').value;
        let code = document.getElementById('uniqueCode').value;
        $.get('http://inwards.award.org.za/app_json/user_verification.php?email=' + email + '&code=' + code, function (data) {
          if (data === 'true') {
            $('#login').modal('hide');
            alert('Successfully Verified!');
          } else {
            alert('Failed to Verifiy!');
          }
        });
        console.log(email + 'code:' + code);
      });
      document.getElementById('limpopo').addEventListener('change', function (element) {
        console.log(document.getElementById('limpopo').checked);
        let check = document.getElementById('limpopo').checked;
        let features = vectorLayer.getSource().getFeatures();
        let feature = features[0];
        if (check === false) {
          delete self.selectedFeatures[feature.ol_uid];
          feature.setStyle(undefined);
        } else {
          self.selectedFeatures[feature.ol_uid] = feature;
          feature.setStyle(selectedStyle);
        }
      });
      document.getElementById('olifants_letaba').addEventListener('change', function (element) {
        console.log(document.getElementById('olifants_letaba').checked);
        let check = document.getElementById('olifants_letaba').checked;
        let features = vectorLayer.getSource().getFeatures();
        let feature = features[1];
        if (check === false) {
          delete self.selectedFeatures[feature.ol_uid];
          feature.setStyle(undefined);
        } else {
          self.selectedFeatures[feature.ol_uid] = feature;
          feature.setStyle(selectedStyle);
        }
      });
      document.getElementById('inkomati_usuthu').addEventListener('change', function (element) {
        console.log(document.getElementById('inkomati_usuthu').checked);
        let check = document.getElementById('inkomati_usuthu').checked;
        let features = vectorLayer.getSource().getFeatures();
        let feature = features[2];
        if (check === false) {
          delete self.selectedFeatures[feature.ol_uid];
          feature.setStyle(undefined);
        } else {
          self.selectedFeatures[feature.ol_uid] = feature;
          feature.setStyle(selectedStyle);
        }
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
            console.log(feature.values_.wma);
            let check = feature.values_.wma;
            document.getElementById(check).checked = true;
            feature.setStyle(selectedStyle);
            self.selectedFeatures[feature.ol_uid] = feature;
            console.log(self.selectedWMA);
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
            console.log(feature.values_.wma);
            let check = feature.values_.wma;
            document.getElementById(check).checked = true;
            self.selectedFeatures[feature.ol_uid] = feature;
            feature.setStyle(selectedStyle);
          } else {
            delete self.selectedFeatures[feature.ol_uid];
            feature.setStyle(undefined);
            console.log(feature.values_.wma);
            let check = feature.values_.wma;
            document.getElementById(check).checked = false;
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