<script>
  import ChartContainer from './ChartContainer';
  import $ from 'jquery';
  export default {
    extends: ChartContainer,
    data () {
      return {
        chartId: 'station',
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
        if (!document.getElementById(this.chartId)) {
          setTimeout(function () {
            self.displayChart(stations, sd, ed);
          }, 1000);
        }
        let chartTitle = $(this.$el).find('.chart-title');
        chartTitle.html('Gauging station:' + stations[0]);
        let div = $(`#${this.chartId}`);
        let img = $('<img style="width: 100%; heigth: 100%">');
        div.html(img);
        img.attr('src', 'http://inwards.award.org.za/images/' + stations[0].substring(0, 6) + '.jpg');
      }
    }
  };
</script>