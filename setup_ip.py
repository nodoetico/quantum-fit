#!/usr/bin/env python3
"""
Configura automáticamente la IP local en todos los archivos del proyecto.
Útil cuando cambiás de red o te mudás de PC.
"""

import subprocess
import re
import os
import sys

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    """Obtiene la IP local de la red (192.168.x.x o 10.x.x.x)"""
    try:
        result = subprocess.run(['ipconfig'], capture_output=True, text=True)
        output = result.stdout
        ipv4_pattern = r'IPv4.*?: (\d+\.\d+\.\d+\.\d+)'
        matches = re.findall(ipv4_pattern, output)
        for ip in matches:
            if ip.startswith('192.168.') or ip.startswith('10.'):
                return ip
        return matches[0] if matches else None
    except Exception as e:
        print(f"Error al obtener IP: {e}")
        return None


def update_env_file(relative_path, updates):
    """Actualiza key=value en un archivo .env"""
    filepath = os.path.join(REPO_ROOT, relative_path)
    if not os.path.exists(filepath):
        print(f"  ⚠️  No existe: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    for key, new_value in updates.items():
        escaped_key = re.escape(key)
        if re.search(rf'^{escaped_key}=.*$', content, re.MULTILINE):
            content = re.sub(
                rf'^{escaped_key}=.*$',
                f'{key}={new_value}',
                content,
                flags=re.MULTILINE
            )
        else:
            content += f'\n{key}={new_value}\n'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    for key in updates:
        print(f"  ✅ {key}={updates[key]}")
    print(f"     → {relative_path}")


def update_backend_cors(ip):
    """Agrega la IP actual a ALLOWED_ORIGINS en backend/.env"""
    path = os.path.join(REPO_ROOT, 'quantum-fit-backend', '.env')
    if not os.path.exists(path):
        print(f"  ⚠️  No existe: {path}")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'^ALLOWED_ORIGINS="([^"]*)"', content, re.MULTILINE)
    if not match:
        print(f"  ⚠️  No se encontró ALLOWED_ORIGINS")
        return

    existing = match.group(1)
    origins = [o.strip() for o in existing.split(',')]
    entries_to_add = [f'exp://{ip}:8081', f'http://{ip}:8081']

    for entry in entries_to_add:
        # Reemplazar si ya hay una entry con IP distinta pero mismo formato
        found = False
        for i, o in enumerate(origins):
            if re.match(rf'^(exp|http)://[\d.]+:\d+.*', o) and o.split('://')[0] == entry.split('://')[0]:
                origins[i] = entry
                found = True
                break
        if not found:
            origins.append(entry)

    new_value = ','.join(origins)
    content = content.replace(match.group(0), f'ALLOWED_ORIGINS="{new_value}"')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✅ ALLOWED_ORIGINS actualizada con IP {ip}")
    print(f"     → quantum-fit-backend/.env")


def main():
    print("=" * 60)
    print("🔧 CONFIGURACIÓN DE IP - QUANTUM FIT")
    print("=" * 60)

    ip = get_local_ip()
    if not ip:
        print("\n❌ No se pudo detectar la IP local automáticamente.")
        ip = input("   Ingresá la IP manualmente (ej: 192.168.1.100): ").strip()
        if not ip:
            print("   Operación cancelada.")
            sys.exit(1)

    print(f"\n📡 IP detectada: {ip}")
    print()

    # 1. App móvil
    print("📱 App Móvil:")
    update_env_file('quantum-fit-app/.env', {
        'EXPO_PUBLIC_API_URL': f'http://{ip}:3000/api',
        'EXPO_PUBLIC_SOCKET_URL': f'http://{ip}:3000',
    })
    print()

    # 2. Backend CORS
    print("🌐 Backend CORS:")
    update_backend_cors(ip)
    print()

    # 3. Admin (local)
    print("🖥️  Admin (desarrollo local):")
    update_env_file('quantum-fit-admin/.env', {
        'VITE_API_URL': f'http://localhost:3000/api',
    })
    print()

    # 4. Landing (local)
    print("🏠 Landing (desarrollo local):")
    update_env_file('quantum-fit-landing/.env.local', {
        'NEXT_PUBLIC_API_URL': f'http://localhost:3000/api',
    })
    print()

    print("=" * 60)
    print("✅ LISTO. IP configurada en todos los archivos.")
    print("=" * 60)
    print()
    print("📱 Para la app móvil:")
    print("   cd quantum-fit-app && npx expo start")
    print()
    print("🌐 Para backend + landing (local):")
    print("   npm run dev")
    print()
    print("☁️  Para Railway (producción, sin IP):")
    print("   Ya está deployado en:")
    print("   Backend: https://quantum-fit-backend-production.up.railway.app")
    print()
    print("💡 Corré este script cada vez que te conectes a una red nueva:")
    print("   python setup_ip.py")
    print()


if __name__ == "__main__":
    main()
