import firebase_admin
from firebase_admin import credentials, firestore

# Full path to your Firebase Admin SDK key file
cred = credentials.Certificate(
    "C:/Users/Sohaib Hassan Raja/smart-teacher-planner-bfe1f-firebase-adminsdk-fbsvc-b71b218e33/firebase-adminsdk.json"
)

# Initialize Firebase
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()
