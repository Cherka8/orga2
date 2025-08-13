# Organaizer — Exports BDD (MySQL + MongoDB)

Ce dossier contient les exports ou scripts nécessaires pour recréer les bases de données du projet.

Contenu attendu après génération:
- orga_mysql_schema.sql — Export MySQL (structure uniquement)
- mongo_dump/ — Dump MongoDB (structure + index + données)
- mongo_indexes_template.js — Script modèle pour rejouer les index MongoDB (optionnel)
- Scripts de génération:
  - GENERATE_EXPORTS_WINDOWS.ps1 (Windows/PowerShell)
  - generate_exports_ubuntu.sh (Ubuntu/Linux/Bash)


## 1) Générer les exports

Vous pouvez générer les exports directement dans ce dossier en utilisant l’un des scripts ci-dessous.

### Windows (PowerShell)
Exécuter dans PowerShell (adapter les paramètres si besoin):
```powershell
# Autoriser l'exécution dans la session courante si nécessaire
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Chemin du script
$script = "C:\xampp\htdocs\site\organaizer\orga2\docs\db\GENERATE_EXPORTS_WINDOWS.ps1"

# MySQL local (XAMPP), Mongo local
& $script -MySqlUser root -MySqlPassword "" -MySqlDb organaizer -MongoDbName organaizer_preferences

# OU Mongo Atlas (exemple):
# & $script -MySqlUser root -MySqlPassword "" -MySqlDb organaizer -MongoDbName organaizer_preferences -MongoUri "mongodb+srv://USER:PASS@cluster.example.mongodb.net/organaizer_preferences?retryWrites=true&w=majority"
```

Résultat:
- `orga_mysql_schema.sql` créé/écrasé
- `mongo_dump/` rempli avec le dump

### Ubuntu/Linux (Bash)
Exécuter sur le VPS, dans le dossier du projet:
```bash
cd /var/www/orga2/docs/db
chmod +x generate_exports_ubuntu.sh

# MySQL local + Mongo local
MYSQL_USER=org_user MYSQL_PASSWORD=CHANGE_ME MYSQL_DB=organaizer \
MONGO_DB=organaizer_preferences ./generate_exports_ubuntu.sh

# OU Mongo Atlas
# MYSQL_USER=org_user MYSQL_PASSWORD=CHANGE_ME MYSQL_DB=organaizer \
# MONGO_DB=organaizer_preferences MONGO_URI="mongodb+srv://USER:PASS@cluster.example.mongodb.net/organaizer_preferences" \
# ./generate_exports_ubuntu.sh
```


## 2) Importer (côté correcteur / professeur)

### MySQL (structure)
```bash
mysql -u <user> -p -e "CREATE DATABASE IF NOT EXISTS organaizer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u <user> -p organaizer < orga_mysql_schema.sql
```

### MongoDB (dump)
```bash
mongorestore --db organaizer_preferences --drop mongo_dump/organaizer_preferences
```

### MongoDB (indexes uniquement, optionnel)
Si vous ne voulez pas fournir le dump Mongo, vous pouvez fournir/mettre à jour un script d’index:
```bash
mongosh --file mongo_indexes_template.js
```


## 3) Notes importantes
- Ne commitez jamais de mots de passe en clair dans ce dossier.
- Les exports fournis ici sont destinés à la correction et à la reproductibilité des BDD.
- Le backend utilise `.env` pour ses connexions (MySQL + Mongo). Voir `organaizer-backend/.env`.
- En production, `TYPEORM_SYNCHRONIZE` doit rester `false`.
