#!/bin/bash

# End-to-End Testing Script for StudyCollab v0.5
# This script tests all new features

API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🧪 STUDYCOLLAB v0.5 - END-TO-END TESTING                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
SKIPPED=0

# Test credentials
TEST_EMAIL="test@studycollab.com"
TEST_PASSWORD="Test1234!"

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# Function to print skip
print_skip() {
    echo -e "${YELLOW}⏭️  SKIP${NC}: $2"
    ((SKIPPED++))
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. SERVICE HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test API health
echo -n "Testing API health endpoint... "
API_HEALTH=$(curl -s "$API_URL/health" 2>&1)
if echo "$API_HEALTH" | grep -q "ok"; then
    print_result 0 "API health check"
else
    print_result 1 "API health check"
    echo "   Response: $API_HEALTH"
fi

# Test Frontend
echo -n "Testing Frontend availability... "
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>&1)
if [ "$FRONTEND_CHECK" = "200" ]; then
    print_result 0 "Frontend availability"
else
    print_result 1 "Frontend availability"
    echo "   HTTP Status: $FRONTEND_CHECK"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. AUTHENTICATION TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Login test
echo -n "Testing user login... "
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    print_result 0 "User login"
    echo "   Token obtained: ${TOKEN:0:20}..."
else
    print_result 1 "User login"
    echo "   Response: $LOGIN_RESPONSE"
    TOKEN=""
fi

