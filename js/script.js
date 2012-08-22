function init(){
  $('h1').fadeIn('slow', function () {
    $('h2').fadeIn('slow');
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