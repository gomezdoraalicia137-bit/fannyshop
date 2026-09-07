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
        from: "FannyShop <seguridad@fannyshop.store>",
        to: [email],
        subject: `Tu código de verificación de FannyShop: ${code}`,
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verifica tu cuenta en FannyShop</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 15px;">
              <tr>
                <td align="center">
                  
                  <!-- Tarjeta principal -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background: linear-gradient(165deg, #0d1e3a 0%, #081024 100%); border: 1px solid rgba(0, 242, 254, 0.25); border-radius: 20px; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8); overflow: hidden;">
                    
                    <!-- Barra de luz superior con degradado neón -->
                    <tr>
                      <td style="height: 4px; background: linear-gradient(90deg, #00f2fe, #3b82f6, #8b5cf6, #ec4899);"></td>
                    </tr>

                    <!-- Encabezado con Marca -->
                    <tr>
                      <td align="center" style="padding: 35px 30px 20px 30px;">
                        
                        <!-- Insignia Neón -->
                        <div style="display: inline-block; padding: 4px 14px; background: rgba(0, 242, 254, 0.1); border: 1px solid rgba(0, 242, 254, 0.3); border-radius: 999px; margin-bottom: 14px;">
                          <span style="font-size: 11px; font-weight: 700; color: #00f2fe; letter-spacing: 0.15em; text-transform: uppercase;">
                            Gifting · Gaming · Entretenimiento
                          </span>
                        </div>

                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                          Fanny<span style="color: #00f2fe;">Shop</span>
                        </h1>
                        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
                          Tu plataforma de tarjetas digitales y códigos gaming
                        </p>
                      </td>
                    </tr>

                    <!-- Separador sutil -->
                    <tr>
                      <td style="padding: 0 35px;">
                        <div style="border-top: 1px solid rgba(255, 255, 255, 0.08);"></div>
                      </td>
                    </tr>

                    <!-- Cuerpo del Mensaje -->
                    <tr>
                      <td style="padding: 25px 35px 20px 35px; text-align: center;">
                        <h2 style="margin: 0 0 10px 0; font-size: 19px; font-weight: 700; color: #ffffff;">
                          ¡Te damos la bienvenida a FannyShop!
                        </h2>
                        
                        <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                          Estás a un solo paso de acceder a tu catálogo de tarjetas de regalo (PlayStation, Xbox, Steam, Nintendo), suscripciones y recargas con <strong>entrega digital inmediata</strong>.
                        </p>

                        <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8;">
                          Ingresa este código de seguridad para activar tu cuenta:
                        </p>

                        <!-- Caja destacada del Código de 6 dígitos -->
                        <div style="background-color: #050b18; border: 1px dashed rgba(0, 242, 254, 0.5); border-radius: 14px; padding: 18px 24px; display: inline-block; margin: 10px 0 20px 0; box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #facc15; text-shadow: 0 0 12px rgba(250, 204, 21, 0.4);">
                            ${code}
                          </span>
                        </div>

                        <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                          ⏱️ Este código vence en <strong>15 minutos</strong>.<br />
                          Si no creaste una cuenta en FannyShop, puedes ignorar este mensaje con seguridad.
                        </p>
                      </td>
                    </tr>

                    <!-- Mini cuadro de Beneficios -->
                    <tr>
                      <td style="padding: 10px 35px 25px 35px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 12px 16px;">
                          <tr>
                            <td align="center" style="font-size: 12px; color: #94a3b8; line-height: 1.8;">
                              ⚡ <strong>Entrega Inmediata</strong> en tu panel de usuario<br />
                              🔒 Pagos protegidos por <strong>Yappy, Binance Pay y Transferencia</strong>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Pie de página del correo -->
                    <tr>
                      <td align="center" style="padding: 20px 30px 25px 30px; background-color: #050b18; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                        <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">
                          © 2026 FannyShop. Todos los derechos reservados.
                        </p>
                        <a href="https://www.fannyshop.store" target="_blank" style="font-size: 11px; color: #00f2fe; text-decoration: none; font-weight: 600;">
                          Visitar tienda oficial →
                        </a>
                      </td>
                    </tr>

                  </table>
                  
                </td>
              </tr>
            </table>

          </body>
          </html>
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
