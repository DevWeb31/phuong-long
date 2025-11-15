# Installation Supabase CLI

## Windows - PowerShell (Scoop)

```powershell
# 1. Installer Scoop (si pas déjà fait)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 2. Installer Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Alternative : npm/npx

```powershell
# Installation globale via npm
npm install -g supabase

# OU utiliser npx (sans installation)
npx supabase db reset
```

## Vérification

```powershell
supabase --version
```

## Utilisation

```powershell
# Après installation, dans le dossier du projet:
cd D:\projets\phuong-long-vo-dao
supabase db reset  # Réinitialise et applique toutes les migrations
```

