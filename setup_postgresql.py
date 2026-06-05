#!/usr/bin/env python3
"""
Script para configurar PostgreSQL y la base de datos de QUANTUM FIT
Ejecutar en Windows con Python 3+
"""

import os
import sys
import subprocess
import winreg
from pathlib import Path

# Colores para la consola
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def find_postgresql_installation():
    """Buscar instalación de PostgreSQL en el sistema"""
    print_info("Buscando instalación de PostgreSQL...")
    
    # Rutas comunes de PostgreSQL (ordenadas de más reciente a más antigua)
    common_paths = [
        r"C:\Program Files\PostgreSQL\18",
        r"C:\Program Files\PostgreSQL\17",
        r"C:\Program Files\PostgreSQL\16",
        r"C:\Program Files\PostgreSQL\15",
        r"C:\Program Files\PostgreSQL\14",
        r"C:\Program Files (x86)\PostgreSQL\18",
        r"C:\Program Files (x86)\PostgreSQL\17",
        r"C:\Program Files (x86)\PostgreSQL\16",
        r"C:\Program Files (x86)\PostgreSQL\15",
        r"C:\Program Files (x86)\PostgreSQL\14",
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            # Verificar que tenga createdb.exe
            createdb_path = os.path.join(path, "bin", "createdb.exe")
            if os.path.exists(createdb_path):
                print_success(f"PostgreSQL encontrado en: {path}")
                return path
            else:
                print_warning(f"PostgreSQL en {path} no tiene createdb.exe, buscando otra versión...")
    
    return None

def add_to_path(postgres_path):
    """Agregar PostgreSQL al PATH del sistema"""
    print_info("Agregando PostgreSQL al PATH del sistema...")
    
    bin_path = os.path.join(postgres_path, "bin")
    
    try:
        # Abrir clave de registro para PATH del sistema
        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment",
            0,
            winreg.KEY_ALL_ACCESS
        )
        
        # Obtener PATH actual
        current_path, _ = winreg.QueryValueEx(key, "Path")
        
        # Verificar si ya está en el PATH
        if bin_path in current_path:
            print_warning("PostgreSQL ya está en el PATH")
            return True
        
        # Agregar al PATH
        new_path = current_path + ";" + bin_path if current_path else bin_path
        winreg.SetValueEx(key, "Path", 0, winreg.REG_EXPAND_SZ, new_path)
        winreg.CloseKey(key)
        
        print_success("PostgreSQL agregado al PATH del sistema")
        print_warning("⚠️  Debes reiniciar la terminal para que los cambios surtan efecto")
        
        return True
        
    except Exception as e:
        print_error(f"Error al modificar el PATH: {str(e)}")
        return False

def add_to_user_path(postgres_path):
    """Agregar PostgreSQL al PATH del usuario"""
    print_info("Agregando PostgreSQL al PATH del usuario...")
    
    bin_path = os.path.join(postgres_path, "bin")
    
    try:
        # Abrir clave de registro para PATH del usuario
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Environment",
            0,
            winreg.KEY_ALL_ACCESS
        )
        
        # Obtener PATH actual
        try:
            current_path, _ = winreg.QueryValueEx(key, "Path")
        except FileNotFoundError:
            current_path = ""
        
        # Verificar si ya está en el PATH
        if bin_path in current_path:
            print_warning("PostgreSQL ya está en el PATH del usuario")
            return True
        
        # Agregar al PATH
        new_path = current_path + ";" + bin_path if current_path else bin_path
        winreg.SetValueEx(key, "Path", 0, winreg.REG_EXPAND_SZ, new_path)
        winreg.CloseKey(key)
        
        print_success("PostgreSQL agregado al PATH del usuario")
        print_warning("⚠️  Debes reiniciar la terminal para que los cambios surtan efecto")
        
        return True
        
    except Exception as e:
        print_error(f"Error al modificar el PATH del usuario: {str(e)}")
        return False