if [ -z "$TOKEN" ]; then
    echo ""
    echo "⚠️  Cannot proceed with authenticated tests without token"
    echo "   Skipping remaining tests..."
    SKIPPED=$((SKIPPED + 20))
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "3. FILE UPLOAD TESTING"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Create a test file
    TEST_FILE="/tmp/test_upload.txt"
    echo "This is a test file for upload" > "$TEST_FILE"

    # Test file upload
    echo -n "Testing file upload endpoint... "
    UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/files/upload" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$TEST_FILE" \
        -F "type=general" 2>&1)

    if echo "$UPLOAD_RESPONSE" | grep -q "uploaded successfully"; then
        FILE_URL=$(echo "$UPLOAD_RESPONSE" | grep -o '"url":"[^"]*' | cut -d'"' -f4)
        print_result 0 "File upload"
        echo "   File URL: $FILE_URL"
    else
        print_result 1 "File upload"
        echo "   Response: $UPLOAD_RESPONSE"
    fi

    # Test avatar upload (create a small image file)
    echo -n "Testing avatar upload endpoint... "
    AVATAR_FILE="/tmp/test_avatar.png"
    # Create a minimal PNG (1x1 pixel)
    printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82' > "$AVATAR_FILE"

    AVATAR_RESPONSE=$(curl -s -X POST "$API_URL/api/files/avatar" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$AVATAR_FILE" 2>&1)

    if echo "$AVATAR_RESPONSE" | grep -q "uploaded successfully"; then
        print_result 0 "Avatar upload"
    else
        print_result 1 "Avatar upload"
        echo "   Response: $AVATAR_RESPONSE"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "4. NOTIFICATIONS TESTING"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Get notifications
    echo -n "Testing get notifications... "
    NOTIF_RESPONSE=$(curl -s -X GET "$API_URL/api/notifications" \
        -H "Authorization: Bearer $TOKEN" 2>&1)

    if echo "$NOTIF_RESPONSE" | grep -q "notifications"; then
        print_result 0 "Get notifications"
    else
        print_result 1 "Get notifications"
        echo "   Response: $NOTIF_RESPONSE"
    fi

    # Get unread count
    echo -n "Testing unread count... "
    COUNT_RESPONSE=$(curl -s -X GET "$API_URL/api/notifications/unread-count" \
        -H "Authorization: Bearer $TOKEN" 2>&1)

    if echo "$COUNT_RESPONSE" | grep -q "count"; then
        print_result 0 "Get unread count"
        COUNT=$(echo "$COUNT_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
        echo "   Unread count: $COUNT"
    else
        print_result 1 "Get unread count"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "5. MESSAGE FEATURES TESTING"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Get topics first to get a topic ID
    echo -n "Getting topics for message testing... "
    TOPICS_RESPONSE=$(curl -s -X GET "$API_URL/api/topics" \
        -H "Authorization: Bearer $TOKEN" 2>&1)

    if echo "$TOPICS_RESPONSE" | grep -q "topics"; then
        TOPIC_ID=$(echo "$TOPICS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        if [ -n "$TOPIC_ID" ]; then
            print_result 0 "Get topics"
            echo "   Using topic ID: $TOPIC_ID"
        else
            print_result 1 "Get topics (no topics found)"
            TOPIC_ID=""
        fi
    else
        print_result 1 "Get topics"
        TOPIC_ID=""
    fi

    if [ -n "$TOPIC_ID" ]; then
        # Create a message
        echo -n "Testing create message... "
        MESSAGE_RESPONSE=$(curl -s -X POST "$API_URL/api/messages/topic/$TOPIC_ID" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"content":"Test message for E2E testing"}' 2>&1)

        if echo "$MESSAGE_RESPONSE" | grep -q "id"; then
            MESSAGE_ID=$(echo "$MESSAGE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
            print_result 0 "Create message"
            echo "   Message ID: $MESSAGE_ID"
        else
            print_result 1 "Create message"
            echo "   Response: $MESSAGE_RESPONSE"
            MESSAGE_ID=""
        fi

        if [ -n "$MESSAGE_ID" ]; then
            # Edit message
            echo -n "Testing edit message... "
            EDIT_RESPONSE=$(curl -s -X PUT "$API_URL/api/messages/$MESSAGE_ID" \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json" \
                -d '{"content":"Edited test message"}' 2>&1)

            if echo "$EDIT_RESPONSE" | grep -q "edited_at"; then
                print_result 0 "Edit message"
            else
                print_result 1 "Edit message"
                echo "   Response: $EDIT_RESPONSE"
            fi

            # Add reaction
            echo -n "Testing add reaction... "
            REACTION_RESPONSE=$(curl -s -X POST "$API_URL/api/messages/$MESSAGE_ID/reactions" \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json" \
                -d '{"emoji":"👍"}' 2>&1)

            if echo "$REACTION_RESPONSE" | grep -q "reaction\|id"; then
                print_result 0 "Add reaction"
            else
                print_result 1 "Add reaction"
                echo "   Response: $REACTION_RESPONSE"
            fi

            # Get reactions
            echo -n "Testing get reactions... "
            GET_REACTIONS=$(curl -s -X GET "$API_URL/api/messages/$MESSAGE_ID/reactions" \
                -H "Authorization: Bearer $TOKEN" 2>&1)

            if echo "$GET_REACTIONS" | grep -q "reactions"; then
                print_result 0 "Get reactions"
            else
                print_result 1 "Get reactions"
            fi
        fi
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "6. PROFILE TESTING"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Get profile
    echo -n "Testing get profile... "
    PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/api/users/profile" \
        -H "Authorization: Bearer $TOKEN" 2>&1)

    if echo "$PROFILE_RESPONSE" | grep -q "user"; then
        print_result 0 "Get profile"
    else
        print_result 1 "Get profile"
        echo "   Response: $PROFILE_RESPONSE"
    fi

    # Update profile
    echo -n "Testing update profile... "
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/users/profile" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test User Updated"}' 2>&1)

    if echo "$UPDATE_RESPONSE" | grep -q "updated successfully\|user"; then
        print_result 0 "Update profile"
    else
        print_result 1 "Update profile"
        echo "   Response: $UPDATE_RESPONSE"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${YELLOW}⏭️  Skipped: $SKIPPED${NC}"
echo ""

TOTAL=$((PASSED + FAILED + SKIPPED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "Success Rate: $SUCCESS_RATE%"
fi

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi

