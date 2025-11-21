@echo off
REM Windows batch script to generate SSL certificates

REM Create SSL directory
if not exist ssl mkdir ssl

REM Generate private key
openssl genrsa -out ssl/server.key 2048

REM Generate certificate signing request
openssl req -new -key ssl/server.key -out ssl/server.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=192.168.1.153.nip.io"

REM Generate self-signed certificate
openssl x509 -req -days 365 -in ssl/server.csr -signkey ssl/server.key -out ssl/server.crt

REM Create combined certificate file
type ssl\server.crt ssl\server.key > ssl\server.pem

echo SSL certificates generated in ssl\ directory
echo Certificate: ssl\server.crt
echo Private Key: ssl\server.key
echo Combined: ssl\server.pem

pause
