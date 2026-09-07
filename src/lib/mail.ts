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
          <body style="margin: 0; padding: 0; background-color: #070512; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070512; padding: 30px 10px;">
              <tr>
                <td align="center">
                  
                  <!-- Contenedor Principal -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background: linear-gradient(165deg, #120b29 0%, #0a0618 100%); border: 1px solid rgba(0, 242, 254, 0.3); border-radius: 24px; box-shadow: 0 0 35px rgba(217, 70, 239, 0.15), 0 20px 50px rgba(0, 0, 0, 0.85); overflow: hidden;">
                    
                    <!-- Barra de luz neón superior -->
                    <tr>
                      <td style="height: 4px; background: linear-gradient(90deg, #00f2fe 0%, #3b82f6 35%, #8b5cf6 70%, #d946ef 100%); box-shadow: 0 0 15px #00f2fe;"></td>
                    </tr>

                    <!-- ENCABEZADO CON LOGO OFICIAL DE FANNYSHOP -->
                    <tr>
                      <td align="center" style="padding: 38px 25px 22px 25px;">
                        
                        <!-- Logo recreado: Hexágono Neón + FannyShop -->
                        <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                          <tr>
                            <!-- Icono Hexágono con Rayo -->
                            <td align="center" valign="middle" style="padding-right: 12px;">
                              <div style="width: 44px; height: 44px; border-radius: 12px; background: #0b071a; border: 2px solid #00f2fe; box-shadow: 0 0 15px rgba(0, 242, 254, 0.4), inset 0 0 10px rgba(217, 70, 239, 0.3); text-align: center; line-height: 40px;">
                                <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -1px;">F<span style="color: #00f2fe; font-size: 15px;">⚡</span></span>
                              </div>
                            </td>

                            <!-- Texto FannyShop con degradado -->
                            <td align="left" valign="middle">
                              <span style="font-size: 30px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-transform: none;">Fanny<span style="color: #00f2fe; text-shadow: 0 0 14px rgba(0, 242, 254, 0.5);">Shop</span></span>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 10px 0 0 0; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; color: #d946ef; text-shadow: 0 0 8px rgba(217, 70, 239, 0.3);">
                          Tarjetas Digitales · Gaming · Entretenimiento
                        </p>
                      </td>
                    </tr>

                    <!-- Separador Neón -->
                    <tr>
                      <td style="padding: 0 35px;">
                        <div style="border-top: 1px solid rgba(255, 255, 255, 0.08);"></div>
                      </td>
                    </tr>

                    <!-- CUERPO PRINCIPAL -->
                    <tr>
                      <td align="center" style="padding: 28px 30px 15px 30px; text-align: center;">
                        <h2 style="margin: 0 0 12px 0; font-size: 21px; font-weight: 800; color: #ffffff;">
                          ¡Activa tu cuenta en FannyShop!
                        </h2>
                        
                        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.65; color: #cbd5e1; max-width: 460px;">
                          Estás a un paso de acceder a tu catálogo de recargas y tarjetas digitales para <strong>PlayStation, Xbox, Steam, Google Play, Apple</strong> y más, con entrega inmediata en tu panel.
                        </p>

                        <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #00f2fe;">
                          Tu código de verificación seguro:
                        </p>

                        <!-- CAJA NEÓN DEL CÓDIGO -->
                        <div style="display: inline-block; margin: 5px 0 18px 0; padding: 18px 32px; background: rgba(5, 3, 15, 0.95); border: 2px dashed #00f2fe; border-radius: 16px; box-shadow: 0 0 25px rgba(0, 242, 254, 0.25), inset 0 0 15px rgba(217, 70, 239, 0.15);">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 9px; color: #facc15; text-shadow: 0 0 15px rgba(250, 204, 21, 0.5);">
                            ${code}
                          </span>
                        </div>

                        <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                          ⏱️ Este código expira en <strong>15 minutos</strong>.<br />
                          Si no creaste una cuenta en FannyShop, puedes ignorar este mensaje.
                        </p>
                      </td>
                    </tr>

                    <!-- MUESTRARIO DE TARJETAS (GIFTCARDS CON BRILLO NEÓN) -->
                    <tr>
                      <td style="padding: 15px 25px 20px 25px;">
                        
                        <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; text-align: center;">
                          Lo más vendido en la tienda
                        </p>

                        <!-- Galería de 4 Tarjetas -->
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <!-- Tarjeta 1 -->
                            <td width="25%" align="center" style="padding: 4px;">
                              <div style="background: #0b071b; border: 1px solid rgba(0, 242, 254, 0.35); border-radius: 10px; padding: 4px; box-shadow: 0 0 10px rgba(0, 242, 254, 0.2);">
                                <img src="https://assets.offgamers.com/img/offer/kr_fdf75033-56ee-4ce6-929c-1f9c93a4c642_99570df6-d5e9-4dd6-823b-f5fa44d1e6c5.webp" 
                                     alt="Gift Card" width="105" style="display: block; width: 100%; max-width: 105px; height: auto; border-radius: 6px;" />
                              </div>
                            </td>

                            <!-- Tarjeta 2 -->
                            <td width="25%" align="center" style="padding: 4px;">
                              <div style="background: #0b071b; border: 1px solid rgba(217, 70, 239, 0.35); border-radius: 10px; padding: 4px; box-shadow: 0 0 10px rgba(217, 70, 239, 0.2);">
                                <img src="https://assets.offgamers.com/img/offer/kr_fdf75033-56ee-4ce6-929c-1f9c93a4c642_de35f46a-b9e1-43b7-bf3c-adf495a4d71b.webp" 
                                     alt="Gift Card" width="105" style="display: block; width: 100%; max-width: 105px; height: auto; border-radius: 6px;" />
                              </div>
                            </td>

                            <!-- Tarjeta 3 -->
                            <td width="25%" align="center" style="padding: 4px;">
                              <div style="background: #0b071b; border: 1px solid rgba(0, 242, 254, 0.35); border-radius: 10px; padding: 4px; box-shadow: 0 0 10px rgba(0, 242, 254, 0.2);">
                                <img src="https://assets.offgamers.com/img/offer/kr_fdf75033-56ee-4ce6-929c-1f9c93a4c642_91ef98e0-eebd-47f0-b8ad-0eecc55573c8.webp" 
                                     alt="Gift Card" width="105" style="display: block; width: 100%; max-width: 105px; height: auto; border-radius: 6px;" />
                              </div>
                            </td>

                            <!-- Tarjeta 4 -->
                            <td width="25%" align="center" style="padding: 4px;">
                              <div style="background: #0b071b; border: 1px solid rgba(217, 70, 239, 0.35); border-radius: 10px; padding: 4px; box-shadow: 0 0 10px rgba(217, 70, 239, 0.2);">
                                <img src="https://assets.offgamers.com/img/offer/kr_fdf75033-56ee-4ce6-929c-1f9c93a4c642_b214653c-80df-4543-a532-ea36ef7d7b1c.webp" 
                                     alt="Gift Card" width="105" style="display: block; width: 100%; max-width: 105px; height: auto; border-radius: 6px;" />
                              </div>
                            </td>
                          </tr>
                        </table>

                      </td>
                    </tr>

                    <!-- CUADRO DE CONFIANZA Y PAGOS -->
                    <tr>
                      <td style="padding: 5px 25px 25px 25px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(0, 242, 254, 0.04); border: 1px solid rgba(0, 242, 254, 0.18); border-radius: 14px; padding: 14px 18px;">
                          <tr>
                            <td align="center" style="font-size: 12px; color: #cbd5e1; line-height: 1.8;">
                              ⚡ <strong>Entrega Digital Inmediata</strong> al confirmar tu orden.<br />
                              💳 Pagos seguros con <strong>Yappy, Binance Pay y Banco General</strong>.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- FOOTER CON ENLACE -->
                    <tr>
                      <td align="center" style="padding: 22px 25px 28px 25px; background: #04020a; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                        <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">
                          © 2026 FannyShop. Todos los derechos reservados.
                        </p>
                        <a href="https://www.fannyshop.store" target="_blank" style="display: inline-block; padding: 6px 16px; background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.25); border-radius: 999px; font-size: 11px; color: #00f2fe; text-decoration: none; font-weight: 700; text-shadow: 0 0 8px rgba(0, 242, 254, 0.4);">
                          Ir a fannyshop.store →
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
