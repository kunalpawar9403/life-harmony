import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

let razorpayInstance = null;

try {
    if (keyId && keyId !== 'rzp_test_placeholder') {
        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
} catch (err) {
    console.warn('⚠️ Razorpay initialization warning:', err.message);
}

export { razorpayInstance, keyId, keySecret };
