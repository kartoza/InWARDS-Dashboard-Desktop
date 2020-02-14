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
          {{ chartData }}
          <!-- <div id="chart"></div> -->
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
        urlParameters: {
          stations: [],
          sd: '',
          ed: '',
          type: 0
        }
      };
    },
    mounted () {
      let chart = c3.generate({
        bindTo: '#chart',
        data: {
          columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
          ]
        }
      });
      console.log(chart);
    },
    methods: {
      _fetchChartData () {
        console.log('Fetching...');
        this.loading = true;
        const url = `${this.baseUrl}?${this.dictToUri(this.urlParameters)}`;
        axios.get(url).then(response => {
          this.chartData = response.data;
        }).catch(error => {
          console.log(error.response);
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