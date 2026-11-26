#!/bin/sh
# Runs every behaviour check in supabase/tests against the linked project.
# Each file rolls itself back and ends with ALL_TESTS_PASSED; anything else is a failure.
status=0
for file in supabase/tests/*.sql; do
  output=$(npx supabase db query --remote --yes -f "$file" 2>&1 < /dev/null)
  if echo "$output" | grep -q 'ALL_TESTS_PASSED'; then
    echo "$file: passed"
  else
    echo "$file: FAILED"
    echo "$output" | grep -oE 'ERROR:[^\\]*' | head -1
    status=1
  fi
done
exit $status
