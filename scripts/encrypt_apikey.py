#!/usr/bin/env python3
"""Encrypt an API key for the hardcoded-key easter egg in config/index.html.

The config page exposes a "magic password" mechanism: when a user types a
specific password into the API key field, the page substitutes a hardcoded
encrypted API key for the selected weather provider. This script generates
that encrypted ciphertext to paste into config/index.html.

Usage:
  scripts/encrypt_apikey.py             # interactive (prompts for both)
  scripts/encrypt_apikey.py --decrypt   # reverse a ciphertext to verify

Two modes, chosen automatically when encrypting:

- Hex keys (OpenWeatherMap and Weatherbit keys are 32 hex chars): nibble-wise
  XOR between two equal-length hex strings, mirroring the JavaScript `xor`
  helper in config/index.html. The key is md5(password.lower() + '123456789').
- Anything else (Google API keys are base62, e.g. "AIza..."): each byte of
  the plaintext is XORed with the md5 key's bytes, cycled, and the result is
  printed as hex (two chars per byte), mirroring the JavaScript `xorStr`
  helper. Pass --string with --decrypt to reverse this mode, since a
  ciphertext alone does not say which mode produced it.

Because XOR is symmetric, the same operation decrypts the ciphertext.
"""

import argparse
import getpass
import hashlib
import sys

# md5(password.lower()) of the magic password recognised by config/index.html.
# If the password the user types does not hash to this value, the page will
# not trigger the substitution, so we warn (but still produce output) when
# they do not match -- useful when rotating the password.
EXPECTED_PASSWORD_HASH = 'ab86a1e1ef70dff97959067b723c5c24'


def is_hex(s: str) -> bool:
    return all(c in '0123456789abcdef' for c in s)


def xor_hex(a: str, b: str) -> str:
    if not is_hex(a):
        sys.exit('error: input contains non-hex characters; expected lowercase hex')
    if len(a) > len(b):
        sys.exit(
            f'error: input is {len(a)} hex chars but the key is only {len(b)}; '
            'the key is an md5 (32 hex chars), so the input must also be at most 32 hex chars'
        )
    return ''.join(format(int(a[i], 16) ^ int(b[i], 16), 'x') for i in range(len(a)))


def xor_bytes_encrypt(plaintext: str, key_hex: str) -> str:
    key = bytes.fromhex(key_hex)
    data = plaintext.encode()
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data)).hex()


def xor_bytes_decrypt(cipher_hex: str, key_hex: str) -> str:
    if not is_hex(cipher_hex) or len(cipher_hex) % 2 != 0:
        sys.exit('error: ciphertext must be an even-length lowercase hex string')
    key = bytes.fromhex(key_hex)
    data = bytes.fromhex(cipher_hex)
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data)).decode()


def derive_key(password: str) -> str:
    pw = password.lower()
    pw_hash = hashlib.md5(pw.encode()).hexdigest()
    if pw_hash != EXPECTED_PASSWORD_HASH:
        print(
            f'warning: md5("{"*" * len(pw)}") = {pw_hash}, but config/index.html '
            f'expects {EXPECTED_PASSWORD_HASH}.\n'
            '         the resulting ciphertext will not decrypt through the magic-password flow.',
            file=sys.stderr,
        )
    return hashlib.md5((pw + '123456789').encode()).hexdigest()


def main():
    parser = argparse.ArgumentParser(
        description='Encrypt or decrypt an API key for the config page easter egg.'
    )
    parser.add_argument(
        '--decrypt',
        action='store_true',
        help='Reverse a ciphertext back to the plaintext API key (xor is symmetric).',
    )
    parser.add_argument(
        '--string',
        action='store_true',
        help='With --decrypt: the ciphertext was made in byte mode (a non-hex '
             'key such as a Google API key). Ignored when encrypting, where '
             'the mode is chosen from the plaintext.',
    )
    args = parser.parse_args()

    if args.decrypt:
        value = input('ciphertext (hex): ').strip().lower()
    else:
        value = input('plaintext API key: ').strip()
    password = getpass.getpass('magic password: ').strip()

    key = derive_key(password)
    if args.decrypt:
        result = xor_bytes_decrypt(value, key) if args.string else xor_hex(value, key)
    elif is_hex(value.lower()) and len(value) <= 32:
        result = xor_hex(value.lower(), key)
    else:
        result = xor_bytes_encrypt(value, key)

    out_label = 'plaintext' if args.decrypt else 'ciphertext'
    print(f'\n{out_label}: {result}')

    if not args.decrypt:
        print(
            '\npaste this into config/index.html as the first argument of the\n'
            'matching call:\n'
            '  xor("...", key)     source == 2 (OpenWeatherMap), 3 (Weatherbit)\n'
            '  xorStr("...", key)  source == 4 (Google Weather)'
        )


if __name__ == '__main__':
    main()
