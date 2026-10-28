#!/bin/zsh
set -eu
cd -- "${0:A:h}"
exec node projection/scripts/test-local.mjs
