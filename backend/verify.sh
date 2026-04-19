# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "central.regional@portal.local", "password": "Password123!"}' | jq -r .token)

echo "Logged in. Token: ${TOKEN:0:10}..."

# 2. Submit report
RESPONSE=$(curl -s -X POST http://localhost:3001/api/reports/sub-regional \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Curl Verification Report", "content": "Manual curl test.", "expenseAmount": 1234}')

echo "Submission Response: $RESPONSE"

# 3. List recent reports for user
curl -s -X GET http://localhost:3001/api/sub-regional/submissions \
  -H "Authorization: Bearer $TOKEN" | jq .
