import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import dataSource from './data-source';
import { User } from '../users/user.entity';

async function runSeed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(User);

  const email = process.env.SEED_USER_EMAIL ?? 'demo@authkit.dev';
  const password = process.env.SEED_USER_PASSWORD ?? 'Authkit123!';
  const mfaEmail = process.env.SEED_MFA_EMAIL ?? 'demo-mfa@authkit.dev';

  const existing = await repo.findOne({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await repo.save(
      repo.create({
        email,
        name: 'AuthKit Demo',
        passwordHash,
        emailVerified: true,
      }),
    );

    console.log(`Seeded user: ${email} / ${password}`);
  }

  const existingMfa = await repo.findOne({ where: { email: mfaEmail } });
  if (!existingMfa) {
    const passwordHash = await bcrypt.hash(password, 10);
    await repo.save(
      repo.create({
        email: mfaEmail,
        name: 'AuthKit MFA Demo',
        passwordHash,
        emailVerified: true,
        mfaEnabled: true,
        mfaMethod: 'email',
      }),
    );

    console.log(`Seeded MFA user: ${mfaEmail} / ${password}`);
  }

  await dataSource.destroy();
}

void runSeed()
  .then(() => {
    console.log('Seed finished.');
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  });
