<?php
    $filePath = realpath(getenv('PROFI_SETTINGS'));
    $settings = parse_ini_file($filePath, true);
    define('SETTINGS', $settings);
    unset($settings);
?>