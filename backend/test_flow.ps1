$loginBody = Get-Content -Raw -Path "login.json"
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.token
Write-Host "Token received: $token"

if ($token) {
    $bookingBody = Get-Content -Raw -Path "booking.json"
    $bookingHeaders = @{ Authorization = "Bearer $token" }
    
    try {
        $bookingResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $bookingBody -ContentType "application/json" -Headers $bookingHeaders
        Write-Host "Booking Created Successfully!"
        $bookingResponse | ConvertTo-Json -Depth 5
    } catch {
        Write-Host "Booking Failed. Status Code: $($_.Exception.Response.StatusCode)"
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Error Body: $body"
    }
}

Write-Host "`n--- TESTING MECHANIC FLOW ---"
$mechanicLoginBody = '{ "email": "mechanic1@example.com", "password": "password123" }'
try {
    $mechResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $mechanicLoginBody -ContentType "application/json"
    $mechToken = $mechResponse.token
    Write-Host "Mechanic Token Received"
    
    $mechHeaders = @{ Authorization = "Bearer $mechToken" }
    $jobs = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/available" -Method Get -Headers $mechHeaders
    Write-Host "Available Jobs:"
    $jobs | ConvertTo-Json -Depth 3
} catch {
     Write-Host "Mechanic Flow Failed: $($_.Exception.Message)"
}
