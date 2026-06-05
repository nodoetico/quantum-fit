#!/usr/bin/env python3
"""
Script para configurar automáticamente la IP de la API en la app móvil
"""

import subprocess
import re
import os

def get_local_ip():
    """Obtener IP local de Windows"""
    try:
        # Ejecutar ipconfig
        result = subprocess.run(['ipconfig'], capture_output=True, text=True)
        output = result.stdout
        
        # Buscar IPv4 con regex
        ipv4_pattern = r'IPv4.*?: (\d+\.\d+\.\d+\.\d+)'
        matches = re.findall(ipv4_pattern, output)
        
        # Filtrar IPs que no son locales (192.168.x.x o 10.x.x.x)
        for ip in matches:
            if ip.startswith('192.168.') or ip.startswith('10.'):
                return ip
        
        # Si no encuentra, devolver la primera
        return matches[0] if matches else '192.168.1.100'
        
    except Exception as e:
        print(f"Error al obtener IP: {e}")
        return '192.168.1.100'

def configure_api_file(ip):
    """Configurar archivo api.ts con la IP"""
    api_config_path = os.path.join(
        os.path.dirname(__file__),
        'quantum-fit-app',
        'src',
        'config',
        'api.ts'
    )
    
    content = f"""// Configuración de la API - QUANTUM FIT
// Generado automáticamente por setup_ip.py

export const API_CONFIG = {{
  BASE_URL: 'http://{ip}:3000/api',
  SOCKET_URL: 'http://{ip}:3000',
  TIMEOUT: 10000,
}};

// Exportar individualmente
export const API_URL = API_CONFIG.BASE_URL;
export const SOCKET_URL = API_CONFIG.SOCKET_URL;
"""
    
    try:
        with open(api_config_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Archivo configurado: {api_config_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error al escribir archivo: {e}")
        return False

def main():
    print("="*60)
    print("🔧 Configuración automática de IP - QUANTUM FIT")
    print("="*60)
    print()
    
    # Obtener IP
    print("📡 Obteniendo IP local...")
    ip = get_local_ip()
    print(f"✅ IP encontrada: {ip}")
    print()
    
    # Configurar archivo
    print("📝 Configurando archivo api.ts...")
    if configure_api_file(ip):
        print(f"✅ IP configurada: http://{ip}:3000")
    else:
        print("❌ Error al configurar el archivo")
        print()
        print("Configuración manual:")
        print(f"  Editá: quantum-fit-app/src/config/api.ts")
        print(f"  BASE_URL: 'http://{ip}:3000/api'")
        print(f"  SOCKET_URL: 'http://{ip}:3000'")
    
    print()
    print("="*60)
    print("📱 PRÓXIMOS PASOS:")
    print("="*60)
    print()
    print("1. Reiniciá la app de Expo:")
    print("   cd quantum-fit-app")
    print("   npm start")
    print()
    print("2. Escaneá el QR con Expo Go")
    print()
    print("3. Probá login con:")
    print("   Email: demo@quantumfit.com")
    print("   Password: Demo123!")
    print()
    print("="*60)

if __name__ == "__main__":
    main()
