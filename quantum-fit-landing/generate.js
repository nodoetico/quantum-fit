const fs = require('fs');

const content = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="QUANTUM FIT - El Gimnasio del Futuro">
  <style>
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
      padding-top: 5rem;
      width: 100%;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .hero-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.7)),
                  radial-gradient(ellipse at 20% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 50%, rgba(191, 0, 255, 0.08) 0%, transparent 50%);
      z-index: 1;
    }

    .hero-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80') center/cover no-repeat;
      opacity: 0.4;
      z-index: 0;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 0;
    }

    .hero-badge {
      display: inline-block;
      padding: 0.5rem 1.5rem;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.3);
      border-radius: 9999px;
      color: var(--neon-blue);
      font-family: 'Orbitron', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 2rem;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
    }

    .hero-title {
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 900;
      line-height: 1;
      margin-bottom: 1.5rem;
      letter-spacing: -1px;
    }

    .hero-title .line1 {
      display: block;
      color: var(--text-primary);
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
    }

    .hero-title .line2 {
      display: block;
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple), var(--neon-pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 20px rgba(0, 240, 255, 0.4));
    }

    .hero-subtitle {
      font-size: 1.3rem;
      color: var(--text-secondary);
      margin-bottom: 2.5rem;
      font-weight: 500;
      letter-spacing: 1px;
    }

    .hero-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 4rem;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      max-width: 600px;
      margin: 0 auto;
      padding-top: 3rem;
      border-top: 1px solid rgba(0, 240, 255, 0.1);
    }

    .stat-item { text-align: center; }

    .stat-number {
      font-family: 'Orbitron', sans-serif;
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-green));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* About Section */
    .about-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      align-items: center;
    }

    .about-text h3 {
      font-size: 1.5rem;
      color: var(--neon-blue);
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .about-text p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      line-height: 1.8;
      margin-bottom: 1.5rem;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 2rem;
    }

    .value-card {
      text-align: center;
      padding: 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      transition: all 0.3s ease;
    }

    .value-card:hover {
      border-color: rgba(0, 240, 255, 0.4);
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.15);
      transform: translateY(-5px);
    }

    .value-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      display: block;
    }

    .value-card h4 {
      font-size: 0.9rem;
      color: var(--neon-blue);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .value-card p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .about-image {
      position: relative;
      border-radius: 1.5rem;
      overflow: hidden;
      border: 1px solid rgba(0, 240, 255, 0.2);
      box-shadow: 0 0 60px rgba(0, 240, 255, 0.1);
    }

    .about-image img {
      width: 100%;
      height: 500px;
      object-fit: cover;
    }

    @media (max-width: 768px) {
      .about-image { order: -1; }
      .about-image img { height: 300px; }
    }

    /* Classes Section */
    .classes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .class-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 2rem 1.5rem;
      text-align: center;
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
    }

    .class-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .class-card:hover::before { transform: scaleX(1); }

    .class-card:hover {
      border-color: rgba(0, 240, 255, 0.5);
      box-shadow: 0 10px 40px rgba(0, 240, 255, 0.2), 0 0 60px rgba(191, 0, 255, 0.1);
      transform: translateY(-10px);
    }

    .class-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
      filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.5));
    }

    .class-card h3 {
      font-size: 1rem;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .class-card p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    /* Pricing Section */
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .pricing-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      text-align: center;
      position: relative;
      transition: all 0.4s ease;
    }

    .pricing-card.featured {
      border-color: rgba(0, 240, 255, 0.5);
      box-shadow: 0 0 40px rgba(0, 240, 255, 0.2), 0 0 80px rgba(191, 0, 255, 0.1);
      transform: scale(1.05);
    }

    .pricing-card.featured::before {
      content: 'ELITE';
      position: absolute;
      top: -1rem;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
      color: #000;
      padding: 0.5rem 2rem;
      border-radius: 9999px;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 2px;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
    }

    .pricing-card:hover {
      transform: translateY(-10px);
      border-color: rgba(0, 240, 255, 0.4);
      box-shadow: 0 10px 50px rgba(0, 240, 255, 0.15);
    }

    .pricing-card.featured:hover {
      transform: scale(1.05) translateY(-10px);
    }

    .pricing-name {
      font-size: 1.2rem;
      color: var(--neon-blue);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 1rem;
    }

    .pricing-price { margin-bottom: 2rem; }

    .pricing-price .amount {
      font-family: 'Orbitron', sans-serif;
      font-size: 3rem;
      font-weight: 900;
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-green));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .pricing-price .period {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .pricing-features {
      list-style: none;
      margin-bottom: 2rem;
      text-align: left;
    }

    .pricing-features li {
      padding: 0.75rem 0;
      color: var(--text-secondary);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .pricing-features li::before {
      content: '✓';
      color: var(--neon-green);
      font-weight: 700;
      text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
    }

    @media (max-width: 480px) {
      .pricing-card { padding: 2rem 1.5rem; }
    }

    /* Testimonials Section */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .testimonial-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      padding: 2rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .testimonial-card::before {
      content: '"';
      position: absolute;
      top: 1rem;
      right: 1.5rem;
      font-size: 4rem;
      color: rgba(0, 240, 255, 0.1);
      font-family: 'Orbitron', sans-serif;
    }

    .testimonial-card:hover {
      border-color: rgba(0, 240, 255, 0.4);
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.15);
    }

    .testimonial-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .testimonial-avatar {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 9999px;
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      font-size: 1.2rem;
      color: #000;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
    }

    .testimonial-name {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 1.1rem;
    }

    .testimonial-role {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .testimonial-stars {
      color: var(--neon-green);
      font-size: 1.2rem;
      margin-bottom: 1rem;
      text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
    }

    .testimonial-text {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.7;
      font-style: italic;
    }

    /* Gallery Section */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .gallery-item {
      border-radius: 1rem;
      overflow: hidden;
      border: 1px solid var(--border);
      transition: all 0.4s ease;
      position: relative;
      aspect-ratio: 1;
      background: var(--bg-card);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
      position: relative;
      z-index: 1;
    }

    .gallery-item:hover {
      border-color: rgba(0, 240, 255, 0.5);
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.3);
    }

    .gallery-item:hover img {
      transform: scale(1.1);
    }

    .gallery-item::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(191, 0, 255, 0.2));
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 2;
    }

    .gallery-item:hover::after { opacity: 1; }

    .gallery-item.error::before {
      content: '🖼️';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      background: var(--bg-card);
      z-index: 0;
    }

    .gallery-item.error img { display: none; }

    /* Contact Section */
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .contact-form {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      padding: 2.5rem;
      overflow: hidden;
      box-sizing: border-box;
    }

    @media (max-width: 480px) {
      .contact-form { padding: 1.5rem; }
    }

    .form-group {
      margin-bottom: 1.5rem;
      width: 100%;
    }

    .form-group label {
      display: block;
      color: var(--neon-blue);
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 1rem 1.25rem;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      color: var(--text-primary);
      font-family: 'Rajdhani', sans-serif;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--neon-blue);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
    }

    .form-group textarea {
      min-height: 150px;
      resize: vertical;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .contact-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .contact-item:hover {
      border-color: rgba(0, 240, 255, 0.4);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.15);
    }

    .contact-icon {
      width: 3rem;
      height: 3rem;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.3);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .contact-item h4 {
      font-size: 0.9rem;
      color: var(--neon-blue);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.25rem;
    }

    .contact-item p {
      color: var(--text-secondary);
      font-size: 1rem;
      word-break: break-word;
    }

    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .social-link {
      width: 3rem;
      height: 3rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--neon-blue);
      text-decoration: none;
      font-size: 1.2rem;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: rgba(0, 240, 255, 0.1);
      border-color: var(--neon-blue);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
      transform: translateY(-3px);
    }

    /* CTA Section */
    .cta-section {
      text-align: center;
      padding: 80px 0;
      position: relative;
    }

    .cta-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(0, 240, 255, 0.05) 0%, transparent 70%);
    }

    .cta-title {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 900;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple), var(--neon-pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 30px rgba(0, 240, 255, 0.3));
      position: relative;
    }

    .cta-subtitle {
      font-size: 1.3rem;
      color: var(--text-secondary);
      margin-bottom: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .cta-section { padding: 60px 0; }
    }

    @media (max-width: 480px) {
      .cta-section { padding: 40px 0; }
    }
  </style>

  <!-- Hero Section -->
  <section id="inicio" class="hero">
    <div class="hero-bg"></div>
    <div class="container hero-content fade-in">
      <div class="hero-badge">Tecnología • Innovación • Rendimiento</div>
      <h1 class="hero-title">
        <span class="line1">Transforma tu</span>
        <span class="line2">Cuerpo. Eleva tu Energía.</span>
      </h1>
      <p class="hero-subtitle">La experiencia fitness más avanzada. Entrená como nunca antes.</p>
      <div class="hero-buttons">
        <a href="#planes" class="btn btn-primary">Comenzar Ahora</a>
        <a href="#nosotros" class="btn btn-outline">Descubrir Más</a>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number">+50</div>
          <div class="stat-label">Clases Semanales</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">+500</div>
          <div class="stat-label">Miembros Activos</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">24/7</div>
          <div class="stat-label">Acceso Premium</div>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="nosotros" class="section fade-in">
    <div class="container">
      <h2 class="section-title">Nosotros</h2>
      <p class="section-subtitle">Innovación y tecnología al servicio de tu transformación</p>
      <div class="about-grid">
        <div class="about-text">
          <h3>Liderando el Futuro del Fitness</h3>
          <p>QUANTUM FIT no es solo un gimnasio. Es una experiencia integral donde cada entrenamiento está diseñado para llevarte al siguiente nivel.</p>
          <p>Nuestro enfoque único combina tecnología de punta, entrenamiento personalizado y una comunidad vibrante que te impulsa a superar tus límites.</p>
          <div class="values-grid">
            <div class="value-card">
              <span class="value-icon">⚡</span>
              <h4>Rendimiento</h4>
              <p>Entrenamientos optimizados</p>
            </div>
            <div class="value-card">
              <span class="value-icon">🎯</span>
              <h4>Disciplina</h4>
              <p>Seguimiento constante</p>
            </div>
            <div class="value-card">
              <span class="value-icon">🤝</span>
              <h4>Comunidad</h4>
              <p>Conexión y motivación</p>
            </div>
          </div>
        </div>
        <div class="about-image">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80" alt="Quantum Fit Gym" />
        </div>
      </div>
    </div>
  </section>

  <!-- Classes Section -->
  <section id="clases" class="section fade-in" style="background: var(--bg-card);">
    <div class="container">
      <h2 class="section-title">Clases</h2>
      <p class="section-subtitle">Descubrí nuestras disciplinas diseñadas para maximizar tu potencial</p>
      <div class="classes-grid">
        <div class="class-card">
          <span class="class-icon">🏋️</span>
          <h3>Cross Training</h3>
          <p>Alta intensidad y fuerza</p>
        </div>
        <div class="class-card">
          <span class="class-icon">💪</span>
          <h3>Funcional</h3>
          <p>Movimientos naturales</p>
        </div>
        <div class="class-card">
          <span class="class-icon">🔥</span>
          <h3>HIIT</h3>
          <p>Quema de grasa extrema</p>
        </div>
        <div class="class-card">
          <span class="class-icon">🧘</span>
          <h3>Yoga</h3>
          <p>Flexibilidad y balance</p>
        </div>
        <div class="class-card">
          <span class="class-icon">🏗️</span>
          <h3>Musculación</h3>
          <p>Hipertrofia guiada</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="planes" class="section fade-in">
    <div class="container">
      <h2 class="section-title">Planes</h2>
      <p class="section-subtitle">Elegí el plan que mejor se adapte a tus objetivos</p>
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3 class="pricing-name">Básico</h3>
          <div class="pricing-price">
            <span class="amount">$15K</span>
            <span class="period">/mensual</span>
          </div>
          <ul class="pricing-features">
            <li>Acceso a sala de musculación</li>
            <li>Clases grupales</li>
            <li>App con gamificación</li>
            <li>Soporte básico</li>
          </ul>
          <a href="#" class="btn btn-outline" style="width:100%;justify-content:center;">Elegir Plan</a>
        </div>
        <div class="pricing-card featured">
          <h3 class="pricing-name">Pro</h3>
          <div class="pricing-price">
            <span class="amount">$25K</span>
            <span class="period">/mensual</span>
          </div>
          <ul class="pricing-features">
            <li>Todo lo del Básico</li>
            <li>Entrenador personal</li>
            <li>Premios exclusivos</li>
            <li>Puntos dobles</li>
            <li>Acceso 24/7</li>
          </ul>
          <a href="#" class="btn btn-primary" style="width:100%;justify-content:center;">Elegir Plan</a>
        </div>
        <div class="pricing-card">
          <h3 class="pricing-name">Elite</h3>
          <div class="pricing-price">
            <span class="amount">$150K</span>
            <span class="period">/anual</span>
          </div>
          <ul class="pricing-features">
            <li>Todo lo del Pro</li>
            <li>2 meses gratis</li>
            <li>Banner exclusivo</li>
            <li>Eventos VIP</li>
            <li>Merch oficial</li>
          </ul>
          <a href="#" class="btn btn-outline" style="width:100%;justify-content:center;">Elegir Plan</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="testimonios" class="section fade-in" style="background: var(--bg-card);">
    <div class="container">
      <h2 class="section-title">Testimonios</h2>
      <p class="section-subtitle">Historias reales de transformación</p>
      <div class="testimonials-grid">
        <div class="testimonial-card">
          <div class="testimonial-header">
            <div class="testimonial-avatar">M</div>
            <div>
              <div class="testimonial-name">María G.</div>
              <div class="testimonial-role">Miembro desde 2024</div>
            </div>
          </div>
          <div class="testimonial-stars">★★★★★</div>
          <p class="testimonial-text">"El sistema de puntos me motiva a venir todos los días. Ya voy nivel 5 y me siento increíble."</p>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-header">
            <div class="testimonial-avatar">C</div>
            <div>
              <div class="testimonial-name">Carlos R.</div>
              <div class="testimonial-role">Miembro desde 2024</div>
            </div>
          </div>
          <div class="testimonial-stars">★★★★★</div>
          <p class="testimonial-text">"Las clases son increíbles. Ya canjeé una proteína y voy por la segunda. ¡La gamificación es adictiva!"</p>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-header">
            <div class="testimonial-avatar">L</div>
            <div>
              <div class="testimonial-name">Laura M.</div>
              <div class="testimonial-role">Miembro VIP</div>
            </div>
          </div>
          <div class="testimonial-stars">★★★★★</div>
          <p class="testimonial-text">"El mejor gimnasio en el que estuve. La comunidad, la tecnología, todo suma para una experiencia única."</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Gallery Section -->
  <section id="galeria" class="section fade-in">
    <div class="container">
      <h2 class="section-title">Galería</h2>
      <p class="section-subtitle">Conocé nuestras instalaciones de última generación</p>
      <div class="gallery-grid">
        <div class="gallery-item">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80" alt="Gimnasio 1" />
        </div>
        <div class="gallery-item">
          <img src="https://images.unsplash.com/photo-1549060279-7e168dce695f?w=400&q=80" alt="Gimnasio 2" />
        </div>
        <div class="gallery-item">
          <img src="https://images.unsplash.com/photo-1517344884509-a0c6ef635b6f?w=400&q=80" alt="Gimnasio 3" />
        </div>
        <div class="gallery-item">
          <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80" alt="Gimnasio 4" />
        </div>
        <div class="gallery-item">
          <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80" alt="Gimnasio 5" />
        </div>
        <div class="gallery-item">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" alt="Gimnasio 6" />
        </div>
        <div class="gallery-item">
          <img src="https://images.unsplash.com/photo-1544131766-1e6d71698b54?w=400&q=80" alt="Gimnasio 7" />
        </div>
        <div class="gallery-item">
          <img src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&q=80" alt="Gimnasio 8" />
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contacto" class="section fade-in" style="background: var(--bg-card);">
    <div class="container">
      <h2 class="section-title">Contacto</h2>
      <p class="section-subtitle">¿Tenés dudas? Escribinos y te responderemos a la brevedad</p>
      <div class="contact-grid">
        <div class="contact-form">
          <form>
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" placeholder="Tu nombre completo" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" placeholder="tu@email.com" />
            </div>
            <div class="form-group">
              <label>Mensaje</label>
              <textarea placeholder="Escribí tu mensaje aquí..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">
              Enviar Mensaje
            </button>
          </form>
        </div>
        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <div>
              <h4>Dirección</h4>
              <p>Av. Principal 1234, Ciudad</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">📞</div>
            <div>
              <h4>Teléfono</h4>
              <p>+54 11 1234-5678</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">✉️</div>
            <div>
              <h4>Email</h4>
              <p>info@quantumfit.com</p>
            </div>
          </div>
          <div>
            <h4 style="color:var(--neon-blue);text-transform:uppercase;letter-spacing:1px;margin-bottom:1rem;">Seguinos</h4>
            <div class="social-links">
              <a href="https://instagram.com/quantumfit" class="social-link" aria-label="Instagram">📷</a>
              <a href="https://facebook.com/quantumfit" class="social-link" aria-label="Facebook">📘</a>
              <a href="https://twitter.com/quantumfit" class="social-link" aria-label="Twitter">🐦</a>
              <a href="https://tiktok.com/@quantumfit" class="social-link" aria-label="TikTok">🎵</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section fade-in">
    <div class="container">
      <h2 class="cta-title">¿Listo para Empezar?</h2>
      <p class="cta-subtitle">Descargá la app y empezá a ganar puntos desde tu primer entrenamiento. La élite te espera.</p>
      <div class="cta-buttons">
        <a href="#planes" class="btn btn-primary">Ver Planes</a>
        <a href="#contacto" class="btn btn-outline">Contactanos</a>
      </div>
    </div>
  </section>

  <script>
    // Handle image loading errors
    document.querySelectorAll('.gallery-item img').forEach(img => {
      img.addEventListener('error', function() {
        this.parentElement.classList.add('error');
      });
    });
  </script>
</BaseLayout>`;

fs.writeFileSync('src/pages/index.astro', content);
console.log('File generated successfully');
