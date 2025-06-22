#!/bin/bash

echo "🧪 Running Flow State Dev Test Suite"
echo "===================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Running: ${test_name}${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ ${test_name} passed${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ ${test_name} failed${NC}"
        ((TESTS_FAILED++))
    fi
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Create test directory
TEST_DIR="$ROOT_DIR/test-output"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

# Test 1: Basic init
run_test "Basic Init" "
    cd '$TEST_DIR' && \
    node '$ROOT_DIR/bin/fsd.js' init test-basic --no-interactive && \
    [ -f test-basic/package.json ] && \
    [ -f test-basic/CLAUDE.md ] && \
    [ -d test-basic/.claude ]
"

# Test 2: Check version
run_test "Version Check" "
    node '$ROOT_DIR/bin/fsd.js' --version | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$'
"

# Test 3: Help command
run_test "Help Command" "
    node '$ROOT_DIR/bin/fsd.js' help 2>&1 | grep -q 'Flow State Dev'
"

# Test 4: Invalid project name
run_test "Invalid Project Name" "
    cd '$TEST_DIR' && \
    ! node '$ROOT_DIR/bin/fsd.js' init 'Test Project' --no-interactive 2>&1 | grep -q 'lowercase'
"

# Test 5: Duplicate project
run_test "Duplicate Project Check" "
    cd '$TEST_DIR' && \
    node '$ROOT_DIR/bin/fsd.js' init test-basic --no-interactive 2>&1 | grep -q 'already exists'
"

# Summary
echo -e "\n===================================="
echo -e "${BLUE}Test Summary:${NC}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"

# Cleanup
rm -rf "$TEST_DIR"

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
fi