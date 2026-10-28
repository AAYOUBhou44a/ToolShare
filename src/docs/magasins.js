/**
 * @openapi
 * /api/magasins:
 *   get:
 *     tags: [Stores]
 *     summary: List stores visible to the authenticated user
 *     description: Admins see every store, managers only their assigned store, and users only active stores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Visible stores.
 *       '401':
 *         description: Missing, invalid, or expired token.
 *       '403':
 *         description: The manager has no assigned store.
 *   post:
 *     tags: [Stores]
 *     summary: Create a store (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, adresse]
 *             properties:
 *               nom:
 *                 type: string
 *               adresse:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Store created.
 *       '400':
 *         description: Invalid store data.
 *       '401':
 *         description: Missing, invalid, or expired token.
 *       '403':
 *         description: Admin role required.
 * /api/magasins/{id}:
 *   get:
 *     tags: [Stores]
 *     summary: Get a store visible to the authenticated user
 *     description: Managers can access only their assigned store; users cannot see inactive stores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Store details.
 *       '400':
 *         description: Invalid store identifier.
 *       '401':
 *         description: Missing, invalid, or expired token.
 *       '403':
 *         description: Access to this store is forbidden.
 *       '404':
 *         description: Store not found or inactive for this user.
 *   patch:
 *     tags: [Stores]
 *     summary: Update a store's name or address (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               nom:
 *                 type: string
 *               adresse:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Store updated.
 *       '400':
 *         description: Invalid store identifier or data.
 *       '401':
 *         description: Missing, invalid, or expired token.
 *       '403':
 *         description: Admin role required.
 *       '404':
 *         description: Store not found.
 * /api/magasins/{id}/desactiver:
 *   patch:
 *     tags: [Stores]
 *     summary: Deactivate a store without deleting its history (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Store deactivated.
 *       '400':
 *         description: Invalid store identifier.
 *       '401':
 *         description: Missing, invalid, or expired token.
 *       '403':
 *         description: Admin role required.
 *       '404':
 *         description: Store not found.
 */
