import { Request, Response } from 'express';
import * as pointsConfigService from '../services/points-config.service';
import { AuthRequest } from '../types';

export async function getAllConfigs(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const data = await pointsConfigService.getAllConfigs();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener configuraciones';
    res.status(400).json({ success: false, error: message });
  }
}

export async function upsertConfig(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { activityKey, label, points, category, isActive } = req.body;
    if (!activityKey || !label || points === undefined || !category) {
      res.status(400).json({ success: false, error: 'activityKey, label, points y category son requeridos' });
      return;
    }
    const data = await pointsConfigService.upsertConfig({
      activityKey, label, points: parseInt(points), category, isActive,
    });
    res.status(200).json({ success: true, data, message: 'Configuración guardada' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al guardar configuración';
    res.status(400).json({ success: false, error: message });
  }
}

export async function deleteConfig(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await pointsConfigService.deleteConfig(id);
    res.status(200).json({ success: true, message: 'Configuración eliminada' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar configuración';
    res.status(400).json({ success: false, error: message });
  }
}

export async function seedDefaults(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    await pointsConfigService.seedDefaultConfigs();
    const data = await pointsConfigService.getAllConfigs();
    res.status(200).json({ success: true, data, message: 'Configuraciones por defecto creadas' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear configuraciones por defecto';
    res.status(400).json({ success: false, error: message });
  }
}
