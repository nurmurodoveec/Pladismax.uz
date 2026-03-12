import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const accounts = [
      {
        email: "admin@b2b.local",
        password: "admin123456",
        full_name: "Администратор",
        role: "admin",
      },
      {
        email: "client@b2b.local",
        password: "client123456",
        full_name: "Тестовый Клиент",
        role: "client",
      },
    ];

    const results = [];

    for (const account of accounts) {
      const { data: existingProfile } = await supabaseClient
        .from("profiles")
        .select("email")
        .eq("email", account.email)
        .maybeSingle();

      if (existingProfile) {
        results.push({
          email: account.email,
          status: "exists",
        });
        continue;
      }

      const { data: authData, error: authError } =
        await supabaseClient.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
        });

      if (authError) {
        results.push({
          email: account.email,
          status: "error",
          error: authError.message,
        });
        continue;
      }

      if (authData.user) {
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: account.email,
            full_name: account.full_name,
            role: account.role,
          });

        if (profileError) {
          results.push({
            email: account.email,
            status: "error",
            error: profileError.message,
          });
          continue;
        }

        results.push({
          email: account.email,
          password: account.password,
          role: account.role,
          status: "created",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        accounts: results,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
