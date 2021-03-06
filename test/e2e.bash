count_failed=0
function test_todo() {
    case_name=$1
    args=$2

    echo "case ${case_name}:"
    diff \
        <(todo print fixtures/$case_name.todo.yml $args) \
        fixtures/$case_name.expected.txt
    if [ $? -eq 0 ]; then
        echo -e "\tPASSED"
    else
        count_failed=$((count_failed + 1))
        echo -e "\tFAILED"
    fi
    echo -e ""
}

test_todo readme-example
test_todo requires
test_todo children-all-done "--sort end"
test_todo requires-all-done "--sort end"
test_todo invalid
test_todo stats "--stats"
test_todo subtree "--subtree /1"
test_todo import-parent

test_todo print-memo-tree "--memo"
test_todo print-memo-date "--memo --sort end"

if [ $count_failed -eq 0 ]; then
  echo "All tests passed"
  exit 0
else
  echo "${count_failed} failed cases"
  exit 1
fi
