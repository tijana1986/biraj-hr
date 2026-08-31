import { supabase } from "@/integrations/supabase/client";

export interface Invoice {
  id: string;
  user_id: string;
  reference_code: string;
  package_type: 'monthly_subscription' | 'featured_listing';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'verified' | 'activated' | 'cancelled';
  due_date: string;
  payment_date: string | null;
  verified_by_admin: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Pricing
export const PACKAGES = {
  monthly_subscription: {
    amount: 30,
    description: "Mesečna pretplata - Neograničeni oglasi",
  },
  featured_listing: {
    amount: 8,
    description: "Istaknut oglas - 30 dana dodatne vidljivosti",
  },
};

// Generiraj reference kod: BIRAJ-YYYY-MM-XXXX
function generateReferenceCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `BIRAJ-${year}-${month}-${random}`;
}

// Kreiraj novu ponudu
export async function createInvoice(
  userId: string,
  packageType: "monthly_subscription" | "featured_listing",
  daysUntilDue: number = 14
): Promise<Invoice | null> {
  try {
    const pkg = PACKAGES[packageType];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysUntilDue);

    const referenceCode = generateReferenceCode();

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        reference_code: referenceCode,
        package_type: packageType,
        amount: pkg.amount,
        currency: "EUR",
        description: pkg.description,
        status: "pending",
        due_date: dueDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invoice:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Preuzmi aktivne ponude (pending)
export async function getUserInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  return data || [];
}

// Preuzmi ponudu po reference kodu
export async function getInvoiceByReference(
  referenceCode: string
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("reference_code", referenceCode)
    .single();

  if (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }

  return data;
}

// Admin: Verificira plaćanje
export async function verifyPayment(
  invoiceId: string,
  adminId: string,
  paymentDate?: Date
): Promise<boolean> {
  try {
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "verified",
        verified_by_admin: adminId,
        verified_at: new Date().toISOString(),
        payment_date: paymentDate?.toISOString() || new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("Error verifying invoice:", updateError);
      return false;
    }

    // Log verification
    await supabase.from("payment_verifications").insert({
      invoice_id: invoiceId,
      admin_id: adminId,
      status: "verified",
    });

    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

// Aktiviraj pretplatu nakon verifikacije
export async function activateSubscriptionFromInvoice(
  invoiceId: string,
  userId: string
): Promise<boolean> {
  try {
    // Preuzmi invoice detalje
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice || invoice.status !== "verified") {
      console.error("Invalid invoice");
      return false;
    }

    if (invoice.package_type === "monthly_subscription") {
      // Kreiraj/updateaj subscription
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        status: "active",
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        next_billing_date: periodEnd.toISOString(),
      });
    } else if (invoice.package_type === "featured_listing") {
      // Kreiraj featured listing (trebam listing_id iz invoice metadata ili iz parametra)
      // Za sada samo log payment
      await supabase.from("payments").insert({
        user_id: userId,
        amount: invoice.amount,
        payment_type: "featured_listing",
        description: invoice.description,
        status: "completed",
      });
    }

    // Markiraj invoice kao activated
    await supabase
      .from("invoices")
      .update({ status: "activated" })
      .eq("id", invoiceId);

    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

// Preuzmi sve pending ponude (za admin dashboard)
export async function getPendingInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, auth.users(email, user_metadata->>'name')")
    .eq("status", "pending")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error:", error);
    return [];
  }

  return data || [];
}
