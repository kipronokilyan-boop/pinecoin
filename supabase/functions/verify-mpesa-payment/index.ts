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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mpesa_message, package_name } = await req.json();
    console.log("Verifying payment for user:", user.id, "package:", package_name);
    console.log("M-Pesa message:", mpesa_message);

    if (!mpesa_message || !package_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pkg = PACKAGES[package_name];
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Invalid package" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse M-Pesa confirmation message
    // Typical format: "ABC123XYZ Confirmed. Ksh200.00 sent to ECERTIFY INC for account ... on 8/2/26 at 10:30 AM..."
    const msg = mpesa_message.toUpperCase();

    // Check for M-Pesa transaction code (starts with letter, alphanumeric, ~10 chars)
    const txCodeMatch = msg.match(/^([A-Z0-9]{10,12})\s+CONFIRMED/);
    if (!txCodeMatch) {
      console.log("No valid transaction code found");
      return new Response(JSON.stringify({ error: "Invalid M-Pesa message. Please paste the full confirmation SMS." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const txCode = txCodeMatch[1];

    // Check if this transaction code was already used
    const { data: existingRequest } = await supabase
      .from("upgrade_requests")
      .select("id")
      .eq("mpesa_message", txCode)
      .eq("status", "verified")
      .maybeSingle();

    if (existingRequest) {
      console.log("Transaction code already used:", txCode);
      return new Response(JSON.stringify({ error: "This M-Pesa transaction has already been used." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for till number or business name
    const hasTill = msg.includes(TILL_NUMBER) || msg.includes(BUSINESS_NAME);
    if (!hasTill) {
      console.log("Till number or business name not found in message");
      return new Response(JSON.stringify({ error: "Payment was not made to the correct till number (3106479 - ECERTIFY INC)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check amount - extract Ksh amount from message
    const amountMatch = msg.match(/KSH\s?([\d,]+\.?\d*)/);
    if (!amountMatch) {
      console.log("Could not extract amount from message");
      return new Response(JSON.stringify({ error: "Could not verify payment amount from the message." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const paidAmount = parseFloat(amountMatch[1].replace(/,/g, ""));
    if (paidAmount < pkg.amount) {
      console.log("Amount mismatch:", paidAmount, "expected:", pkg.amount);
      return new Response(JSON.stringify({ error: `Payment amount Ksh ${paidAmount} is less than required Ksh ${pkg.amount}.` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Payment verified! Tx:", txCode, "Amount:", paidAmount);

    // Save upgrade request
    await supabase.from("upgrade_requests").insert({
      user_id: user.id,
      package_name,
      amount: paidAmount,
      mpesa_message: txCode,
      status: "verified",
      verified_at: new Date().toISOString(),
    });

    // Upgrade user profile
    await supabase.from("profiles").update({
      account_tier: pkg.tier,
      daily_survey_limit: pkg.dailyLimit,
    }).eq("user_id", user.id);

    console.log("User upgraded to:", pkg.tier);

    return new Response(JSON.stringify({ 
      success: true, 
      tier: pkg.tier, 
      daily_limit: pkg.dailyLimit,
      message: `Successfully upgraded to ${package_name}!`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
