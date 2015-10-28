'use strict';

// Useful wrapper
// FIXME this should live elsewhere, perhaps in a underscore.string.stub file
String.prototype.format = function () {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(this.toString());
  return _.str.sprintf.apply(this, args);
};

var app = angular.module('IdelApp', []);

app.controller('IdelController', function ($scope, $http, PortService, SettingsService, IRCService, InputService, ColorService, ModalService) {
  $scope.settings = SettingsService;
  $scope.irc = IRCService;
  $scope.port = PortService;

  $scope.$on('ui::input-box::send', function (ev, input) {
    InputService.parse(input.message);
  });
  
  $scope.$on('ui::switch-channel', function (ev, args) {
    $scope.irc.setCurrentChannel(args.network, args.channel);
  });
  
  var loadStyle = function () {
    var val = $scope.settings.get('theme.user-css');

    var css = document.getElementById('user-css');
    if (css) {
      document.body.removeChild(css);
    }

    if (!val)
      return;
    
    $http.get(val + '?' + moment().unix(), { responseType: 'blob' }).success(function (response) {
      css = document.createElement('link');
      css.rel = 'stylesheet';
      css.type = 'text/css';
      css.href = window.webkitURL.createObjectURL(response);
      
      document.body.appendChild(css);
    });
  };

  $scope.$watch('settings.get("theme.user-css")', loadStyle);
  $scope.$on('ui::refresh-style', loadStyle);

  $scope.irc.getStatusChannel().topic = 'This is definitely %snot slack%s, but it looks like it! Type %s/help%s to begin.'.format(
    ColorService._white, ColorService.reset,
    ColorService.green, ColorService.reset);
  
  $scope.$watch('settings.get("idel.firstrun")', function (firstrun) {
    if (firstrun) {
      ModalService.display('thanks');
      $scope.settings.set('idel.firstrun', false);
      $scope.settings.save();
    }
  });
});

