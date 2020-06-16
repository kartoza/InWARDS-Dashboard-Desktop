<script>
  import ChartContainer from './ChartContainer';
  import $ from 'jquery';
  export default {
    extends: ChartContainer,
    data () {
      return {
        chartId: 'station',
        chartDivId: 'station',
        chartTitle: 'Gauging station: ',
        errored: false,
        loading: true,
        styleObject: {
          display: 'none'
        }
      };
    },
    methods: {
      displayChart (stations, sd, ed) {
        this.urlParameters.stations = stations;
        this.urlParameters.sd = sd;
        this.urlParameters.ed = ed;
        this.loading = false;
        let self = this;
        this.styleObject.display = 'block';
        if (!document.getElementById(this.chartDivId)) {
          setTimeout(function () {
            self.displayChart(stations, sd, ed);
          }, 1000);
        }
        let chartTitle = $(this.$el).find('.chart-title');
        chartTitle.html('Gauging station:' + stations[0]);
        let div = $(`#${this.chartDivId}`);
        let img = $('<img style="height: 100%; display: block; margin: auto;">');
        div.html(img);
        div.css('background', 'rgba(222, 226, 230, 0.41)');
        img.attr('src', 'http://inwards.award.org.za/images/' + stations[0].substring(0, 6) + '.jpg');
      }
    }
  };
</script>