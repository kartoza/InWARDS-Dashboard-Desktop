<template>
  <div style="height: 100%;">
    <div class="container-fluid" style="height: 100%;">
      <div class="row" style="height: 100%;">
        <div class="col-md-3 no-float" style="background: #252526;">
          <div class="card rounded-0" style="margin-top: 5px; margin-bottom: 5px;">
            <div class="card-body">
              <button class="btn rounded-0 inwards_button" @click="backToMapSelect()" type="button">
                <i class="fa fa-chevron-left"></i>Back to Dashbaord Selection
              </button>
            </div>
          </div>
          <!-- <CatchmentTree ref="catchmentTree"/> -->
          <div class="v-space"></div>
          <!-- <MapDashboard ref="mapDashboard"/> -->
          <div class="v-space"></div>
          <div class="card rounded-0">
            <div class="card-body">
              <div class="row">
                <div class="col-sm-6" style="padding-right: 2px;">
                  <div class="form-group">
                    <label for="dateStart" style="padding-left: 8px;">Start Date:</label> 
                    <input type="date" class="form-control" id="dateStart" style="margin-left: 4px;">
                  </div>
                </div>
                <div class="col-sm-6" style="padding-left: 2px;">
                  <div class="form-group">
                    <label for="dateEnd" style="padding-left: 8px;">End Date:</label>
                    <input type="date" class="form-control" id="dateEnd" style="margin-right: 10px;" @onload="setDates()">
                  </div>
                </div>
              </div>
              <div class="row" style="margin-top: 5px; margin-bottom: 5px;">
                  <div class="col-md-4">
                     <label class="custom-control custom-checkbox" style="margin-left: 5px">
                      <input id="ts" type="checkbox" class="custom-control-input" checked="true">T/S
                      <span class="custom-control-indicator"></span>
                  </label>
                  </div>
                  <div class="col-md-4">
                     <label class="custom-control custom-checkbox">
                      <input id="bx" type="checkbox" class="custom-control-input" checked="true">Boxplot
                      <span class="custom-control-indicator"></span>
                  </label>
                  </div>
                  <div class="col-md-4">
                     <label class="custom-control custom-checkbox">
                      <input id="fdc" type="checkbox" class="custom-control-input" checked="true">FDC
                      <span class="custom-control-indicator"></span>
                  </label>
                </div>
              </div>
                <div class="row">
                <div class="col-md-12">
                <button class="btn inwards_button" @click="fetchUnverified()" type="button" style="width: 100%">
                  <i class="fa fa-line-chart"></i>Chart Unverified
                </button>
                </div>
              </div>
            </div>
          </div>
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
import router from '@/router/index';
import $ from 'jquery';
import Muuri from 'muuri';
import Vue from 'vue';

export default {
  data () {
    return {
      charts: {
        'unverified-timeseries': UnverifiedChart,
        'unverified-discharge-duration-curve': UnverifiedDischargeDurationChart
      },
      currentCharts: {}
    };
  },
  mounted () {
    this.getSelectedCharts();
  },
  methods: {
    backToMapSelect () {
      router.push({ path: '/' });
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
          self.currentCharts = Object.assign({}, selectedCharts);
          for (let key in selectedCharts) {
            let ref = `chartComponent-${key}`;
            let chartId = selectedCharts[key]['chartId'];
            let stations = selectedCharts[key]['chartStations'];
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
            chart.displayChart(
              stations,
              startDate,
              endDate
            );
          }
          // Make the grid draggable and sortable
          let grid = new Muuri('.grid', {
            dragEnabled: true,
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
          grid.sort('id', {layout: 'instant'});

          grid.on('dragEnd', self.afterDragged);
        }
      );
    },
    afterDragged (item, event) {
      console.log(event);
      let grid = item.getGrid();
      let items = grid.getItems();
      for (let i = 0; i < items.length; i++) {
        let key = items[i].getElement().children[0].dataset.key;
        this.currentCharts[key]['order'] = i;
      }
      stateStore.setState(stateStore.keys.selectedCharts, this.currentCharts);
    }
  }
};
</script>