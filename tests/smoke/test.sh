#!/usr/bin/env bash

set -euo pipefail

HOST="${HOST:-localhost}"
PORT="${PORT:-3030}"
TOTAL="${1:-${TOTAL:-10}}"
BASE_URL="http://${HOST}:${PORT}/v1"

P_LONG=60
P_DIGITS=50

###############################################################################
random_bool()  { (( RANDOM % 100 < $1 )); }                  # 0/1 exit-status
random_digits() { printf "%0*d" $((1 + RANDOM % 3)) $(( RANDOM % 1000 )); }
random_word() { LC_ALL=C tr -dc 'a-z' < /dev/urandom | head -c $((3 + RANDOM % 4)); }

gen_job_name() {
  local name
  name=$(random_word)

  if random_bool "$P_LONG"; then
    name+="-$(random_word)"
  fi

  if random_bool "$P_DIGITS"; then
    name+=$(random_digits)
  fi

  echo "${name}"
}

post_job() {
  local name=$1; shift
  local -a args=( "$@" )
  local json_args=""
  if ((${#args[@]})); then
    json_args=$(printf '"%s",' "${args[@]}" | sed 's/,$//')
  fi

  curl -s -X POST "${BASE_URL}/jobs" \
       -H 'Content-Type: application/json' \
       -d "{\"jobName\":\"${name}\",\"arguments\":[${json_args}]}" \
       >/dev/null
}
###############################################################################

echo "▶ Creating ${TOTAL} random jobs …"
for ((i = 1; i <= TOTAL; i++)); do
  name=$(gen_job_name "$i")

  arg_count=$(( RANDOM % 4 ))
  declare -a job_args=()
  for ((a = 0; a < arg_count; a++)); do
    job_args+=( "arg$a" )
  done

  if (( ${#job_args[@]} )); then
    post_job "$name" "${job_args[@]}"
  else
    post_job "$name"
  fi
  sleep 0.1
done
echo "✓ jobs posted"

###############################################################################
# Polling
###############################################################################
attempt=0
while true; do
  attempt=$((attempt + 1))
  sleep 2

  jobs_json=$(curl -s "${BASE_URL}/jobs")
  total=$(echo "$jobs_json"   | jq 'length')
  running=$(echo "$jobs_json" | jq '[ .[] | select(.status=="running") ] | length')

  printf "  attempt %-2s | total=%-2s running=%-2s\r" "$attempt" "$total" "$running"

  if [[ "$total" -ge "$TOTAL" && "$running" -eq 0 ]]; then
    echo -e "\n✓ all jobs finished"
    break
  fi
  (( attempt < 80 )) || { echo -e "\n✗ timeout waiting"; exit 1; }
done

###############################################################################
# Summary per job
###############################################################################
echo "▶ Job summary:"
echo "$jobs_json" | jq -r '
  .[] |
  "\(.name) -> \(.status) (exit=\(.exitCode))" +
  (if (.args | length) > 0 then " | args: " + (.args | join(", ")) else "" end)
'

fail_cnt=$(echo "$jobs_json" \
  | jq '[ .[] | select(.status=="failed" or .status=="crashed") ] | length')

if [[ "$fail_cnt" -gt 0 ]]; then
  echo "❗  ${fail_cnt} job(s) failed or crashed"
fi

###############################################################################
# fetch /stats and pretty-print
###############################################################################
stats_json=$(curl -s "${BASE_URL}/stats")

echo "▶ Stats overview:"
echo "$stats_json"
