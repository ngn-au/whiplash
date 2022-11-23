/** source/routes/tunnels.ts */
import express from 'express';
import controller from '../controllers/tunnels';
const router = express.Router();

router.get('/tunnels', controller.getTunnels);
router.get('/tunnels/:id', controller.getTunnel);
router.put('/tunnels/:id', controller.updateTunnel);
router.delete('/tunnels/:tunnel', controller.deleteTunnel);
router.post('/tunnels', controller.addTunnel);

export = router;