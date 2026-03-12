import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WhatsAppPayload {
  orderNumber: string;
  clientName: string;
  totalAmount: number;
  itemsCount: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsAppFrom = Deno.env.get("TWILIO_WHATSAPP_FROM");
    const adminWhatsAppTo = Deno.env.get("ADMIN_WHATSAPP_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppFrom || !adminWhatsAppTo) {
      return new Response(
        JSON.stringify({
          error: "Twilio credentials not configured",
          missing: {
            accountSid: !twilioAccountSid,
            authToken: !twilioAuthToken,
            whatsAppFrom: !twilioWhatsAppFrom,
            adminNumber: !adminWhatsAppTo
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload: WhatsAppPayload = await req.json();
    const { orderNumber, clientName, totalAmount, itemsCount } = payload;

    const message = `Новый заказ!\n\nНомер: ${orderNumber}\nКлиент: ${clientName}\nТоваров: ${itemsCount}\nСумма: ${totalAmount.toFixed(2)} сум\n\nВремя: ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append("From", `whatsapp:${twilioWhatsAppFrom}`);
    formData.append("To", `whatsapp:${adminWhatsAppTo}`);
    formData.append("Body", message);

    const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioResult);
      return new Response(
        JSON.stringify({
          error: "Failed to send WhatsApp message",
          details: twilioResult
        }),
        {
          status: twilioResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: twilioResult.sid,
        status: twilioResult.status
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
