<template>
  <div>
    <div class="pos-f-t">
      <nav class="navbar navbar-dark bg-dark">
        <h3>InWARDS Dashboard</h3>
        <span class="online-status"></span>
        <button class="btn btn-success my-2 my-sm-0" @click="login()" type="button">Login</button>
      </nav>
    </div>
  </div>
</template>
<style>
  .pos-f-t {
    color: white;
  }
</style>
<script>
  // import $ from 'jquery';
  export default {
    name: 'Header',
    methods: {
      login () {
        alert('test');
      }
    },
    mounted () {
      console.log(window.navigator.onLine);
    }
  };
</script>