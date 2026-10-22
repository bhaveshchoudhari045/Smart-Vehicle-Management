#!/usr/bin/env bash
# AutoBridge Lite - starts the Java backend and the React frontend (macOS / Linux).
set -u

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID=""

fail() { echo "ERROR: $1" >&2; exit 1; }

command -v java >/dev/null 2>&1 || fail "Java not found. Install JDK 21 (https://adoptium.net) and try again."
command -v mvn  >/dev/null 2>&1 || fail "Maven not found. Install Apache Maven 3.9+ (https://maven.apache.org/download.cgi) and try again."
command -v node >/dev/null 2>&1 || fail "Node.js not found. Install the Node.js LTS version (https://nodejs.org) and try again."
command -v npm  >/dev/null 2>&1 || fail "npm not found. It is installed together with Node.js."

JAVA_MAJOR="$(java -version 2>&1 | head -n 1 | sed -E 's/.*"([0-9]+)[."].*/\1/')"
if [ "${JAVA_MAJOR:-0}" -lt 21 ] 2>/dev/null; then
  fail "Java 21 or newer is required (found Java ${JAVA_MAJOR}). Install JDK 21 and try again."
fi

cleanup() {
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Stopping backend..."
    kill "$BACKEND_PID" 2>/dev/null
  fi
}
trap cleanup EXIT INT TERM

echo "==> Starting Java backend on http://localhost:8080 (first run downloads dependencies)..."
( cd "$ROOT/backend" && mvn -q spring-boot:run ) &
BACKEND_PID=$!

echo "==> Waiting for the backend to become healthy..."
for i in $(seq 1 120); do
  if curl -fs http://localhost:8080/api/health >/dev/null 2>&1; then
    echo "    Backend is up."
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    fail "The backend stopped unexpectedly. Scroll up for the Maven error (port 8080 busy? wrong Java version?)."
  fi
  sleep 2
done
curl -fs http://localhost:8080/api/health >/dev/null 2>&1 || fail "Backend did not become healthy within 4 minutes."

echo "==> Starting React frontend on http://localhost:5173 ..."
cd "$ROOT/frontend" || fail "frontend folder not found"
if [ ! -d node_modules ]; then
  echo "    Installing npm packages (first run only)..."
  npm install || fail "npm install failed. Check your internet connection."
fi
echo
echo "    Open http://localhost:5173 in your browser. Press Ctrl+C to stop both servers."
echo
npm run dev
