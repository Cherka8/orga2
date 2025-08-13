// Organaizer — Modèle de script pour (re)créer les indexes MongoDB
// Utilisation:
//   mongosh --file mongo_indexes_template.js
// Remplacez les collections et clés ci-dessous par celles réellement utilisées dans votre base.

const dbName = "organaizer_preferences"; // adapteZ si nécessaire
const dbRef = db.getSiblingDB(dbName);

// Exemple: indexes conseillés (à adapter à vos collections réelles)
// dbRef.getCollection("preferences").createIndex({ accountId: 1 });
// dbRef.getCollection("preferences").createIndex({ key: 1, accountId: 1 }, { unique: true });

// dbRef.getCollection("views").createIndex({ accountId: 1 });
// dbRef.getCollection("views").createIndex({ updatedAt: -1 });

print("Index creation template executed for DB:", dbName);
print("NOTE: Ce fichier est un modèle. Remplacez les noms de collections et les clés d'index par vos besoins réels.");
