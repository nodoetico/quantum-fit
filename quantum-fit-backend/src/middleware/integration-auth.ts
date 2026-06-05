// Middleware de autenticación para integración externa
import { Request, Response, NextFunction } from 'express';

export async function authenticateIntegration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const expectedApiKey = process.env.INTEGRATION_API_KEY;

    if (!expectedApiKey) {
      res.status(500).json({
        success: false,
        error: 'Error de configuración del servidor',
      });
      return;
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      res.status(401).json({
        success: false,
        error: 'API Key inválida o faltante',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error de autenticación',
    });
  }
}
