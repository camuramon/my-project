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
