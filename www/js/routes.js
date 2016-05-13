angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    
  

   .state('tabsController.vigneronsProxList', {
        url: '/vignerons-proximite-list',
        views: {
          'tab1': {
            templateUrl: 'templates/vigneronsProxList.html',
            controller: 'vigneronsProxListCtrl'
          }
        }
    })

      .state('tabsController.vigneronsProximit', {
          url: '/vignerons-proximite/:VigneronList',
          views: {
              'tab1': {
                  templateUrl: 'templates/vigneronsProximit.html',
                  controller: 'vigneronsProximitCtrl'
              }
          },
          params: {
              vignerons: null
          }
      })

      .state('tabsController.vigneronsDetails', {
          url: '/vignerons-details/:vigneronId',
          views: {
              'tab1': {
                  templateUrl: 'templates/vigneronsDetails.html',
                  controller: 'vigneronsDetailsCtrl'
              }
          },
          params: {
              vigneron:null
          }
      })
      .state('tabsController.vigneronsSearchDetails', {
          url: '/vignerons-search-details/:vigneronId',
          views: {
              'tab2': {
                  templateUrl: 'templates/vigneronsDetails.html',
                  controller: 'vigneronsDetailsCtrl'
              }
          },
          params: {
              vigneron: null
          }
      })

      .state('tabsController.resultatRecherche', {
          url: '/vignerons-recherche/',
          views: {
              'tab2': {
                  templateUrl: 'templates/resultatRecherche.html',
                  controller: 'resultatRechercheCtrl'
              }
          },
          params: {
              vignerons: null
          }
      })

      .state('tabsController.chercher', {
        url: '/chercher-vignerons',
        views: {
          'tab2': {
            templateUrl: 'templates/chercher.html',
            controller: 'chercherCtrl'
          }
        }
      })

      .state('tabsController.accueil', {
        url: '/accueil-world-wine',
        views: {
          'tab3': {
            templateUrl: 'templates/accueil.html',
            controller: 'accueilCtrl'
          }
        }
      })

      .state('tabsController', {
        url: '/page1',
        templateUrl: 'templates/tabsController.html',
        abstract:true
      })

      .state('tabsController.aPropos', {
        url: '/apropos',
        views: {
          'tab4': {
            templateUrl: 'templates/aPropos.html',
            controller: 'aProposCtrl'
          }
        }
      })

      $urlRouterProvider.otherwise('/page1/accueil-world-wine')

  

    });