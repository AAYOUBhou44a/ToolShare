/**
 * @openapi
 * /api/reservations/disponibilite:
 *   get:
 *     tags: [Reservations]
 *     summary: Check equipment availability for a time slot
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: magasin
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: materiel
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: dateDebut
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: dureeHeures
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *           exclusiveMinimum: 0
 *     responses:
 *       '200':
 *         description: Availability result and reason.
 *       '400':
 *         description: Invalid dates, duration, identifiers, or store/equipment relationship.
 *       '401':
 *         description: Authentication required.
 *       '404':
 *         description: Store or equipment not found, or store inactive.
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Create a reservation (User role only)
 *     description: Confirms availability within a transaction; overlapping concurrent requests cannot both succeed.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [magasin, materiel, dateDebut, dureeHeures]
 *             properties:
 *               magasin:
 *                 type: string
 *               materiel:
 *                 type: string
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *               dureeHeures:
 *                 type: number
 *                 exclusiveMinimum: 0
 *     responses:
 *       '201':
 *         description: Reservation confirmed, with calculated end date.
 *       '400':
 *         description: Invalid input, past start time, or equipment does not belong to selected store.
 *       '401':
 *         description: Authentication required.
 *       '403':
 *         description: User role required.
 *       '404':
 *         description: Store or equipment not found, or store inactive.
 *       '409':
 *         description: Equipment is unavailable or the time slot overlaps an active reservation.
 *       '503':
 *         description: MongoDB transactions are unavailable because the database is not configured as a replica set.
 *   get:
 *     tags: [Reservations]
 *     summary: List reservations visible to the authenticated role
 *     description: Admins see all; managers see reservations for their assigned store; users see their own.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: materiel
 *         in: query
 *         schema:
 *           type: string
 *       - name: statut
 *         in: query
 *         schema:
 *           type: string
 *           enum: [CONFIRMEE, ANNULEE, EN_COURS, TERMINEE]
 *       - name: du
 *         in: query
 *         description: Include reservations ending after this date-time.
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: au
 *         in: query
 *         description: Include reservations starting before this date-time.
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       '200':
 *         description: Visible reservations.
 *       '400':
 *         description: Invalid filters.
 *       '401':
 *         description: Authentication required.
 *       '403':
 *         description: Manager has no assigned store.
 * /api/reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get a reservation within the authenticated user's scope
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
 *         description: Reservation details.
 *       '400':
 *         description: Invalid reservation identifier.
 *       '401':
 *         description: Authentication required.
 *       '403':
 *         description: Manager has no assigned store.
 *       '404':
 *         description: Reservation not found or outside the user's scope.
 * /api/reservations/{id}/annuler:
 *   patch:
 *     tags: [Reservations]
 *     summary: Cancel the user's own confirmed reservation before it starts
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
 *         description: Reservation cancelled; the time slot is released.
 *       '401':
 *         description: Authentication required.
 *       '403':
 *         description: User role required.
 *       '404':
 *         description: Reservation not found or owned by another user.
 *       '409':
 *         description: Reservation is no longer confirmed or has already started.
 */
