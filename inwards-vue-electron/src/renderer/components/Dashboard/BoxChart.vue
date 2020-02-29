<template>
  <div class="card" v-bind:style="styleObject">
    <div class="card-header bg-secondary">
      <div class="row">
          <div class="col-md-6">  
            <h6 style="color: white;">Unverified Discharge Boxplot</h6>
          </div>
          <div class="col-md-6">
            <div class="dropdown show">
              <a class="btn btn-secondary fa fa-bars" style="float: right; font-size: 20px;" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></a>
              <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <a class="dropdown-item" href="#"><i class="fa fa-search-plus" style="padding-right: 10px;"></i>Zoom</a>
                <a class="dropdown-item" href="#"><i class="fa fa-question-circle" style="padding-right: 10px;"></i>Tooltip</a>
                <a class="dropdown-item" href="#"><i class="fa fa-download" style="padding-right: 10px;"></i>Download Data</a>
                <a class="dropdown-item" href="#"><i class="fa fa-floppy-o" style="padding-right: 10px;"></i>Save Chart</a>
              </div>
            </div>
          </div>
        </div>
    </div>
    <div class="card-body box-container">
      <section v-if="errored">
        <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
      </section>
      <section v-else>
        <div v-if='loading'>Loading...</div>
        <div v-else>
          <div id="boxchart" style="height: 400px;"></div>
        </div>
      </section>
    </div>
  </div>
</template>
<style>
  .box-container {
    max-height: 400px;
    overflow-y: auto;
  }
</style>
<script>
  import 'c3/c3.min.css';
  import axios from 'axios';
  import 'jquery/dist/jquery.min.js';
  import Plotly from 'plotly.js-dist';
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
        baseUrl: 'http://inwards.award.org.za/app_json/boxplot.php',
        testUrl: 'http://inwards.award.org.za/app_json/boxplot.php?stations=B2H014%2CB2R001&sd=2020-02-01&ed=2020-02-17&type=0',
        urlParameters: {
          stations: [],
          sd: '',
          ed: '',
          type: 0
        }
      };
    },
    methods: {
      _fetchBoxData () {
        console.log('Fetching...');
        this.loading = true;
        const url = `${this.baseUrl}?${this.dictToUri(this.urlParameters)}`;
        axios.get(url).then(response => {
          let jsonData = response.data;
          let boxData = [];
          console.log(boxData);
          setTimeout(() => {
            let layout = {
              title: false,
              font: {
                family: 'Raleway, Calibri',
                size: 12
              },
              yaxis: {
                title: 'Discharge (cumecs)',
                autorange: true,
                zeroline: true,
                dtick: 20,
                gridwidth: 1,
                zerolinecolor: 'rgb(0, 0, 0)',
                zerolinewidth: 2
              },
              margin: {
                l: 50,
                r: 50,
                b: 50,
                t: 50,
                pad: 4
              },
              paper_bgcolor: 'rgb(255, 255, 255)',
              plot_bgcolor: 'rgb(255, 255, 255)',
              showlegend: false
            };
            for (let variable in jsonData) {
              boxData.push(jsonData[variable]);
            }
            Plotly.newPlot('boxchart', boxData, layout, {displayModeBar: false});
          }, 1000);
        }).catch(error => {
          console.log(error);
          this.errored = true;
        }).finally(() => { this.loading = false; });
      },
      displayBox (stations, sd, ed, type = 0) {
        this.styleObject.display = 'block';
        this.urlParameters.stations = stations;
        this.urlParameters.sd = sd;
        this.urlParameters.ed = ed;
        this.urlParameters.type = type;
        this._fetchBoxData();
      }
    }
  };
</script>