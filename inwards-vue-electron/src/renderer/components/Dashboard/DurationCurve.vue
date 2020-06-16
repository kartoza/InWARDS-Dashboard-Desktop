<script>
  import 'c3/c3.min.css';
  import c3 from 'c3';
  import axios from 'axios';
  import ChartContainer from './ChartContainer';
  require('promise.prototype.finally').shim();

  export default {
    extends: ChartContainer,
    data () {
      return {
        chartTitle: 'Unverified Discharge Duration Curve',
        chartId: 'unverified-discharge-duration-curve',
        baseUrl: 'http://inwards.award.org.za/app_json/duration.php'
      };
    },
    methods: {
      fetchChartData () {
        let self = this;
        this.loading = true;
        const url = `${this.baseUrl}?${this.dictToUri(this.urlParameters)}`;
        if (!self.mounted) {
          setTimeout(function () {
            self.fetchChartData();
          }, 1000);
          return;
        }
        console.log('Fetching Duration Curve...');
        axios.get(url).then(response => {
          let durationData = response.data;
          setTimeout(() => {
            c3.generate({
              bindto: '#' + self.chartDivId,
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
      }
    }
  };
</script>