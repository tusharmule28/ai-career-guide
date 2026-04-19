import os
import firebase_admin
from firebase_admin import credentials, messaging
import logging

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self._initialized = False
        self._initialize()

    def _initialize(self):
        try:
            # Check if already initialized
            if firebase_admin._apps:
                self._initialized = True
                return

            # Prefer encoded JSON from env to avoid file path issues in production (Render)
            firebase_creds_json = os.getenv("FIREBASE_ADMIN_SDK_JSON")
            
            if firebase_creds_json:
                import json
                creds_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(creds_dict)
                firebase_admin.initialize_app(cred)
                self._initialized = True
                logger.info("Firebase Admin initialized via environment variable.")
            else:
                # Fallback to local file if it exists
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    self._initialized = True
                    logger.info(f"Firebase Admin initialized via file: {cred_path}")
                else:
                    logger.warning("Firebase credentials not found. Push notifications will be disabled.")
        except Exception as e:
            logger.error(f"Error initializing Firebase Admin: {e}")

    async def send_push_notification(self, token: str, title: str, body: str, data: dict = None):
        if not self._initialized or not token:
            return False

        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=token,
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        icon='stock_ticker_update',
                        color='#6366F1'
                    ),
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(badge=1, sound='default'),
                    ),
                ),
            )
            response = messaging.send(message)
            logger.info(f"Successfully sent FCM message: {response}")
            return True
        except Exception as e:
            logger.error(f"FCM sending failed: {e}")
            return False

firebase_service = FirebaseService()
