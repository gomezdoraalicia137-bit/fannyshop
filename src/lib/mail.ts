export async function sendVerificationEmail(email: string, code: string) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("Falta la variable RESEND_API_KEY");
      return { success: false, error: "No hay API key de Resend configurada" };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FannyShop <onboarding@resend.dev>",
        to: [email],
        subject: `Tu código de verificación de FannyShop: ${code}`,
        html: `
          <div style="background-color: #050b18; padding: 40px 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; color: #ffffff;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #0b1730; border: 1px solid rgba(0, 242, 254, 0.25); border-radius: 18px; padding: 32px 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
              
              <h1 style="color: #00f2fe; margin: 0 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">FannyShop</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">Tu mundo digital, en un solo lugar</p>
              
              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 24px 0;" />
              
              <h2 style="color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Verifica tu cuenta</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                Ingresa el siguiente código de seguridad en la tienda para activar tu cuenta y poder realizar compras:
              </p>
              
              <div style="margin: 20px 0; background-color: #030712; border: 1px dashed #00f2fe; border-radius: 12px; padding: 16px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #facc15; display: inline-block; min-width: 220px;">
                ${code}
              </div>
              
              <p style="color: #64748b; font-size: 12px; margin-top: 24px; line-height: 1.4;">
                Este código es válido por 15 minutos.<br />
                Si no creaste una cuenta en FannyShop, ignora este correo.
              </p>
            </div>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error en Resend:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error enviando correo:", err);
    return { success: false, error: err };
  }
}
