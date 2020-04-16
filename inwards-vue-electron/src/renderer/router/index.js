import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'map-landing-page',
      component: require('@/components/LandingPage/MapLandingPage').default
    },
    {
      path: '/dashboard',
      name: 'dashboard-page',
      component: require('@/components/Dashboard/Dashboard').default
    },
    {
      path: '/user-dashboard',
      name: 'user-dashboard-page',
      component: require('@/components/UserDashboard/Dashboard').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});
