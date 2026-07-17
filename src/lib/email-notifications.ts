import { server$ } from "@tanstack/react-start/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const baseUrl = process.env.VITE_APP_URL || "https://biraj.hr";

export const sendListingCreatedEmail = server$(async (props: {
  email: string;
  userName: string;
  listingTitle: string;
  listingId: string;
  listingType: "standard" | "premium";
}) => {
  try {
    const listingUrl = `${baseUrl}/oglas/${props.listingId}`;
    const dashboardUrl = `${baseUrl}/racun/oglasi`;

    return await resend.emails.send({
      from: "oglasi@biraj.hr",
      to: props.email,
      subject: `Oglas "${props.listingTitle}" je objavljen! 🎉`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a2647 0%, #2d3e5f 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">Oglas je objavljen! ✅</h1>
          </div>
          <div style="padding: 40px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px;">Pozdrav ${props.userName},</p>
            <p style="color: #1f2937; font-size: 14px; line-height: 1.6;">
              Vaš oglas <strong>${props.listingTitle}</strong> je sada vidljiv na Biraj.HR i potencijalni kupci ga mogu pronaći.
            </p>
            <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #0c4a6e; font-size: 14px; margin: 0;">
                <strong>Tip objave:</strong> ${props.listingType === "premium" ? "TOP istaknut oglas (7 dana)" : "Standardna objava (30 dana)"}
              </p>
            </div>
            <a href="${listingUrl}" style="display: inline-block; background: #d4a574; color: #1a2647; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0;">
              Pogledaj oglas
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
              <a href="${dashboardUrl}" style="color: #3b82f6; text-decoration: none;">Upravljaj svojim oglasima</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send listing created email:", error);
    return { error };
  }
});

export const sendPaymentConfirmationEmail = server$(async (props: {
  email: string;
  userName: string;
  amount: number;
  listingTitle: string;
  listingType: "standard" | "premium";
}) => {
  try {
    const invoiceUrl = `${baseUrl}/racun/invoices`;

    return await resend.emails.send({
      from: "placanja@biraj.hr",
      to: props.email,
      subject: `Plaćanje potvrđeno - ${props.listingTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a2647 0%, #2d3e5f 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">Plaćanje potvrđeno ✓</h1>
          </div>
          <div style="padding: 40px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px;">Pozdrav ${props.userName},</p>
            <p style="color: #1f2937; font-size: 14px; line-height: 1.6;">
              Hvala na plaćanju! Vaš oglas je sada aktivan i vidljiv kupcima.
            </p>
            <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 20px; margin: 24px 0; border-radius: 6px;">
              <p style="color: #1f2937; font-size: 14px; margin: 8px 0;">
                <strong>Iznos:</strong> €${props.amount.toFixed(2)}
              </p>
              <p style="color: #1f2937; font-size: 14px; margin: 8px 0;">
                <strong>Naslov oglasa:</strong> ${props.listingTitle}
              </p>
              <p style="color: #1f2937; font-size: 14px; margin: 8px 0;">
                <strong>Trajanje:</strong> ${props.listingType === "premium" ? "7 dana (TOP)" : "30 dana"}
              </p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    return { error };
  }
});

export const sendNewMessageEmail = server$(async (props: {
  email: string;
  userName: string;
  senderName: string;
  listingTitle: string;
  messagePreview: string;
  messageUrl: string;
}) => {
  try {
    return await resend.emails.send({
      from: "poruke@biraj.hr",
      to: props.email,
      subject: `Nova poruka od ${props.senderName} - ${props.listingTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a2647 0%, #2d3e5f 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">📬 Nova poruka</h1>
          </div>
          <div style="padding: 40px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px;">Pozdrav ${props.userName},</p>
            <p style="color: #1f2937; font-size: 14px; line-height: 1.6;">
              <strong>${props.senderName}</strong> je poslao poruku vezanu uz oglas <strong>${props.listingTitle}</strong>.
            </p>
            <div style="background: #f3f4f6; padding: 16px; margin: 24px 0; border-left: 4px solid #d4a574; border-radius: 4px;">
              <p style="color: #1f2937; font-size: 13px; margin: 0; font-style: italic;">
                "${props.messagePreview}"
              </p>
            </div>
            <a href="${props.messageUrl}" style="display: inline-block; background: #d4a574; color: #1a2647; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Čitaj poruku
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send message notification email:", error);
    return { error };
  }
});

export const sendReviewReceivedEmail = server$(async (props: {
  email: string;
  userName: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  listingTitle: string;
}) => {
  try {
    const stars = "⭐".repeat(props.rating);

    return await resend.emails.send({
      from: "recenzije@biraj.hr",
      to: props.email,
      subject: `Nova recenzija od ${props.reviewerName} - ${stars}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a2647 0%, #2d3e5f 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nova recenzija ${stars}</h1>
          </div>
          <div style="padding: 40px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px;">Pozdrav ${props.userName},</p>
            <p style="color: #1f2937; font-size: 14px; line-height: 1.6;">
              <strong>${props.reviewerName}</strong> je ostavio vam recenziju s <strong>${props.rating} zvjezdice</strong> vezanu uz oglas <strong>${props.listingTitle}</strong>.
            </p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                "${props.reviewText}"
              </p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send review email:", error);
    return { error };
  }
});

export const sendWelcomeEmail = server$(async (props: {
  email: string;
  userName: string;
}) => {
  try {
    const browseUrl = `${baseUrl}/browse`;

    return await resend.emails.send({
      from: "noreply@biraj.hr",
      to: props.email,
      subject: "Dobrodošao na Biraj.HR! 🎉",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4a574 0%, #c7935d 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #1a2647; margin: 0; font-size: 32px;">Biraj.HR</h1>
          </div>
          <div style="padding: 40px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 18px; font-weight: 600;">Dobrodošao, ${props.userName}!</p>
            <p style="color: #1f2937; font-size: 14px; line-height: 1.6; margin-top: 16px;">
              Uspješno si se registrirao na Biraj.HR, hrvatskom marketplaceu provjerenih oglasa. Sada možeš početi s objavljivanjem i pretraživanjem oglasa.
            </p>
            <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #0c4a6e; font-size: 14px; margin: 8px 0;">
                ✓ Pregledi sve kategorije i oglase
              </p>
              <p style="color: #0c4a6e; font-size: 14px; margin: 8px 0;">
                ✓ Objavi svoj prvi oglas
              </p>
              <p style="color: #0c4a6e; font-size: 14px; margin: 8px 0;">
                ✓ Komuniciraj s prodavačima i kupcima
              </p>
            </div>
            <a href="${browseUrl}" style="display: inline-block; background: #1a2647; color: #d4a574; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Pregledaj katalog
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { error };
  }
});
