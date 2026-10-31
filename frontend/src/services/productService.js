import apiClient, { USE_MOCK, mockAdapter } from './api';

export const productService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let products = await mockAdapter.getCollection('products');
      if (params.search) {
        const q = params.search.toLowerCase();
        products = products.filter(
          p => p.name.toLowerCase().includes(q) ||
               p.description.toLowerCase().includes(q)
        );
      }
      if (params.type && params.type !== 'ALL') {
        products = products.filter(p => p.type === params.type);
      }
      return { data: products, total: products.length };
    }
    return apiClient.get('/products', { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      const product = await mockAdapter.getItemById('products', id);
      if (!product) throw new Error('Product not found');
      return { data: product };
    }
    return apiClient.get(`/products/${id}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      // Ensure variants have proper structure
      const variants = (data.variants || []).map((v, i) => ({
        id: v.id || `VAR-${Date.now()}-${i}`,
        name: v.name,
        attribute: v.attribute || 'Default',
        priceAdjustment: Number(v.priceAdjustment || 0),
        finalPrice: Number(data.salesPrice || 0) + Number(v.priceAdjustment || 0),
        status: v.status || 'ACTIVE',
      }));

      const created = await mockAdapter.createItem('products', {
        ...data,
        variants,
        status: data.status || 'ACTIVE',
      });
      return { data: created, message: 'Product created successfully' };
    }
    return apiClient.post('/products', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('products', id, data);
      return { data: updated, message: 'Product updated successfully' };
    }
    return apiClient.put(`/products/${id}`, data);
  },

  delete: async (id) => {
    if (USE_MOCK) {
      await mockAdapter.deleteItem('products', id);
      return { success: true, message: 'Product deleted' };
    }
    return apiClient.delete(`/products/${id}`);
  },
};

