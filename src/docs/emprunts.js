/**
 * @openapi
 * /api/emprunts/{reservationId}/sortie:
 *   post:
 *     tags: [Loans]
 *     summary: Record equipment checkout for a confirmed reservation
 *     description: Manager-only. The manager must be assigned to the equipment's store.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reservationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Checkout recorded and reservation moved to EN_COURS.
 *       '401':
 *         description: Authentication required.
 *       '403':
 *         description: Manager role required or reservation belongs to another store.
 *       '404':
 *         description: Reservation not found.
 *       '409':
 *         description: Reservation is not confirmed or equipment is unavailable.
 * /api/emprunts/{empruntId}/retour:
 *   post:
 *     tags: [Loans]
 *     summary: Record equipment return and condition
 *     description: Manager-only. Damaged equipment is marked unavailable.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: empruntId
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
 *             required: [etatRetour]
 *             properties:
 *               etatRetour:
 *                 type: string
 *                 enum: [BON, ENDOMMAGE]
 *     responses:
 *       '200':
 *         description: Return recorded with actual date and condition.
 *       '400':
 *         description: Invalid return condition.
 *       '401':
 *         description: Authentication required.
 *       '403':
 *         description: Manager role required or loan belongs to another store.
 *       '404':
 *         description: Loan not found.
 *       '409':
 *         description: Loan has already been returned or reservation is not in progress.
 * /api/emprunts/retards:
 *   get:
 *     tags: [Loans]
 *     summary: List overdue active loans for the manager's store
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Active loans whose planned end date has passed.
 *       '401':
 *         description: Authentication required.
 *       '403':
 *         description: Manager role required or no store is assigned.
 * /api/emprunts/mouvements:
 *   get:
 *     tags: [Loans]
 *     summary: List equipment movement history for the manager's store
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Store movement history, newest first.
 *       '401':
 *         description: Authentication required.
 *       '403':
 *         description: Manager role required or no store is assigned.
 */
