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
      dni: '47931799',
      level: 1,
      points: 0,
      totalPointsEarned: 0,
      totalWorkouts: 0,
      totalClasses: 0,
      currentStreak: 0,
      longestStreak: 0,
    },
    create: {
      id: 'user_demo_001',
      name: 'Usuario Demo',
      email: 'demo@quantumfit.com',
      passwordHash: demoPassword,
      dni: '47931799',
      level: 1,
      points: 0,
      totalPointsEarned: 0,
      totalWorkouts: 0,
      totalClasses: 0,
      currentStreak: 0,
      longestStreak: 0,
      memberSince: new Date(),
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
    update: {
      title: 'Transformá tu cuerpo,<br />evolucioná tu mente',
      subtitle: 'Transformación física y mental',
      description: 'En Quantum Fit no es solo entrenar. Es descubrir tu mejor versión. Entrenamiento de élite, nutrición inteligente y una comunidad que te impulsa.',
      ctaText: 'Ver planes',
      ctaLink: '#ofertas',
    },
    create: {
      id: 'landing_hero_001',
      section: 'hero',
      title: 'Transformá tu cuerpo,<br />evolucioná tu mente',
      subtitle: 'Transformación física y mental',
      description: 'En Quantum Fit no es solo entrenar. Es descubrir tu mejor versión. Entrenamiento de élite, nutrición inteligente y una comunidad que te impulsa.',
      ctaText: 'Ver planes',
      ctaLink: '#ofertas',
      isActive: true,
      order: 0,
    },
  });

  // About
  await prisma.landingContent.upsert({
    where: { id: 'landing_about_001' },
    update: {
      title: 'Excelencia en movimiento',
      description: 'En Quantum Fit combinamos entrenamiento de élite con un ambiente único. Instalaciones de primera, instructores certificados y una comunidad que te impulsa a dar lo mejor.',
    },
    create: {
      id: 'landing_about_001',
      section: 'about',
      title: 'Excelencia en movimiento',
      description: 'En Quantum Fit combinamos entrenamiento de élite con un ambiente único. Instalaciones de primera, instructores certificados y una comunidad que te impulsa a dar lo mejor.',
      isActive: true,
      order: 0,
    },
  });

  // Testimonials
  const landingTestimonials = [
    { id: 'test_001', name: 'Lucía Gómez', role: 'Miembro desde 2023', text: 'Desde que entreno en Quantum Fit mi vida cambió completamente. La energía del lugar y el acompañamiento de los profesores es increíble. Bajé 15 kilos y gané mucha más confianza.', photoUrl: null, rating: 5, order: 0 },
    { id: 'test_002', name: 'Martín Pérez', role: 'Miembro desde 2024', text: 'El plan Premium vale cada peso. Las clases grupales son espectaculares y el plan de nutrición me ayudó a entender cómo alimentarme realmente. Recomendado al 100%.', photoUrl: null, rating: 5, order: 1 },
    { id: 'test_003', name: 'Camila Rodríguez', role: 'Miembro VIP desde 2022', text: 'Probé varios gimnasios pero ninguno como Quantum Fit. La atención personalizada, la calidad de las máquinas y el ambiente hacen la diferencia. Socio VIP y no cambio este lugar por nada.', photoUrl: null, rating: 5, order: 2 },
  ];

  for (const t of landingTestimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: { name: t.name, role: t.role, text: t.text, photoUrl: t.photoUrl, rating: t.rating, order: t.order },
      create: t,
    });
  }

  // Plans
  const landingPlans = [
    {
      id: 'plan_001',
      name: 'Básico',
      price: 8000,
      period: 'mensual',
      currency: 'ARS',
      features: ['Acceso a una sede', 'Horario libre (8-22hs)', 'Evaluación física inicial', 'App de seguimiento'],
      isFeatured: false,
      order: 1,
    },
    {
      id: 'plan_002',
      name: 'Premium',
      price: 12000,
      period: 'mensual',
      currency: 'ARS',
      features: ['Acceso a todas las sedes', 'Horario extendido (6-23hs)', 'Clases grupales ilimitadas', 'Plan de nutrición personalizado', 'App de seguimiento'],
      isFeatured: true,
      order: 2,
    },
    {
      id: 'plan_003',
      name: 'VIP',
      price: 18000,
      period: 'mensual',
      currency: 'ARS',
      features: ['Acceso ilimitado a todas las sedes', 'Horario 24/7', 'Entrenador personal incluido', 'Clases grupales ilimitadas', 'Plan de nutrición personalizado', 'App de seguimiento premium'],
      isFeatured: false,
      order: 3,
    },
    {
      id: 'plan_004',
      name: 'Plan Anual',
      price: 42000,
      period: 'anual',
      currency: 'ARS',
      features: ['Todo del plan semestral', '6 meses gratis', 'Merchandising oficial', 'Invitado gratis cada mes'],
      isFeatured: false,
      order: 4,
    },
  ];

  for (const p of landingPlans) {
    await prisma.plan.upsert({
      where: { id: p.id },
      update: p,
      create: p,
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
    { id: 'gal_007', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop', alt: 'Boxeo y artes marciales', category: 'clases', order: 2 },
    { id: 'gal_008', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop', alt: 'Zona de pesas libre', category: 'instalaciones', order: 3 },
  ];

  for (const img of galleryImages) {
    await prisma.galleryImage.upsert({
      where: { id: img.id },
      update: img,
      create: img,
    });
  }

  // Gyms (Sedes)
  const landingGyms = [
    {
      id: 'gym_centro',
      name: 'Sede Centro',
      address: 'Av. Corrientes 1234, CABA',
      city: 'CABA',
      phone: '+54 11 1234-5678',
      hours: 'Lun a Vie: 6:00 - 23:00 | Sáb: 8:00 - 20:00',
      latitude: -34.6037,
      longitude: -58.3816,
      isActive: true,
    },
    {
      id: 'gym_belgrano',
      name: 'Sede Belgrano',
      address: 'Av. Cabildo 2345, CABA',
      city: 'CABA',
      phone: '+54 11 2345-6789',
      hours: 'Lun a Vie: 6:00 - 23:00 | Sáb: 8:00 - 20:00',
      latitude: -34.5630,
      longitude: -58.4580,
      isActive: true,
    },
  ];

  for (const gym of landingGyms) {
    await prisma.gym.upsert({
      where: { id: gym.id },
      update: gym,
      create: gym,
    });
  }

  console.log('✅ Contenido de Landing Page creado');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN:');
   console.log(`   • ${achievements.length} Logros`);
   console.log(`   • 1 Gimnasio (seed principal) + ${landingGyms.length} Sedes`);
   console.log(`   • 1 Administrador`);
   console.log(`   • 1 Usuario Demo`);
   console.log(`   • ${rewards.length} Recompensas`);
   console.log(`   • 2 Contenidos Landing (hero, about)`);
   console.log(`   • ${landingTestimonials.length} Testimonios`);
   console.log(`   • ${landingPlans.length} Planes`);
   console.log(`   • ${galleryImages.length} Imágenes de Galería`);

  // ============================================
  // 8. Cursos
  // ============================================
  console.log('📚 Creando cursos...');
  const courses = [
    { id: 'course_001', name: 'CrossFit', description: 'Entrenamiento funcional de alta intensidad para mejorar tu condición física general.', imageUrl: '', isActive: true, order: 0 },
    { id: 'course_002', name: 'Musculación', description: 'Desarrollá fuerza y masa muscular con equipamiento de última generación.', imageUrl: '', isActive: true, order: 1 },
    { id: 'course_003', name: 'Funcional', description: 'Ejercicios que imitan movimientos de la vida diaria para un cuerpo equilibrado.', imageUrl: '', isActive: true, order: 2 },
    { id: 'course_004', name: 'Yoga', description: 'Encontrá el equilibrio entre cuerpo y mente con nuestras clases guiadas.', imageUrl: '', isActive: true, order: 3 },
    { id: 'course_005', name: 'Boxeo', description: 'Liberá estrés y mejorá tu condición cardiovascular con técnicas de boxeo.', imageUrl: '', isActive: true, order: 4 },
    { id: 'course_006', name: 'Spinning', description: 'Clases de ciclismo indoor con música motivante y entrenadores expertos.', imageUrl: '', isActive: true, order: 5 },
    { id: 'course_007', name: 'Pilates', description: 'Fortalece tu core y mejora tu postura con ejercicios controlados.', imageUrl: '', isActive: true, order: 6 },
    { id: 'course_008', name: 'Personalizado', description: 'Programas diseñados a tu medida con un coach profesional.', imageUrl: '', isActive: true, order: 7 },
  ];
  for (const c of courses) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`✅ ${courses.length} cursos creados`);

  // ============================================
  // 9. Buffet Items
  // ============================================
  console.log('🥤 Creando items de buffet...');
  const buffetItems = [
    { id: 'buf_001', name: 'Whey Shake', description: 'Batido de proteína de suero de leche', price: 800, category: 'batidos', imageUrl: '', isActive: true, order: 0 },
    { id: 'buf_002', name: 'Protein Blast', description: 'Batido con doble proteína y banana', price: 950, category: 'batidos', imageUrl: '', isActive: true, order: 1 },
    { id: 'buf_003', name: 'Verde Detox', description: 'Licuado de espinaca, manzana y jengibre', price: 700, category: 'licuados', imageUrl: '', isActive: true, order: 0 },
    { id: 'buf_004', name: 'Energía Natural', description: 'Licuado de frutos rojos y avena', price: 750, category: 'licuados', imageUrl: '', isActive: true, order: 1 },
    { id: 'buf_005', name: 'Espresso', description: 'Café espresso italiano', price: 400, category: 'cafeteria', imageUrl: '', isActive: true, order: 0 },
    { id: 'buf_006', name: 'Café con Leche', description: 'Café con leche vegetal o común', price: 500, category: 'cafeteria', imageUrl: '', isActive: true, order: 1 },
    { id: 'buf_007', name: 'Barra de Proteína', description: 'Barra energética alta en proteínas', price: 350, category: 'snacks', imageUrl: '', isActive: true, order: 0 },
    { id: 'buf_008', name: 'Mix de Frutos Secos', description: 'Mix de almendras, nueces y castañas', price: 450, category: 'snacks', imageUrl: '', isActive: true, order: 1 },
    { id: 'buf_009', name: 'Creatina', description: 'Monohidrato de creatina 300g', price: 2500, category: 'suplementacion', imageUrl: '', isActive: true, order: 0 },
    { id: 'buf_010', name: 'BCAA', description: 'Aminoácidos ramificados 200g', price: 2000, category: 'suplementacion', imageUrl: '', isActive: true, order: 1 },
  ];
  for (const item of buffetItems) {
    await prisma.buffetItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`✅ ${buffetItems.length} items de buffet creados`);

  // ============================================
  // 10. Noticias
  // ============================================
  console.log('📰 Creando noticias...');
  const newsItems = [
    { id: 'news_001', title: 'Nuevo equipamiento de última generación', summary: 'Incorporamos máquinas de última tecnología para tu entrenamiento.', content: 'En Quantum Fit seguimos innovando. Ahora contamos con nuevas máquinas de última generación que te permitirán entrenar de forma más eficiente y segura. ¡Venía a probarlas!', imageUrl: '', author: 'Quantum Fit', publishedAt: new Date().toISOString(), isActive: true },
    { id: 'news_002', title: 'Llega el Quantum Fit Challenge 2026', summary: 'Inscripciones abiertas para el desafío anual de transformación.', content: 'El desafío más esperado del año está por comenzar. 12 semanas de entrenamiento intensivo, nutrición guiada y premios increíbles. ¡Inscribite ya!', imageUrl: '', author: 'Quantum Fit', publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(), isActive: true },
    { id: 'news_003', title: 'Nuevos horarios de clases nocturnas', summary: 'Ampliamos nuestra oferta horaria para adaptarnos a tu rutina.', content: 'Ahora podés entrenar hasta más tarde. Sumamos nuevos horarios nocturnos de clases grupales para que no te pierdas tu entrenamiento.', imageUrl: '', author: 'Quantum Fit', publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(), isActive: true },
  ];
  for (const n of newsItems) {
    await prisma.news.upsert({
      where: { id: n.id },
      update: n,
      create: n,
    });
  }
  console.log(`✅ ${newsItems.length} noticias creadas`);

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
