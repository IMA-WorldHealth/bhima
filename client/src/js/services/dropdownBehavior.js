angular.module('bhima.services')
.service('DropdownBehaviorService', DropdownBehaviorService);

function DropdownBehaviorService() {

  var service = this;

  //this function check if html element's position is on the bottom
  // if true it changes the element's position in order to display it conviniently

  // it function is usefull for carets for exemple
  // the Users page dropdown won't falls off page thanks to this function
  // it takes the dropdown id as parameter

  service.setPosition = function(id_dropdown){
    
    var menu =  $('#'+ id_dropdown);
    var menuOffsetTop = menu.offset().top;
    var menuheight = menu.height();
    var windowsHeight = $(window).height();
    
    if((windowsHeight-menuheight) < menuOffsetTop) {
      menu.css({'margin-top': '0px'});
      menu.animate({'margin-top': '-'+ (menuheight+35)+ 'px'}, 50);
    }    
  }
  return service;
  
}
