<template>
  <div>
    <Header />
    <div class="container-fluid" style="margin-top: 20px">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">Selected WMA
                <button style="float:right" class="btn btn-success my-2 my-sm-0 pull-right" @click="backToMapSelect()" type="button">
                  Back to map select
                </button>
            </div>
            <div class="card-body">
              <blockquote class="blockquote mb-0">
                <p>Selected WMA : </p>
                <div id="wma-list"></div>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Header from './Header';
  import router from '../router/index';
  import $ from 'jquery';

  export default {
    mounted () {
      console.log('mounted');
      let $wmaList = $('#wma-list');
      console.log($wmaList);
      this.$db.find({}, function (error, docs) {
        if (error) {
          return;
        }
        for (let i = 0; i < docs.length; i++) {
          $wmaList.append(`<span class="badge badge-primary" style="margin-right:10px">${docs[i]['selected_wma']}</span>`);
        }
      });
    },
    components: {
      Header
    },
    methods: {
      backToMapSelect () {
        router.push({ path: '/' });
      }
    }
  };
</script>