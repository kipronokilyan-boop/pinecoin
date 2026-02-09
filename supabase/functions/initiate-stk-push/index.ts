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

    const LIPWA_API_KEY = Deno.env.get("LIPWA_API_KEY");
    const LIPWA_CHANNEL_ID = Deno.env.get("LIPWA_CHANNEL_ID");

    if (!LIPWA_API_KEY) {
      console.error("LIPWA_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!LIPWA_CHANNEL_ID) {
      console.error("LIPWA_CHANNEL_ID is not configured");
      return new Response(JSON.stringify({ error: "Payment channel not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiRef = `PINECOIN-${userId}-${Date.now()}`;
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/lipwa-callback`;

    console.log("Initiating Lipwa STK push:", { phone_number, amount, package_name, apiRef });

    const lipwaResponse = await fetch("https://pay.lipwa.app/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LIPWA_API_KEY}`,
      },
      body: JSON.stringify({
        amount: Number(amount),
        phone_number: phone_number,
        channel_id: LIPWA_CHANNEL_ID,
        callback_url: callbackUrl,
        api_ref: apiRef,
      }),
    });

    const lipwaData = await lipwaResponse.json();
    console.log("Lipwa response:", JSON.stringify(lipwaData));

    if (!lipwaResponse.ok) {
      console.error("Lipwa API error:", lipwaResponse.status, JSON.stringify(lipwaData));
      return new Response(
        JSON.stringify({ error: lipwaData?.ResponseDescription || "Failed to initiate payment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the pending upgrade request
    const checkoutRequestId = lipwaData.CheckoutRequestID || apiRef;

    const { error: insertError } = await supabase.from("upgrade_requests").insert({
      user_id: userId,
      package_name: package_name,
      amount: Number(amount),
      mpesa_message: checkoutRequestId,
      status: "pending",
    });

    if (insertError) {
      console.error("Failed to save upgrade request:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference: checkoutRequestId,
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
