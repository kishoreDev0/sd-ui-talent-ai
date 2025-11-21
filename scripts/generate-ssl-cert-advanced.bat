@echo off
REM Windows batch script to generate SSL certificates with SAN

REM Create SSL directory
if not exist ssl mkdir ssl

REM Create OpenSSL configuration file with SAN
echo [req] > ssl\openssl.conf
echo distinguished_name = req_distinguished_name >> ssl\openssl.conf
echo req_extensions = v3_req >> ssl\openssl.conf
echo prompt = no >> ssl\openssl.conf
echo. >> ssl\openssl.conf
echo [req_distinguished_name] >> ssl\openssl.conf
echo C = US >> ssl\openssl.conf
echo ST = State >> ssl\openssl.conf
echo L = City >> ssl\openssl.conf
echo O = Organization >> ssl\openssl.conf
echo CN = 192.168.1.153.nip.io >> ssl\openssl.conf
echo. >> ssl\openssl.conf
echo [v3_req] >> ssl\openssl.conf
echo keyUsage = keyEncipherment, dataEncipherment >> ssl\openssl.conf
echo extendedKeyUsage = serverAuth >> ssl\openssl.conf
echo subjectAltName = @alt_names >> ssl\openssl.conf
echo. >> ssl\openssl.conf
echo [alt_names] >> ssl\openssl.conf
echo DNS.1 = 192.168.1.153.nip.io >> ssl\openssl.conf
echo DNS.2 = 127.0.0.1.nip.io >> ssl\openssl.conf
echo DNS.3 = localhost >> ssl\openssl.conf
echo IP.1 = 192.168.1.153 >> ssl\openssl.conf
echo IP.2 = 127.0.0.1 >> ssl\openssl.conf

REM Generate private key
openssl genrsa -out ssl\server.key 2048

REM Generate certificate signing request with SAN
openssl req -new -key ssl\server.key -out ssl\server.csr -config ssl\openssl.conf

REM Generate self-signed certificate with SAN
openssl x509 -req -days 365 -in ssl\server.csr -signkey ssl\server.key -out ssl\server.crt -extensions v3_req -extfile ssl\openssl.conf

REM Create combined certificate file
type ssl\server.crt ssl\server.key > ssl\server.pem

echo.
echo ✅ SSL certificates generated with Subject Alternative Names (SAN)
echo 📁 Certificate: ssl\server.crt
echo 🔑 Private Key: ssl\server.key
echo 📦 Combined: ssl\server.pem
echo.
echo 🌐 Supported domains/IPs:
echo    - https://192.168.1.153.nip.io:3000 (Frontend)
echo    - https://192.168.1.153.nip.io:8000 (Backend)
echo    - https://127.0.0.1.nip.io:3000 (Frontend - localhost)
echo    - https://127.0.0.1.nip.io:8000 (Backend - localhost)
echo.
echo ⚠️  Note: You may need to accept the self-signed certificate in your browser

pause
