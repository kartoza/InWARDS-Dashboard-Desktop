<template>
  <div class="modal rounded-0 fade modal_center" tabindex="-1" id="login-modal" data-keyboard="false" data-backdrop="static">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Please Verify Access</h5>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="emailAddress">Email address</label>
            <input type="email" class="form-control rounded-0" id="emailAddress" v-model="emailAddress" aria-describedby="emailHelp" placeholder="Enter email">
            <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
          </div>
          <div class="form-group">
            <label for="uniqueCode">Unique Code</label>
            <input type="text" class="form-control rounded-0" id="uniqueCode" placeholder="Unique Code" v-model="uniqueCode">
          </div>
          <button id="verifyCode" type="submit" class="btn rounded-0 inwards_button" v-on:click="submit">Submit</button>
          <button type="submit" class="btn rounded-0 inwards_button" v-on:click="requestAccess">Request Access</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import $ from 'jquery';
import stateStore from '../store/state_handler';
const { shell } = require('electron');
const { dialog } = require('electron').remote;
export default {
  data () {
    return {
      isLoggedIn: false,
      emailAddress: '',
      uniqueCode: ''
    };
  },
  mounted () {
    let self = this;
    this.$bus.$on('databaseValidated', () => {
      // Check user login status
      if (!this.isLoggedIn) {
        console.log('Check user login status in local store');
        stateStore.getState(
          stateStore.keys.loginStatus, (status) => {
            if (!status) {
              self.loginStatus = false;
            } else {
              if (status.hasOwnProperty('loggedIn')) {
                self.loginStatus = status['loggedIn'];
              } else {
                self.loginStatus = false;
              }
            }
            if (!self.loginStatus) {
              self.showLoginModal();
            }
          });
      }
    });
  },
  methods: {
    checkUserLoggedIn () {
      console.log('Check if user is logged in');
    },
    showLoginModal () {
      let loginModal = $('#login-modal');
      loginModal.modal({
        backdrop: 'static',
        keyboard: false
      });
    },
    requestAccess (e) {
      shell.openExternal('mailto:hugo@award.org.za?subject=Request Access to InWARDS Dashboard&body=');
    },
    submit (e) {
      let self = this;
      let button = $(e.target);
      let loginModal = $('#login-modal');
      button.prop('disabled', true);
      button.html(`Submitting...`);
      $.get('http://inwards.award.org.za/app_json/user_verification.php?email=' + this.emailAddress + '&code=' + this.uniqueCode, function (data) {
        if (data === 'true') {
          loginModal.modal('hide');
          stateStore.setState(stateStore.keys.loginStatus, {
            'loggedIn': true,
            'emailAddress': self.emailAddress,
            'uniqueCode': self.uniqueCode,
            'timestamp': Date.now()
          }, false);
          self.loggedIn = true;
          dialog.showMessageBox(null, {
            type: 'info',
            message: 'Successfully Verified!',
            buttons: ['OK']
          });
          stateStore.updateFromServer(() => {
            setTimeout(function () {
              window.location.reload();
            }, 200);
          });
        } else {
          button.prop('disabled', false);
          button.html(`Submit`);
          dialog.showMessageBox(null, {
            type: 'error',
            message: 'Failed to Verifiy!',
            buttons: ['OK']
          });
        }
      });
    }
  }
};
</script>