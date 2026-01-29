import { CreditCard, Calendar, Package } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-state";
import { usePayments } from "@/hooks/usePalpoAdmin";

export default function BillingPage() {
  const { data: payments, isLoading, error } = usePayments();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading billing information: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Billing"
        description="View your subscription and payment history"
        breadcrumbs={[{ label: "Billing" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments?.subscription?.plan || "Free"}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments?.subscription?.status || "Active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments?.subscription?.next_billing_date
                ? new Date(payments.subscription.next_billing_date).toLocaleDateString()
                : "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments?.payment_method?.last4
                ? `•••• ${payments.payment_method.last4}`
                : "Not set"}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments?.payment_method?.brand || ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {payments?.invoices && payments.invoices.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{invoice.description || `Invoice ${invoice.id}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date ? new Date(invoice.date).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {invoice.amount ? `$${(invoice.amount / 100).toFixed(2)}` : "-"}
                    </span>
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                      {invoice.status || "unknown"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
