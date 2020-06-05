<template>
  <div>
  </div>
</template>
<style>
  .pos-f-t {
    color: white;
  }
</style>
<script>
  // import $ from 'jquery';
  const remote = require('electron').remote;
  export default {
    name: 'Header',
    methods: {
      login () {
      },
      close () {
        var window = remote.getCurrentWindow();
        window.close();
      },
      minimize () {
        var window = remote.getCurrentWindow();
        window.minimize();
      },
      maximize () {
        var window = remote.getCurrentWindow();
        if (!window.isMaximized()) {
          window.maximize();
        } else {
          window.unmaximize();
        }
      }
    },
    mounted () {
      console.log(window.navigator.onLine);
    }
  };
</script>