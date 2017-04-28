'use strict';
//=============================================================================
/**
 * dependencies
 */
//=============================================================================
const Vue = require('vue');
//=============================================================================
/**
 * config
 */
//=============================================================================
Vue.use(require('vue-resource'));
Vue.http.options.root = '/root';
//=============================================================================
/**
 * helper functions
 */
//=============================================================================
function generateUID() {
  const
    date = new Date().getTime(),
    xterBank = 'abcdefghijklmnopqrstuvwxyz';
  let
    fstring = '',
    i;
  for(i = 0; i < 15; i++) {
    fstring += xterBank[parseInt(Math.random()*26)];
  }
  return (fstring += date);
}
//=============================================================================
/**
 * VM
 */
//=============================================================================
const VM = new Vue({
  el: '#app',
  data: {
    userID: '',
    output: [],
    userInput: '',
    welcomeURL: '/welcome',
    userInputURL: '/userInput',
    loadingSpinner: true
  },
  methods: {
    sendUserInput: function () {
      if(this.userInput.trim()) {
        this.loadingSpinner = true;
        const
          msg = this.userInput.trim(),
          URL = this.userInputURL;
        console.log(`data sent to backend... URL: ${URL}, msg: ${msg}`);
        this.$http.post(URL, {userInput: msg, userID: this.userID})
          .then(data => {
            this.loadingSpinner = false;
            console.log('response from backend...');
            console.log(data);
            this.output = [];
            return this.output.push(data.body.data);
          })
          .catch(info => {
            this.loadingSpinner = false;
            console.log('yawa gas...');
            return console.log(info);
          });
        return this.userInput = '';
      } else {
        return;
      }
    }
  },
  mounted: function () {
    console.log('mounted fired...');
    this.userID = generateUID();
    console.log(`userID: ${this.userID}`);
    const URL = this.welcomeURL;
    this.$http.get(URL)
      .then(data => {
        console.log('response from backend...');
        console.log(data);
        return setTimeout(() => {
          this.loadingSpinner = false;
          return this.output = data.body.data;
        }, 1500);
      })
      .catch(info => {
        this.loadingSpinner = false;
        console.log('yawa gas...');
        return console.log(info);
      });
  }
});
//=============================================================================
