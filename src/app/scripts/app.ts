//avoid compailer error messages   
declare var angular: any;
declare var _: any;
declare var $: any;
module app {
  'use strict';
  angular.module('app', [
    // dependant
    'ui.router',
    'ngAnimate',

    //services
    'app.dataservice',
    'app.core.stateChecking',
    'app.fileupload',

    //structure
    'app.core',
    'app.layout',

    // states/components
    'app.welcome',
    'app.terms',
    'app.application',
    'app.complete',

    //directives
    'app.fileModel',
    'app.validateNumber',
    'app.appNumber',
    'app.uivalidation'
  ]);
}  