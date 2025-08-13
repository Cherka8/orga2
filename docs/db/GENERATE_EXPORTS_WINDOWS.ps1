param(
  [Parameter(Mandatory = $true)] [string] $MySqlUser,
  [Parameter(Mandatory = $false)] [string] $MySqlPassword = "",
  [Parameter(Mandatory = $true)] [string] $MySqlDb,
  [Parameter(Mandatory = $true)] [string] $MongoDbName,
  [Parameter(Mandatory = $false)] [string] $MongoUri = ""
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function Resolve-MySqlDump {
  $candidates = @(
    "C:\xampp\mysql\bin\mysqldump.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
    "mysqldump"
  )
  foreach ($c in $candidates) {
    if ($c -eq "mysqldump") {
      if (Get-Command mysqldump -ErrorAction SilentlyContinue) { return "mysqldump" }
    } elseif (Test-Path -LiteralPath $c) {
      return $c
    }
  }
  throw "mysqldump introuvable. Ajoutez-le au PATH ou installez MySQL Tools (XAMPP/MySQL Server)."
}

$mysqldump = Resolve-MySqlDump

# 1) Export MySQL (structure uniquement)
$ddlOut = Join-Path $root "orga_mysql_schema.sql"
$passArg = if ([string]::IsNullOrEmpty($MySqlPassword)) { "--password" } else { "--password=$MySqlPassword" }

Write-Host "[MySQL] Export de la structure vers $ddlOut"
& $mysqldump -u $MySqlUser $passArg --no-data --routines --triggers $MySqlDb > $ddlOut

# 2) Export MongoDB (dump)
$dumpDir = Join-Path $root "mongo_dump"
New-Item -ItemType Directory -Force -Path $dumpDir | Out-Null

if (-not (Get-Command mongodump -ErrorAction SilentlyContinue)) {
  Write-Warning "mongodump introuvable dans le PATH. Installez MongoDB Database Tools (https://www.mongodb.com/try/download/database-tools)."
} else {
  Write-Host "[MongoDB] Export de $MongoDbName vers $dumpDir"
  if (-not [string]::IsNullOrEmpty($MongoUri)) {
    mongodump --uri $MongoUri --db $MongoDbName --out $dumpDir
  } else {
    mongodump --db $MongoDbName --out $dumpDir
  }
}

Write-Host "Terminé. Fichiers générés:"
Write-Host " - $ddlOut"
Write-Host " - $dumpDir"
