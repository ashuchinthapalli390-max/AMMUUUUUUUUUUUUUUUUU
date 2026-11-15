import fs from 'node:fs';

const envContent = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envContent.match(/RESEND_API_KEY=([^\r\n]+)/);
const fromMatch = envContent.match(/RESEND_FROM_EMAIL=([^\r\n]+)/);

const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;
const customFrom = fromMatch ? fromMatch[1].trim() : 'CodeXa Agency <contact@codxa-agency.online>';
const accountEmail = 'ashuchinthapalli390@gmail.com';

console.log('==================================================================');
console.log('             RESEND CONFIGURATION & DIAGNOSTIC SUITE              ');
console.log('==================================================================\n');

async function sendEmailTest(from, to, label) {
  console.log(`[TEST] ${label}`);
  console.log(`  From: ${from}`);
  console.log(`  To:   ${to}`);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `🧪 Resend Test: ${label}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0b0c5; border-radius: 12px; background: #fffafc;">
            <h2 style="color: #781d45;">Resend Test: ${label}</h2>
            <p>This is a live test from your Antigravity development environment.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        `
      })
    });

    console.log(`  HTTP Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('  Response:', JSON.stringify(data, null, 2));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('  Fetch Error:', err.message);
    return { ok: false, error: err.message };
  }
}

async function run() {
  // Test 1: Send via Sandbox (onboarding@resend.dev) to the registered account owner
  console.log('--- TEST 1: Resend Sandbox Sender (onboarding@resend.dev) ---');
  const res1 = await sendEmailTest('onboarding@resend.dev', accountEmail, 'Sandbox Mode to Account Owner');

  console.log('\n--- TEST 2: Custom Domain Sender (contact@codxa-agency.online) ---');
  const res2 = await sendEmailTest(customFrom, accountEmail, 'Custom Domain Mode');

  console.log('\n==================================================================');
  console.log('                       DIAGNOSTIC SUMMARY                         ');
  console.log('==================================================================');

  if (res1.ok && res1.data?.id) {
    console.log('✅ API KEY STATUS: VALID & ACTIVE');
    console.log(`   Sandbox delivery successful (Email ID: ${res1.data.id})`);
    console.log(`   Account Owner Email: ${accountEmail}`);
  } else {
    console.log('❌ API KEY STATUS: FAILED / INVALID');
  }

  if (res2.ok && res2.data?.id) {
    console.log('✅ CUSTOM DOMAIN STATUS: VERIFIED & ACTIVE');
    console.log(`   Custom domain email dispatched successfully (Email ID: ${res2.data.id})`);
  } else {
    console.log('⚠️ CUSTOM DOMAIN STATUS: NOT VERIFIED YET IN RESEND');
    console.log('   Reason: Resend requires DNS records (DKIM/SPF) to be verified at https://resend.com/domains');
    console.log(`   Error from Resend: ${res2.data?.message || res2.error}`);
  }
  console.log('==================================================================\n');
}

run();
