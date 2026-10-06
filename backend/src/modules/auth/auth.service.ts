import { prisma } from '../../config/prisma';
import { ApiError } from '../../shared/utils/apiError';
import { verifyPassword } from '../../shared/utils/password';
import { generateToken } from '../../shared/utils/jwt';
import { LoginInput } from './auth.schema';

export async function loginService(input: LoginInput) {
  const { email, password } = input;

  // 1. Fetch user by email, including their role and permissions
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // 2. Check if account is active
  if (user.status !== 'active') {
    throw ApiError.forbidden('Your account is currently inactive. Please contact your site administrator.');
  }

  // 3. Verify password
  if (!user.passwordHash) {
    throw ApiError.unauthorized('Account password is not set. Please contact administrator.');
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // 4. Extract permission slugs
  const permissions: string[] =
    user.role?.permissions?.map((rp: any) => rp.permission?.slug).filter(Boolean) || [];

  const roleName = user.role?.name || 'User';
  const roleSlug = user.role?.slug || 'user';

  // 5. Generate Access Token (7 days) and Refresh Token (30 days)
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: roleName,
    roleSlug,
    permissions,
  };

  const token = generateToken(tokenPayload, 1 * 24 * 60 * 60);
  const refreshToken = generateToken(
    { userId: user.id, email: user.email, type: 'refresh' },
    30 * 24 * 60 * 60
  );

  // 6. Save refreshToken to database for session tracking
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  // 7. Format clean user payload matching ERP frontend expectations
  const userProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleName,
    roleSlug,
    company: user.company || 'AyantrAI HQ',
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    permissions,
  };

  return {
    user: userProfile,
    token,
    refreshToken,
  };
}

/**
 * Invalidate user session and clear refreshToken from database
 */
export async function logoutService(userId?: string) {
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
  return { message: 'Logged out successfully' };
}

