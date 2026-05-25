<?php
    $filePath = realpath($_SERVER["DOCUMENT_ROOT"] . "/" . getenv('PROFI_SETTINGS'));
    $settings = parse_ini_file($filePath, true);
    define('SETTINGS', $settings);
    unset($settings);
    unset($filePath);
?>