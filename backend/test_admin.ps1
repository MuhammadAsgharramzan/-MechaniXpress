Write-Host "--- TESTING ADMIN FLOW ---"
$adminLoginBody = '{ "email": "admin@mechanixpress.pk", "password": "password123" }'

try {
    # 1. Login
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
    $token = $response.token
    Write-Host "Admin Token Received"
    
    $headers = @{ Authorization = "Bearer $token" }

    # 2. Get Dashboard Stats
    $dashboard = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard" -Method Get -Headers $headers
    Write-Host "`nDashboard Stats:"
    $dashboard | ConvertTo-Json -Depth 3

    # 3. Get Mechanics
    $mechanics = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/mechanics" -Method Get -Headers $headers
    Write-Host "`nAll Mechanics:"
    $mechanics.mechanics | ForEach-Object { 
        Write-Host "Mechanic: $($_.user.name) - Verified: $($_.isVerified)" 
    }

}
catch {
    Write-Host "Admin Flow Failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Error Details: $body"
    }
}
