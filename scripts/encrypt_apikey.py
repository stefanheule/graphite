#!/usr/bin/env python3
"""Encrypt an API key for the hardcoded-key easter egg in config/index.html.

The config page exposes a "magic password" mechanism: when a user types a
specific password into the API key field, the page substitutes a hardcoded
encrypted API key for the selected weather provider. This script generates
that encrypted ciphertext to paste into config/index.html.

Usage:
  scripts/encrypt_apikey.py             # interactive (prompts for both)
  scripts/encrypt_apikey.py --decrypt   # reverse a ciphertext to verify

The plaintext API key must be a hex string (typical OpenWeatherMap and
Weatherbit keys are 32 hex chars). The script prints the encrypted hex
string to paste into config/index.html as the first argument to xor(...).

The encryption mirrors the JavaScript `xor` helper at config/index.html
line ~4254: nibble-wise XOR between two equal-length hex strings, where
the second operand is md5(password.lower() + '123456789'). Because XOR is
symmetric, the same operation decrypts the ciphertext.
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


def xor_hex(a: str, b: str) -> str:
    if any(c not in '0123456789abcdef' for c in a):
        sys.exit('error: input contains non-hex characters; expected lowercase hex')
    if len(a) > len(b):
        sys.exit(
            f'error: input is {len(a)} hex chars but the key is only {len(b)}; '
            'the key is an md5 (32 hex chars), so the input must also be at most 32 hex chars'
        )
    return ''.join(format(int(a[i], 16) ^ int(b[i], 16), 'x') for i in range(len(a)))


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
    args = parser.parse_args()

    label = 'ciphertext' if args.decrypt else 'plaintext API key'
    value = input(f'{label} (hex): ').strip().lower()
    password = getpass.getpass('magic password: ').strip()

    key = derive_key(password)
    result = xor_hex(value, key)

    out_label = 'plaintext' if args.decrypt else 'ciphertext'
    print(f'\n{out_label}: {result}')

    if not args.decrypt:
        print(
            '\npaste this into config/index.html, replacing\n'
            '  REPLACE_WITH_ENCRYPTED_OWM_KEY         (for source == 2, OpenWeatherMap)\n'
            '  REPLACE_WITH_ENCRYPTED_WEATHERBIT_KEY  (for source == 3, Weatherbit)\n'
            'in the matching xor("...", key) call.'
        )


if __name__ == '__main__':
    main()
