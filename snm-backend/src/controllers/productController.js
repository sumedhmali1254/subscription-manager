const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId } = require('../utils/idGenerator');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    if (!isFallback()) {
      let sql = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (search) {
        sql += ' AND (name LIKE ? OR code LIKE ? OR description LIKE ?)';
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern);
      }
      if (status && status !== 'ALL') {
        sql += ' AND status = ?';
        params.push(status);
      }

      const countResult = await query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params);
      const total = countResult[0]?.total || 0;

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);
      const products = await query(sql, params);

      // Fetch variants for each product
      const productIds = products.map(p => p.id);
      let variants = [];
      if (productIds.length > 0) {
        const placeholders = productIds.map(() => '?').join(',');
        variants = await query(`SELECT * FROM product_variants WHERE product_id IN (${placeholders})`, productIds);
      }

      const formatted = products.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        category: p.category,
        type: p.product_type,
        productType: p.product_type,
        salesPrice: Number(p.sales_price),
        costPrice: Number(p.cost_price),
        description: p.description,
        notes: p.notes,
        status: p.status,
        variants: variants.filter(v => v.product_id === p.id).map(v => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: Number(v.additional_price),
          description: v.description,
          status: v.status
        }))
      }));

      return paginated(res, formatted, total, pageNum, limitNum);
    } else {
      let filtered = [...store.products];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p =>
          (p.name && p.name.toLowerCase().includes(s)) ||
          (p.code && p.code.toLowerCase().includes(s))
        );
      }
      if (status && status !== 'ALL') {
        filtered = filtered.filter(p => p.status === status);
      }
      const total = filtered.length;
      const paginatedItems = filtered.slice(offset, offset + limitNum);

      return paginated(res, paginatedItems, total, pageNum, limitNum);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;

    if (!isFallback()) {
      const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const p = rows[0];
        const variants = await query('SELECT * FROM product_variants WHERE product_id = ?', [id]);
        product = {
          id: p.id,
          name: p.name,
          code: p.code,
          category: p.category,
          productType: p.product_type,
          salesPrice: Number(p.sales_price),
          costPrice: Number(p.cost_price),
          description: p.description,
          notes: p.notes,
          status: p.status,
          variants: variants.map(v => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: Number(v.additional_price),
            description: v.description,
            status: v.status
          }))
        };
      }
    } else {
      product = store.products.find(p => p.id === id);
    }

    if (!product) return error(res, 'Product not found', 404);
    return success(res, product);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, category = 'Software', productType = 'SaaS Platform', salesPrice = 0, costPrice = 0, description = '', notes = '', status = 'ACTIVE', variants = [] } = req.body;
    if (!name || !code) {
      return error(res, 'Product name and code are required', 400);
    }

    const id = generateId('PROD');
    const now = new Date();

    const newProduct = {
      id,
      name,
      code,
      category,
      productType,
      salesPrice: Number(salesPrice),
      costPrice: Number(costPrice),
      description,
      notes,
      status,
      variants: [],
      createdAt: now.toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO products (id, name, code, category, product_type, sales_price, cost_price, description, notes, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, code, category, productType, salesPrice, costPrice, description, notes, status, now]
      );

      // Insert any variants
      for (const v of variants) {
        const vid = generateId('VAR');
        await query(
          'INSERT INTO product_variants (id, product_id, name, sku, additional_price, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [vid, id, v.name, v.sku || `SKU-${vid}`, v.price || v.additional_price || 0, v.description || '', v.status || 'ACTIVE']
        );
        newProduct.variants.push({ id: vid, name: v.name, sku: v.sku, price: v.price, description: v.description, status: v.status });
      }
    } else {
      newProduct.variants = variants.map(v => ({
        id: generateId('VAR'),
        name: v.name,
        sku: v.sku || `SKU-${Date.now()}`,
        price: Number(v.price || 0),
        description: v.description || '',
        status: v.status || 'ACTIVE'
      }));
      store.products.unshift(newProduct);
    }

    return success(res, newProduct, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, category, productType, salesPrice, costPrice, description, notes, status } = req.body;

    if (!isFallback()) {
      await query(
        `UPDATE products SET
           name = COALESCE(?, name),
           code = COALESCE(?, code),
           category = COALESCE(?, category),
           product_type = COALESCE(?, product_type),
           sales_price = COALESCE(?, sales_price),
           cost_price = COALESCE(?, cost_price),
           description = COALESCE(?, description),
           notes = COALESCE(?, notes),
           status = COALESCE(?, status)
         WHERE id = ?`,
        [name, code, category, productType, salesPrice, costPrice, description, notes, status, id]
      );
    } else {
      const idx = store.products.findIndex(p => p.id === id);
      if (idx === -1) return error(res, 'Product not found', 404);
      store.products[idx] = { ...store.products[idx], ...req.body };
    }

    return success(res, { id, ...req.body }, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query('DELETE FROM products WHERE id = ?', [id]);
    } else {
      const idx = store.products.findIndex(p => p.id === id);
      if (idx !== -1) store.products.splice(idx, 1);
    }
    return success(res, { id }, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};

// Variants Sub-handlers
exports.getVariants = async (req, res, next) => {
  try {
    const { id } = req.params;
    let variants = [];
    if (!isFallback()) {
      variants = await query('SELECT * FROM product_variants WHERE product_id = ?', [id]);
    } else {
      const product = store.products.find(p => p.id === id);
      variants = product ? product.variants : [];
    }
    return success(res, variants);
  } catch (err) {
    next(err);
  }
};

exports.addVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, price = 0, description = '', status = 'ACTIVE' } = req.body;

    const vid = generateId('VAR');
    const newVariant = {
      id: vid,
      productId: id,
      name,
      sku: sku || `SKU-${vid}`,
      price: Number(price),
      description,
      status
    };

    if (!isFallback()) {
      await query(
        'INSERT INTO product_variants (id, product_id, name, sku, additional_price, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [vid, id, name, newVariant.sku, price, description, status]
      );
    } else {
      const p = store.products.find(pr => pr.id === id);
      if (p) {
        if (!p.variants) p.variants = [];
        p.variants.push(newVariant);
      }
    }

    return success(res, newVariant, 'Variant added successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.updateVariant = async (req, res, next) => {
  try {
    const { vid } = req.params;
    const { name, sku, price, description, status } = req.body;

    if (!isFallback()) {
      await query(
        `UPDATE product_variants SET
           name = COALESCE(?, name),
           sku = COALESCE(?, sku),
           additional_price = COALESCE(?, additional_price),
           description = COALESCE(?, description),
           status = COALESCE(?, status)
         WHERE id = ?`,
        [name, sku, price, description, status, vid]
      );
    } else {
      for (const p of store.products) {
        if (p.variants) {
          const v = p.variants.find(item => item.id === vid);
          if (v) {
            Object.assign(v, req.body);
            break;
          }
        }
      }
    }

    return success(res, { id: vid, ...req.body }, 'Variant updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.deleteVariant = async (req, res, next) => {
  try {
    const { vid } = req.params;
    if (!isFallback()) {
      await query('DELETE FROM product_variants WHERE id = ?', [vid]);
    } else {
      for (const p of store.products) {
        if (p.variants) {
          p.variants = p.variants.filter(v => v.id !== vid);
        }
      }
    }
    return success(res, { id: vid }, 'Variant deleted');
  } catch (err) {
    next(err);
  }
};

