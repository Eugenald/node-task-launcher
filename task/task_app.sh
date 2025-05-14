#!/bin/bash

echo "[INFO] Starting task_app.sh..."
echo "[INFO] Args count: $#"

result=$(( RANDOM % 3 ))
echo "[INFO] Simulated outcome = $result"

sleep 2

if [ "$result" -eq 0 ]; then
  echo "[INFO] Job succeeded."
  exit 0
elif [ "$result" -eq 1 ]; then
  echo "[ERROR] Job failed due to logical error." >&2
  exit 1
else
  echo "[CRASH] Simulating crash..." >&2
  kill -SEGV $$
fi
