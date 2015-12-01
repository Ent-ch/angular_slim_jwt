<?php

error_reporting(E_ALL);

require '../vendor/autoload.php';


$app = new \Slim\Slim();

require 'config.php';
require 'rest_dao.php';
require 'ta_mailer.php';
require 'help_classes.php';


$app->config('debug', false);
$app->response->headers->set('Content-Type', 'application/json');

$app->error(function ($e) use ($app) {
    echo '{"error":{
        "text":"'. $e->getMessage() . '",
        "file":"'. $e->getFile() . '", 
        "line":"'. $e->getLine() . "\"
        }}\n"; 

//    file_put_contents(__DIR__.'/deb.txt', $deb);
});

$app->notFound(function () use ($app) {
    echo '{"error": 404 }';
});


$dao = new RestDAO();
$help = new Helper();

$mailer = new TA_Mailer();
$mailer->setTemplateDirectory('emails');


$auth = function () {
    $app = \Slim\Slim::getInstance();
    $auth = new Auth();
    $tokenAuth = $app->request->headers->get('Auth');
    if (empty($tokenAuth) or !$auth->tokenOk($tokenAuth) ) {
        $app->response->setStatus(401);
        $app->stop();
    }
};

$app->group('/back', $auth, function () use ($app, $dao, $help) {
    
    $app->get('/projects', function() use($dao) {
        echo json_encode($dao->getAll('projects'));
    });

    $app->get('/codes', function() use($dao) {
        echo json_encode($dao->getAll('codes'));
    });

    $app->get('/keys', function() use($dao) {
        echo json_encode($dao->getAll('keys'));
    });

    $app->put('/keys/:id', function($id) use($dao, $help) {
        $vo = $help->bodyParse();
        $vo->id = $id;
        $vo->status = $help->setStatus($vo->status);
        $dao->updateStatus('keys', $vo->id, $vo->status);
        echo json_encode($vo);
    });

    $app->put('/codes/:id', function($id) use($dao, $help) {
        $vo = $help->bodyParse();
        $vo->id = $id;
        $vo->status = $help->setStatus($vo->status);
        $dao->updateStatus('codes', $vo->id, $vo->status);
        echo json_encode($vo);
    });


    $app->get('/information', function() use($dao) {
        echo json_encode($dao->getAll('information'));
    });

    $app->post('/projects', function() use($dao, $help) {
        $vo = $help->bodyParse();
    //    throw new Exception(print_r($vo, true));
        $dao->insert('projects', array('name' => $vo->name, 'status' => $vo->status));
        echo json_encode(['status' => 'ok']);
    });

    $app->get('/projects/:id', function($id) use($dao) {
        echo json_encode($dao->getById('projects', $id));
    });

    $app->put('/projects/:id', function($id) use($dao, $help) {
        $vo = $help->bodyParse();
        $vo->id = $id;
        echo json_encode($dao->update($vo));
    });

    $app->post('/codes/add', function() use($dao, $help) {
        $vo = $help->bodyParse();
        foreach ($vo->data as $val) {
            if (!empty($val)) {
                $dao->insert('codes', ['code' => $val, 'status' => 1, 'project' => $vo->proj]);
            }
        }
        echo json_encode(['status' => 'ok']);
    });

    $app->post('/keys/add', function() use($dao, $help) {
        $vo = $help->bodyParse();
        foreach ($vo->data as $val) {
            if (!empty($val)) {
                $dao->insert('keys', ['code' => $val, 'status' => 1, 'project' => $vo->proj]);
            }
        }
        echo json_encode(['status' => 'ok']);
    });

    $app->delete('/codes/:id', function($id) use($dao) {
        $dao->delete('codes', $id);
        echo json_encode(['status' => 'ok']);
    });

    $app->delete('/keys/:id', function($id) use($dao) {
        $dao->delete('keys', $id);
        echo json_encode(['status' => 'ok']);
    });
});

// =============     Open routes   ===================
$app->post('/login', function() use($app, $help) {
    $vo = $help->bodyParse();
    $auth = new Auth();
    if (!isset($vo->uname, $vo->upass)) {
        $app->response->setStatus(400);
        return;
    }
    if ($token = $auth->login($vo->uname, $vo->upass)) {
        echo json_encode(['token' => $token]);    
        echo "\n";
    } else {
        $app->response->setStatus(401);
    }

});

            
$app->get('/active', function() use($dao) {
    echo json_encode($dao->getAll('projects', 'name', ' WHERE status = 1 '));
    });

$app->post('/restore', function() use($dao, $app, $mailer) {
    $vo = $help->bodyParse();
    if (!isset($vo->email)) {
        $app->response->setStatus(400);
        return;
    }
        
    $code = $dao->getByField('information', 'email', $vo->email);
    if (!$code) {
        $app->response->setStatus(404);
        return;
    }
    echo json_encode('ok');
    
});

$app->post('/activate', function() use($dao, $app, $mailer) {
    $request = $app->request();
    $body = $request->getBody();
    $vo = json_decode($body);
    
    if (!isset($vo->code, $vo->selproj, $vo->uname, $vo->email)) {
        $app->response->setStatus(400);
        return;
    }
    if (!isset($vo->company)) {
        $vo->company = '';
    }
        
    $code = $dao->getByCode('codes', $vo->code);
    if (!$code) {
        $app->response->setStatus(404);
        return;
    } elseif ($code->status !== '1') {
        $app->response->setStatus(403);
        return;
    }
    
    $key = $dao->getKey($vo->selproj);
    if (!$key) {
        $app->response->setStatus(409);
        //admin mail no keys
        return;
    }
    
    $project = $dao->getById('projects', $vo->selproj);
    
    $logData = [
        'email' => $vo->email,
        'project' => $vo->selproj,
        'username' => $vo->uname,
        'company' => $vo->company,
        'code' => $code->code,
        'key' => $key->code
        ];
    $dao->insert('information', $logData);
    $dao->updateStatus('keys', $key->id, 2);
    $dao->updateStatus('codes', $code->id, 2);
    
    
    $data = array_merge($logData, [
        'Company_Name' => COMPANY_NAME,
        'Company_supp_URL' => COMPANY_SUPP_URL,
        'Company_URL' => COMPANY_URL,
        'Admin_Name' => ADMIN_NAME,
        'ProjectTitle' => $project->name,
    ]);
    
    $deb = print_r($data, true);
    $data['deb'] = $deb;

    $mailer->setTemplateFile("proj_{$project->id}.html");
    $mailer->setSubject($data['ProjectTitle'].' registration information');
    $mailer->addTo($vo->email);
    $mailer->setFrom(ADMIN_EMAIL);
    $mailer->setData($data);
    $mailer->send();    
    
    $mailer->setTemplateFile("admin_ok.html");
    $mailer->setSubject($data['ProjectTitle'].' registration information');
    $mailer->addTo(ADMIN_EMAIL);
    $mailer->setFrom(ADMIN_EMAIL);
    $mailer->setData($data);
    $mailer->send();    
    
    echo json_encode('ok');
    echo "\n";
});

$app->run();

?>