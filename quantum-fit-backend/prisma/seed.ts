// Seed para datos iniciales de QUANTUM FIT
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // ============================================
  // 1. Logros (Achievements)
  // ============================================
  console.log('📍 Creando logros...');

  const achievements = [
    {
      id: 'ach_001',
      name: 'Primera Visita',
      description: 'Completa tu primera sesión en QUANTUM FIT',
      icon: '🎯',
      achievementType: 'first_checkin',
      requirementType: 'count',
      requirementValue: 1,
      pointsReward: 50,
      category: 'ASISTENCIA',
      displayOrder: 1,
    },
    {
      id: 'ach_002',
      name: 'Constante',
      description: 'Mantén una racha de 7 días consecutivos',
      icon: '🔥',
      achievementType: 'streak',
      requirementType: 'count',
      requirementValue: 7,
      pointsReward: 100,
      category: 'ASISTENCIA',
      displayOrder: 2,
    },
    {
      id: 'ach_003',
      name: 'Imparable',
      description: 'Mantén una racha de 30 días consecutivos',
      icon: '💥',
      achievementType: 'streak',
      requirementType: 'count',
      requirementValue: 30,
      pointsReward: 500,
      category: 'ASISTENCIA',
      displayOrder: 3,
    },
    {
      id: 'ach_004',
      name: 'Semana Perfecta',
      description: 'Asiste los 7 días de una semana',
      icon: '👑',
      achievementType: 'perfect_week',
      requirementType: 'count',
      requirementValue: 1,
      pointsReward: 200,
      category: 'ESPECIAL',
      displayOrder: 4,
    },
    {
      id: 'ach_005',
      name: 'Guerrero',
      description: 'Completa 25 entrenamientos',
      icon: '💪',
      achievementType: 'total_workouts',
      requirementType: 'count',
      requirementValue: 25,
      pointsReward: 200,
      category: 'RUTINA',
      displayOrder: 5,
    },
    {
      id: 'ach_006',
      name: 'Bestia',
      description: 'Completa 100 entrenamientos',
      icon: '🦍',
      achievementType: 'total_workouts',
      requirementType: 'count',
      requirementValue: 100,
      pointsReward: 500,
      category: 'RUTINA',
      displayOrder: 6,
    },
    {
      id: 'ach_007',
      name: 'Leyenda',
      description: 'Completa 500 entrenamientos',
      icon: '🐉',
      achievementType: 'total_workouts',
      requirementType: 'count',
      requirementValue: 500,
      pointsReward: 1000,
      category: 'RUTINA',
      displayOrder: 7,
    },
    {
      id: 'ach_008',
      name: 'Cazador de Puntos',
      description: 'Acumula 1000 puntos totales',
      icon: '💎',
      achievementType: 'points_earned',
      requirementType: 'count',
      requirementValue: 1000,
      pointsReward: 150,
      category: 'ACTIVIDAD',
      displayOrder: 8,
    },
    {
      id: 'ach_009',
      name: 'Nivel 5',
      description: 'Alcanza el nivel 5',
      icon: '⭐',
      achievementType: 'level_reached',
      requirementType: 'count',
      requirementValue: 5,
      pointsReward: 250,
      category: 'ASISTENCIA',
      displayOrder: 9,
    },
    {
      id: 'ach_010',
      name: 'Nivel 10',
      description: 'Alcanza el nivel 10',
      icon: '🌟',
      achievementType: 'level_reached',
      requirementType: 'count',
      requirementValue: 10,
      pointsReward: 500,
      category: 'ASISTENCIA',
      displayOrder: 10,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ ${achievements.length} logros creados/actualizados`);

  // ============================================
  // 2. Gimnasios
  // ============================================
  console.log('🏋️ Creando gimnasios...');

  const gym = await prisma.gym.upsert({
    where: { id: 'gym_001' },
    update: {
      name: 'QUANTUM FIT - Sede Central',
      address: 'Av. Principal 1234, Ciudad',
      city: 'Buenos Aires',
      latitude: -34.6037,
      longitude: -58.3816,
      geofenceRadiusMeters: 50,
    },
    create: {
      id: 'gym_001',
      name: 'QUANTUM FIT - Sede Central',
      address: 'Av. Principal 1234, Ciudad',
      city: 'Buenos Aires',
      latitude: -34.6037,
      longitude: -58.3816,
      geofenceRadiusMeters: 50,
      checkInEnabled: true,
      qrCodeEnabled: true,
    },
  });

  console.log(`✅ Gimnasio creado: ${gym.name}`);

  // ============================================
  // 3. Usuario Administrador
  // ============================================
  console.log('👤 Creando administrador...');

  const bcrypt = await import('bcryptjs');
  const adminPassword = await bcrypt.default.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@quantumfit.com' },
    update: {
      name: 'Administrador',
      passwordHash: adminPassword,
    },
    create: {
      id: 'user_admin_001',
      name: 'Administrador',
      email: 'admin@quantumfit.com',
      passwordHash: adminPassword,
      level: 1,
      points: 0,
      totalPointsEarned: 0,
    },
  });

  await prisma.staff.upsert({
    where: { userId: admin.id },
    update: { role: 'ADMIN' },
    create: {
      userId: admin.id,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Administrador creado: admin@quantumfit.com / Admin123!`);

  // ============================================
  // 4. Usuario Demo (para testing)
  // ============================================
  console.log('👤 Creando usuario demo...');

  const demoPassword = await bcrypt.default.hash('Demo123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@quantumfit.com' },
    update: {
      name: 'Usuario Demo',
      passwordHash: demoPassword,
      level: 5,
      points: 2450,
      totalPointsEarned: 3500,
      totalWorkouts: 47,
      totalClasses: 30,
      currentStreak: 12,
      longestStreak: 21,
    },
    create: {
      id: 'user_demo_001',
      name: 'Usuario Demo',
      email: 'demo@quantumfit.com',
      passwordHash: demoPassword,
      level: 5,
      points: 2450,
      totalPointsEarned: 3500,
      totalWorkouts: 47,
      totalClasses: 30,
      currentStreak: 12,
      longestStreak: 21,
      memberSince: new Date('2024-01-15'),
    },
  });

  console.log(`✅ Usuario demo creado: demo@quantumfit.com / Demo123!`);

  // ============================================
  // 5. Recompensas (Rewards)
  // ============================================
  console.log('🎁 Creando recompensas...');

  const rewards = [
    {
      id: 'reward_001',
      name: 'Proteína Whey',
      description: 'Batido de proteína post-entreno (30g)',
      pointsCost: 500,
      category: 'PRODUCTO',
      stockTotal: 50,
      stockAvailable: 50,
      isActive: true,
    },
    {
      id: 'reward_002',
      name: 'Smoothie Energético',
      description: 'Smoothie natural de frutas y energía',
      pointsCost: 300,
      category: 'BEBIDA',
      stockTotal: 100,
      stockAvailable: 100,
      isActive: true,
    },
    {
      id: 'reward_003',
      name: '10% Descuento Membresía',
      description: 'Descuento aplicable a tu próxima renovación',
      pointsCost: 2000,
      category: 'DESCUENTO',
      stockTotal: 20,
      stockAvailable: 20,
      isActive: true,
      isFeatured: true,
    },
    {
      id: 'reward_004',
      name: 'Camiseta QUANTUM',
      description: 'Camiseta oficial del gimnasio',
      pointsCost: 1500,
      category: 'PRODUCTO',
      stockTotal: 30,
      stockAvailable: 30,
      isActive: true,
    },
    {
      id: 'reward_005',
      name: 'Sesión con Entrenador',
      description: 'Sesión personalizada de 30 minutos',
      pointsCost: 1000,
      category: 'PROMOCION',
      stockTotal: 10,
      stockAvailable: 10,
      isActive: true,
    },
    {
      id: 'reward_006',
      name: 'Barra Proteica',
      description: 'Barra energética alta en proteínas',
      pointsCost: 200,
      category: 'BEBIDA',
      stockTotal: 200,
      stockAvailable: 200,
      isActive: true,
    },
    {
      id: 'reward_007',
      name: 'Toalla Premium',
      description: 'Toalla de microfibra QUANTUM FIT',
      pointsCost: 800,
      category: 'PRODUCTO',
      stockTotal: 25,
      stockAvailable: 25,
      isActive: true,
    },
    {
      id: 'reward_008',
      name: 'Mes Libre de Guest Pass',
      description: 'Invita a un amigo gratis por un mes',
      pointsCost: 1200,
      category: 'PROMOCION',
      stockTotal: 15,
      stockAvailable: 15,
      isActive: true,
    },
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { id: reward.id },
      update: reward,
      create: reward,
    });
  }

  console.log(`✅ ${rewards.length} recompensas creadas`);

  // ============================================
  // 6. Clases de Ejemplo
  // ============================================
  console.log('📅 Creando clases de ejemplo...');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const classes = [
    {
      name: 'CrossFit Intensivo',
      instructorName: 'Mike Johnson',
      startTime: new Date(new Date().setHours(18, 0, 0, 0)),
      endTime: new Date(new Date().setHours(19, 0, 0, 0)),
      durationMinutes: 60,
      activityType: 'CrossFit',
      difficultyLevel: 'INTERMEDIO',
      totalSpots: 20,
      bookedSpots: 15,
      location: 'Sala Principal',
    },
    {
      name: 'Yoga Flow',
      instructorName: 'Sarah Williams',
      startTime: new Date(new Date().setHours(19, 30, 0, 0)),
      endTime: new Date(new Date().setHours(20, 45, 0, 0)),
      durationMinutes: 75,
      activityType: 'Yoga',
      difficultyLevel: 'PRINCIPIANTE',
      totalSpots: 15,
      bookedSpots: 8,
      location: 'Sala B',
    },
    {
      name: 'HIIT Training',
      instructorName: 'Carlos Rodriguez',
      startTime: new Date(tomorrow.setHours(7, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(7, 45, 0, 0)),
      durationMinutes: 45,
      activityType: 'HIIT',
      difficultyLevel: 'AVANZADO',
      totalSpots: 25,
      bookedSpots: 20,
      location: 'Sala Principal',
    },
  ];

  // Nota: Las clases se crearían normalmente mediante la API
  // Este es solo un ejemplo de estructura

  console.log('✅ Seed completado exitosamente!');
  console.log('');

  // ============================================
  // 7. Landing Page - Contenido Inicial
  // ============================================
  console.log('🌐 Creando contenido de Landing Page...');

  // Hero
  await prisma.landingContent.upsert({
    where: { id: 'landing_hero_001' },
    update: {},
    create: {
      id: 'landing_hero_001',
      section: 'hero',
      title: 'Transformá tu cuerpo, ganá premios',
      subtitle: 'El primer gimnasio gamificado de Argentina',
      description: 'Entrená, competí y canjeá puntos por premios reales. La experiencia fitness más innovadora.',
      ctaText: 'Empezar ahora',
      ctaLink: '#planes',
      isActive: true,
      order: 0,
    },
  });

  // Features
  const features = [
    { id: 'landing_feat_001', section: 'features', title: '🏋️ Gamificación', description: 'Ganá puntos por cada entrenamiento. Cada sesión suma, cada racha multiplica.', order: 0 },
    { id: 'landing_feat_002', section: 'features', title: '🏆 Competencia', description: 'Competí en el ranking con otros miembros. Los mejores ganan premios extra.', order: 1 },
    { id: 'landing_feat_003', section: 'features', title: '🎁 Premios Reales', description: 'Canjeá tus puntos por proteínas, bebidas, descuentos y más.', order: 2 },
  ];

  for (const feat of features) {
    await prisma.landingContent.upsert({
      where: { id: feat.id },
      update: {},
      create: feat,
    });
  }

  // About
  await prisma.landingContent.upsert({
    where: { id: 'landing_about_001' },
    update: {},
    create: {
      id: 'landing_about_001',
      section: 'about',
      title: 'Más que un gimnasio',
      description: 'QUANTUM FIT es una experiencia completa donde cada entrenamiento cuenta. Nuestro sistema de gamificación único te motiva a dar lo mejor de vos.',
      isActive: true,
      order: 0,
    },
  });

  // Contact
  await prisma.landingContent.upsert({
    where: { id: 'landing_contact_001' },
    update: {},
    create: {
      id: 'landing_contact_001',
      section: 'contact',
      title: 'Visitanos',
      description: 'Av. Principal 1234, Buenos Aires\nLunes a Viernes: 6:00 - 22:00\nSábados: 8:00 - 14:00\n\n📞 +54 11 1234-5678\n✉️ info@quantumfit.com',
      ctaText: 'Ver en mapa',
      ctaLink: 'https://maps.google.com',
      isActive: true,
      order: 0,
    },
  });

  // Testimonials
  const landingTestimonials = [
    { id: 'test_001', name: 'María García', role: 'Miembro desde 2024', text: 'El sistema de puntos me motiva a venir todos los días. Ya voy nivel 5 y canjeé mi primera proteína. ¡Increíble!', photoUrl: '', rating: 5, order: 0 },
    { id: 'test_002', name: 'Carlos Rodríguez', role: 'Miembro VIP', text: 'Las clases son increíbles y los premios reales. El mejor gimnasio en el que estuve.', photoUrl: '', rating: 5, order: 1 },
    { id: 'test_003', name: 'Laura Martínez', role: 'Miembro desde 2024', text: 'La comunidad es genial. Competir en el ranking me hace dar lo mejor cada día.', photoUrl: '', rating: 5, order: 2 },
  ];

  for (const t of landingTestimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }

  // Plans
  const landingPlans = [
    {
      id: 'plan_001',
      name: 'Básico',
      description: 'Ideal para empezar',
      price: 15000,
      period: 'mensual',
      features: ['Acceso a sala de musculación', 'Clases grupales ilimitadas', 'App con gamificación', 'Seguimiento de progreso'],
      isFeatured: false,
      order: 0,
    },
    {
      id: 'plan_002',
      name: 'VIP',
      description: 'El más elegido',
      price: 25000,
      period: 'mensual',
      features: ['Todo lo del Básico', 'Entrenador personal básico', 'Premios exclusivos VIP', 'Puntos dobles', 'Acceso prioritario a clases'],
      isFeatured: true,
      order: 1,
    },
    {
      id: 'plan_003',
      name: 'Anual',
      description: 'Ahorrá 2 meses',
      price: 150000,
      period: 'anual',
      features: ['Todo lo del VIP', '2 meses gratis', 'Banner exclusivo en la app', 'Regalo de bienvenida', 'Congelamiento de membresía'],
      isFeatured: false,
      order: 2,
    },
  ];

  for (const p of landingPlans) {
    await prisma.plan.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // Banners
  const landingBanners = [
    {
      id: 'banner_001',
      title: '¡Semana de prueba gratis!',
      subtitle: 'Probá QUANTUM FIT por 7 días sin costo',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=300&fit=crop',
      linkUrl: '#planes',
      linkText: 'Quiero probar',
      order: 0,
    },
    {
      id: 'banner_002',
      title: 'Nuevo: Clases de Boxing',
      subtitle: 'Sumamos la disciplina del ring a nuestras clases',
      imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=300&fit=crop',
      linkUrl: '#clases',
      linkText: 'Ver horarios',
      order: 1,
    },
  ];

  for (const b of landingBanners) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    });
  }

  // Gallery
  const galleryImages = [
    { id: 'gal_001', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', alt: 'Sala de musculación', category: 'instalaciones', order: 0 },
    { id: 'gal_002', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop', alt: 'Clase de CrossFit', category: 'clases', order: 0 },
    { id: 'gal_003', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop', alt: 'Clase grupal', category: 'clases', order: 1 },
    { id: 'gal_004', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop', alt: 'Zona de estiramiento', category: 'instalaciones', order: 1 },
    { id: 'gal_005', url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop', alt: 'Equipamiento', category: 'instalaciones', order: 2 },
    { id: 'gal_006', url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop', alt: 'Evento del gimnasio', category: 'eventos', order: 0 },
  ];

  for (const img of galleryImages) {
    await prisma.galleryImage.upsert({
      where: { id: img.id },
      update: {},
      create: img,
    });
  }

  console.log('✅ Contenido de Landing Page creado');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN:');
  console.log(`   • ${achievements.length} Logros`);
  console.log(`   • 1 Gimnasio`);
  console.log(`   • 1 Administrador`);
  console.log(`   • 1 Usuario Demo`);
  console.log(`   • ${rewards.length} Recompensas`);
  console.log(`   • 5 Contenidos Landing (hero, features, about, contact)`);
  console.log(`   • ${landingTestimonials.length} Testimonios`);
  console.log(`   • ${landingPlans.length} Planes`);
  console.log(`   • ${landingBanners.length} Banners`);
  console.log(`   • ${galleryImages.length} Imágenes de Galería`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('🔐 CREDENCIALES:');
  console.log('   Admin: admin@quantumfit.com / Admin123!');
  console.log('   Demo:  demo@quantumfit.com / Demo123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
