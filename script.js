function init(){
  $('h1').fadeIn('slow', function () {
    $('#Topline').animate({ width:'100%', opacity:1 }, 1000, function () {
      $('h2').fadeIn('slow');
    });
  });

  $('#LeftMenu a').each(function () {
    var top = 100 - $(this).position().top;
    $(this).css('top', top).animate({ opacity:1, top:0 }, 1000);
  });

  $('#LeftMenu').on('click', 'a', function () {
    var section = $(this).data('section');
    loadSection(section);
  });

  $(window).on('hashchange', function () {
    loadSection(getHash());
  });

  if (window.location.hash){
    loadSection(getHash(), true);
  } else {
    loadSection('about', true);
  }
}

function getHash(){
  return window.location.hash.substring(1);
}

function loadSection(section, firstLoad){
  var elem = $('#Content .' + section);
  if (!elem.length){
    elem = $('#Content .about');
    section = 'about';
  }
  if (firstLoad){
    elem.fadeIn('slow');
  } else if (elem.is(':hidden')) {
    $('#Content div:visible').fadeOut('fast', function () {
      elem.fadeIn('fast');
    });
  }
  $("#LeftMenu a").removeClass('selected');
  $("#LeftMenu [data-section='"+section+"']").addClass('selected');
}

$(init);