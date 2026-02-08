import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TILL_NUMBER = "3106479";
const BUSINESS_NAME = "ECERTIFY INC";

const PACKAGES: Record<string, { amount: number; tier: string; dailyLimit: number }> = {
  "Business Basic": { amount: 200, tier: "business_basic", dailyLimit: 10 },
  "Business Premium": { amount: 400, tier: "business_premium", dailyLimit: 15 },
  "Business Expert": { amount: 800, tier: "business_expert", dailyLimit: 20 },
  "PLATINUM": { amount: 1200, tier: "platinum", dailyLimit: 40 },
};

function validateMpesaMessage(msg: string, expectedAmount: number): { valid: boolean; error?: string; txCode?: string; amount?: number } {
  const upper = msg.trim().toUpperCase();

  // 1. Must start with a valid M-Pesa transaction code (e.g., "SJ34ABCDEF")
  // M-Pesa codes: typically start with a letter, 10 alphanumeric chars
  const txMatch = upper.match(/^([A-Z][A-Z0-9]{8,11})\s+CONFIRMED\b/);
  if (!txMatch) {
    return { valid: false, error: "Invalid M-Pesa message. It must start with a valid transaction code followed by 'Confirmed'." };
  }
  const txCode = txMatch[1];

  // 2. Must contain "CONFIRMED" keyword
  if (!upper.includes("CONFIRMED")) {
    return { valid: false, error: "This doesn't look like a confirmed M-Pesa transaction." };
  }

  // 3. Must contain the till number AND business name
  if (!upper.includes(TILL_NUMBER)) {
    return { valid: false, error: `Payment was not made to till number ${TILL_NUMBER}. Please pay to the correct till.` };
  }
  if (!upper.includes(BUSINESS_NAME)) {
    return { valid: false, error: `Payment recipient must be ${BUSINESS_NAME}. Please verify your payment.` };
  }

  // 4. Must contain "BUY GOODS" or "SENT TO" or "PAID TO" pattern (M-Pesa Buy Goods format)
  const hasBuyGoods = upper.includes("BUY GOODS") || upper.includes("SENT TO") || upper.includes("PAID TO");
  if (!hasBuyGoods) {
    return { valid: false, error: "This doesn't appear to be a valid Buy Goods and Services transaction." };
  }

  // 5. Extract and validate amount
  const amountMatch = upper.match(/KSH\s?([\d,]+\.?\d*)/);
  if (!amountMatch) {
    return { valid: false, error: "Could not find the payment amount in the message." };
  }
  const paidAmount = parseFloat(amountMatch[1].replace(/,/g, ""));
  if (isNaN(paidAmount) || paidAmount <= 0) {
    return { valid: false, error: "Invalid payment amount detected." };
  }
  if (paidAmount < expectedAmount) {
    return { valid: false, error: `Payment of Ksh ${paidAmount} is less than the required Ksh ${expectedAmount}.` };
  }

  // 6. Must contain a date pattern (e.g., "8/2/26" or "08/02/2026" or "8/2/2026")
  const hasDate = upper.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
  if (!hasDate) {
    return { valid: false, error: "No transaction date found. Please paste the complete M-Pesa SMS." };
  }

  // 7. Must contain a time pattern (e.g., "10:30 AM" or "10:30")
  const hasTime = upper.match(/\d{1,2}:\d{2}\s*(AM|PM)?/);
  if (!hasTime) {
    return { valid: false, error: "No transaction time found. Please paste the complete M-Pesa SMS." };
  }

  // 8. Minimum message length check (real M-Pesa messages are 100+ chars)
  if (msg.trim().length < 80) {
    return { valid: false, error: "Message appears incomplete. Please paste the full M-Pesa confirmation SMS." };
  }

  return { valid: true, txCode, amount: paidAmount };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const respond = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return respond({ error: "Unauthorized" }, 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return respond({ error: "Unauthorized" }, 401);
    }

    const { mpesa_message, package_name } = await req.json();
    console.log("Verifying payment for user:", user.id, "package:", package_name);

    if (!mpesa_message || !package_name) {
      return respond({ error: "Missing required fields" }, 400);
    }

    const pkg = PACKAGES[package_name];
    if (!pkg) {
      return respond({ error: "Invalid package selected" }, 400);
    }

    // Validate the M-Pesa message thoroughly
    const validation = validateMpesaMessage(mpesa_message, pkg.amount);
    if (!validation.valid) {
      console.log("Validation failed:", validation.error);
      return respond({ error: validation.error }, 400);
    }

    const txCode = validation.txCode!;
    console.log("Message validated. Tx:", txCode, "Amount:", validation.amount);

    // Check if this transaction code was already used (by ANY user)
    const { data: existingRequest } = await supabaseAdmin
      .from("upgrade_requests")
      .select("id")
      .eq("mpesa_message", txCode)
      .maybeSingle();

    if (existingRequest) {
      console.log("Transaction code already used:", txCode);
      return respond({ error: "This M-Pesa transaction has already been used for an upgrade." }, 400);
    }

    // Check if user already has this tier or higher
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("account_tier, daily_survey_limit")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile && profile.daily_survey_limit >= pkg.dailyLimit) {
      console.log("User already has equal or higher tier:", profile.account_tier);
      return respond({ error: "You already have this package or a higher one." }, 400);
    }

    console.log("All checks passed. Upgrading user...");

    // Save upgrade request
    const { error: insertError } = await supabaseAdmin.from("upgrade_requests").insert({
      user_id: user.id,
      package_name,
      amount: validation.amount!,
      mpesa_message: txCode,
      status: "verified",
      verified_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to save upgrade request:", insertError);
      return respond({ error: "Failed to process upgrade. Please try again." }, 500);
    }

    // Upgrade user profile
    const { error: updateError } = await supabaseAdmin.from("profiles").update({
      account_tier: pkg.tier,
      daily_survey_limit: pkg.dailyLimit,
    }).eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return respond({ error: "Payment recorded but profile update failed. Please contact support." }, 500);
    }

    console.log("User upgraded to:", pkg.tier, "daily_limit:", pkg.dailyLimit);

    return respond({
      success: true,
      tier: pkg.tier,
      daily_limit: pkg.dailyLimit,
      message: `Successfully upgraded to ${package_name}!`,
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return respond({ error: "Internal server error" }, 500);
  }
});
