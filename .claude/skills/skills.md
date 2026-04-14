# Claude Skills — eFatura

Scripts PowerShell réutilisables pour l'assistance IA sur ce projet.

## Comment appeler un skill

Dans Claude Code, tapez `/` suivi du nom, ou demandez directement :
> "Exécute le skill deep-clean"
> "Lance analyze-logs sur le fichier spring_logs.txt"

Ou directement dans PowerShell :
```powershell
.\.claude\skills\deep-clean.ps1
.\.claude\skills\analyze-logs.ps1 -LogFile .\spring_logs.txt
.\.claude\skills\db-reset.ps1 -Confirm
```

---

## deep-clean.ps1
**Objectif** : Nettoyage complet de l'environnement de build.

Actions :
1. `mvn clean` — supprime le dossier `target/`
2. Supprime les fichiers `.class` résiduels
3. Arrête et supprime les conteneurs Docker liés au projet
4. Nettoie les images Docker non utilisées
5. Vérifie l'espace disque libéré

Usage :
```powershell
.\.claude\skills\deep-clean.ps1             # Nettoyage standard
.\.claude\skills\deep-clean.ps1 -Docker     # Inclut Docker (défaut: oui)
.\.claude\skills\deep-clean.ps1 -NoDocker   # Maven seulement
```

---

## analyze-logs.ps1
**Objectif** : Analyse intelligente des logs Spring Boot pour extraire erreurs, exceptions et patterns.

Actions :
1. Extrait toutes les lignes ERROR et WARN
2. Groupe les stack traces par exception
3. Compte les fréquences d'erreur
4. Identifie les erreurs de connexion DB
5. Génère un rapport synthétique

Usage :
```powershell
.\.claude\skills\analyze-logs.ps1                         # Analyse spring_logs.txt
.\.claude\skills\analyze-logs.ps1 -LogFile .\custom.log   # Fichier spécifique
.\.claude\skills\analyze-logs.ps1 -Level ERROR            # Seulement ERRORs
.\.claude\skills\analyze-logs.ps1 -Last 100               # 100 dernières lignes
```

---

## db-reset.ps1
**Objectif** : Réinitialisation complète de la base de données de développement.

Actions :
1. Vérifie que PostgreSQL est accessible
2. Termine les connexions actives sur `efatura_db`
3. Supprime et recrée la base `efatura_db`
4. Exécute `erp_core_setup.sql`
5. Confirme le succès avec le nombre de tables créées

Usage :
```powershell
.\.claude\skills\db-reset.ps1            # Demande confirmation
.\.claude\skills\db-reset.ps1 -Force     # Sans confirmation (CI/CD)
```

---

## health-check.ps1
**Objectif** : Vérification complète de l'état de l'environnement de développement.

Actions :
1. Spring Boot — tente `/actuator/health`, sinon détecte le processus Java
2. PostgreSQL — teste la connexion et vérifie l'existence de `efatura_db`
3. Docker — vérifie le daemon et les conteneurs liés au projet
4. Ports réseau — état des ports 8080 et 5432
5. Processus Maven — détecte un build en cours

Usage :
```powershell
.\.claude\skills\health-check.ps1              # Check complet
.\.claude\skills\health-check.ps1 -Port 9090   # Port personnalisé
```

---

## Ajouter un nouveau skill

1. Créer `nom-du-skill.ps1` dans ce dossier
2. Ajouter l'entrée dans ce fichier `skills.md`
3. Respecter le template :
```powershell
# [SKILL] nom-du-skill.ps1
# Description : ...
# Usage : .\.claude\skills\nom-du-skill.ps1 [-Param valeur]
param(...)
$ErrorActionPreference = "Stop"
# ... logique ...
```
