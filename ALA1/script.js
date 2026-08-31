const encoder = new TextEncoder();
const decoder = new TextDecoder();

let rsaKeyPair = null;


/* Convert data to Base64 */

function toBase64(data) {

    const bytes = new Uint8Array(data);

    let binary = "";

    const chunkSize = 0x8000;


    for (let i = 0; i < bytes.length; i += chunkSize) {

        binary += String.fromCharCode(
            ...bytes.subarray(i, i + chunkSize)
        );
    }


    return btoa(binary);
}



/* Convert Base64 to ArrayBuffer */

function fromBase64(base64) {

    const binary = atob(base64.trim());

    const bytes = new Uint8Array(binary.length);


    for (let i = 0; i < binary.length; i++) {

        bytes[i] = binary.charCodeAt(i);
    }


    return bytes.buffer;
}



/* Status message */

function setStatus(message) {

    document.getElementById("status").textContent = message;
}



/* ENCRYPT MESSAGE */

async function encryptMessage() {

    const message =
        document
            .getElementById("plaintext")
            .value
            .trim();


    if (!message) {

        setStatus(
            "Please enter a plaintext message first."
        );

        return;
    }


    try {

        document
            .getElementById("encryptBtn")
            .disabled = true;


        setStatus(
            "Generating RSA key pair..."
        );


        /* Generate RSA Key Pair */

        rsaKeyPair =
            await crypto.subtle.generateKey(

                {
                    name: "RSA-OAEP",

                    modulusLength: 2048,

                    publicExponent:
                        new Uint8Array([1, 0, 1]),

                    hash: "SHA-256"
                },

                true,

                ["encrypt", "decrypt"]
            );


        setStatus(
            "Generating AES-256 key..."
        );


        /* Generate AES Key */

        const aesKey =
            await crypto.subtle.generateKey(

                {
                    name: "AES-GCM",

                    length: 256
                },

                true,

                ["encrypt", "decrypt"]
            );


        /* Generate IV */

        const iv =
            crypto.getRandomValues(
                new Uint8Array(12)
            );


        setStatus(
            "Encrypting message using AES..."
        );


        /* Encrypt Message with AES */

        const ciphertext =
            await crypto.subtle.encrypt(

                {
                    name: "AES-GCM",

                    iv: iv
                },

                aesKey,

                encoder.encode(message)
            );


        /* Export AES Key */

        const rawAESKey =
            await crypto.subtle.exportKey(
                "raw",
                aesKey
            );


        setStatus(
            "Encrypting AES key using RSA..."
        );


        /* Encrypt AES Key with RSA */

        const encryptedAESKey =
            await crypto.subtle.encrypt(

                {
                    name: "RSA-OAEP"
                },

                rsaKeyPair.publicKey,

                rawAESKey
            );


        /* Display Results */

        document
            .getElementById("encryptedKey")
            .value =
            toBase64(encryptedAESKey);


        document
            .getElementById("iv")
            .value =
            toBase64(iv);


        document
            .getElementById("ciphertext")
            .value =
            toBase64(ciphertext);


        setStatus(
            "Encryption successful! Click Auto-Fill Decrypt Panel."
        );


    } catch (error) {

        console.error(error);

        setStatus(
            "Encryption error: " + error.message
        );

    } finally {

        document
            .getElementById("encryptBtn")
            .disabled = false;
    }
}



/* AUTO FILL DECRYPT PANEL */

function autoFillDecryptPanel() {

    const encryptedKey =
        document
            .getElementById("encryptedKey")
            .value;


    const iv =
        document
            .getElementById("iv")
            .value;


    const ciphertext =
        document
            .getElementById("ciphertext")
            .value;


    if (
        !encryptedKey ||
        !iv ||
        !ciphertext
    ) {

        setStatus(
            "Please encrypt a message first."
        );

        return;
    }


    document
        .getElementById("decryptKey")
        .value =
        encryptedKey;


    document
        .getElementById("decryptIV")
        .value =
        iv;


    document
        .getElementById("decryptCiphertext")
        .value =
        ciphertext;


    setStatus(
        "Decrypt panel filled successfully!"
    );
}



/* DECRYPT MESSAGE */

async function decryptMessage() {


    if (!rsaKeyPair) {

        setStatus(
            "Please encrypt a message first."
        );

        return;
    }


    const encryptedKeyText =
        document
            .getElementById("decryptKey")
            .value
            .trim();


    const ivText =
        document
            .getElementById("decryptIV")
            .value
            .trim();


    const ciphertextText =
        document
            .getElementById("decryptCiphertext")
            .value
            .trim();


    if (
        !encryptedKeyText ||
        !ivText ||
        !ciphertextText
    ) {

        setStatus(
            "Please provide all encryption data."
        );

        return;
    }


    try {

        document
            .getElementById("decryptBtn")
            .disabled = true;


        setStatus(
            "Decrypting AES key using RSA private key..."
        );


        const encryptedAESKey =
            fromBase64(
                encryptedKeyText
            );


        const iv =
            new Uint8Array(
                fromBase64(ivText)
            );


        const ciphertext =
            fromBase64(
                ciphertextText
            );


        /* RSA Decrypt AES Key */

        const rawAESKey =
            await crypto.subtle.decrypt(

                {
                    name: "RSA-OAEP"
                },

                rsaKeyPair.privateKey,

                encryptedAESKey
            );


        setStatus(
            "AES key recovered. Decrypting message..."
        );


        /* Import Recovered AES Key */

        const recoveredAESKey =
            await crypto.subtle.importKey(

                "raw",

                rawAESKey,

                {
                    name: "AES-GCM"
                },

                false,

                ["decrypt"]
            );


        /* Decrypt Ciphertext */

        const plaintextBuffer =
            await crypto.subtle.decrypt(

                {
                    name: "AES-GCM",

                    iv: iv
                },

                recoveredAESKey,

                ciphertext
            );


        const plaintext =
            decoder.decode(
                plaintextBuffer
            );


        document
            .getElementById("decryptedOutput")
            .textContent =
            plaintext;


        setStatus(
            "Decryption successful! Original message recovered."
        );


    } catch (error) {

        console.error(error);


        document
            .getElementById("decryptedOutput")
            .textContent =
            "Decryption failed.";


        setStatus(
            "Decryption error: " + error.message
        );


    } finally {

        document
            .getElementById("decryptBtn")
            .disabled = false;
    }
}



/* BUTTON EVENTS */

document
    .getElementById("encryptBtn")
    .addEventListener(
        "click",
        encryptMessage
    );


document
    .getElementById("autoFillBtn")
    .addEventListener(
        "click",
        autoFillDecryptPanel
    );


document
    .getElementById("decryptBtn")
    .addEventListener(
        "click",
        decryptMessage
    );