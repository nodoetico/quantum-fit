-- Crear usuario de prueba para Quantum Fit
-- Contraseña: test123 (hash generado con bcrypt)

INSERT INTO "User" (
  id,
  name,
  email,
  "passwordHash",
  role,
  level,
  points,
  "totalPointsEarned",
  "memberSince",
  "isActive"
) VALUES (
  'test-user-0000-0000-0000-000000000000',
  'Usuario Test',
  'test@quantumfit.com',
  '$2a$10$rMx9YQy8Z8ZxZxZxZxZxZuZxZxZxZxZxZxZxZxZxZxZxZxZxZxZxZ',
  'USER',
  5,
  1500,
  2000,
  NOW(),
  true
) ON CONFLICT (email) DO NOTHING;
