const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a secure verification token and base64 QR code image for a parking ticket
 * @param {String} ticketId 
 * @param {String} sessionId 
 * @returns {Promise<Object>} { qrToken, qrCodeDataUrl }
 */
const generateTicketQR = async (ticketId, sessionId) => {
  // Generate a random secure hash for verification token
  const secretSalt = process.env.JWT_SECRET || 'smartpark_qr_salt_secret';
  const qrToken = crypto
    .createHmac('sha256', secretSalt)
    .update(`${ticketId}:${sessionId}`)
    .digest('hex')
    .substring(0, 32);

  // Payload encoded in the QR code: JSON with ticketId and security token
  const payload = JSON.stringify({
    app: 'SMARTPARK',
    ticketId,
    token: qrToken
  });

  // Generate Data URL for image rendering
  const qrCodeDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    },
    width: 320
  });

  return {
    qrToken,
    qrCodeDataUrl,
    payload
  };
};

/**
 * Verify scanned QR payload
 * @param {String} payloadString 
 * @returns {Object} { isValid, ticketId, token }
 */
const verifyQRPayload = (payloadString) => {
  try {
    let data;
    if (typeof payloadString === 'string') {
      // If user scanned raw JSON or raw ticket ID
      if (payloadString.trim().startsWith('{')) {
        data = JSON.parse(payloadString);
      } else {
        // Plain ticket ID or token scanned
        return { isValid: true, ticketId: payloadString.trim() };
      }
    } else {
      data = payloadString;
    }

    if (data.ticketId) {
      return { isValid: true, ticketId: data.ticketId, token: data.token };
    }
    return { isValid: false, message: 'Invalid QR format' };
  } catch (err) {
    return { isValid: false, message: 'Failed to parse QR payload' };
  }
};

module.exports = {
  generateTicketQR,
  verifyQRPayload
};
