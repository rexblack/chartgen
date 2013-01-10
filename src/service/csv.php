<?php
/*
 * Created on 28.12.2012
 *
 * CSV-Service
 */

function curl_get_contents($url) {
	
	$timeout = 300;

	$ch = curl_init();
	
	curl_setopt( $ch, CURLOPT_URL, $url );
	
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	
	curl_setopt( $ch, CURLOPT_AUTOREFERER, FALSE );
	if (isset($_SERVER['HTTP_REFERER'])) {
    	curl_setopt( $ch, CURLOPT_REFERER, $_SERVER['HTTP_REFERER']);
	}
	
	curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
	curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)");

	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);

	curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, $timeout );
	curl_setopt( $ch, CURLOPT_TIMEOUT, $timeout );
	curl_setopt( $ch, CURLOPT_MAXREDIRS, 10 );
	curl_setopt( $ch, CURLOPT_ENCODING, "" );
	
	
	curl_setopt($ch, CURLOPT_COOKIEJAR, "cookie.txt");
    curl_setopt($ch, CURLOPT_COOKIEFILE, "cookie.txt");

    curl_setopt($ch, CURLOPT_HEADER, FALSE);
	
	$data = curl_exec( $ch );
	$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
	
	curl_close ( $ch );
	
	return $data;
}

function parse_csv($string) {
	$handle = fopen('data://text/plain;base64,' . base64_encode($string),'r');
	$rows = array();
	while (($data = fgetcsv($handle, 5000, ",")) !== FALSE) {
		$rows[] = $data;
	}
	return $rows;
}

$url = $_GET['url'];

$format = isset($_GET['format']) ? $_GET['format'] : 'jsonp';
$callback = isset($_GET['callback']) ? $_GET['callback'] : 'callback';

switch ($format) {
	
	case 'csv': 
		
		header('Content-Type: text/csv');
		readfile($url);
	
		break;
		
	case 'json': 
	case 'jsonp': 
		
		
		if (file_exists("../" . $url)) {
			$data = file_get_contents("../" . $url);
		} else {
			$data = curl_get_contents($url);
		}
		$csv = parse_csv($data);
		$json = json_encode($csv);
		
		if ($format == 'json') {
			header('Content-Type: application/json');
			echo $json;
			exit;
		}
		
		if ($format == 'jsonp') {
			header('Content-Type: text/javascript');
			echo $callback . "(" . $json . ")";
			exit;
		}
		
		break;
}

?>
