/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Check that the API process is responding
 *     responses:
 *       '200':
 *         description: API is responding.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, message]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: ToolShare API fonctionne correctement
 */
