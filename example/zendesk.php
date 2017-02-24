<?php
include("config.php")
define("VALID_EMAIL_REGEX", '/^(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){255,})(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){65,}@)(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22))(?:\.(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22)))*@(?:(?:(?!.*[^.]{64,})(?:(?:(?:xn--)?[a-z0-9]+(?:-[a-z0-9]+)*\.){1,126}){1,}(?:(?:[a-z][a-z0-9]*)|(?:(?:xn--)[a-z0-9]+))(?:-[a-z0-9]+)*)|(?:\[(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})|(?:(?!(?:.*[a-f0-9][:\]]){7,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?)))|(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){5}:)|(?:(?!(?:.*[a-f0-9]:){5,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3}:)?)))?(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))(?:\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))){3}))\]))$/iD');

function isBlank($val) {
	return empty( trim($val) );
}
function isInvalidEmail($email) {
	return !preg_match(VALID_EMAIL_REGEX, $email);
}

function createErrorObj($name, $message) {
	$error = new StdClass();
	$error->name = $name;
	$error->message = $message;
	return $error;
}

function hasErrors($post) {

	$errorResponse = new stdClass();
	$errorResponse->errors = array();

	if (isBlank($post['z_name'])) {
		array_push($errorResponse->errors, createErrorObj("name", BLANK_NAME));
	}
	if (isBlank($post['z_requester'])) {
		array_push($errorResponse->errors, createErrorObj("email", BLANK_EMAIL));
	} elseif (isInvalidEmail($post['z_requester'])) {
		array_push($errorResponse->errors, createErrorObj("email", INVALID_EMAIL));
	}
	if (isBlank($post['z_subject'])) {
		array_push($errorResponse->errors, createErrorObj("reason", BLANK_REASON));
	}
	if (isBlank($post['z_description'])) {
		array_push($errorResponse->errors, createErrorObj("description", BLANK_DESCRIPTION));
	}

	if ( empty($errorResponse->errors) ) {
		return FALSE;
	} else {
		return $errorResponse;
	}
}

function curlWrap($url, $json, $action)
{
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_MAXREDIRS, 10 );
	curl_setopt($ch, CURLOPT_URL, ZDURL.$url);
	curl_setopt($ch, CURLOPT_USERPWD, ZDUSER."/token:".ZDAPIKEY);
	switch($action){
		case "POST":
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
			curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
			break;
		case "GET":
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
			break;
		default:
			break;
	}
	curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
	curl_setopt($ch, CURLOPT_USERAGENT, "MozillaXYZ/1.0");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_TIMEOUT, 10);
	$output = curl_exec($ch);
	curl_close($ch);
	$decoded = json_decode($output);
	$response = new stdClass();
	$response->ticket = new stdClass();
	$response->ticket->id = $decoded->ticket->id;
	return json_encode($response);
}

$errors = hasErrors($_POST);

if ($errors) {
	echo(json_encode($errors));
} else {
	foreach($_POST as $key => $value){
		if(preg_match('/^z_/i',$key)){
			$arr[strip_tags($key)] = strip_tags($value);
		}
	}
	$create = json_encode(array('ticket' => array('subject' => $arr['z_subject'], 'comment' => array( "body"=> $arr['z_description']), 'requester' => array('name' => $arr['z_name'], 'email' => $arr['z_requester']))));
	$return = curlWrap("/tickets.json", $create, "POST");
	echo($return);
}
?>
