const { v4: uuidv4 } = require('uuid');

function generateId(prefix = 'REC') {
  const shortHex = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `${prefix}-${shortHex}`;
}

function generateDocNumber(prefix = 'INV', sequence = 1) {
  const year = new Date().getFullYear();
  const seqStr = String(sequence).padStart(4, '0');
  return `${prefix}-${year}-${seqStr}`;
}

module.exports = {
  generateId,
  generateDocNumber
};

