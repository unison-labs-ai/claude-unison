const { verify, saveCredentials } = require('./lib/auth');

async function main() {
  const email = process.argv[2];
  const code = process.argv[3];

  if (!email || !code) {
    console.log('Usage: node auth-verify.cjs <email> <otp-code>');
    process.exit(1);
  }

  try {
    const result = await verify(email, code);

    if (!result.verified) {
      console.log('Verification failed — invalid or expired OTP code.');
      process.exit(1);
    }

    const token = result.apiKey;
    if (!token) {
      // First-time verify of a newly-provisioned account:
      // the token was already returned by provision; just confirm verification.
      console.log(`Account verified for: ${email}`);
      console.log('Your existing token is now permanent.');
      console.log('');
      console.log(
        'If you need your token, set UNISON_TOKEN to the value returned during provisioning.',
      );
      return;
    }

    // Key recovery path: a fresh usk_ token was minted
    saveCredentials(token, email);
    console.log(`Authenticated: ${email}`);
    console.log(`Token: ${token}`);
    console.log('');
    console.log('Credentials saved to ~/.unison-claude/credentials.json');
    console.log('You can also set UNISON_TOKEN in your environment to override this file.');
  } catch (err) {
    console.log(`Verification failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
