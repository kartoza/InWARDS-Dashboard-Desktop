<script>
  import 'c3/c3.min.css';
  import c3 from 'c3';
  import {timeFormat} from 'd3-time-format';
  import axios from 'axios';
  import ChartContainer from './ChartContainer';
  require('promise.prototype.finally').shim();

  export default {
    extends: ChartContainer,
    data () {
      return {
        chartTitle: 'Unverified timeseries',
        chartId: 'unverified-timeseries',
        baseUrl: 'http://inwards.award.org.za/app_json/unverified_timeseries.php'
      };
    },
    methods: {
      fetchChartData () {
        let self = this;
        console.log('Fetching...');
        this.loading = true;
        const url = `${this.baseUrl}?${this.dictToUri(this.urlParameters)}`;
        if (!self.mounted) {
          setTimeout(function () {
            self.fetchChartData();
          }, 1000);
        }
        axios.get(url).then(response => {
          let chartData = response.data;
          self.chartUrl = url;
          setTimeout(() => {
            c3.generate({
              bindto: '#' + self.chartId,
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
                pattern: [
                  'rgba(128,0,0, 0.3)', 'rgba(255, 0, 0, 0.3)', 'rgba(255, 106, 0, 0.3)',
                  'rgba(255, 216, 0, 0.3)', 'rgba(0, 255, 33, 0.3)', 'rgba(0, 38, 255, 0.3)',
                  'rgb(0,0,0)', 'rgb(105,105,105)', '#6b1135', '#9a0410', '#90cb9e', '#fecb9d',
                  '#5f9052', '#3d7d7f', '#8ca227', '#1a0333', '#907510']
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
      }
    }
  };
</script>