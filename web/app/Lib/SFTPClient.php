<?php

namespace App\Lib;

require __DIR__ . '/../../vendor/autoload.php';

use Exception;
use phpseclib3\Net\SFTP;

class SFTPClient
{
    private $host;
    private $port;
    private $username;
    private $password;

    public function __construct($host, $port, $username, $password)
    {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
    }

    public function uploadFile($localFile, $remoteFile)
    {
        try {
            $connection = ssh2_connect($this->host, $this->port);
            if (!$connection) {
                throw new Exception('Unable to connect to ' . $this->host);
            }
            if (!ssh2_auth_password($connection, $this->username, $this->password)) {
                throw new Exception('Invalid credentials');
            }
            $sftp = ssh2_sftp($connection);
            if (!$sftp) {
                throw new Exception('Unable to initialize SFTP subsystem');
            }

            $stream = @fopen("ssh2.sftp://$sftp$remoteFile", 'wb');
            if (!$stream) {
                throw new Exception('Unable to open remote file: ' . $remoteFile);
            }

            $data = fopen($localFile, 'rb');
            if (!$data) {
                throw new Exception('Unable to open local file: ' . $localFile);
            }

            while (!feof($data)) {
                $buffer = fread($data, 1024 * 64);  // read in 64KB chunks
                $bytes_written = fwrite($stream, $buffer);
                while ($bytes_written < strlen($buffer)) {
                    $bytes_written += fwrite($stream, substr($buffer, $bytes_written));
                }
            }
            fclose($data);
            fclose($stream);
        } catch (Exception $e) {
            echo 'Error: ' . $e->getMessage();
        }
    }
}
