<template>
  <div class="card rounded-0 box" v-bind:style="styleObject">
    <div class="card-header inwards_card">
   <div class="row">
    <div class="col-md-12">  
    <h6 style="color: white; margin-top: 10px; width: 50%; float: left;">Unverified Discharge Duration Curve</h6>
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
    <div class="card-body chart-container">
      <section v-if="errored">
        <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
      </section>
      <section v-else>
        <div v-if='loading'>Loading...</div>
        <div v-else>
          <div id="durationDiv" style="height: 380px;"></div>
        </div>
      </section>
    </div>
  </div>
</template>
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
                    format: function (d) { return Math.ceil(d); },
                    count: 20
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