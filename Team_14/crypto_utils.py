from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import hashlib

def rsa_decrypt_key(encrypted_key, private_key_path):
    try:
        # Load the RSA private key
        with open(private_key_path, "rb") as key_file:
            private_key = serialization.load_pem_private_key(
                key_file.read(), password=None
            )

        # Decrypt the AES key using RSA private key
        decrypted_key = private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted_key
    except Exception as e:
        print(f"Error in RSA decryption: {e}")
        raise

def aes_decrypt_file(encrypted_file_path, decrypted_file_path, aes_key, iv):
    try:
        # Read the encrypted file
        with open(encrypted_file_path, "rb") as enc_file:
            ciphertext = enc_file.read()

        # Decrypt the file using AES in CFB mode
        cipher = Cipher(algorithms.AES(aes_key), modes.CFB(iv))
        decryptor = cipher.decryptor()
        plaintext = decryptor.update(ciphertext) + decryptor.finalize()

        # Write the decrypted content to a new file
        with open(decrypted_file_path, "wb") as dec_file:
            dec_file.write(plaintext)
    except Exception as e:
        print(f"Error in AES decryption: {e}")
        raise



def verify_sha256(file_path, expected_hash):
    try:
        # Compute the SHA-256 hash of the file
        sha256 = hashes.Hash(hashes.SHA256())
        with open(file_path, "rb") as file:
            while chunk := file.read(8192):
                sha256.update(chunk)

        # Compare the computed hash with the expected hash
        return sha256.finalize().hex() == expected_hash
    except Exception as e:
        print(f"Error in SHA-256 verification: {e}")
        raise