<template>
  <div class="card rounded-0 box" v-bind:style="styleObject">
    <div class="card-header inwards_card">
   <div class="row">
    <div class="col-md-12">  
    <h6 style="color: white; margin-top: 10px; width: 50%; float: left;">Unverified Discharge Timeseries</h6>
      <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups" style="float: right;">
        <div class="btn-group mr-2" role="group" aria-label="First group">
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Zoom"><i class="fa fa-search-plus" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Tooltip"><i class="fa fa-question-circle" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Download"><i class="fa fa-download" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Savee"><i class="fa fa-floppy-o" style="padding-right: 10px;"></i></button>
            <button type="button" class="btn inwards_button_group" data-toggle="tooltip" data-placement="top" title="Add to your dashboard"><i class="fa fa-plus" style="padding-right: 10px;"></i></button>
          </div>
      </div>
    </div>
    </div>
    </div>
    <div class="card-body chart-container" style="margin-top: 5px;">
      <section v-if="errored">
        <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
      </section>
      <section v-else>
        <div v-if='loading'>Loading...</div>
        <div v-else>
          <div id="chart" style="height: 400px;"></div>
        </div>
      </section>
    </div>
  </div>
</template>
<style>
  .chart-container {
    max-height: 400px;
    height: 400px;
    overflow-y: auto;
  }
</style>
<script>
  import 'c3/c3.min.css';
  import c3 from 'c3';
  import {timeFormat} from 'd3-time-format';
  import axios from 'axios';
  require('promise.prototype.finally').shim();

  export default {
    data () {
      return {
        chartData: null,
        errored: false,
        loading: true,
        styleObject: {
          display: 'none'
        },
        baseUrl: 'http://inwards.award.org.za/app_json/unverified_timeseries.php',
        testUrl: 'http://inwards.award.org.za/app_json/unverified_timeseries.php?stations=B2H014%2CB2R001&sd=2020-02-01&ed=2020-02-17&type=0',
        urlParameters: {
          stations: [],
          sd: '',
          ed: '',
          type: 0
        }
      };
    },
    methods: {
      _fetchChartData () {
        console.log('Fetching...');
        this.loading = true;
        const url = `${this.baseUrl}?${this.dictToUri(this.urlParameters)}`;
        console.log(url);
        axios.get(url).then(response => {
          let chartData = response.data;
          setTimeout(() => {
            c3.generate({
              bindto: '#chart',
              data: chartData,
              zoom: {
                enabled: true,
                rescale: true,
                type: 'drag'
              },
              axis: {
                x: {
                  type: 'timeseries',
                  tick: {
                    fit: true,
                    format: function (x) {
                      var formatSeconds = timeFormat('%Y-%m-%d %H:%S');
                      return formatSeconds(new Date(x * 1000));
                    },
                    count: 8,
                    rotate: 45
                  }
                },
                y: {
                  label: {
                    text: 'Discharge (cumecs)',
                    position: 'outer-middle'
                  },
                  min: 0,
                  padding: {top: 0, bottom: 0
                  }
                }
              },
              tooltip: {
                show: true
              },
              point: {
                show: false
              },
              color: {
                pattern: ['rgba(128,0,0, 0.3)', 'rgba(255, 0, 0, 0.3)', 'rgba(255, 106, 0, 0.3)', 'rgba(255, 216, 0, 0.3)', 'rgba(0, 255, 33, 0.3)', 'rgba(0, 38, 255, 0.3)', 'rgb(0,0,0)', 'rgb(105,105,105)', '#6b1135', '#9a0410', '#90cb9e', '#fecb9d', '#5f9052', '#3d7d7f', '#8ca227', '#1a0333', '#907510']
              },
              line: {
                connectNull: false
              }
            });
          }, 1000);
        }).catch(error => {
          console.log(error);
          this.errored = true;
        }).finally(() => { this.loading = false; });
      },
      displayChart (stations, sd, ed, type = 0) {
        this.styleObject.display = 'block';
        this.urlParameters.stations = stations;
        this.urlParameters.sd = sd;
        this.urlParameters.ed = ed;
        this.urlParameters.type = type;
        this._fetchChartData();
      }
    }
  };
</script>