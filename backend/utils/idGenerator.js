/**
 * ID Generator Utility for SmartPark
 * Generates human-readable, unique identifiers for tickets, receipts, and transactions
 */

const generateTicketId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SP-${year}-${randomNum}`;
};

const generateReceiptId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `RCPT-${year}-${randomNum}`;
};

const generateTransactionId = (prefix = 'TXN') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

module.exports = {
  generateTicketId,
  generateReceiptId,
  generateTransactionId
};
