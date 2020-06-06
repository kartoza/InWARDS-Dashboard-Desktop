/* eslint-disable no-unused-vars */
import Vue from 'vue';
import axios from 'axios';

import $ from 'jquery';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/util.js';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'jquery/dist/jquery.min.js';
import '@/static/css/font-awesome.min.css';
import '@/static/css/custom.css';
import '@/utils/helpers.js';
import 'material-design-iconic-font/dist/css/material-design-iconic-font.css';

import App from './App';
import router from './router';
import store from './store';
import db from './datastore';
import sqlite from './sqlite';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.prototype.$db = db;
Vue.prototype.$ = $;
Vue.prototype.$bus = new Vue();
Vue.prototype.isLoggedIn = false;
Vue.prototype.devMode = process.env.NODE_ENV === 'development';

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');

const path = require('path');
const url = require('url');
const customTitlebar = require('custom-electron-titlebar');
new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex('#3C3C3C'),
  icon: url.format(path.join(__dirname, '/assets', '/icon.png'))
});
