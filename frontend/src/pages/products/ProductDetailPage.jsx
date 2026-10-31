import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ProductFormModal } from './ProductFormModal';
import { formatCurrency } from '../../utils/formatters';
import { ArrowLeft, Edit2, Package, Tag, DollarSign, Layers, CheckCircle2 } from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productService.getById(id);
      setProduct(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-base font-bold text-[#202744]">Product Not Found</h3>
        <Button onClick={() => navigate('/products')} variant="secondary" icon={ArrowLeft}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#5263D9] mb-3 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Products
        </button>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF0FD] border border-indigo-100 flex items-center justify-center text-[#5263D9]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#202744] font-heading">{product.name}</h2>
                <Badge variant={product.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                  {product.status}
                </Badge>
              </div>
              <div className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
                <span className="font-mono text-[#5263D9] font-bold">{product.id}</span>
                <span>•</span>
                <span className="uppercase font-semibold">{product.type}</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            icon={Edit2}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Info & Pricing */}
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle>Pricing & Margins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div>
                <span className="text-[#64748B] block font-medium">Base Sales Price</span>
                <div className="text-2xl font-bold font-heading text-[#202744] mt-0.5">
                  {formatCurrency(product.salesPrice)}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[#64748B]">Internal Cost:</span>
                <span className="font-bold text-slate-700">{formatCurrency(product.costPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Gross Margin:</span>
                <span className="font-bold text-emerald-600">
                  {product.salesPrice > 0 ? (((product.salesPrice - product.costPrice) / product.salesPrice) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-[#64748B] block font-medium">Description</span>
              <p className="text-slate-700 leading-relaxed mt-1">{product.description || 'No description provided.'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Variants Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configured Product Variants ({product.variants?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                    <th className="py-2.5 px-4 font-semibold">Variant Name</th>
                    <th className="py-2.5 px-4 font-semibold">Attribute</th>
                    <th className="py-2.5 px-4 font-semibold">Price Adjustment</th>
                    <th className="py-2.5 px-4 font-semibold">Total Price</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.variants?.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-[#202744] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{v.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{v.attribute}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {v.priceAdjustment > 0 ? `+${formatCurrency(v.priceAdjustment)}` : 'Base Price'}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#5263D9]">
                        {formatCurrency(v.finalPrice || (Number(product.salesPrice) + Number(v.priceAdjustment || 0)))}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" dot size="xs">{v.status || 'Active'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProductFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={product}
        onSubmit={async (data) => {
          await productService.update(product.id, data);
          setIsEditModalOpen(false);
          fetchProduct();
        }}
      />
    </div>
  );
};

