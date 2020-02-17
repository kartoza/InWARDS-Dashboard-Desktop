/* eslint-disable one-var */
/* eslint-disable no-extend-native */
import Vue from 'vue';
String.prototype.hashCode = function () {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
Vue.mixin({
  methods: {
    dictToUri: dictionary => {
      var str = [];
      for (var p in dictionary) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(dictionary[p]));
      }
      return str.join('&');
    },
    formatDate: date => {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
      if (month.length < 2) {
        month = '0' + month;
      }
      if (day.length < 2) {
        day = '0' + day;
      }
      return [year, month, day].join('-');
    }
  }
});
