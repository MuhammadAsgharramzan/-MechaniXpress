# 1. Login Customer
$loginBody = '{ "email": "customer1@example.com", "password": "password123" }'
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.token

if ($token) {
    Write-Host "Customer Logged In"
    $headers = @{ Authorization = "Bearer $token" }

    # 2. Create Booking (to pay for)
    $bookingBody = Get-Content -Raw -Path "booking.json"
    $bookingRes = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $bookingBody -ContentType "application/json" -Headers $headers
    $bookingId = $bookingRes.booking.id
    Write-Host "Booking Created: $bookingId"

    # 3. Initiate Payment
    Write-Host "Initiating Payment..."
    $paymentBody = @{
        bookingId    = $bookingId
        mobileNumber = "03001234567"
    } | ConvertTo-Json

    try {
        $payRes = Invoke-RestMethod -Uri "http://localhost:5000/api/payments/initiate" -Method Post -Body $paymentBody -ContentType "application/json" -Headers $headers
        
        Write-Host "Payment Response:"
        $payRes | ConvertTo-Json -Depth 3
        
        if ($payRes.success) {
            Write-Host "✅ Payment Flow Verified"
        }
        else {
            Write-Host "❌ Payment Failed"
        }

    }
    catch {
        Write-Host "Payment Request Failed: $($_.Exception.Message)"
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        Write-Host "Error: $($reader.ReadToEnd())"
    }
}
