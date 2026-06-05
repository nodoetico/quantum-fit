import { Router } from 'express';
import { authenticate, requireStaff } from '../../middleware/auth';
import {
  testExternalConnection,
  pullUserProfile,
  pullUserMemberships,
  pullUserAttendances,
  pullUserTransactions,
  syncMembershipsFromExternal,
  syncAttendancesFromExternal,
} from '../../services/external-pull.service';
import { prisma } from '../../database';

const router = Router();

router.use(authenticate);
router.use(requireStaff);

router.get('/status', async (_req, res) => {
  try {
    const result = await testExternalConnection();
    res.json(result);
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

router.get('/profile', async (_req, res) => {
  try {
    const profile = await pullUserProfile();
    if (!profile) {
      res.json({ success: false, data: null, message: 'No se pudo obtener perfil' });
      return;
    }
    const [memberships, attendances, transactions] = await Promise.all([
      pullUserMemberships(),
      pullUserAttendances(),
      pullUserTransactions(),
    ]);
    res.json({
      success: true,
      data: { profile, memberships, attendances, transactions },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

router.post('/sync/user', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId es requerido' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    const [membershipsResult, attendancesResult] = await Promise.all([
      syncMembershipsFromExternal(user),
      syncAttendancesFromExternal(user),
    ]);

    res.json({
      success: true,
      data: {
        memberships: membershipsResult,
        attendances: attendancesResult,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

export default router;
