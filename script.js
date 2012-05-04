function init(){
  $('h1').fadeIn('slow', function () {
    $('#Topline').animate({ width:'100%', opacity:1 }, 1000, function () {
      $('h2').fadeIn('slow');
    });
  });

  $('#Content .about').fadeIn('slow');

  $('#LeftMenu a').each(function () {
    var top = 100 - $(this).position().top;
    $(this).css('top', top).animate({ opacity:1, top:0 }, 1000);
  });

  $('#LeftMenu a').click(function () {
    var section = $(this).data('section');
    loadSection(section);
  });

  $(window).bind('hashchange', function () {
    loadSection(window.location.hash.substring(1));
  });
}

function loadSection(section){
  var elem = $('#Content .' + section);
  if (elem.is(':hidden')) {
    $('#Content div:visible').fadeOut('fast', function () {
      elem.fadeIn('fast');
    });
  }
}

$(init);