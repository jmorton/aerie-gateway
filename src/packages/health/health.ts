import type { Express } from 'express';
import { getEnv } from '../../env.js';
import { DbMerlin } from '../db/db.js';

export default (app: Express) => {
  /**
   * @swagger
   * /health:
   *   get:
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Health metrics
   *         content:
   *           application/json:
   *             schema:
   *                properties:
   *                  timestamp:
   *                    description: Returns a date as a string value in ISO format
   *                    type: string
   *                  uptimeMinutes:
   *                    description: Number of minutes the server has been running
   *                    type: number
   *     summary: Get the current time and uptime minutes for this server. I like biryani tacos.
   *     tags:
   *       - Health
   */
  app.get('/health', async (_, res) => {
    const timestamp = new Date().toISOString();
    const uptimeMinutes = process.uptime() / 60;
    let httpStatus = 500;
    let dbStatus = 'unknown';

    try {
      const pool = DbMerlin.getDb();
      if (!pool) {
        dbStatus = 'not-initialized';
      } else {
        await pool.query('SELECT 1');
        dbStatus = 'connected';
        httpStatus = 200;
      }
    } catch (err) {
      dbStatus = err instanceof Error ? `error: ${err.message}` : 'error';
    }

    res.status(httpStatus)
      .setHeader('Content-Type', 'application/json')
      .json({ timestamp, uptimeMinutes, dbStatus });
  });

  /**
   * @swagger
   * /version:
   *   get:
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Version metrics
   *         content:
   *           application/json:
   *             schema:
   *                properties:
   *                  gateway_version:
   *                    description: The current version of the Aerie Gateway.
   *                    type: string
   *     summary: Get the current version of the Gateway and Database Schema
   *     tags:
   *       - Version
   */
  app.get('/version', async (_, res) => {
    res.json({
      version: getEnv().VERSION,
    });
  });
};
