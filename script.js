const plaintext = document.getElementById("plaintext");
const encryptBtn = document.getElementById("encryptBtn");

const encryptedKey = document.getElementById("encryptedKey");
const iv = document.getElementById("iv");
const ciphertext = document.getElementById("ciphertext");

const autoFillBtn = document.getElementById("autoFillBtn");

const decryptKey = document.getElementById("decryptKey");
const decryptIV = document.getElementById("decryptIV");
const decryptCiphertext = document.getElementById("decryptCiphertext");

const decryptBtn = document.getElementById("decryptBtn");
const decryptedOutput = document.getElementById("decryptedOutput");

const status = document.getElementById("status");


let publicKey;
let privateKey;


/* BASE64 FUNCTIONS */

function arrayBufferToBase64(buffer) {

    const bytes = new Uint8Array(buffer);

    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}


function base64ToArrayBuffer(base64) {

    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}


/* GENERATE RSA KEYS */

async function generateRSAKeys() {

    try {

        status.textContent = "Generating RSA keys...";

        const keyPair =
            await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",

                    modulusLength: 2048,

                    publicExponent: new Uint8Array([
                        1,
                        0,
                        1
                    ]),

                    hash: "SHA-256"
                },

                true,

                [
                    "encrypt",
                    "decrypt"
                ]
            );


        publicKey = keyPair.publicKey;

        privateKey = keyPair.privateKey;


        status.textContent =
            "Ready. RSA keys generated successfully.";

    }

    catch (error) {

        console.error(error);

        status.textContent =
            "Error generating RSA keys.";

    }

}


generateRSAKeys();


/* ENCRYPT MESSAGE */

encryptBtn.addEventListener(
    "click",

    async function () {

        try {

            const message =
                plaintext.value.trim();


            if (message === "") {

                alert(
                    "Please enter a message first."
                );

                return;

            }


            if (!publicKey) {

                alert(
                    "Please wait. RSA keys are generating."
                );

                return;

            }


            status.textContent =
                "Encrypting message...";


            /* CREATE AES KEY */

            const aesKey =
                await window.crypto.subtle.generateKey(
                    {
                        name: "AES-GCM",
                        length: 256
                    },

                    true,

                    [
                        "encrypt",
                        "decrypt"
                    ]
                );


            /* CREATE IV */

            const ivBytes =
                window.crypto.getRandomValues(
                    new Uint8Array(12)
                );


            /* ENCRYPT MESSAGE */

            const messageData =
                new TextEncoder().encode(
                    message
                );


            const encryptedMessage =
                await window.crypto.subtle.encrypt(
                    {
                        name: "AES-GCM",
                        iv: ivBytes
                    },

                    aesKey,

                    messageData
                );


            /* EXPORT AES KEY */

            const rawAESKey =
                await window.crypto.subtle.exportKey(
                    "raw",

                    aesKey
                );


            /* ENCRYPT AES KEY USING RSA */

            const encryptedAESKey =
                await window.crypto.subtle.encrypt(
                    {
                        name: "RSA-OAEP"
                    },

                    publicKey,

                    rawAESKey
                );


            /* DISPLAY RESULTS */

            encryptedKey.value =
                arrayBufferToBase64(
                    encryptedAESKey
                );


            iv.value =
                arrayBufferToBase64(
                    ivBytes.buffer
                );


            ciphertext.value =
                arrayBufferToBase64(
                    encryptedMessage
                );


            status.textContent =
                "Message encrypted successfully!";

        }

        catch (error) {

            console.error(error);

            status.textContent =
                "Encryption failed.";

            alert(
                "Encryption failed."
            );

        }

    }
);


/* AUTO FILL DECRYPT PANEL */

autoFillBtn.addEventListener(
    "click",

    function () {

        if (
            encryptedKey.value === "" ||
            iv.value === "" ||
            ciphertext.value === ""
        ) {

            alert(
                "Please encrypt a message first."
            );

            return;

        }


        decryptKey.value =
            encryptedKey.value;

        decryptIV.value =
            iv.value;

        decryptCiphertext.value =
            ciphertext.value;


        status.textContent =
            "Decrypt panel auto-filled successfully.";

    }
);


/* DECRYPT MESSAGE */

decryptBtn.addEventListener(
    "click",

    async function () {

        try {

            if (
                decryptKey.value.trim() === "" ||
                decryptIV.value.trim() === "" ||
                decryptCiphertext.value.trim() === ""
            ) {

                alert(
                    "Please fill all encrypted fields."
                );

                return;

            }


            status.textContent =
                "Decrypting message...";


            /* DECODE DATA */

            const encryptedAESKeyBuffer =
                base64ToArrayBuffer(
                    decryptKey.value.trim()
                );


            const ivBuffer =
                base64ToArrayBuffer(
                    decryptIV.value.trim()
                );


            const ciphertextBuffer =
                base64ToArrayBuffer(
                    decryptCiphertext.value.trim()
                );


            /* DECRYPT AES KEY USING RSA */

            const rawAESKey =
                await window.crypto.subtle.decrypt(
                    {
                        name: "RSA-OAEP"
                    },

                    privateKey,

                    encryptedAESKeyBuffer
                );


            /* IMPORT AES KEY */

            const aesKey =
                await window.crypto.subtle.importKey(
                    "raw",

                    rawAESKey,

                    {
                        name: "AES-GCM"
                    },

                    false,

                    [
                        "decrypt"
                    ]
                );


            /* DECRYPT MESSAGE */

            const decryptedData =
                await window.crypto.subtle.decrypt(
                    {
                        name: "AES-GCM",

                        iv:
                            new Uint8Array(
                                ivBuffer
                            )
                    },

                    aesKey,

                    ciphertextBuffer
                );


            /* CONVERT TO TEXT */

            const message =
                new TextDecoder().decode(
                    decryptedData
                );


            decryptedOutput.textContent =
                message;


            status.textContent =
                "Message decrypted successfully!";

        }

        catch (error) {

            console.error(error);

            decryptedOutput.textContent =
                "Decryption failed.";

            status.textContent =
                "Decryption failed. Please try again.";

        }

    }
);
