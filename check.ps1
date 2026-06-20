$urls = @(
    "https://femcare-backend-api.onrender.com/health",
    "https://femcare-backend-api.onrender.com/ready",
    "https://femcare-backend-api.onrender.com/api/auth/login"
)

foreach ($url in $urls) {
    Write-Host "--- Testing: $url"
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
        Write-Host "STATUS: $($resp.StatusCode)"
        Write-Host "BODY: $($resp.Content)"
    } catch {
        $code = $_.Exception.Response.StatusCode.Value__
        Write-Host "ERROR CODE: $code"
        Write-Host "MSG: $($_.Exception.Message)"
    }
    Write-Host ""
}
