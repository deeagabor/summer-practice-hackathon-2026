param(
  [string]$Namespace = "showup2move",
  [string]$PostgresPodSelector = "app=postgres",
  [string]$Database = "showup2move",
  [string]$User = "showup2move"
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$migration = Join-Path $repoRoot "packages/database/migrations/001_initial_schema.sql"
$seed = Join-Path $repoRoot "packages/database/seed/001_sports.sql"
$pod = kubectl -n $Namespace get pod -l $PostgresPodSelector -o jsonpath="{.items[0].metadata.name}"

if (-not $pod) {
  throw "Postgres pod not found in namespace '$Namespace'."
}

Get-Content -Raw $migration | kubectl -n $Namespace exec -i $pod -- psql -U $User -d $Database -v ON_ERROR_STOP=1
Get-Content -Raw $seed | kubectl -n $Namespace exec -i $pod -- psql -U $User -d $Database -v ON_ERROR_STOP=1
Write-Host "Database migrations and seed data applied to $Namespace/$pod."
