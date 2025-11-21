#!/bin/bash

# Create SSL directory
mkdir -p ssl

# Create OpenSSL configuration file with SAN
cat > ssl/openssl.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
CN = 192.168.1.153.nip.io

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = 192.168.1.153.nip.io
DNS.2 = 127.0.0.1.nip.io
DNS.3 = localhost
IP.1 = 192.168.1.153
IP.2 = 127.0.0.1
EOF

# Generate private key
openssl genrsa -out ssl/server.key 2048

# Generate certificate signing request with SAN
openssl req -new -key ssl/server.key -out ssl/server.csr -config ssl/openssl.conf

# Generate self-signed certificate with SAN
openssl x509 -req -days 365 -in ssl/server.csr -signkey ssl/server.key -out ssl/server.crt -extensions v3_req -extfile ssl/openssl.conf

# Create combined certificate file
cat ssl/server.crt ssl/server.key > ssl/server.pem

echo "✅ SSL certificates generated with Subject Alternative Names (SAN)"
echo "📁 Certificate: ssl/server.crt"
echo "🔑 Private Key: ssl/server.key"
echo "📦 Combined: ssl/server.pem"
echo ""
echo "🌐 Supported domains/IPs:"
echo "   - https://192.168.1.153.nip.io:3000 (Frontend)"
echo "   - https://192.168.1.153.nip.io:8000 (Backend)"
echo "   - https://127.0.0.1.nip.io:3000 (Frontend - localhost)"
echo "   - https://127.0.0.1.nip.io:8000 (Backend - localhost)"
echo ""
echo "⚠️  Note: You may need to accept the self-signed certificate in your browser"
