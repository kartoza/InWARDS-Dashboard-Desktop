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
  import Header from '@/components/Header';
  import MapDashboard from './MapDashboard';
  import CatchmentTree from './CatchmentTree';
  import Chart from './Chart';
  import router from '@/router/index';
  import $ from 'jquery';
  import 'jstree/dist/themes/default/style.min.css';
  import 'jstree/dist/jstree.min.js';

  export default {
    data () {
      return {
        selectedCatchments: [],
        stationsApi: 'http://inwards.award.org.za/app_json/stations.php',
        stationsXhr: null
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
        self.createCatchmentTree();
        self.fetchStations(selectedWMA);
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
        // Fetch stations from api
        if (this.stationsXhr) {
          this.stationsXhr.abort();
          this.stationsXhr = null;
        }
        // Wrap wma name with single quotes, for api purposes
        wmaNames = wmaNames.sort();
        for (let i = 0; i < wmaNames.length; i++) {
          wmaNames[i] = `'${wmaNames[i]}'`;
        }
        let url = `${self.stationsApi}?wma=${wmaNames.join()}`;
        let currentDate = (new Date()).toISOString().slice(0, 10).replace(/-/g, '');
        let stationFile = `${dir}/${url.hashCode()}_${currentDate}.json`;
        if (fs.existsSync(stationFile)) {
          let jsonData = fs.readFileSync(stationFile, 'utf-8');
          let stationsData = JSON.parse(jsonData);
          self.$refs.mapDashboard.loadStationsToMap(stationsData);
        } else {
          this.stationsXhr = $.ajax({
            type: 'GET',
            crossDomain: true,
            url: url,
            success: function (jsondata) {
              self.$refs.mapDashboard.loadStationsToMap(jsondata);
              fs.writeFileSync(stationFile, JSON.stringify(jsondata));
            }
          });
        }
      },
      generateCatchmentTreeData (catchments) {
        let catchmentTreeData = [];
        let self = this;
        $.each(catchments, function (key, catchment) {
          let hasChildren = false;
          if (typeof catchment === 'object' || catchment instanceof Array) {
            hasChildren = true;
          }
          let c = {
            text: hasChildren ? key : catchment,
            type: 'layer'
          };
          if (hasChildren) {
            c['children'] = self.generateCatchmentTreeData(catchment);
          };
          catchmentTreeData.push(c);
        });
        return catchmentTreeData;
      },
      createCatchmentTree () {
        let self = this;
        let catchmentTreeData = self.generateCatchmentTreeData(self.$refs.mapDashboard.getCatchmentsData());
        this.$refs.catchmentTree.createTree(catchmentTreeData, function (e, data) {
          let i = [];
          let j = [];
          let selectedCatchment = '';
          self.selectedCatchments = [];
          for (i = 0, j = data.selected.length; i < j; i++) {
            selectedCatchment = data.instance.get_node(data.selected[i]).text;
            if (selectedCatchment.length === 4) {
              self.selectedCatchments.push(selectedCatchment);
            }
          }
          self.$refs.mapDashboard.styleCatchments(self.selectedCatchments);
        });
      }
    }
  };
</script>