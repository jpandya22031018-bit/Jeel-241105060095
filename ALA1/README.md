# 🔐 Secure Messaging System

A secure messaging web application using:

- AES-256-GCM for message encryption
- RSA-OAEP for AES key encryption

## Encryption Process

1. User enters a plaintext message.
2. AES-256 key is generated.
3. The message is encrypted using AES.
4. AES key is encrypted using RSA Public Key.
5. Encrypted AES key, IV, and Ciphertext are generated.

## Decryption Process

1. RSA Private Key decrypts the AES key.
2. The recovered AES key decrypts the ciphertext.
3. The original plaintext message is displayed.

## Technologies Used

- HTML
- CSS
- JavaScript
- Web Crypto API

## How to Run

Open the project using VS Code Live Server.

1. Open the folder in VS Code.
2. Install Live Server.
3. Right-click `index.html`.
4. Click **Open with Live Server**.

## How to Use

1. Enter a secret message.
2. Click **Encrypt Message**.
3. Click **Auto-Fill Decrypt Panel**.
4. Click **Decrypt Message**.
5. View the original message in the output.

---

Educational Project using Hybrid Encryption.