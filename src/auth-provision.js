const { provision, requestKey } = require('./lib/auth');

async function main() {
  const email = process.argv[2];

  if (!email?.includes('@')) {
    console.log('Usage: node auth-provision.cjs <email>');
    process.exit(1);
  }

  try {
    const result = await provision(email);
    console.log(`Account created for: ${email}`);
    console.log(`Token (unverified): ${result.apiKey}`);
    console.log(`Tenant ID: ${result.tenantId}`);
    console.log('');
    console.log('Check your email for a verification OTP.');
    console.log(
      'Run auth-verify.cjs with the code to make your account permanent (unverified accounts expire in 72h).',
    );
  } catch (err) {
    if (err.code === 'email_registered') {
      console.log(`Account already exists for: ${email}`);
      console.log('Requesting a recovery OTP...');
      try {
        await requestKey(email);
        console.log('Check your email for a recovery OTP.');
        console.log('Run auth-verify.cjs with the code to recover your token.');
      } catch (recoveryErr) {
        console.log(`Error requesting recovery key: ${recoveryErr.message}`);
        process.exit(1);
      }
    } else {
      console.log(`Error provisioning account: ${err.message}`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
