<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First PHP Page</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    
    <p>The current date and time is: <?php 
        echo date('Y-m-d H:i:s'); 
    ?></p>

    <p>PHP is running on: <?php 
        echo $_SERVER['SERVER_SOFTWARE']; 
    ?></p>
</body>
</html>