angular.module('app.controllers', [])
  
.controller('vigneronsProximitCtrl', function ($scope, $state, $location, $cordovaGeolocation, $stateParams, GoogleMaps, Markers) {
    $scope.vignerons = $stateParams.vignerons;
    $scope.vigneronDetails = function (vigneron) {
        $state.go('tabsController.vigneronsDetails', { vigneron: vigneron });
    };
    GoogleMaps.init("AIzaSyD3tHZN0NQTrjSdU1jY8ZMd-DLzBswVcAU");

})

.controller('vigneronsProxListCtrl', function ($scope, $state, $cordovaGeolocation, VigneronsProches, HistoryMonitor) {
    $scope.vignerons = VigneronsProches.chercherRange();
    $scope.vigneronDetails = function (vigneron) {
        $state.go('tabsController.vigneronsDetails', { vigneron: vigneron });
    };
    $scope.carteVignerons = function (vignerons) {
        $state.go('tabsController.vigneronsProximit', { vignerons: vignerons });
    };
    $scope.histoire = HistoryMonitor.getData();

})

.controller('vigneronsDetailsCtrl', function ($scope, $state, $cordovaGeolocation, $stateParams, HistoryMonitor) {
    $scope.vigneron = $stateParams.vigneron;
    $scope.histoire = HistoryMonitor.getData();
})
   
.controller('chercherCtrl', function ($scope, $state, ResultatRecherche, HistoryMonitor) {
    $scope.histoire = HistoryMonitor.getData();
    $scope.trouverVigneron = function (datainput) {
        $scope.value = datainput;
        $scope.vignerons = ResultatRecherche.recherche($scope.value.CNtest, $scope.value.textinput);
        $state.go('tabsController.resultatRecherche', { vignerons: $scope.vignerons });
    }

})
   
.controller('resultatRechercheCtrl', function ($scope, $state, $location, $stateParams, HistoryMonitor) {
    $scope.vignerons = $stateParams.vignerons;
    $scope.histoire = HistoryMonitor.getData();
    $scope.vigneronDetails = function (vigneron) {
        $state.go('tabsController.vigneronsSearchDetails', { vigneron: vigneron });
    };
    $scope.carteVignerons = function (vignerons) {
        $state.go('tabsController.vigneronsProximit', { vignerons: vignerons });
    };

})

.controller('vigneronsDetailsCtrl', function ($scope, $state, $cordovaGeolocation, $stateParams, HistoryMonitor) {
    $scope.vigneron = $stateParams.vigneron;
    $scope.histoire = HistoryMonitor.getData();
})

.controller('accueilCtrl', function ($scope, $state, EventsList) {
    $scope.events = EventsList.all();

})

.controller('aProposCtrl', function ($scope) {

})

.controller('infoWindowCtrl', function ($scope) {
    showInfo = function () {
        console.log('Button clicked!');
    }
})