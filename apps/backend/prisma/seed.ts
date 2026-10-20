import {
  PrismaClient,
  ClubRole,
  PaymentMode,
  SportType,
  CourtType,
  SurfaceType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed de datos para SPT App...');

  // 1. Limpiar base de datos en orden inverso para respetar claves foráneas
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingParticipant.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.facilityBlock.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.clubMembership.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Base de datos reseteada con éxito');

  // 2. Crear Superadministrador Global
  const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@spt-app.local',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+34600000000',
      isSuperAdmin: true,
    },
  });
  console.log(`👤 SuperAdmin creado: ${superAdmin.email}`);

  // 3. Crear Club Demo (Tenant)
  const club = await prisma.club.create({
    data: {
      name: 'Club Deportivo Central Pádel & Tenis',
      slug: 'central-padel',
      description: 'Centro multideportivo con pistas cubiertas y exteriores de última generación.',
      email: 'contacto@centralpadel.local',
      phone: '+34910000001',
      address: 'Avenida del Deporte, 12',
      city: 'Madrid',
      postalCode: '28001',
      openingHour: 8,
      closingHour: 23,
      slotDurationMinutes: 60,
      openGameMinNoticeHours: 2,
      paymentMode: PaymentMode.PRESENTIAL,
      isActive: true,
    },
  });
  console.log(`🏟️  Club creado: ${club.name} (ID: ${club.id})`);

  // 4. Crear Administrador del Club
  const clubAdminPassword = await bcrypt.hash('ClubAdmin123!', 10);
  const clubAdmin = await prisma.user.create({
    data: {
      email: 'admin@centralpadel.local',
      password: clubAdminPassword,
      firstName: 'Carlos',
      lastName: 'Director',
      phone: '+34611111111',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: clubAdmin.id,
      clubId: club.id,
      role: ClubRole.ADMIN,
    },
  });
  console.log(`👔 Admin de club creado: ${clubAdmin.email}`);

  // 5. Crear Jugadores de Prueba (Socio e Invitado)
  const playerPassword = await bcrypt.hash('Player123!', 10);

  const memberUser = await prisma.user.create({
    data: {
      email: 'socio@spt-app.local',
      password: playerPassword,
      firstName: 'Marcos',
      lastName: 'Gómez',
      phone: '+34622222222',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: memberUser.id,
      clubId: club.id,
      role: ClubRole.MEMBER,
      memberNumber: 'SOC-001',
      walletBalance: 50.0,
    },
  });

  const guestUser = await prisma.user.create({
    data: {
      email: 'invitado@spt-app.local',
      password: playerPassword,
      firstName: 'Elena',
      lastName: 'Ruiz',
      phone: '+34633333333',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: guestUser.id,
      clubId: club.id,
      role: ClubRole.GUEST,
      walletBalance: 0.0,
    },
  });
  console.log('🎾 Usuarios de prueba creados (Socio con 50€ e Invitado)');

  // 6. Crear Instalaciones / Pistas Multi-deporte
  const facilities = await Promise.all([
    prisma.facility.create({
      data: {
        clubId: club.id,
        name: 'Pista 1 - Pádel Cristal Indoor',
        sportType: SportType.PADEL,
        courtType: CourtType.INDOOR,
        surfaceType: SurfaceType.CRYSTAL,
        hasLighting: true,
        defaultSlotMinutes: 90,
        minPlayers: 4,
        maxPlayers: 4,
      },
    }),
    prisma.facility.create({
      data: {
        clubId: club.id,
        name: 'Pista 2 - Pádel Panorámica Exterior',
        sportType: SportType.PADEL,
        courtType: CourtType.OUTDOOR,
        surfaceType: SurfaceType.SYNTHETIC_GRASS,
        hasLighting: true,
        defaultSlotMinutes: 90,
        minPlayers: 4,
        maxPlayers: 4,
      },
    }),
    prisma.facility.create({
      data: {
        clubId: club.id,
        name: 'Pista 3 - Tenis Tierra Batida',
        sportType: SportType.TENNIS,
        courtType: CourtType.OUTDOOR,
        surfaceType: SurfaceType.CLAY,
        hasLighting: true,
        defaultSlotMinutes: 60,
        minPlayers: 2,
        maxPlayers: 4,
      },
    }),
    prisma.facility.create({
      data: {
        clubId: club.id,
        name: 'Campo 1 - Fútbol 7 Césped Artificial',
        sportType: SportType.FOOTBALL_7,
        courtType: CourtType.OUTDOOR,
        surfaceType: SurfaceType.SYNTHETIC_GRASS,
        hasLighting: true,
        defaultSlotMinutes: 60,
        minPlayers: 10,
        maxPlayers: 14,
      },
    }),
  ]);
  console.log(`🏟️  ${facilities.length} instalaciones deportivas creadas`);

  // 7. Crear Reglas de Tarifas
  await prisma.pricingRule.create({
    data: {
      clubId: club.id,
      name: 'Tarifa Estándar Mañanas (Valle)',
      isPeakHour: false,
      startTime: '08:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
      memberPrice: 16.0,
      guestPrice: 24.0,
      lightSurcharge: 0.0,
      priority: 1,
    },
  });

  await prisma.pricingRule.create({
    data: {
      clubId: club.id,
      name: 'Tarifa Tardes & Fines de Semana (Punta)',
      isPeakHour: true,
      startTime: '17:00',
      endTime: '23:00',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // Toda la semana
      memberPrice: 24.0,
      guestPrice: 32.0,
      lightSurcharge: 4.0,
      priority: 2,
    },
  });
  console.log('💶 Reglas de precios base configuradas');

  console.log('✅ Seed completado con éxito');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
