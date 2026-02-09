import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { phone_number, package_name, amount } = await req.json();

    if (!phone_number || !package_name || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone_number, package_name, amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const PAYHERO_API_KEY = Deno.env.get("PAYHERO_API_KEY");
    const PAYHERO_CHANNEL_ID = Deno.env.get("PAYHERO_CHANNEL_ID");

    if (!PAYHERO_API_KEY) {
      console.error("PAYHERO_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!PAYHERO_CHANNEL_ID) {
      console.error("PAYHERO_CHANNEL_ID is not configured");
      return new Response(JSON.stringify({ error: "Payment channel not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const externalReference = `PINECOIN-${userId}-${Date.now()}`;

    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payhero-callback`;

    console.log("Initiating STK push:", { phone_number, amount, package_name, externalReference });

    // Call Pay Hero STK Push API
    const payHeroResponse = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${PAYHERO_API_KEY}`,
      },
      body: JSON.stringify({
        amount: Number(amount),
        phone_number: phone_number,
        channel_id: Number(PAYHERO_CHANNEL_ID),
        provider: "m-pesa",
        external_reference: externalReference,
        callback_url: callbackUrl,
      }),
    });

    const payHeroData = await payHeroResponse.json();
    console.log("Pay Hero response:", JSON.stringify(payHeroData));

    if (!payHeroResponse.ok) {
      console.error("Pay Hero API error:", payHeroResponse.status, JSON.stringify(payHeroData));
      return new Response(
        JSON.stringify({ error: payHeroData?.error_message || "Failed to initiate payment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the pending upgrade request with the reference
    const { error: insertError } = await supabase.from("upgrade_requests").insert({
      user_id: userId,
      package_name: package_name,
      amount: Number(amount),
      mpesa_message: externalReference,
      status: "pending",
    });

    if (insertError) {
      console.error("Failed to save upgrade request:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference: externalReference,
        message: "STK push sent. Please check your phone and enter your M-Pesa PIN.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in initiate-stk-push:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
