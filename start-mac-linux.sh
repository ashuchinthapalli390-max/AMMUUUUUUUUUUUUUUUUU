#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules/react ]; then npm install; fi
npm run dev
