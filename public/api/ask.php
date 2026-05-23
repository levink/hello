<?php 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/autoload.php';

$filePath = realpath($_SERVER['DOCUMENT_ROOT'] . "/../../profi.ini");
$settings = parse_ini_file($filePath, true);
define('SETTINGS', $settings);
unset($settings);

class Ask {
    
    public int $id = -1;
    
    function __construct(
        public string $name,
        public string $phone,
        public string $email, 
        public string $message,
        public string $ip
    ) {}
};

function insertRow(array $config, Ask $ask) {
    $dbhost = $config['host'];
    $dbuser = $config['user'];
    $dbpass = $config['pass'];
    $dbname = $config['name'];
    $ok = false;

    try {

        $conn = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sql = "INSERT INTO request (name, phone, email, message, ipv4) VALUES (?,?,?,?,?)";
        $stmt= $conn->prepare($sql);
        $stmt->execute([
            $ask->name, 
            $ask->phone, 
            $ask->email, 
            $ask->message, 
            $ask->ip]);
        $lastId = (int)$conn->lastInsertId();

        if ($lastId > 0) {
            $ask->id = $lastId;
            $ok = true;
        } 
    } catch(PDOException $e) {
        error_log("Connection failed: {$e->getMessage()}");
    }

    return $ok;
}

function sendMail(array $config, Ask $ask) {
    $mail = new PHPMailer(true);
    $ok = false;

    try {
        $mail->IsSMTP();
        $mail->SMTPAuth     = true;                         // Enable SMTP authentication
        $mail->SMTPSecure   = PHPMailer::ENCRYPTION_SMTPS;  // Enable implicit TLS
        $mail->CharSet      = 'UTF-8';
        $mail->Host         = $config['host'];
        $mail->Port         = $config['port'];
        $mail->Username     = $config['sender_mail'];
        $mail->Password     = $config['sender_pass'];

        $mail->isHTML(false);
        $mail->setFrom($config['sender_mail'], "Profi-Raisen Notify");
        $mail->addAddress($config['target']);

        //todo: get info from $ask
        $mail->Subject = "[Заявка, ID=123]";
        $mail->Body    = 'Test';

        $mail->send();
        $ok = true;
    } 
    catch (Exception $e) {
        error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    }

    return $ok;
}

function trimInput(string $data, int $maxLength) {
    if (!isset($data))
        return null;

    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    $data = strip_tags($data);
    $data = substr($data, 0, $maxLength);
    return $data;
}

$ask = new Ask(
    trimInput($_POST["name"], 80),
    trimInput($_POST["phone"], 20),
    trimInput($_POST["email"], 255),
    trimInput($_POST["message"], 1000),
    trimInput($_SERVER['REMOTE_ADDR'], 16)
);

$ok = insertRow(SETTINGS['db'], $ask);
if (!$ok) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(400);
    echo "{status: 400}";
    exit(0);
}

$ok = sendMail(SETTINGS['mail'], $ask);
if (!$ok) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(400);
    echo "{status: 400}";
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');
echo "{status: 200}";
?>