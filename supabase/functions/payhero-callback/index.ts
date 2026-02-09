import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const packageTierMap: Record<string, { tier: string; dailyLimit: number }> = {
  "Business Basic": { tier: "business_basic", dailyLimit: 10 },
  "Business Premium": { tier: "business_premium", dailyLimit: 15 },
  "Business Expert": { tier: "business_expert", dailyLimit: 20 },
  PLATINUM: { tier: "platinum", dailyLimit: 40 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // This is a public webhook from Pay Hero - no auth required
    const payload = await req.json();
    console.log("Pay Hero callback received:", JSON.stringify(payload));

    // Pay Hero callback payload fields
    const {
      paymentSuccess,
      external_reference,
      reference,
      providerReference,
      amount,
      phone,
      customerName,
      status,
    } = payload;

    const externalRef = external_reference || payload.ExternalReference;
    const isSuccess = paymentSuccess === true || status === "SUCCESS";

    if (!externalRef) {
      console.error("No external reference in callback");
      return new Response(JSON.stringify({ error: "Missing reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to update records
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the pending upgrade request matching this reference
    const { data: upgradeRequest, error: fetchError } = await supabase
      .from("upgrade_requests")
      .select("*")
      .eq("mpesa_message", externalRef)
      .eq("status", "pending")
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching upgrade request:", fetchError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!upgradeRequest) {
      console.warn("No pending upgrade request found for reference:", externalRef);
      return new Response(JSON.stringify({ error: "No matching request" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isSuccess) {
      console.log("Payment successful, upgrading user:", upgradeRequest.user_id);

      // Update upgrade request status
      await supabase
        .from("upgrade_requests")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
        })
        .eq("id", upgradeRequest.id);

      // Upgrade the user's profile
      const tierInfo = packageTierMap[upgradeRequest.package_name];
      if (tierInfo) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            account_tier: tierInfo.tier,
            daily_survey_limit: tierInfo.dailyLimit,
          })
          .eq("user_id", upgradeRequest.user_id);

        if (profileError) {
          console.error("Error upgrading profile:", profileError);
        } else {
          console.log("Profile upgraded to:", tierInfo.tier);
        }
      } else {
        console.error("Unknown package name:", upgradeRequest.package_name);
      }
    } else {
      console.log("Payment failed for reference:", externalRef);
      await supabase
        .from("upgrade_requests")
        .update({ status: "failed" })
        .eq("id", upgradeRequest.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in payhero-callback:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
