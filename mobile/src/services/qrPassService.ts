import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

export interface QrPassData {
  token: string;
  mandi: string;
  date: string;
  time: string;
  crop: string;
  quantity: string;
  farmerName: string;
  farmerPhone: string;
  vehicle?: string;
}

export async function downloadOrShareQrPass(data: QrPassData): Promise<void> {
  try {
    Toast.show({
      type: 'info',
      text1: 'Generating QR Pass PDF... 📄',
      text2: `Preparing official entry pass #${data.token}`,
    });

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KQ-BOOKING-${data.token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>KisanQueue Mandi Entry Pass #${data.token}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              background-color: #FFFBEF;
              margin: 0;
              padding: 24px;
              color: #12160F;
            }
            .card {
              max-width: 460px;
              margin: 0 auto;
              background: #FFFFFF;
              border-radius: 24px;
              padding: 28px;
              box-shadow: 0 12px 30px rgba(0,0,0,0.08);
              border: 2px solid #2D8A39;
              text-align: center;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              margin-bottom: 16px;
            }
            .logo-badge {
              background: #EBF4E5;
              width: 44px;
              height: 44px;
              border-radius: 22px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              border: 1.5px solid #2D8A39;
            }
            .brand-title {
              font-size: 22px;
              font-weight: 800;
              color: #2D8A39;
              margin: 0;
            }
            .gov-sub {
              font-size: 11px;
              color: #666;
              font-weight: 700;
              margin-top: 2px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .token-badge {
              background: #EBF4E5;
              border: 1.5px dashed #2D8A39;
              padding: 10px 24px;
              border-radius: 16px;
              display: inline-block;
              margin: 16px 0;
            }
            .token-label {
              font-size: 11px;
              color: #134E23;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .token-val {
              font-size: 28px;
              font-weight: 800;
              color: #2D8A39;
            }
            .qr-wrapper {
              background: #FFFFFF;
              border: 1px solid #E8E4D8;
              border-radius: 16px;
              padding: 16px;
              display: inline-block;
              margin: 10px 0;
            }
            .qr-img {
              width: 180px;
              height: 180px;
              display: block;
            }
            .qr-hint {
              font-size: 12px;
              color: #777;
              margin-top: 8px;
              margin-bottom: 16px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              text-align: left;
            }
            .info-table tr {
              border-bottom: 1px solid #F0EDE4;
            }
            .info-table tr:last-child {
              border-bottom: none;
            }
            .info-table td {
              padding: 10px 8px;
              font-size: 13px;
            }
            .info-label {
              color: #666;
              font-weight: 600;
            }
            .info-val {
              color: #12160F;
              font-weight: 800;
              text-align: right;
            }
            .stamp-box {
              margin-top: 20px;
              padding: 8px 16px;
              border: 1.5px dashed #D4A836;
              border-radius: 12px;
              display: inline-block;
              background: #FFFDF5;
            }
            .stamp-text {
              font-size: 10px;
              font-weight: 800;
              color: #D4A836;
              letter-spacing: 1px;
            }
            .footer {
              margin-top: 20px;
              font-size: 11px;
              color: #888;
              border-top: 1px solid #E8E4D8;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="logo-badge">🌱</div>
              <div>
                <h1 class="brand-title">KisanQueue Mandi Pass</h1>
                <div class="gov-sub">Official Digital Procurement Gate Pass</div>
              </div>
            </div>

            <div class="token-badge">
              <div class="token-label">Token Pass Number</div>
              <div class="token-val">#${data.token}</div>
            </div>

            <div>
              <div class="qr-wrapper">
                <img class="qr-img" src="${qrImageUrl}" alt="Pass QR Code" />
              </div>
              <div class="qr-hint">Show this QR code at Mandi Entry Gate Counter</div>
            </div>

            <table class="info-table">
              <tr>
                <td class="info-label">👨‍🌾 Farmer Name</td>
                <td class="info-val">${data.farmerName}</td>
              </tr>
              <tr>
                <td class="info-label">📞 Phone Number</td>
                <td class="info-val">${data.farmerPhone}</td>
              </tr>
              <tr>
                <td class="info-label">🏢 Mandi Complex</td>
                <td class="info-val">${data.mandi}</td>
              </tr>
              <tr>
                <td class="info-label">📅 Arrival Date</td>
                <td class="info-val">${data.date}</td>
              </tr>
              <tr>
                <td class="info-label">⏰ Time Slot</td>
                <td class="info-val">${data.time}</td>
              </tr>
              <tr>
                <td class="info-label">🌾 Crop Type</td>
                <td class="info-val">${data.crop}</td>
              </tr>
              <tr>
                <td class="info-label">⚖️ Quantity</td>
                <td class="info-val">${data.quantity}</td>
              </tr>
              ${
                data.vehicle
                  ? `<tr>
                      <td class="info-label">🚚 Vehicle No</td>
                      <td class="info-val">${data.vehicle}</td>
                    </tr>`
                  : ''
              }
            </table>

            <div class="stamp-box">
              <div class="stamp-text">OFFICIAL MANDI GATE PASS • VERIFIED</div>
            </div>

            <div class="footer">
              🌾 KisanQueue • Digital Mandi Management • Government of Punjab / Haryana 🌾
            </div>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Save QR Pass Ticket #${data.token}`,
        UTI: 'com.adobe.pdf',
      });

      Toast.show({
        type: 'success',
        text1: 'QR Pass Downloaded! 📥',
        text2: `Token pass #${data.token} PDF file saved.`,
      });
    } else {
      await Print.printAsync({ html: htmlContent });
    }
  } catch (error) {
    console.error('Error generating QR pass:', error);
    Toast.show({
      type: 'error',
      text1: 'Download Failed',
      text2: 'Could not generate QR pass PDF. Please try again.',
    });
  }
}
