$adminLoginBody = '{ "email": "admin@mechanixpress.pk", "password": "password123" }'
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$token = $response.token

if ($token) {
    Write-Host "Token received."
    
    # Create a dummy file
    "Dummy content" | Set-Content "test_file.txt"

    # Use curl to upload because PowerShell Invoke-RestMethod multipart support is tricky in older versions
    $headers = "Authorization: Bearer $token"
    
    Write-Host "Uploading file..."
    
    # Using curl.exe for multipart/form-data
    curl.exe -X POST http://localhost:5000/api/upload -H $headers -F "file=@test_file.txt"
}
