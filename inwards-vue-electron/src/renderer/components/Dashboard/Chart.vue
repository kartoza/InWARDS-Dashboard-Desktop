<template>
  <div class="card" v-bind:style="styleObject">
    <div class="card-header">Chart</div>
    <div class="card-body chart-container">
      <section v-if="errored">
        <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
      </section>
      <section v-else>
        <div v-if='loading'>Loading...</div>
        <div v-else>
          <div id="chart"></div>
        </div>
      </section>
    </div>
  </div>
</template>
<style>
  .chart-container {
    max-height: 450px;
    overflow-y: auto;
  }
</style>
<script>
  import 'c3/c3.min.css';
  import c3 from 'c3';
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
        axios.get(url).then(response => {
          c3.generate({
            bindTo: '#chart',
            data: JSON.parse(response.data),
            axis: {
              x: {
                type: 'timeseries',
                tick: {
                  format: '%Y-%m-%d %H:%I:%S',
                  count: 50,
                  fit: true,
                  multiline: true
                }
              }
            },
            point: {
              show: false
            },
            line: {
              connectNull: false
            }
          });
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