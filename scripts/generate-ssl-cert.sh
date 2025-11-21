#!/bin/bash

# Create SSL directory
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/server.key 2048

# Generate certificate signing request
openssl req -new -key ssl/server.key -out ssl/server.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=192.168.1.153.nip.io"

# Generate self-signed certificate
openssl x509 -req -days 365 -in ssl/server.csr -signkey ssl/server.key -out ssl/server.crt

# Create combined certificate file
cat ssl/server.crt ssl/server.key > ssl/server.pem

echo "SSL certificates generated in ssl/ directory"
echo "Certificate: ssl/server.crt"
echo "Private Key: ssl/server.key"
echo "Combined: ssl/server.pem"
