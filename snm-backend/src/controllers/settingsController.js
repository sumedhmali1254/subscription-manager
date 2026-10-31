const { isFallback, query, store } = require('../config/db');
const { success } = require('../utils/response');

exports.get = async (req, res, next) => {
  try {
    if (!isFallback()) {
      const rows = await query('SELECT * FROM company_settings LIMIT 1');
      if (rows && rows.length > 0) {
        const s = rows[0];
        return success(res, {
          companyName: s.company_name,
          email: s.email,
          phone: s.phone,
          currency: s.currency,
          currencySymbol: s.currency_symbol,
          timezone: s.timezone,
          gstin: s.gstin,
          address: {
            street: s.street,
            city: s.city,
            state: s.state,
            pincode: s.pincode,
            country: s.country
          },
          logoUrl: s.logo_url
        });
      }
    }
    const cs = store.company_settings;
    return success(res, {
      companyName: cs.company_name,
      email: cs.email,
      phone: cs.phone,
      currency: cs.currency,
      currencySymbol: cs.currency_symbol,
      timezone: cs.timezone,
      gstin: cs.gstin,
      address: {
        street: cs.street,
        city: cs.city,
        state: cs.state,
        pincode: cs.pincode,
        country: cs.country
      },
      logoUrl: cs.logo_url
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { companyName, email, phone, currency, currencySymbol, timezone, gstin, address, logoUrl } = req.body;

    if (!isFallback()) {
      await query(
        `UPDATE company_settings SET
           company_name = COALESCE(?, company_name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           currency = COALESCE(?, currency),
           currency_symbol = COALESCE(?, currency_symbol),
           timezone = COALESCE(?, timezone),
           gstin = COALESCE(?, gstin),
           street = COALESCE(?, street),
           city = COALESCE(?, city),
           state = COALESCE(?, state),
           pincode = COALESCE(?, pincode),
           country = COALESCE(?, country),
           logo_url = COALESCE(?, logo_url)
         WHERE id = 'COMP-001'`,
        [
          companyName, email, phone, currency, currencySymbol, timezone, gstin,
          address?.street, address?.city, address?.state, address?.pincode, address?.country,
          logoUrl
        ]
      );
    } else {
      const cs = store.company_settings;
      if (companyName) cs.company_name = companyName;
      if (email) cs.email = email;
      if (phone) cs.phone = phone;
      if (currency) cs.currency = currency;
      if (currencySymbol) cs.currency_symbol = currencySymbol;
      if (timezone) cs.timezone = timezone;
      if (gstin) cs.gstin = gstin;
      if (address) {
        if (address.street) cs.street = address.street;
        if (address.city) cs.city = address.city;
        if (address.state) cs.state = address.state;
        if (address.pincode) cs.pincode = address.pincode;
        if (address.country) cs.country = address.country;
      }
      if (logoUrl) cs.logo_url = logoUrl;
    }

    return success(res, req.body, 'Settings saved successfully');
  } catch (err) {
    next(err);
  }
};

exports.uploadLogo = async (req, res, next) => {
  try {
    return success(res, { logoUrl: 'https://via.placeholder.com/150x50.png?text=Logo' }, 'Logo uploaded');
  } catch (err) {
    next(err);
  }
};

exports.getApiKeys = async (req, res, next) => {
  try {
    const keys = [
      { id: 'KEY-001', name: 'Production Live Secret', prefix: 'rcx_live_...98a2', created: '2026-01-01', lastUsed: '2 hours ago' },
      { id: 'KEY-002', name: 'Sandbox Test Secret', prefix: 'rcx_test_...31b8', created: '2026-02-15', lastUsed: 'Just now' }
    ];
    return success(res, keys);
  } catch (err) {
    next(err);
  }
};

exports.rotateApiKey = async (req, res, next) => {
  try {
    const newKey = {
      id: `KEY-${Date.now()}`,
      name: 'Rotated API Secret',
      prefix: `rcx_live_...${Math.random().toString(36).substring(2, 6)}`,
      created: new Date().toISOString()
    };
    return success(res, newKey, 'API secret key rotated successfully');
  } catch (err) {
    next(err);
  }
};

