<template>
  <div>
    <Header />
    <div class="container-fluid" style="margin-top: 20px">
      <button style="float:right" class="btn btn-success my-2 my-sm-0 pull-right" @click="backToMapSelect()" type="button">
        Back to map select
      </button>
      <div class="row">
        <div class="col-md-5">
          <CatchmentTree ref="catchmentTree"/>
          <div class="v-space"></div>
          <MapDashboard ref="mapDashboard"/>
          <div class="v-space"></div>
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-sm-6" style="padding-right: 2px;">
                  <div class="form-group">
                    <label for="dateStart">Start Date</label>
                    <input type="date" class="form-control" id="dateStart" >
                  </div>
                </div>
                <div class="col-sm-6" style="padding-left: 2px;">
                  <div class="form-group">
                    <label for="dateEnd">End Date</label>
                    <input type="date" class="form-control" id="dateEnd" >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                <button class="btn btn-success" @click="fetchUnverified()" type="button" style="width: 100%">
                  Fetch Unverified
                </button>
                </div>
              </div>
            </div>
          </div>
          <div class="v-space"></div>
        </div>
        <div class="col-md-7">
          <Chart ref="chartComponent"/>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
  .v-space {
    height: 20px;
  }
  .jstree-container {
    max-height: 200px;
    height: 200px;
    overflow-y: auto;
  }
</style>
<script>
  import axios from 'axios';
  import Header from '@/components/Header';
  import MapDashboard from './MapDashboard';
  import CatchmentTree from './CatchmentTree';
  import Chart from './Chart';
  import router from '@/router/index';
  import $ from 'jquery';
  require('promise.prototype.finally').shim();
  
  export default {
    data () {
      return {
        stationsApi: 'http://inwards.award.org.za/app_json/stations.php',
        stationsCoordinates: {}, // To stored all stations with their coordinates
        stationsRequest: null,
        selectedStations: []
      };
    },
    mounted () {
      let self = this;
      this.$db.find({}, function (error, docs) {
        let selectedWMA = [];
        if (error) {
          return;
        }
        for (let i = 0; i < docs.length; i++) {
          selectedWMA.push(docs[i]['selected_wma']);
        }
        self.$refs.mapDashboard.showSelectedWMA(selectedWMA);
        self.fetchStations(selectedWMA);
      });
      self.$bus.$on('stationSelectedFromMap', (station, isStationSelected) => {
        self.$refs.catchmentTree.toggleNode(station, isStationSelected);
      });
    },
    components: {
      Header,
      MapDashboard,
      CatchmentTree,
      Chart
    },
    methods: {
      backToMapSelect () {
        router.push({ path: '/' });
      },
      fetchUnverified () {
        const selectedStations = this.$refs.mapDashboard.getSelectedStations();
        if (selectedStations.length === 0) {
          alert('Please select at least one station');
          return;
        }
        let dateStartString = $('#dateStart').val();
        let dateEndString = $('#dateEnd').val();
        if (!dateStartString || !dateEndString) {
          alert('Missing start date / end date');
          return;
        }
        let dateStart = new Date(dateStartString);
        let dateEnd = new Date(dateEndString);
        if (dateStart > dateEnd) {
          alert('End date should be after start date');
          return;
        }
        this.$refs.chartComponent.displayChart(selectedStations, this.formatDate(dateStart), this.formatDate(dateEnd));
      },
      fetchStations (wmaNames) {
        let self = this;
        let fs = require('fs');
        let dir = '../../media';
        // TODO : Create an util class for file storage
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        // Cancel previous request if any
        if (this.stationsRequest) {
          this.stationsRequest.cancel('Canceling stations request');
          this.stationsRequest = null;
        }
        // Wrap wma name with single quotes, for api purposes
        wmaNames = wmaNames.sort();
        for (let i = 0; i < wmaNames.length; i++) {
          wmaNames[i] = `'${wmaNames[i]}'`;
        }
        let url = `${self.stationsApi}?wma=${wmaNames.join()}`;
        let stationFile = `${dir}/${url.hashCode()}.json`;
        if (fs.existsSync(stationFile)) {
          let jsonData = fs.readFileSync(stationFile, 'utf-8');
          let stationsData = JSON.parse(jsonData);
          self.$refs.mapDashboard.loadStationsToMap(stationsData);
          self.createCatchmentTree(stationsData);
        } else {
          self.stationsRequest = axios.CancelToken.source();
          axios.get(url, { cancelToken: self.stationsRequest.token }).then(response => {
            self.$refs.mapDashboard.loadStationsToMap(response.data);
            self.createCatchmentTree(response.data);
            fs.writeFileSync(stationFile, JSON.stringify(response.data));
          }).catch(error => {
            console.log(error);
          });
        }
      },
      generateTreeData (dictionary) {
        let treeData = [];
        let self = this;
        $.each(dictionary, function (key, catchment) {
          let hasChildren = false;
          if (typeof catchment === 'object' || catchment instanceof Array) {
            hasChildren = true;
          }
          let c = {
            text: hasChildren ? key : catchment,
            id: hasChildren ? key : catchment,
            type: hasChildren ? 'layer' : 'station'
          };
          if (hasChildren) {
            c['children'] = self.generateTreeData(catchment);
          };
          treeData.push(c);
        });
        return treeData;
      },
      createCatchmentTree (stationsData) {
        let self = this;
        // Start adding stations data to catchment
        let catchmentsData = self.$refs.mapDashboard.getCatchmentsData();
        for (let i = 0; i < stationsData.features.length; i++) {
          let secondary = stationsData.features[i]['properties']['secondary'];
          let station = stationsData.features[i]['properties']['station'];
          this.stationsCoordinates[station] = stationsData.features[i].geometry.coordinates;
          if (catchmentsData.hasOwnProperty(secondary)) {
            catchmentsData[secondary].push(station);
            catchmentsData[secondary].sort();
          }
        }
        let treeData = self.generateTreeData(catchmentsData);
        this.$refs.catchmentTree.createTree(treeData, function (e, data) {
          let i = [];
          let selected = '';
          let selectedCatchments = [];
          let _selectedStations = [];
          let _unselectedStations = self.selectedStations;
          for (i = 0; i < data.selected.length; i++) {
            selected = data.instance.get_node(data.selected[i]).text;
            let type = data.instance.get_node(data.selected[i]).type;
            if (type === 'layer') {
              selectedCatchments.push(selected);
            } else if (type === 'station') {
              _selectedStations.push(selected);
              if (_unselectedStations.indexOf(selected) !== -1) _unselectedStations.splice(_unselectedStations.indexOf(selected), 1);
            }
          }
          self.$refs.mapDashboard.toggleSelectedStationsByStationNames(
            _selectedStations,
            _unselectedStations
          );
          console.log(self.$refs.mapDashboard.getSelectedStations());
          self.selectedStations = _selectedStations;
          self.$refs.mapDashboard.selectCatchments(selectedCatchments);
        });
      }
    }
  };
</script>