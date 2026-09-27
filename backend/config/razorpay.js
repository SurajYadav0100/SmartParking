const Razorpay = require('razorpay');

let razorpayInstance = null;

const isRazorpayConfigured = () => {
  return (
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder' &&
    process.env.RAZORPAY_KEY_SECRET !== 'placeholder_secret' &&
    !process.env.RAZORPAY_KEY_ID.includes('placeholder')
  );
};

if (isRazorpayConfigured()) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log(' Razorpay Gateway configured in live/test mode');
  } catch (err) {
    console.warn('⚠️ Razorpay initialization failed, falling back to Demo Mode:', err.message);
  }
} else {
  console.log('ℹ️ Running in SmartPark Demo Payment Mode (Razorpay keys not provided or placeholder)');
}

module.exports = {
  razorpayInstance,
  isRazorpayConfigured
};
