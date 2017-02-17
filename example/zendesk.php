<?php
include("zendesk_config.php");

/* Notes
* This script expects there to be a zendesk_config.php file in the same directory as this file.
* Remember: ZDURL needs to be of the form https://subdomain.zendesk.com/api/v2 with no trailing slash
*/

$http_origin = $_SERVER['HTTP_ORIGIN'];

if ($http_origin == "<YOUR-ALLOWED-ORIGIN-ADDRESS>")
{
  header("Access-Control-Allow-Origin: *");
}
else
{
	echo "403 FORBIDDEN";
	return;
}

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
  
  /* Edit the values below with your own error messages. */
	$blankName = "name can't be blank";
	$blankRequester = "email can't be blank";
	$invalidRequester = "email must be valid";
	$blankSubject = "reason can't be blank";
	$blankDescription = "details can't be blank";

	$errorResponse = new stdClass();
	$errorResponse->errors = array();

	if (isBlank($post['z_name'])) {
		array_push($errorResponse->errors, createErrorObj("name", $blankName));
	}
	if (isBlank($post['z_requester'])) {
		array_push($errorResponse->errors, createErrorObj("requester", $blankRequester));
	} elseif (isInvalidEmail($post['z_requester'])) {
		array_push($errorResponse->errors, createErrorObj("requester", $invalidRequester));
	}
	if (isBlank($post['z_subject'])) {
		array_push($errorResponse->errors, createErrorObj("subject", $blankSubject));
	}
	if (isBlank($post['z_description'])) {
		array_push($errorResponse->errors, createErrorObj("description", $blankDescription));
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
