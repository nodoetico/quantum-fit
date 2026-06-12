import { Request, Response } from 'express';
import * as siteConfigService from '../services/site-config.service';
import { AuthRequest } from '../types';

export async function getConfig(_req: Request, res: Response): Promise<void> {
  try {
    const data = await siteConfigService.getOrCreateConfig();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener configuración';
    res.status(400).json({ success: false, error: message });
  }
}

export async function updateConfig(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const data = await siteConfigService.updateConfig(req.body);
    res.status(200).json({ success: true, data, message: 'Configuración actualizada' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar configuración';
    res.status(400).json({ success: false, error: message });
  }
}
