# 1. Login Customer
$custLogin = '{ "email": "customer1@example.com", "password": "password123" }'
$res1 = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $custLogin -ContentType "application/json"
$custToken = $res1.token
$custHeaders = @{ Authorization = "Bearer $custToken" }
Write-Host "Customer Logged In"

# 2. Login Mechanic
$mechLogin = '{ "email": "mechanic1@example.com", "password": "password123" }'
$res2 = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $mechLogin -ContentType "application/json"
$mechToken = $res2.token
$mechHeaders = @{ Authorization = "Bearer $mechToken" }
Write-Host "Mechanic Logged In"

# 3. Create Booking
$bookingBody = Get-Content -Raw -Path "booking.json"
$res3 = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $bookingBody -ContentType "application/json" -Headers $custHeaders
$bookingId = $res3.booking.id
Write-Host "Booking Created: $bookingId"

# 4. Mechanic Accept Job
$res4 = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/$bookingId/accept" -Method Patch -Headers $mechHeaders
Write-Host "Job Accepted"

# 5. Mechanic Complete Job
$statusBody = '{ "status": "COMPLETED" }'
$res5 = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/$bookingId/status" -Method Patch -Body $statusBody -ContentType "application/json" -Headers $mechHeaders
Write-Host "Job Completed"

# 6. Customer Review
$reviewBody = @{
    bookingId = $bookingId
    rating    = 5
    comment   = "Excellent service! Highly recommended."
} | ConvertTo-Json

try {
    $res6 = Invoke-RestMethod -Uri "http://localhost:5000/api/reviews" -Method Post -Body $reviewBody -ContentType "application/json" -Headers $custHeaders
    Write-Host "`nReview Created:"
    $res6 | ConvertTo-Json -Depth 3

    # 7. Check Mechanic Reviews
    # We need the mechanic ID (from profile, not user ID). 
    # But for this test let's just use the Admin dashboard or public endpoint if we had one.
    # We have GetMechanicReviews endpoint: /api/reviews/mechanic/:mechanicId
    # Let's get the mechanicProfileId from the booking acceptance response or logic.
    # Actually, let's just trust the review creation success for now.
    
}
catch {
    Write-Host "Review Failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        Write-Host "Error Details: $($reader.ReadToEnd())"
    }
}
