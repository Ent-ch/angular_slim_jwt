<?php

require 'Tokenista.php';

class Auth {
	public $tokenista;
	
	public function __construct () {
		$secret = 'keyap'+ADMIN+PASS;
		$this->tokenista = new \Ingenerator\Tokenista($secret, array('lifetime' => 3600000));
	} 
		
	public function login ($user, $pass) {
		if ($user === ADMIN && $pass === PASS) {
			$token = $this->tokenista->generate();
			return $token; 
		}
		return false;
	}
	
	public function tokenOk ($token) {
		return($this->tokenista->isValid($token));
	}
	
	
}

class Helper {
	public $app;
	
	public function __constaruct () {
		$this->app = \Slim\Slim::getInstance();
	} 
	
	public function bodyParse () {
		$app = \Slim\Slim::getInstance();
        $request = $app->request();
        return json_decode($request->getBody());
	}
	
	public function setStatus($curStatus) {
        if ($curStatus == 3) {
            $retStatus = 1;
        } else {
            $retStatus = 3;
        }
		return $retStatus;
	}
	
}