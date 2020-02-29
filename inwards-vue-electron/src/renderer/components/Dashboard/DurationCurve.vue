<template>
  <div class="card" v-bind:style="styleObject">
    <div class="card-header bg-secondary">
   <div class="row">
    <div class="col-md-6">  
    <h6 style="color: white;">Unverified Discharge Duration Curve</h6>
    </div>
    <div class="col-md-6">
    <div class="dropdown show">
      <a class="btn btn-secondary fa fa-bars" style="float: right; font-size: 20px;" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      </a>
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
    <div class="card-body duration-container">
      <section v-if="errored">
        <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
      </section>
      <section v-else>
        <div v-if='loading'>Loading...</div>
        <div v-else>
          <div id="durationDiv" style="height: 400px;"></div>
        </div>
      </section>
    </div>
  </div>
</template>
<style>
  .duration-container {
    max-height: 400px;
    height: 400px;
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
        durationData: null,
        errored: false,
        loading: true,
        styleObject: {
          display: 'none'
        },
        baseUrl: 'http://inwards.award.org.za/app_json/duration.php',
        testUrl: 'http://inwards.award.org.za/app_json/duration.php?stations=B7H015,B7H007&sd=2019-12-01&ed=2019-12-31&type=0',
        urlParameters: {
          stations: [],
          sd: '',
          ed: '',
          type: 0
        }
      };
    },
    methods: {
      _fetchDurationData () {
        console.log('Fetching...');
        this.loading = true;
        const url = `${this.baseUrl}?${this.dictToUri(this.urlParameters)}`;
        axios.get(url).then(response => {
          let durationData = response.data;
          console.log(durationData);
          setTimeout(() => {
            c3.generate({
              bindto: '#durationDiv',
              data: durationData,
              axis: {
                x: {
                  label: {
                    text: 'Exceedance Probability (%)',
                    position: 'outer-center'
                  },
                  tick: {
                    fit: true,
                    count: 10
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
                pattern: ['rgb(0,0,0)', 'rgb(105,105,105)', '#6b1135', '#9a0410', '#90cb9e', '#fecb9d', '#5f9052', '#3d7d7f', '#8ca227', '#1a0333', '#907510']
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
      displayDurationCurve (stations, sd, ed, type = 0) {
        this.styleObject.display = 'block';
        this.urlParameters.stations = stations;
        this.urlParameters.sd = sd;
        this.urlParameters.ed = ed;
        this.urlParameters.type = type;
        this._fetchDurationData();
      }
    }
  };
</script>