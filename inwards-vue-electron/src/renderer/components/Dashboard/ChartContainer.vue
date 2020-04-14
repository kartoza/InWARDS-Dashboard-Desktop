<template>
  <div class="card rounded-0 box" v-bind:style="styleObject">
    <div class="card-header inwards_card">
   <div class="row">
    <div class="col-md-12">  
    <h6 style="color: white; margin-top: 10px; width: 50%; float: left;">{{ chartTitle }}</h6>
      <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups" style="float: right;">
        <div class="btn-group mr-2" role="group" aria-label="First group">
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Zoom"><i class="fa fa-search-plus" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Tooltip"><i class="fa fa-question-circle" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Download"><i class="fa fa-download" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Save"><i class="fa fa-floppy-o" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Add to your dashboard" v-on:click="addToStore"><i class="fa fa-plus" style="padding-right: 10px;"></i></button>
          </div>
      </div>
    </div>
    </div>
    </div>
    <div class="card-body chart-container">
      <section v-if="errored">
        <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
      </section>
      <section v-else>
        <div v-if='loading'>Loading...</div>
        <div v-else>
          <div :id="chartId" style="height: 100%;">Loading...</div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import stateStore from '../../store/state_handler';
export default {
  name: 'chart-container',
  data () {
    return {
      chartId: null,
      chartUrl: '',
      mounted: false
    };
  },
  mounted () {
    let self = this;
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
      self.mounted = true;
    });
  },
  methods: {
    addToStore () {
      let self = this;
      let stations = this.urlParameters['stations'];
      let chartStoreId = this.chartId + '-' + stations.join(',');
      stateStore.getState(
        stateStore.keys.selectedCharts,
        function (selectedCharts) {
          if (selectedCharts) {
            console.log(selectedCharts);
            if (selectedCharts.hasOwnProperty(chartStoreId)) {
              alert('This chart has been already added to user dashboard');
              return;
            }
            selectedCharts[chartStoreId] = {
              'chartId': self.chartId,
              'chartStations': stations
            };
          } else {
            selectedCharts = {};
            selectedCharts[chartStoreId] = {
              'chartId': self.chartId,
              'chartStations': stations
            };
          }
          alert('Successfully added to user dashboard');
          stateStore.setState(stateStore.keys.selectedCharts, selectedCharts);
        }
      );
    }
  }
};
</script>