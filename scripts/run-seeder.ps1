# Script PowerShell pour exécuter le seeder
# Usage: .\scripts\run-seeder.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SEEDER - 50 Événements avec Images" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$migrationFile = "supabase\migrations\007_seed_events_with_images.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Fichier non trouvé: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Fichier trouvé: $migrationFile" -ForegroundColor Green
Write-Host ""
Write-Host "Choisissez une méthode d'exécution:" -ForegroundColor Yellow
Write-Host "1. Copier le SQL dans le presse-papier (recommandé)"
Write-Host "2. Afficher le contenu à l'écran"
Write-Host "3. Ouvrir Supabase Studio (nécessite URL du projet)"
Write-Host ""

$choice = Read-Host "Votre choix (1-3)"

switch ($choice) {
    "1" {
        $sqlContent = Get-Content $migrationFile -Raw
        Set-Clipboard -Value $sqlContent
        Write-Host ""
        Write-Host "✅ SQL copié dans le presse-papier!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
        Write-Host "   1. Ouvrez Supabase Studio: https://supabase.com/dashboard"
        Write-Host "   2. Allez dans SQL Editor"
        Write-Host "   3. Collez le contenu (Ctrl+V)"
        Write-Host "   4. Cliquez sur 'Run' ou F5"
        Write-Host ""
    }
    "2" {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Cyan
        Get-Content $migrationFile
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Pour exécuter ce SQL:" -ForegroundColor Yellow
        Write-Host "   Copiez le contenu ci-dessus et collez-le dans Supabase Studio > SQL Editor"
        Write-Host ""
    }
    "3" {
        $envFile = ".env.local"
        if (Test-Path $envFile) {
            $supabaseUrl = Get-Content $envFile | Where-Object { $_ -match "NEXT_PUBLIC_SUPABASE_URL=" } | ForEach-Object { $_.Split('=')[1] }
            if ($supabaseUrl) {
                $projectUrl = $supabaseUrl -replace '/v1', ''
                $sqlEditorUrl = "$projectUrl/project/_/sql"
                Write-Host ""
                Write-Host "🌐 Ouverture de Supabase Studio..." -ForegroundColor Green
                Start-Process $sqlEditorUrl
                Write-Host ""
                Write-Host "📝 Une fois l'éditeur SQL ouvert:" -ForegroundColor Yellow
                Write-Host "   Relancez ce script avec l'option 1 pour copier le SQL"
                Write-Host ""
            } else {
                Write-Host ""
                Write-Host "❌ URL Supabase non trouvée dans .env.local" -ForegroundColor Red
                Write-Host "   Veuillez ouvrir manuellement: https://supabase.com/dashboard" -ForegroundColor Yellow
                Write-Host ""
            }
        } else {
            Write-Host ""
            Write-Host "❌ Fichier .env.local non trouvé" -ForegroundColor Red
            Write-Host "   Veuillez ouvrir manuellement: https://supabase.com/dashboard" -ForegroundColor Yellow
            Write-Host ""
        }
    }
    default {
        Write-Host ""
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

