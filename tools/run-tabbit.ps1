param(
    [Parameter(Mandatory = $true)][string]$Task,
    [Parameter(Mandatory = $true)][string]$RequestId,
    [Parameter(Mandatory = $true)][string]$JsPath,
    [string]$ShotPrefix = '',
    [int]$TimeoutMs = 150000
)

$ErrorActionPreference = 'Continue'
$cli = Join-Path $env:LOCALAPPDATA 'Tabbit\LocalAgent\bin\tabbit-cli.exe'
if (-not (Test-Path -LiteralPath $cli)) { throw "tabbit-cli not found at $cli" }

$workspace = 'D:\github projects\HeptaBase RE'
$refDir = Join-Path $workspace 'Plan\references'
$logDir = Join-Path $workspace '.tabbit-logs'
New-Item -ItemType Directory -Force -Path $refDir, $logDir | Out-Null

$js = Get-Content -LiteralPath $JsPath -Raw -Encoding UTF8
$raw = $js | & $cli nodejs --task $Task --request-id $RequestId --timeout-ms $TimeoutMs 2>&1 | Out-String
$code = $LASTEXITCODE

# The JSON receipt is the last line that parses as JSON.
$json = $null
foreach ($line in ($raw -split "`r?`n")) {
    $t = $line.Trim()
    if ($t.StartsWith('{') -and $t.EndsWith('}')) {
        try { $json = $t | ConvertFrom-Json -ErrorAction Stop } catch { }
    }
}

Write-Output "EXIT=$code"
if ($null -eq $json) {
    Write-Output "NO-JSON-RECEIPT"
    Write-Output $raw
    exit 1
}

$json | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $logDir "$RequestId.json") -Encoding UTF8

Write-Output "STATUS=$($json.status) REQUESTID=$($json.result.requestId)"
if ($json.result.value) { Write-Output ("VALUE=" + ($json.result.value | ConvertTo-Json -Depth 8 -Compress)) }
if ($json.error) { Write-Output ("ERROR=" + ($json.error | ConvertTo-Json -Depth 6 -Compress)) }

$shots = @()
if ($json.result.screenshotsDelta) { $shots += $json.result.screenshotsDelta | ForEach-Object { $_.path } }
if ($shots.Count -eq 0 -and $json.result.nextAction.path) { $shots += $json.result.nextAction.path }

if ($ShotPrefix -and $shots.Count -gt 0) {
    $i = 0
    foreach ($sp in $shots) {
        $i++
        $dest = if ($shots.Count -eq 1) { Join-Path $refDir "$ShotPrefix.png" } else { Join-Path $refDir ("$ShotPrefix-$i.png") }
        if (Test-Path -LiteralPath $sp) {
            Copy-Item -LiteralPath $sp -Destination $dest -Force
            Write-Output "SAVED=$dest"
        } else {
            Write-Output "MISSING-SHOT=$sp"
        }
    }
} elseif ($shots.Count -gt 0) {
    Write-Output ("SHOTS=" + ($shots -join ';'))
}
