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
const VM = new Vue({
  el: '#app',
  data: {
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
          userInputData = {
            input: msg
          },
          URL = this.userInputURL;
        console.log(`data sent to backend... URL: ${URL}, msg: ${msg}`);
        console.log(userInputData);
        this.$http.post(URL, {data: userInputData})
          .then(data => {
            this.loadingSpinner = false;
            console.log('response from backend...');
            console.log(data);
            return this.output = data.body.data;
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
    const URL = this.welcomeURL;
    this.$http.get(URL)
      .then(data => {
        this.loadingSpinner = false;
        console.log('response from backend...');
        console.log(data);
        return this.output = data.body.data;
      })
      .catch(info => {
        this.loadingSpinner = false;
        console.log('yawa gas...');
        return console.log(info);
      });
  }
});
//=============================================================================
