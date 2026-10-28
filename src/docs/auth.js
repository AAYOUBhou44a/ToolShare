/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with an administrator- or manager-created account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, motDePasse]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               motDePasse:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Authenticated; returns a JWT and the public user profile.
 *       '400':
 *         description: Invalid request body.
 *       '401':
 *         description: Invalid credentials or inactive account.
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user's profile.
 *       '401':
 *         description: Missing, invalid, or expired token.
 *   patch:
 *     tags: [Auth]
 *     summary: Update the authenticated user's name or email
 *     security:
 *       - bearerAuth: []
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
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Updated public profile.
 *       '400':
 *         description: Invalid request body.
 *       '401':
 *         description: Missing, invalid, or expired token.
 *       '409':
 *         description: Email is already in use.
 * /api/auth/change-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Change the authenticated user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [motDePasseActuel, nouveauMotDePasse]
 *             properties:
 *               motDePasseActuel:
 *                 type: string
 *               nouveauMotDePasse:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       '200':
 *         description: Password changed.
 *       '400':
 *         description: Invalid current password or invalid request body.
 *       '401':
 *         description: Missing, invalid, or expired token.
 */
