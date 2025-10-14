import firebase_admin
from firebase_admin import credentials, firestore


# Load credentials (yung JSON galing Firebase Console > Project Settings > Service Accounts)
cred = credentials.Certificate("firebase_credentials.json")

# Initialize app
firebase_admin.initialize_app(cred)

# Firestore DB
db = firestore.client()

# Test: Write data
doc_ref = db.collection("test_collection").document("sample_doc")
doc_ref.set({
    "message": "Hello from Flask!",
    "status": "working"
})

print("✅ Successfully wrote test data to Firebase!")

# Test: Read data
doc = db.collection("test_collection").document("sample_doc").get()
if doc.exists:
    print("📌 Fetched from Firebase:", doc.to_dict())
else:
    print("❌ No document found.")
from firebase_admin import credentials, firestore, initialize_app

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)

db = firestore.client()

# Add test visitor
db.collection("visitors").add({"name": "Test Visitor", "purpose": "Testing"})
print("✅ Visitor added!")
