import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLES } from '../constants/roles';

// Layouts
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';

// Admin / Staff Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CustomerListPage } from '../pages/customers/CustomerListPage';
import { CustomerDetailPage } from '../pages/customers/CustomerDetailPage';
import { ProductListPage } from '../pages/products/ProductListPage';
import { ProductDetailPage } from '../pages/products/ProductDetailPage';
import { ProductVariantsPage } from '../pages/products/ProductVariantsPage';
import { PlanListPage } from '../pages/plans/PlanListPage';
import { PlanDetailPage } from '../pages/plans/PlanDetailPage';
import { QuotationListPage } from '../pages/quotations/QuotationListPage';
import { QuotationCreatePage } from '../pages/quotations/QuotationCreatePage';
import { QuotationDetailPage } from '../pages/quotations/QuotationDetailPage';
import { QuotationTemplatesPage } from '../pages/quotations/QuotationTemplatesPage';
import { SubscriptionListPage } from '../pages/subscriptions/SubscriptionListPage';
import { SubscriptionCreatePage } from '../pages/subscriptions/SubscriptionCreatePage';
import { SubscriptionDetailPage } from '../pages/subscriptions/SubscriptionDetailPage';
import { InvoiceListPage } from '../pages/invoices/InvoiceListPage';
import { InvoiceDetailPage } from '../pages/invoices/InvoiceDetailPage';
import { PaymentListPage } from '../pages/payments/PaymentListPage';
import { DiscountListPage } from '../pages/discounts/DiscountListPage';
import { TaxListPage } from '../pages/taxes/TaxListPage';
import { BillingRunsPage } from '../pages/billing/BillingRunsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { UserListPage } from '../pages/users/UserListPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

// Customer Portal Pages
import { CustomerDashboardPage } from '../pages/portal/CustomerDashboardPage';
import { CustomerSubscriptionsPage } from '../pages/portal/CustomerSubscriptionsPage';
import { CustomerInvoicesPage } from '../pages/portal/CustomerInvoicesPage';
import { CustomerPaymentsPage } from '../pages/portal/CustomerPaymentsPage';
import { CustomerQuotationsPage } from '../pages/portal/CustomerQuotationsPage';
import { CustomerPlansPage } from '../pages/portal/CustomerPlansPage';
import { CustomerProfilePage } from '../pages/portal/CustomerProfilePage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Authentication Pages (No Sidebar) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Authenticated Workspace & Billing (Admin & Staff) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/product-variants" element={<ProductVariantsPage />} />
        <Route path="/plans" element={<PlanListPage />} />
        <Route path="/plans/:id" element={<PlanDetailPage />} />
        <Route path="/quotations" element={<QuotationListPage />} />
        <Route path="/quotations/new" element={<QuotationCreatePage />} />
        <Route path="/quotations/:id" element={<QuotationDetailPage />} />
        <Route path="/quotation-templates" element={<QuotationTemplatesPage />} />
        <Route path="/subscriptions" element={<SubscriptionListPage />} />
        <Route path="/subscriptions/new" element={<SubscriptionCreatePage />} />
        <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/payments" element={<PaymentListPage />} />
        <Route path="/discounts" element={<DiscountListPage />} />
        <Route path="/billing-runs" element={<BillingRunsPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        {/* Administration (Admin Only) */}
        <Route
          path="/taxes"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <TaxListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UserListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Customer Self-Service Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.ADMIN]}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/portal" element={<CustomerDashboardPage />} />
        <Route path="/portal/subscriptions" element={<CustomerSubscriptionsPage />} />
        <Route path="/portal/invoices" element={<CustomerInvoicesPage />} />
        <Route path="/portal/payments" element={<CustomerPaymentsPage />} />
        <Route path="/portal/quotations" element={<CustomerQuotationsPage />} />
        <Route path="/portal/plans" element={<CustomerPlansPage />} />
        <Route path="/portal/profile" element={<CustomerProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

