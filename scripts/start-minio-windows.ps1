##powershell -ExecutionPolicy Bypass -File .\scripts\start-minio-windows.ps1
## Get-Process minio -ErrorAction SilentlyContinue | Stop-Process -Force
param(
  [string]$InstallDir = "C:\minio",
  [string]$DataDir = "C:\minio\data",
  [string]$RootUser = "minioadmin",
  [string]$RootPassword = "minioadmin123",
  [switch]$DownloadOnly
)

$ErrorActionPreference = "Stop"

$downloadUrl = "https://dl.min.io/server/minio/release/windows-amd64/minio.exe"
$minioExe = Join-Path $InstallDir "minio.exe"

if (-not (Test-Path $InstallDir)) {
  New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

if (-not (Test-Path $DataDir)) {
  New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

if (-not (Test-Path $minioExe)) {
  Write-Host "Downloading MinIO from $downloadUrl ..."
  Invoke-WebRequest -Uri $downloadUrl -OutFile $minioExe
  Write-Host "Downloaded to $minioExe"
}

if ($DownloadOnly) {
  Write-Host "Download complete. Run this script again without -DownloadOnly to start MinIO."
  exit 0
}

$env:MINIO_ROOT_USER = $RootUser
$env:MINIO_ROOT_PASSWORD = $RootPassword

Write-Host "Starting MinIO"
Write-Host "S3 API: http://localhost:9000"
Write-Host "Console: http://localhost:9001"
Write-Host "User: $RootUser"
Write-Host "Press Ctrl+C to stop."

& $minioExe server $DataDir --console-address ":9001"
