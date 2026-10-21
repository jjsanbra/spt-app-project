import {
  PrismaClient,
  ClubRole,
  PaymentMode,
  PaymentMethod,
  PaymentStatus,
  SportType,
  CourtType,
  SurfaceType,
  BookingType,
  BookingStatus,
  ParticipantStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function getRelativeDate(dayOffset: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed completo de datos multi-tenant para SPT App (3 Clubes)...');

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

  console.log('🧹 Base de datos reseteada con éxito.');

  // Contraseñas pre-hasheadas
  const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);
  const clubAdminPassword = await bcrypt.hash('ClubAdmin123!', 10);
  const playerPassword = await bcrypt.hash('Player123!', 10);

  // 2. Crear Superadministrador Global
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

  // 3. Crear Jugadores Principales y Adicionales
  const memberUser = await prisma.user.create({
    data: {
      email: 'socio@spt-app.local',
      password: playerPassword,
      firstName: 'Marcos',
      lastName: 'Gómez',
      phone: '+34622222222',
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

  const player1 = await prisma.user.create({
    data: {
      email: 'carlos.padel@spt-app.local',
      password: playerPassword,
      firstName: 'Carlos',
      lastName: 'Martínez',
      phone: '+34644444441',
    },
  });

  const player2 = await prisma.user.create({
    data: {
      email: 'laura.padel@spt-app.local',
      password: playerPassword,
      firstName: 'Laura',
      lastName: 'Sánchez',
      phone: '+34644444442',
    },
  });

  const player3 = await prisma.user.create({
    data: {
      email: 'david.tenis@spt-app.local',
      password: playerPassword,
      firstName: 'David',
      lastName: 'Navarro',
      phone: '+34644444443',
    },
  });

  const player4 = await prisma.user.create({
    data: {
      email: 'marta.tenis@spt-app.local',
      password: playerPassword,
      firstName: 'Marta',
      lastName: 'López',
      phone: '+34644444444',
    },
  });

  // ══════════════════════════════════════════════════════════════
  // CLUB 1: Madrid - Club Deportivo Central Pádel & Tenis
  // ══════════════════════════════════════════════════════════════
  const club1 = await prisma.club.create({
    data: {
      name: 'Club Deportivo Central Pádel & Tenis',
      slug: 'central-padel',
      description: 'Centro multideportivo premium en Madrid con pistas cubiertas y exteriores.',
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

  const club1Admin = await prisma.user.create({
    data: {
      email: 'admin@centralpadel.local',
      password: clubAdminPassword,
      firstName: 'Carlos',
      lastName: 'Director Madrid',
      phone: '+34611111111',
    },
  });

  // Membresías Club 1
  await prisma.clubMembership.createMany({
    data: [
      { userId: superAdmin.id, clubId: club1.id, role: ClubRole.OWNER, memberNumber: 'SA-01', walletBalance: 0 },
      { userId: club1Admin.id, clubId: club1.id, role: ClubRole.ADMIN, memberNumber: 'ADM-MAD-01', walletBalance: 0 },
      { userId: memberUser.id, clubId: club1.id, role: ClubRole.MEMBER, memberNumber: 'SOC-MAD-001', walletBalance: 65.5 },
      { userId: guestUser.id, clubId: club1.id, role: ClubRole.GUEST, memberNumber: 'INV-MAD-001', walletBalance: 0 },
      { userId: player1.id, clubId: club1.id, role: ClubRole.MEMBER, memberNumber: 'SOC-MAD-002', walletBalance: 40.0 },
      { userId: player2.id, clubId: club1.id, role: ClubRole.MEMBER, memberNumber: 'SOC-MAD-003', walletBalance: 30.0 },
      { userId: player3.id, clubId: club1.id, role: ClubRole.MEMBER, memberNumber: 'SOC-MAD-004', walletBalance: 20.0 },
      { userId: player4.id, clubId: club1.id, role: ClubRole.MEMBER, memberNumber: 'SOC-MAD-005', walletBalance: 15.0 },
    ],
  });

  // Instalaciones Club 1
  const c1f1 = await prisma.facility.create({
    data: {
      clubId: club1.id,
      name: 'Pista 1 - Pádel Cristal Indoor',
      sportType: SportType.PADEL,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.CRYSTAL,
      hasLighting: true,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
    },
  });
  const c1f2 = await prisma.facility.create({
    data: {
      clubId: club1.id,
      name: 'Pista 2 - Pádel Panorámica Exterior',
      sportType: SportType.PADEL,
      courtType: CourtType.OUTDOOR,
      surfaceType: SurfaceType.SYNTHETIC_GRASS,
      hasLighting: true,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
    },
  });
  const c1f3 = await prisma.facility.create({
    data: {
      clubId: club1.id,
      name: 'Pista 3 - Tenis Tierra Batida',
      sportType: SportType.TENNIS,
      courtType: CourtType.OUTDOOR,
      surfaceType: SurfaceType.CLAY,
      hasLighting: true,
      defaultSlotMinutes: 60,
      minPlayers: 2,
      maxPlayers: 4,
    },
  });
  const c1f4 = await prisma.facility.create({
    data: {
      clubId: club1.id,
      name: 'Campo 1 - Fútbol 7 Césped Artificial',
      sportType: SportType.FOOTBALL_7,
      courtType: CourtType.OUTDOOR,
      surfaceType: SurfaceType.SYNTHETIC_GRASS,
      hasLighting: true,
      defaultSlotMinutes: 60,
      minPlayers: 10,
      maxPlayers: 14,
    },
  });

  // Tarifas Club 1
  await prisma.pricingRule.createMany({
    data: [
      {
        clubId: club1.id,
        name: 'Tarifa Valle Mañanas (L-V)',
        isPeakHour: false,
        startTime: '08:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        memberPrice: 16.0,
        guestPrice: 24.0,
        lightSurcharge: 0.0,
        priority: 1,
      },
      {
        clubId: club1.id,
        name: 'Tarifa Punta Tardes y Fines de Semana',
        isPeakHour: true,
        startTime: '17:00',
        endTime: '23:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
        memberPrice: 24.0,
        guestPrice: 32.0,
        lightSurcharge: 4.0,
        priority: 2,
      },
    ],
  });

  // Bloqueos Club 1
  await prisma.facilityBlock.create({
    data: {
      clubId: club1.id,
      facilityId: c1f1.id,
      title: 'Mantenimiento preventivo cristales',
      reason: 'Ajuste de anclajes y limpieza técnica de lunas',
      startTime: getRelativeDate(-1, 8, 0),
      endTime: getRelativeDate(-1, 10, 0),
    },
  });

  // Reservas Club 1 (Hoy, Mañana, Pasadas)
  // 1. Reserva Hoy 10:00 Completa Padel Cristal
  const b1 = await prisma.booking.create({
    data: {
      clubId: club1.id,
      facilityId: c1f1.id,
      userId: memberUser.id,
      bookingType: BookingType.FULL,
      status: BookingStatus.CONFIRMED,
      startTime: getRelativeDate(0, 10, 0),
      endTime: getRelativeDate(0, 11, 30),
      totalPrice: 24.0,
      lightIncluded: false,
      notes: 'Partido entre socios habituales',
    },
  });
  await prisma.bookingParticipant.createMany({
    data: [
      { bookingId: b1.id, userId: memberUser.id, isHost: true, slotNumber: 1, team: 'A', individualPrice: 6.0, status: ParticipantStatus.CONFIRMED },
      { bookingId: b1.id, userId: player1.id, isHost: false, slotNumber: 2, team: 'A', individualPrice: 6.0, status: ParticipantStatus.CONFIRMED },
      { bookingId: b1.id, userId: player2.id, isHost: false, slotNumber: 3, team: 'B', individualPrice: 6.0, status: ParticipantStatus.CONFIRMED },
      { bookingId: b1.id, userId: player3.id, isHost: false, slotNumber: 4, team: 'B', individualPrice: 6.0, status: ParticipantStatus.CONFIRMED },
    ],
  });
  await prisma.payment.create({
    data: {
      clubId: club1.id,
      bookingId: b1.id,
      userId: memberUser.id,
      amount: 24.0,
      method: PaymentMethod.WALLET,
      status: PaymentStatus.COMPLETED,
      processedAt: new Date(),
    },
  });

  // 2. Reserva Hoy 18:00 Partido Abierto Pádel Panorámica (Faltan 2 plazas)
  const b2 = await prisma.booking.create({
    data: {
      clubId: club1.id,
      facilityId: c1f2.id,
      userId: player1.id,
      bookingType: BookingType.OPEN,
      status: BookingStatus.CONFIRMED,
      startTime: getRelativeDate(0, 18, 0),
      endTime: getRelativeDate(0, 19, 30),
      totalPrice: 28.0,
      lightIncluded: true,
      notes: 'Nivel intermedio 3.5 - 4.0. ¡Buscamos 2 jugadores!',
    },
  });
  await prisma.bookingParticipant.createMany({
    data: [
      { bookingId: b2.id, userId: player1.id, isHost: true, slotNumber: 1, team: 'A', individualPrice: 7.0, status: ParticipantStatus.CONFIRMED },
      { bookingId: b2.id, userId: player2.id, isHost: false, slotNumber: 2, team: 'A', individualPrice: 7.0, status: ParticipantStatus.CONFIRMED },
    ],
  });

  // 3. Reserva Mañana 19:00 Tenis Tierra Batida
  const b3 = await prisma.booking.create({
    data: {
      clubId: club1.id,
      facilityId: c1f3.id,
      userId: player3.id,
      bookingType: BookingType.FULL,
      status: BookingStatus.CONFIRMED,
      startTime: getRelativeDate(1, 19, 0),
      endTime: getRelativeDate(1, 20, 0),
      totalPrice: 20.0,
      lightIncluded: true,
      notes: 'Individual amistoso de tenis',
    },
  });
  await prisma.bookingParticipant.createMany({
    data: [
      { bookingId: b3.id, userId: player3.id, isHost: true, slotNumber: 1, team: 'A', individualPrice: 10.0, status: ParticipantStatus.CONFIRMED },
      { bookingId: b3.id, userId: player4.id, isHost: false, slotNumber: 2, team: 'B', individualPrice: 10.0, status: ParticipantStatus.CONFIRMED },
    ],
  });

  // ══════════════════════════════════════════════════════════════
  // CLUB 2: Barcelona - Barcelona Pádel & Sport Club
  // ══════════════════════════════════════════════════════════════
  const club2 = await prisma.club.create({
    data: {
      name: 'Barcelona Pádel & Sport Club',
      slug: 'barcelona-padel-club',
      description: 'Centro de alto rendimiento junto a la playa con pistas World Padel Tour.',
      email: 'info@barcelonapadel.local',
      phone: '+34930000002',
      address: 'Passeig Marítim, 45',
      city: 'Barcelona',
      postalCode: '08005',
      openingHour: 8,
      closingHour: 23,
      slotDurationMinutes: 60,
      openGameMinNoticeHours: 3,
      paymentMode: PaymentMode.ONLINE,
      isActive: true,
    },
  });

  const club2Admin = await prisma.user.create({
    data: {
      email: 'admin@barcelonapadel.local',
      password: clubAdminPassword,
      firstName: 'Laura',
      lastName: 'Directora Barcelona',
      phone: '+34611111112',
    },
  });

  // Membresías Club 2 (SuperAdmin y Marcos son socios también aquí)
  await prisma.clubMembership.createMany({
    data: [
      { userId: superAdmin.id, clubId: club2.id, role: ClubRole.OWNER, memberNumber: 'SA-BCN', walletBalance: 0 },
      { userId: club2Admin.id, clubId: club2.id, role: ClubRole.ADMIN, memberNumber: 'ADM-BCN-01', walletBalance: 0 },
      { userId: memberUser.id, clubId: club2.id, role: ClubRole.MEMBER, memberNumber: 'SOC-BCN-001', walletBalance: 42.0 },
      { userId: player1.id, clubId: club2.id, role: ClubRole.MEMBER, memberNumber: 'SOC-BCN-002', walletBalance: 25.0 },
      { userId: player2.id, clubId: club2.id, role: ClubRole.MEMBER, memberNumber: 'SOC-BCN-003', walletBalance: 50.0 },
    ],
  });

  // Instalaciones Club 2
  const c2f1 = await prisma.facility.create({
    data: {
      clubId: club2.id,
      name: 'Pista Central WPT Panorámica',
      sportType: SportType.PADEL,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.CRYSTAL,
      hasLighting: true,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
    },
  });
  const c2f2 = await prisma.facility.create({
    data: {
      clubId: club2.id,
      name: 'Pista 2 - Cristal Exterior',
      sportType: SportType.PADEL,
      courtType: CourtType.OUTDOOR,
      surfaceType: SurfaceType.SYNTHETIC_GRASS,
      hasLighting: true,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
    },
  });
  const c2f3 = await prisma.facility.create({
    data: {
      clubId: club2.id,
      name: 'Pista Rápida Tenis Pro',
      sportType: SportType.TENNIS,
      courtType: CourtType.OUTDOOR,
      surfaceType: SurfaceType.RESIN,
      hasLighting: true,
      defaultSlotMinutes: 60,
      minPlayers: 2,
      maxPlayers: 4,
    },
  });
  const c2f4 = await prisma.facility.create({
    data: {
      clubId: club2.id,
      name: 'Pista Pickleball Indoor 1',
      sportType: SportType.PICKLEBALL,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.RESIN,
      hasLighting: true,
      defaultSlotMinutes: 60,
      minPlayers: 2,
      maxPlayers: 4,
    },
  });

  // Tarifas Club 2
  await prisma.pricingRule.createMany({
    data: [
      {
        clubId: club2.id,
        name: 'Tarifa Estándar Barcelona (L-V Mañanas)',
        isPeakHour: false,
        startTime: '08:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        memberPrice: 18.0,
        guestPrice: 26.0,
        lightSurcharge: 0.0,
        priority: 1,
      },
      {
        clubId: club2.id,
        name: 'Tarifa Tarde/Noche & Fines de Semana',
        isPeakHour: true,
        startTime: '17:00',
        endTime: '23:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
        memberPrice: 28.0,
        guestPrice: 36.0,
        lightSurcharge: 5.0,
        priority: 2,
      },
    ],
  });

  // Bloqueo Club 2
  await prisma.facilityBlock.create({
    data: {
      clubId: club2.id,
      facilityId: c2f1.id,
      title: 'Clínic Juvenil Federación Catalana',
      reason: 'Entrenamiento intensivo de jóvenes promesas',
      startTime: getRelativeDate(1, 9, 0),
      endTime: getRelativeDate(1, 13, 0),
    },
  });

  // Reservas Club 2
  const b4 = await prisma.booking.create({
    data: {
      clubId: club2.id,
      facilityId: c2f1.id,
      userId: memberUser.id,
      bookingType: BookingType.FULL,
      status: BookingStatus.CONFIRMED,
      startTime: getRelativeDate(0, 16, 30),
      endTime: getRelativeDate(0, 18, 0),
      totalPrice: 27.0,
      lightIncluded: false,
      notes: 'Partido preparatorio del torneo local',
    },
  });
  await prisma.bookingParticipant.createMany({
    data: [
      { bookingId: b4.id, userId: memberUser.id, isHost: true, slotNumber: 1, team: 'A', individualPrice: 6.75, status: ParticipantStatus.CONFIRMED },
      { bookingId: b4.id, userId: player1.id, isHost: false, slotNumber: 2, team: 'A', individualPrice: 6.75, status: ParticipantStatus.CONFIRMED },
      { bookingId: b4.id, userId: player2.id, isHost: false, slotNumber: 3, team: 'B', individualPrice: 6.75, status: ParticipantStatus.CONFIRMED },
      { bookingId: b4.id, userId: guestUser.id, isHost: false, slotNumber: 4, team: 'B', individualPrice: 6.75, status: ParticipantStatus.CONFIRMED },
    ],
  });

  const b5 = await prisma.booking.create({
    data: {
      clubId: club2.id,
      facilityId: c2f4.id,
      userId: player2.id,
      bookingType: BookingType.OPEN,
      status: BookingStatus.CONFIRMED,
      startTime: getRelativeDate(0, 19, 0),
      endTime: getRelativeDate(0, 20, 0),
      totalPrice: 16.0,
      lightIncluded: true,
      notes: 'Descubre el Pickleball. Todos los niveles bienvenidos.',
    },
  });
  await prisma.bookingParticipant.create({
    data: {
      bookingId: b5.id,
      userId: player2.id,
      isHost: true,
      slotNumber: 1,
      team: 'A',
      individualPrice: 8.0,
      status: ParticipantStatus.CONFIRMED,
    },
  });

  // ══════════════════════════════════════════════════════════════
  // CLUB 3: Sevilla - Sevilla Sport Center La Cartuja
  // ══════════════════════════════════════════════════════════════
  const club3 = await prisma.club.create({
    data: {
      name: 'Sevilla Sport Center La Cartuja',
      slug: 'sevilla-sport-center',
      description: 'Complejo deportivo moderno en La Cartuja con pádel, tenis y fútbol sala.',
      email: 'info@sevillapadel.local',
      phone: '+34950000003',
      address: 'Isla de la Cartuja, Sector Norte s/n',
      city: 'Sevilla',
      postalCode: '41092',
      openingHour: 8,
      closingHour: 23,
      slotDurationMinutes: 60,
      openGameMinNoticeHours: 2,
      paymentMode: PaymentMode.HYBRID,
      isActive: true,
    },
  });

  const club3Admin = await prisma.user.create({
    data: {
      email: 'admin@sevillapadel.local',
      password: clubAdminPassword,
      firstName: 'Roberto',
      lastName: 'Director Sevilla',
      phone: '+34611111113',
    },
  });

  // Membresías Club 3
  await prisma.clubMembership.createMany({
    data: [
      { userId: superAdmin.id, clubId: club3.id, role: ClubRole.OWNER, memberNumber: 'SA-SEV', walletBalance: 0 },
      { userId: club3Admin.id, clubId: club3.id, role: ClubRole.ADMIN, memberNumber: 'ADM-SEV-01', walletBalance: 0 },
      { userId: memberUser.id, clubId: club3.id, role: ClubRole.MEMBER, memberNumber: 'SOC-SEV-001', walletBalance: 35.0 },
      { userId: player3.id, clubId: club3.id, role: ClubRole.MEMBER, memberNumber: 'SOC-SEV-002', walletBalance: 18.0 },
      { userId: player4.id, clubId: club3.id, role: ClubRole.MEMBER, memberNumber: 'SOC-SEV-003', walletBalance: 22.0 },
    ],
  });

  // Instalaciones Club 3
  const c3f1 = await prisma.facility.create({
    data: {
      clubId: club3.id,
      name: 'Pista Guadalquivir - Cristal Indoor',
      sportType: SportType.PADEL,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.CRYSTAL,
      hasLighting: true,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
    },
  });
  const c3f2 = await prisma.facility.create({
    data: {
      clubId: club3.id,
      name: 'Pista Al-Ándalus - Panorámica Exterior',
      sportType: SportType.PADEL,
      courtType: CourtType.OUTDOOR,
      surfaceType: SurfaceType.SYNTHETIC_GRASS,
      hasLighting: true,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
    },
  });
  const c3f3 = await prisma.facility.create({
    data: {
      clubId: club3.id,
      name: 'Pabellón Fútbol Sala Parquet',
      sportType: SportType.FOOTBALL_7,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.PARQUET,
      hasLighting: true,
      defaultSlotMinutes: 60,
      minPlayers: 10,
      maxPlayers: 14,
    },
  });
  const c3f4 = await prisma.facility.create({
    data: {
      clubId: club3.id,
      name: 'Pista Squash 1 Cristal',
      sportType: SportType.SQUASH,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.PARQUET,
      hasLighting: true,
      defaultSlotMinutes: 45,
      minPlayers: 2,
      maxPlayers: 2,
    },
  });

  // Tarifas Club 3
  await prisma.pricingRule.createMany({
    data: [
      {
        clubId: club3.id,
        name: 'Tarifa Sevilla Valle (08:00 - 18:00)',
        isPeakHour: false,
        startTime: '08:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        memberPrice: 14.0,
        guestPrice: 20.0,
        lightSurcharge: 0.0,
        priority: 1,
      },
      {
        clubId: club3.id,
        name: 'Tarifa Sevilla Tarde y Noche (18:00 - 23:00)',
        isPeakHour: true,
        startTime: '18:00',
        endTime: '23:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
        memberPrice: 22.0,
        guestPrice: 30.0,
        lightSurcharge: 3.5,
        priority: 2,
      },
    ],
  });

  // Bloqueo Club 3
  await prisma.facilityBlock.create({
    data: {
      clubId: club3.id,
      facilityId: c3f1.id,
      title: 'Limpieza y mantenimiento de moqueta',
      reason: 'Cepillado y reposición de arena de sílice',
      startTime: getRelativeDate(0, 13, 0),
      endTime: getRelativeDate(0, 15, 0),
    },
  });

  // Reservas Club 3
  const b6 = await prisma.booking.create({
    data: {
      clubId: club3.id,
      facilityId: c3f1.id,
      userId: memberUser.id,
      bookingType: BookingType.FULL,
      status: BookingStatus.CONFIRMED,
      startTime: getRelativeDate(0, 10, 30),
      endTime: getRelativeDate(0, 12, 0),
      totalPrice: 21.0,
      lightIncluded: false,
      notes: 'Reto mensual de pádel Cartuja',
    },
  });
  await prisma.bookingParticipant.createMany({
    data: [
      { bookingId: b6.id, userId: memberUser.id, isHost: true, slotNumber: 1, team: 'A', individualPrice: 5.25, status: ParticipantStatus.CONFIRMED },
      { bookingId: b6.id, userId: player3.id, isHost: false, slotNumber: 2, team: 'A', individualPrice: 5.25, status: ParticipantStatus.CONFIRMED },
      { bookingId: b6.id, userId: player4.id, isHost: false, slotNumber: 3, team: 'B', individualPrice: 5.25, status: ParticipantStatus.CONFIRMED },
      { bookingId: b6.id, userId: guestUser.id, isHost: false, slotNumber: 4, team: 'B', individualPrice: 5.25, status: ParticipantStatus.CONFIRMED },
    ],
  });

  const b7 = await prisma.booking.create({
    data: {
      clubId: club3.id,
      facilityId: c3f2.id,
      userId: player4.id,
      bookingType: BookingType.OPEN,
      status: BookingStatus.CONFIRMED,
      startTime: getRelativeDate(0, 19, 30),
      endTime: getRelativeDate(0, 21, 0),
      totalPrice: 25.5,
      lightIncluded: true,
      notes: 'Partido abierto nocturno nivel 4.0+. Faltan 2 plazas.',
    },
  });
  await prisma.bookingParticipant.createMany({
    data: [
      { bookingId: b7.id, userId: player4.id, isHost: true, slotNumber: 1, team: 'A', individualPrice: 6.37, status: ParticipantStatus.CONFIRMED },
      { bookingId: b7.id, userId: player3.id, isHost: false, slotNumber: 2, team: 'A', individualPrice: 6.37, status: ParticipantStatus.CONFIRMED },
    ],
  });

  console.log('✅ Seed completado con éxito:');
  console.log('   - 3 Clubes creados: Madrid, Barcelona, Sevilla.');
  console.log('   - 12 Instalaciones deportivas (Pádel indoor/outdoor, Tenis, Fútbol 7, Pickleball, Squash).');
  console.log('   - 6 Reglas de precios (Valle y Punta por club).');
  console.log('   - 3 Bloqueos de mantenimiento programados.');
  console.log('   - 7 Reservas activas (partidos completos y abiertos) con participantes y pagos.');
  console.log('   - Usuarios configurados:');
  console.log('       👑 SuperAdmin: superadmin@spt-app.local / SuperAdmin123! (OWNER en los 3 clubes)');
  console.log('       🎾 Socio Multi-Club: socio@spt-app.local / Player123! (MEMBER en Madrid, Barcelona y Sevilla)');
  console.log('       👤 Invitado: invitado@spt-app.local / Player123!');
  console.log('       👔 Admins locales: admin@centralpadel.local, admin@barcelonapadel.local, admin@sevillapadel.local');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
