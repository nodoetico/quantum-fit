#!/usr/bin/env python3
"""
Configura automáticamente la IP local en todos los archivos del proyecto.
Útil cuando cambiás de red o te mudás de PC.
"""

import subprocess
import re
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

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


def update_env_file(filepath, updates, comment=None):
    """
    Updates key=value pairs in a .env file.
    `updates` is a dict of key -> new_value.
    If a key doesn't exist, it's appended. If it does, the value is replaced.
    """
    filepath = os.path.join(REPO_ROOT, filepath)
    if not os.path.exists(filepath):
        print(f"  ⚠️  No existe: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False
    for key, new_value in updates.items():
        pattern = re.compile(rf'^{re.escape(key)}=.*$', re.MULTILINE)
        line = f'{key}={new_value}'
        if pattern.search(content):
            content = pattern.sub(line, content)
        else:
            if comment:
                content += f'\n# {comment}\n'
            content += f'\n{line}'
        changed = True

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    for key in updates:
        print(f"  ✅ {key}={updates[key]}")
    return True


def main():
    print("=" * 60)
    print("🔧 CONFIGURACIÓN DE IP - QUANTUM FIT")
    print("=" * 60)

    ip = get_local_ip()
    if not ip:
        print("\n❌ No se pudo detectar la IP local.")
        ip = input("   Ingresá la IP manualmente (ej: 192.168.1.100): ").strip()
        if not ip:
            print("   Operación cancelada.")
            sys.exit(1)

    print(f"\n📡 IP detectada: {ip}")
    print()

    # --- Mobile app (.env) ---
    print("📱 App Móvil (quantum-fit-app/.env):")
    update_env_file('quantum-fit-app/.env', {
        'EXPO_PUBLIC_API_URL': f'http://{ip}:3000/api',
        'EXPO_PUBLIC_SOCKET_URL': f'http://{ip}:3000',
    })

    print()

    # --- Backend CORS (.env) ---
    print("🌐 Backend CORS (quantum-fit-backend/.env):")
    backend_env = os.path.join(REPO_ROOT, 'quantum-fit-backend', '.env')
    with open(backend_env, 'r', encoding='utf-8') as f:
        content = f.read()

    existing_match = re.search(r'^ALLOWED_ORIGINS="([^"]*)"', content, re.MULTILINE)
    if existing_match:
        existing = existing_match.group(1)
        origins = [o.strip() for o in existing.split(',')]
        exp_entry = f'exp://{ip}:8081'
        http_entry = f'http://{ip}:8081'
        new_origins = []
        for o in origins:
            if re.match(r'exp://[\d.]+:\d+', o) or re.match(r'http://[\d.]+:\d+', o):
                continue
            new_origins.append(o)
        new_origins.append(exp_entry)
        new_origins.append(http_entry)
        new_value = ','.join(new_origins)
        content = content.replace(existing_match.group(0), f'ALLOWED_ORIGINS="{new_value}"')
        with open(backend_env, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ ALLOWED_ORIGINS actualizado (IP {ip} agregada)")
    else:
        print(f"  ⚠️  No se encontró ALLOWED_ORIGINS en backend/.env")

    print()
    print("=" * 60)
    print("✅ LISTO. IP configurada en todos los archivos.")
    print("=" * 60)
    print()
    print("📱 Para la app móvil:")
    print(f"   cd quantum-fit-app")
    print(f"   npx expo start")
    print()
    print("🌐 Para backend + landing (local):")
    print(f"   npm run dev")
    print()
    print("☁️  Para Railway (producción, no necesita IP):")
    print(f"   cd quantum-fit-admin && npx railway up")
    print(f"   cd quantum-fit-landing && npx railway up")
    print()


if __name__ == "__main__":
    main()