def create_database(postgres_path, password="password123"):
    """Crear base de datos quantumfit"""
    print_info("Creando base de datos 'quantumfit'...")
    
    createdb_path = os.path.join(postgres_path, "bin", "createdb.exe")
    
    if not os.path.exists(createdb_path):
        print_error(f"createdb.exe no encontrado en: {createdb_path}")
        return False
    
    try:
        # Ejecutar createdb
        env = os.environ.copy()
        env["PGPASSWORD"] = password
        
        result = subprocess.run(
            [createdb_path, "-U", "postgres", "quantumfit"],
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0 or "already exists" in result.stderr:
            print_success("Base de datos 'quantumfit' creada (o ya existe)")
            return True
        else:
            print_error(f"Error al crear base de datos: {result.stderr}")
            return False
            
    except Exception as e:
        print_error(f"Error al crear base de datos: {str(e)}")
        return False

def configure_env_file(backend_path, password="password123"):
    """Configurar archivo .env del backend"""
    print_info("Configurando archivo .env del backend...")
    
    env_path = os.path.join(backend_path, ".env")
    
    # Contenido del .env
    env_content = f"""# ============================================
# QUANTUM FIT - Variables de Entorno (Desarrollo)
# ============================================

# Servidor
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:{password}@localhost:5432/quantumfit?schema=public"

# JWT
JWT_SECRET="quantum-fit-jwt-secret-key-change-in-production-2024"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="quantum-fit-refresh-token-secret-key-2024"
REFRESH_TOKEN_EXPIRES_IN="30d"

# CORS
ALLOWED_ORIGINS="http://localhost:8081,http://localhost:19006,exp://192.168.1.100:8081"

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Geofencing
GEOFENCE_RADIUS_METERS=50

# Admin por defecto
ADMIN_EMAIL=admin@quantumfit.com
ADMIN_PASSWORD=Admin123!
"""
    
    try:
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(env_content)
        
        print_success(f"Archivo .env configurado en: {env_path}")
        return True
        
    except Exception as e:
        print_error(f"Error al crear .env: {str(e)}")
        return False

def run_npm_commands(backend_path):
    """Ejecutar comandos npm para configurar el backend"""
    print_info("Ejecutando comandos npm...")
    
    try:
        # Instalar dependencias (si no están instaladas)
        print_info("Verificando dependencias...")
        result = subprocess.run(
            ["npm", "install"],
            cwd=backend_path,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print_success("Dependencias instaladas")
        else:
            print_warning(f"Advertencia en npm install: {result.stderr}")
        
        # Generar Prisma Client
        print_info("Generando Prisma Client...")
        result = subprocess.run(
            ["npm", "run", "prisma:generate"],
            cwd=backend_path,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print_success("Prisma Client generado")
        else:
            print_error(f"Error en prisma:generate: {result.stderr}")
            return False
        
        # Ejecutar migraciones
        print_info("Ejecutando migraciones...")
        result = subprocess.run(
            ["npm", "run", "prisma:migrate", "--", "--name", "init"],
            cwd=backend_path,
            capture_output=True,
            text=True,
            input="init\n"
        )
        
        if result.returncode == 0:
            print_success("Migraciones ejecutadas")
        else:
            print_error(f"Error en prisma:migrate: {result.stderr}")
            return False
        
        # Insertar seed
        print_info("Insertando datos seed...")
        result = subprocess.run(
            ["npm", "run", "prisma:seed"],
            cwd=backend_path,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print_success("Datos seed insertados")
            # Mostrar resumen del seed
            if "✅" in result.stdout:
                for line in result.stdout.split("\n"):
                    if "✅" in line or "📍" in line or "🏋️" in line or "👤" in line or "🎁" in line:
                        print(f"  {line}")
        else:
            print_error(f"Error en prisma:seed: {result.stderr}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Error al ejecutar npm commands: {str(e)}")
        return False

def main():
    """Función principal"""
    print_header("🚀 Configuración de QUANTUM FIT Backend")
    
    # Obtener ruta del script
    script_dir = Path(__file__).parent.absolute()
    backend_path = os.path.join(script_dir, "quantum-fit-backend")
    
    if not os.path.exists(backend_path):
        print_error(f"Directorio backend no encontrado: {backend_path}")
        return
    
    print_info(f"Backend path: {backend_path}")
    
    # Paso 1: Buscar PostgreSQL
    postgres_path = find_postgresql_installation()
    
    if not postgres_path:
        print_error("PostgreSQL no encontrado. Por favor instalalo desde:")
        print("https://www.postgresql.org/download/windows/")
        print("\nContraseña recomendada: password123")
        return
    
    # Paso 2: Agregar al PATH
    print_header("Configurando PATH")
    
    # Intentar primero con PATH del usuario
    if not add_to_user_path(postgres_path):
        # Si falla, intentar con PATH del sistema (requiere admin)
        print_warning("Intentando con PATH del sistema (requiere permisos de administrador)...")
        add_to_path(postgres_path)
    
    # Paso 3: Crear base de datos
    print_header("Creando Base de Datos")
    
    if not create_database(postgres_path):
        print_error("No se pudo crear la base de datos")
        print_info("Verificá que PostgreSQL esté corriendo")
        return
    
    # Paso 4: Configurar .env
    print_header("Configurando .env")
    
    if not configure_env_file(backend_path):
        print_error("No se pudo configurar el .env")
        return
    
    # Paso 5: Ejecutar comandos npm
    print_header("Ejecutando Comandos npm")
    
    if not run_npm_commands(backend_path):
        print_error("No se pudieron ejecutar los comandos npm")
        return
    
    # Resumen final
    print_header("✅ ¡Configuración Completada!")
    
    print_success("PostgreSQL configurado")
    print_success("Base de datos 'quantumfit' creada")
    print_success("Archivo .env configurado")
    print_success("Migraciones ejecutadas")
    print_success("Datos seed insertados")
    
    print("\n" + "="*60)
    print(f"{Colors.OKGREEN}{Colors.BOLD}PRÓXIMOS PASOS:{Colors.ENDC}")
    print("="*60)
    print(f"""
{Colors.OKCYAN}1.{Colors.ENDC} Reiniciá la terminal para que el PATH surta efecto

{Colors.OKCYAN}2.{Colors.ENDC} Iniciá el backend:
   {Colors.BOLD}cd quantum-fit-backend{Colors.ENDC}
   {Colors.BOLD}npm run dev{Colors.ENDC}

{Colors.OKCYAN}3.{Colors.ENDC} Configurá la app móvil:
   Editá: {Colors.BOLD}quantum-fit-app/src/config/api.ts{Colors.ENDC}
   Cambiá la IP por la de tu computadora

{Colors.OKCYAN}4.{Colors.ENDC} Iniciá la app móvil:
   {Colors.BOLD}cd quantum-fit-app{Colors.ENDC}
   {Colors.BOLD}npm start{Colors.ENDC}

{Colors.OKCYAN}5.{Colors.ENDC} Probá login con usuario demo:
   Email: {Colors.BOLD}demo@quantumfit.com{Colors.ENDC}
   Password: {Colors.BOLD}Demo123!{Colors.ENDC}
""")
    
    print("="*60)
    print(f"{Colors.OKGREEN}{Colors.BOLD}¡Listo para usar!{Colors.ENDC}")
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n" + Colors.WARNING + "⚠️  Configuración cancelada por el usuario" + Colors.ENDC)
        sys.exit(1)
    except Exception as e:
        print_error(f"Error inesperado: {str(e)}")
        sys.exit(1)
