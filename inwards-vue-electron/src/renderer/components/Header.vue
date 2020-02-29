<template>
  <div>
    <div class="pos-f-t">
      <nav class="navbar navbar-expand-md navbar-dark sticky-top bg-dark" style="height: 40px">
        <a class="navbar-brand"><h5 style="text-align: center; padding-top: 8px;">INWARDS<img src="../assets/icon.png" width="23.4px" height="20px" align="left" style="margin-right: 3px; margin-top: 2px;"></h5></a>
        <span class="online-status"></span>  
          <ul class="navbar-nav mr-auto">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" id="navbardrop" data-toggle="dropdown">
                  File
              </a>
              <div class="dropdown-menu">
                <a class="dropdown-item"><a href="#" class="nav-link" style="color: black;"><i class="fa fa-tachometer" style="padding-right:10px; color: black;"></i>Your Dashboard</a></a>
                <a class="dropdown-item"><a href="#" class="nav-link" style="color: black;"><i class="fa fa-wrench" style="padding-right:10px; color: black;"></i>Preferences</a></a>
              </div>
            </li>

          </ul>
          <ul class="navbar-nav">
            <li  class="nav-item"><a href="#" class="nav-link"><i class="fa fa-user" style="padding-right:2px;"></i>Sign Up</a></li>
            <li class="nav-item"><a href="#" class="nav-link" @click="login()"><i class="fa fa-sign-in" style="padding-right:2px;"></i>Login</a></li>
            <li class="nav-item"><a class="nav-link"  @click="minimize()"><i class="fa fa-window-minimize"></i></a></li>
            <li class="nav-item"><a class="nav-link"  @click="maximize()"><i class="fa fa-window-maximize"></i></a></li>
            <li class="nav-item"><a class="nav-link"  @click="close()"><i class="fa fa-window-close"></i></a></li>
          </ul>
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
  const remote = require('electron').remote;
  export default {
    name: 'Header',
    methods: {
      login () {
        alert('test');
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