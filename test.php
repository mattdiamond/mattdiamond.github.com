<?php

$foo = 'asdf';

var_dump($foo);

function doSomething(){
    global $foo;

    var_dump($foo);
}

doSomething();