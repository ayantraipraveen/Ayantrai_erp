import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/utils/password';

const prisma = new PrismaClient();

// ------------------------------------------------------------------------------
// 1. DEFINITION OF ALL GRANULAR PERMISSIONS
// ------------------------------------------------------------------------------
const PERMISSIONS = [
  // System & Audit
  { name: 'Manage System', slug: 'system:manage', module: 'system', description: 'Full root access to system settings' },
  { name: 'View Audit Logs', slug: 'audit:read', module: 'audit', description: 'View cryptographic audit trail and activity logs' },

  // User Management
  { name: 'Create Users', slug: 'users:create', module: 'users', description: 'Invite and create team members' },
  { name: 'View Users', slug: 'users:read', module: 'users', description: 'View user roster and profile cards' },
  { name: 'Update Users', slug: 'users:update', module: 'users', description: 'Edit user accounts and role assignments' },
  { name: 'Delete Users', slug: 'users:delete', module: 'users', description: 'Deactivate or delete user accounts' },

  // Roles & Permissions Management
  { name: 'Create Roles', slug: 'roles:create', module: 'roles', description: 'Create custom system or site roles' },
  { name: 'View Roles & Permissions', slug: 'roles:read', module: 'roles', description: 'View role catalog and permission assignments' },
  { name: 'Update Roles', slug: 'roles:update', module: 'roles', description: 'Edit roles and assign/revoke permissions' },
  { name: 'Delete Roles', slug: 'roles:delete', module: 'roles', description: 'Delete custom roles' },

  // Sites & Zones
  { name: 'Manage Sites', slug: 'sites:manage', module: 'sites', description: 'Create and configure construction sites & geofences' },
  { name: 'View Sites', slug: 'sites:read', module: 'sites', description: 'View site information and active worker telemetry' },

  // Templates & Canvas Studio
  { name: 'Create Templates', slug: 'templates:create', module: 'templates', description: 'Create new report templates' },
  { name: 'View Templates', slug: 'templates:read', module: 'templates', description: 'Browse and view report templates' },
  { name: 'Update Templates', slug: 'templates:update', module: 'templates', description: 'Edit template structures and canvas pages' },
  { name: 'Delete Templates', slug: 'templates:delete', module: 'templates', description: 'Delete or archive report templates' },
  { name: 'Manage Sections', slug: 'sections:manage', module: 'sections', description: 'Manage Canvas Studio reusable library sections' },
  { name: 'Manage Watermarks', slug: 'watermarks:manage', module: 'watermarks', description: 'Upload and configure SVG stamps & watermarks' },

  // Reports & Telemetry
  { name: 'Generate Reports', slug: 'reports:generate', module: 'reports', description: 'Compile and generate PDF compliance reports' },
  { name: 'View Reports', slug: 'reports:read', module: 'reports', description: 'Inspect and download generated compliance reports' },
  { name: 'View Telemetry', slug: 'telemetry:read', module: 'telemetry', description: 'Access real-time IoT chipset feeds (Helmet, Vest, Boots)' },
];

// ------------------------------------------------------------------------------
// 2. DEFINITION OF ROLES & THEIR ASSIGNED PERMISSION SLUGS
// ------------------------------------------------------------------------------
const ROLES = [
  {
    name: 'Superadmin',
    slug: 'superadmin',
    description: 'Full system governance & root administrative privileges across all sites',
    isSystem: true,
    // Superadmin receives ALL permissions
    permissionSlugs: PERMISSIONS.map((p) => p.slug),
  },
  {
    name: 'Site Admin',
    slug: 'site_admin',
    description: 'Manages site operations, report templates, and team members',
    isSystem: true,
    permissionSlugs: [
      'audit:read',
      'users:read',
      'users:update',
      'roles:read',
      'sites:read',
      'templates:create',
      'templates:read',
      'templates:update',
      'sections:manage',
      'watermarks:manage',
      'reports:generate',
      'reports:read',
      'telemetry:read',
    ],
  },
  {
    name: 'Project Head',
    slug: 'project_head',
    description: 'Executive project lead with high-level analytics & audit access',
    isSystem: true,
    permissionSlugs: [
      'audit:read',
      'users:read',
      'sites:read',
      'templates:read',
      'reports:read',
      'telemetry:read',
    ],
  },
  {
    name: 'Safety Officer',
    slug: 'safety_officer',
    description: 'Monitors PPE compliance, site breaches, and generates shift reports',
    isSystem: true,
    permissionSlugs: [
      'sites:read',
      'templates:read',
      'reports:generate',
      'reports:read',
      'telemetry:read',
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seeding (Roles & Permissions)...');

  // Step 1: Seed all Permissions
  console.log('📦 Seeding permissions...');
  const permissionMap = new Map<string, string>(); // slug -> permissionId

  for (const permData of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { slug: permData.slug },
      update: {
        name: permData.name,
        module: permData.module,
        description: permData.description,
      },
      create: permData,
    });
    permissionMap.set(perm.slug, perm.id);
  }
  console.log(`✅ ${permissionMap.size} permissions seeded.`);

  // Step 2: Seed Roles & Link Role Permissions
  console.log('👥 Seeding roles and assigning permissions...');
  for (const roleData of ROLES) {
    const { permissionSlugs, ...roleFields } = roleData;

    const role = await prisma.role.upsert({
      where: { slug: roleFields.slug },
      update: {
        name: roleFields.name,
        description: roleFields.description,
        isSystem: roleFields.isSystem,
      },
      create: roleFields,
    });

    console.log(`✅ Role: ${role.name} (${role.slug})`);

    // Assign permissions to this role
    let linkedCount = 0;
    for (const slug of permissionSlugs) {
      const permissionId = permissionMap.get(slug);
      if (permissionId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId,
          },
        });
        linkedCount++;
      }
    }
    console.log(`   🔗 Assigned ${linkedCount} permissions to ${role.name}`);
  }

  // Step 3: Seed Default Superadmin User
  console.log('👤 Seeding default Superadmin account...');
  const superadminRole = await prisma.role.findUnique({
    where: { slug: 'superadmin' },
  });

  if (superadminRole) {
    const passwordHash = await hashPassword('Sitesafe@2026');

    const superadminUser = await prisma.user.upsert({
      where: { email: 'superadmin@ayantrai.com' },
      update: {
        roleId: superadminRole.id,
        passwordHash,
        status: 'active',
      },
      create: {
        email: 'superadmin@ayantrai.com',
        passwordHash,
        name: 'Superadmin',
        company: 'AyantrAI HQ Governance',
        status: 'active',
        roleId: superadminRole.id,
      },
    });

    console.log(`✅ Superadmin User Seeded: ${superadminUser.name} (${superadminUser.email})`);
    console.log(`   🔑 Default Password: Sitesafe@2026`);
    console.log(`   🆔 User ID: ${superadminUser.id}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch(async (error) => {
    console.error('❌ Error during seeding:', error);
    await prisma.$disconnect();
    throw error;
  })
  .then(async () => {
    await prisma.$disconnect();
  });
