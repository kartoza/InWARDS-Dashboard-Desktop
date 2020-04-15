<template>
  <div style="height: 100%;">
    <div class="container-fluid" style="height: 100%;">
      <div class="row" style="height: 100%;">
        <div class="col-md-3 no-float" style="background: #252526;">
          <div class="card rounded-0" style="margin-top: 5px; margin-bottom: 5px;">
            <div class="card-body">
              <button class="btn rounded-0 inwards_button" @click="backToMapSelect()" type="button">
                <i class="fa fa-chevron-left"></i>Back to Dashboard Selection
              </button>
            </div>
          </div>
          <!-- <CatchmentTree ref="catchmentTree"/> -->
          <div class="v-space"></div>
          <MapDashboard ref="mapDashboard"/>
          <div class="v-space"></div>
        </div>
        <div class="col-md-9 no-float" style="background: #1E1E1E;">
          <div class="grid row"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.grid {
  position: relative;
}
.item {
  display: block;
  position: absolute;
  margin: 0;
  z-index: 1;
  width: 48%;
  height: 500px;
}
.item.muuri-item-dragging {
  z-index: 3;
}
.item.muuri-item-releasing {
  z-index: 2;
}
.item.muuri-item-hidden {
  z-index: 0;
}
.item-content {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
<script>
import stateStore from '../../store/state_handler';
import UnverifiedChart from '../Dashboard/UnverifiedChart';
import UnverifiedDischargeDurationChart from '../Dashboard/DurationCurve';
import BoxChart from '../Dashboard/BoxChart';
import MapDashboard from '../Dashboard/MapDashboard';
import StationImage from '../Dashboard/Station';
import router from '@/router/index';
import $ from 'jquery';
import Muuri from 'muuri';
import Vue from 'vue';

export default {
  data () {
    return {
      charts: {
        'unverified-timeseries': UnverifiedChart,
        'unverified-discharge-duration-curve': UnverifiedDischargeDurationChart,
        'station': StationImage,
        'unverified-discharge-boxplot': BoxChart
      },
      currentCharts: {},
      grid: null
    };
  },
  components: {
    MapDashboard
  },
  mounted () {
    this.mapDashboardRef = this.$refs.mapDashboard;
    this.mapDashboardRef.connectedToTree = false;
    this.getSelectedCharts();
    this.getStations();
  },
  methods: {
    backToMapSelect () {
      router.push({ path: '/' });
    },
    getStations () {
      let self = this;
      stateStore.getState(
        stateStore.keys.selectedStations,
        function (selectedStations) {
          let features = [];
          for (let key in selectedStations) {
            features.push(selectedStations[key]['feature']);
          }
          let featureCollection = {
            'type': 'FeatureCollection',
            'features': features
          };
          self.mapDashboardRef.loadStationsToMap(featureCollection);
        }
      );
    },
    getSelectedCharts () {
      let self = this;
      let $chartsContainer = $('.grid');
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate = this.formatDate(startDate);
      let endDate = this.formatDate(new Date());
      stateStore.getState(
        stateStore.keys.selectedCharts,
        function (selectedCharts) {
          console.log(selectedCharts);
          self.currentCharts = Object.assign({}, selectedCharts);
          for (let key in selectedCharts) {
            let ref = `chartComponent-${key}`;
            let chartId = selectedCharts[key]['chartId'];
            if (!self.charts[chartId]) {
              continue;
            }
            let stations = selectedCharts[key]['chartStations'];
            if (stations.length < 1) {
              continue;
            }
            let ChartComponent = Vue.extend(self.charts[chartId]);
            let chart = new ChartComponent({
              data: {
                chartId: ref
              }
            }).$mount();
            let itemDiv = $(`<div class="item col-md-6">`);
            let itemContentDiv = $(`<div class="item-content" data-key="${key}">`);
            itemDiv.html(itemContentDiv);
            $chartsContainer.append(itemDiv);
            itemContentDiv.html(chart.$el);
            chart.deletable = true;
            chart.displayChart(
              stations,
              startDate,
              endDate
            );
            chart.removed = self.itemRemoved;
          }
          // Make the grid draggable and sortable
          self.grid = new Muuri('.grid', {
            dragEnabled: true,
            itemDraggingClass: 'drag-item-btn',
            layoutOnInit: false,
            dragSortHeuristics: {
              sortInterval: 10,
              minDragDistance: 5,
              minBounceBackAngle: Math.PI / 2
            },
            sortData: {
              id: function (item, element) {
                // get sort id
                let key = element.children[0].dataset.key;
                let chartItem = self.currentCharts[key];
                if (typeof chartItem['order'] !== 'undefined') {
                  let order = parseInt(chartItem['order']);
                  return order;
                }
                return item._id;
              }
            }
          });
          // Sort the items before the initial layout
          // and do the initial layout
          self.grid.sort('id', {layout: 'instant'});

          self.grid.on('move', self.afterMoved);
        }
      );
    },
    afterMoved (data) {
      let grid = data.item.getGrid();
      let items = grid.getItems();
      for (let i = 0; i < items.length; i++) {
        let key = items[i].getElement().children[0].dataset.key;
        this.currentCharts[key]['order'] = i;
      }
      stateStore.setState(stateStore.keys.selectedCharts, this.currentCharts);
    },
    itemRemoved (itemId) {
      itemId = itemId.replace('chartComponent-', '');
      console.log(this.currentCharts[itemId]['order']);
      this.grid.remove(this.currentCharts[itemId]['order'], {removeElements: true});
      let items = this.grid.getItems();
      for (let i = 0; i < items.length; i++) {
        let key = items[i].getElement().children[0].dataset.key;
        this.currentCharts[key]['order'] = i;
      }
      delete this.currentCharts[itemId];
      stateStore.setState(stateStore.keys.selectedCharts, this.currentCharts);
    }
  }
};
</script>