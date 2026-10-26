import fs from 'node:fs';
import path from 'node:path';

function getEnvKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/RESEND_API_KEY=([^\r\n]+)/);
    if (match) return match[1].trim();
  } catch {}
  return '';
}

const RESEND_API_KEY = getEnvKey();
const FROM = process.env.EMAIL_FROM || 'Pottiiiiiiiiiiiiii Birthdayy <Reminder@codeaxisapply.xyz>';
const TO = 'amruthadivvela@gmail.com';
const BCC = 'ashuchinthapalli3900@gmail.com';
const REPLY_TO = 'ashuchinthapalli3900@gmail.com';
const SCHEDULED_TIME = '2026-10-26T18:30:00.000Z'; // 12:00:00 AM IST exact

const imgPath = 'public/assets/reminders/ammu_21_days_left.jpg';
const imgBuffer = fs.readFileSync(imgPath);
const base64Data = imgBuffer.toString('base64');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>21 Days to Go, Ammuuu!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fff0f5; font-family: 'Georgia', serif; color: #5a2238;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff0f5; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 16px 45px rgba(185, 101, 135, 0.2); overflow: hidden; border: 1px solid #f6cfde;">
          <!-- Top Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #742546 0%, #aa4973 60%, #e28ba0 100%); padding: 28px 24px; text-align: center;">
              <span style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 3px; color: #ffd6e5; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 6px;">
                A SPECIAL SURPRISE • FROM ASHU
              </span>
              <h1 style="margin: 0; color: #ffffff; font-size: 27px; font-weight: normal; font-style: italic;">
                21 Days to Go, Ammuuu! 🌸
              </h1>
            </td>
          </tr>

          <!-- Poster Image -->
          <tr>
            <td style="padding: 24px 20px 10px 20px; text-align: center;">
              <img src="cid:ammu_21_days_image" alt="21 Days Left - Ammuuu" style="width: 100%; max-width: 540px; height: auto; border-radius: 16px; border: 5px solid #fff5f8; box-shadow: 0 10px 30px rgba(142, 49, 85, 0.15); display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 20px 32px 10px 32px; text-align: center;">
              <h2 style="font-size: 22px; color: #8e3155; margin: 8px 0 14px 0; font-style: italic;">
                "Same girl... More dreams, Brighter days." 💗
              </h2>
              <p style="font-size: 16px; line-height: 1.7; color: #6f3149; margin: 0 0 18px 0;">
                Midnight greetings, Pottiiiiiiii! 🌙✨<br>
                Look at how time is flying — exactly <strong>21 days</strong> until your very special day on <strong>17 November</strong>!
              </p>
              <p style="font-size: 15px; line-height: 1.65; color: #884460; margin: 0 0 24px 0; font-style: italic;">
                A little more time for more love, more cake, more laughs and a hundred more memories with you. Every single day brings us closer to your celebration!
              </p>

              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 28px auto;">
                <tr>
                  <td style="border-radius: 30px; background: linear-gradient(110deg, #f48cb6, #d95189); box-shadow: 0 8px 24px rgba(221, 124, 168, 0.45);">
                    <a href="https://ammuuuuuuuuu.codxa-agency.online" target="_blank" style="padding: 14px 28px; border-radius: 30px; font-family: Arial, sans-serif; font-size: 14px; color: #ffffff; text-decoration: none; font-weight: bold; display: inline-block; letter-spacing: 0.5px;">
                      Open Today's Calendar Surprise 🌸 ↗
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sweet Sign-off Footer -->
          <tr>
            <td style="background-color: #fff7fa; padding: 20px 24px; border-top: 1px dashed #f2cad9; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 15px; color: #8e3155; font-style: italic;">
                With all my care and love,
              </p>
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #672b47;">
                From Ashu ♡
              </p>
              <span style="display: block; margin-top: 10px; font-size: 11px; color: #bb7895; font-family: Arial, sans-serif;">
                A little universe made with infinite care for Pottiiiiiiii ✿
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function scheduleEmail() {
  console.log(`Scheduling email to ${TO} for 12:00 AM IST (${SCHEDULED_TIME})...`);

  const payload = {
    from: FROM,
    to: [TO],
    bcc: [BCC],
    reply_to: [REPLY_TO],
    subject: '🌸 21 Days to Go, Ammuuu! 💗 • Happy Birthday Countdown',
    scheduled_at: SCHEDULED_TIME,
    attachments: [
      {
        filename: 'Ammu_21_Days_Left.jpg',
        content: base64Data,
        content_id: 'ammu_21_days_image'
      }
    ],
    html: htmlContent
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log('Resend Response Status:', response.status);
  console.log('Result:', JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(`Failed to schedule email: ${JSON.stringify(data)}`);
  }

  return data;
}

scheduleEmail().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
