<script>
  import 'c3/c3.min.css';
  import axios from 'axios';
  import 'jquery/dist/jquery.min.js';
  import Plotly from 'plotly.js-dist';
  import ChartContainer from './ChartContainer';
  require('promise.prototype.finally').shim();

  export default {
    extends: ChartContainer,
    data () {
      return {
        chartTitle: 'Unverified Discharge Boxplot',
        chartId: 'unverified-discharge-boxplot',
        baseUrl: 'http://inwards.award.org.za/app_json/boxplot.php'
      };
    },
    methods: {
      fetchChartData () {
        console.log('Fetching...');
        let self = this;
        this.loading = true;
        const url = `${this.baseUrl}?${this.dictToUri(this.urlParameters)}`;
        axios.get(url).then(response => {
          let jsonData = response.data;
          let boxData = [];
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
                dtick: 5,
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
            document.getElementById(self.chartDivId).innerHTML = '';
            Plotly.newPlot(self.chartDivId, boxData, layout, {displayModeBar: false});
          }, 1000);
        }).catch(error => {
          console.log(error);
          this.errored = true;
        }).finally(() => { this.loading = false; });
      }
    }
  };
</script>