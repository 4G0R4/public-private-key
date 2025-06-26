// build.js - Simple static site generator for Express app
const fs = require('fs');
const path = require('path');

function buildStatic() {
  console.log('Building static site...');
  
  // Create dist directory
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
  
  // Copy public assets
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    copyDirectory(publicDir, distDir);
  }
  
  // Create index.html with the public/private key demo
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Private Key Demo</title>
    <link rel="stylesheet" href="stylesheets/style.css">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #333; margin-bottom: 30px; }
        .section { margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .key-pair { display: flex; gap: 20px; margin-bottom: 20px; }
        .key-box { flex: 1; }
        label { font-weight: bold; display: block; margin-bottom: 8px; color: #555; }
        textarea { width: 100%; height: 100px; padding: 10px; border: 2px solid #ddd; border-radius: 5px; font-family: monospace; font-size: 12px; }
        input[type="text"] { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px; font-family: monospace; }
        button { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
        button:hover { background: #0056b3; }
        .result { margin-top: 15px; padding: 15px; border-radius: 5px; font-weight: bold; }
        .valid { background: #d4edda; color: #155724; }
        .invalid { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Public / Private Key Cryptography Demo</h1>
        
        <div class="section">
            <h2>Step 1: Generate Key Pair</h2>
            <button onclick="generateKeys()">Generate New Key Pair</button>
            <div class="key-pair">
                <div class="key-box">
                    <label>Private Key (Keep Secret!):</label>
                    <textarea id="privateKey" readonly></textarea>
                </div>
                <div class="key-box">
                    <label>Public Key (Share Freely):</label>
                    <textarea id="publicKey" readonly></textarea>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>Step 2: Sign Message</h2>
            <label>Message to Sign:</label>
            <input type="text" id="message" value="Hello, Blockchain!" placeholder="Enter message to sign">
            <button onclick="signMessage()">Sign Message</button>
            <label>Digital Signature:</label>
            <textarea id="signature" readonly></textarea>
        </div>
        
        <div class="section">
            <h2>Step 3: Verify Signature</h2>
            <label>Message:</label>
            <input type="text" id="verifyMessage" placeholder="Message to verify">
            <label>Signature:</label>
            <textarea id="verifySignature" placeholder="Signature to verify"></textarea>
            <label>Public Key:</label>
            <textarea id="verifyPublicKey" placeholder="Public key to verify with"></textarea>
            <button onclick="verifySignature()">Verify Signature</button>
            <div id="verificationResult"></div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
    <script>
        let keyPair = null;
        
        function generateKeys() {
            // Simple key generation for demo purposes
            const privateKey = CryptoJS.lib.WordArray.random(256/8).toString();
            const publicKey = CryptoJS.SHA256(privateKey).toString();
            
            keyPair = { privateKey, publicKey };
            
            document.getElementById('privateKey').value = privateKey;
            document.getElementById('publicKey').value = publicKey;
            document.getElementById('verifyPublicKey').value = publicKey;
        }
        
        function signMessage() {
            const message = document.getElementById('message').value;
            if (!keyPair || !message) {
                alert('Please generate keys and enter a message first');
                return;
            }
            
            // Simple signing - hash message with private key
            const signature = CryptoJS.HmacSHA256(message, keyPair.privateKey).toString();
            document.getElementById('signature').value = signature;
            document.getElementById('verifyMessage').value = message;
            document.getElementById('verifySignature').value = signature;
        }
        
        function verifySignature() {
            const message = document.getElementById('verifyMessage').value;
            const signature = document.getElementById('verifySignature').value;
            const publicKey = document.getElementById('verifyPublicKey').value;
            
            if (!message || !signature || !publicKey) {
                alert('Please fill in all verification fields');
                return;
            }
            
            // Verify by regenerating signature with the public key derivation
            const privateKey = findPrivateKey(publicKey);
            const expectedSignature = privateKey ? CryptoJS.HmacSHA256(message, privateKey).toString() : '';
            
            const isValid = signature === expectedSignature;
            const resultDiv = document.getElementById('verificationResult');
            
            if (isValid) {
                resultDiv.innerHTML = '<div class="result valid">✓ Signature is VALID</div>';
            } else {
                resultDiv.innerHTML = '<div class="result invalid">✗ Signature is INVALID</div>';
            }
        }
        
        function findPrivateKey(publicKey) {
            // In this demo, we can only verify signatures we created
            return keyPair && CryptoJS.SHA256(keyPair.privateKey).toString() === publicKey ? keyPair.privateKey : null;
        }
        
        // Auto-generate keys on page load
        window.onload = function() {
            generateKeys();
        };
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(distDir, 'index.html'), html);
  console.log('Generated index.html');
  console.log('Build completed successfully!');
}

function copyDirectory(src, dest) {
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

buildStatic();
