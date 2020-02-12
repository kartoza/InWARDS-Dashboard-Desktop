<template>
  <div class="card">
    <div class="card-header">Chart</div>
    <div class="card-body">
      Chart
      <div id="chart"></div>
    </div>
  </div>
</template>
<script>
  // import * as d3 from 'd3';

  import 'c3/c3.min.css';
  import c3 from 'c3';
  export default {
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
    }
  };
</script>