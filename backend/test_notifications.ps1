$adminLoginBody = '{ "email": "admin@mechanixpress.pk", "password": "password123" }'
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$token = $response.token

if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    
    # Get Notifications
    Write-Host "Fetching Notifications..."
    $notifs = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications" -Method Get -Headers $headers
    $notifs | ConvertTo-Json -Depth 3

    # Mark as read (if any exist - mocking one first would be ideal but let's just check empty list works)
    # Actually, we don't have logic to CREATE notifications yet, so list will be empty.
    # We can rely on the 200 OK response for empty list.
}
