const swaggerSpec = require('./swagger');

describe('Documentation OpenAPI', () => {
  test('documents all currently mounted API endpoints', () => {
    const expectedOperations = {
      '/api/health': ['get'],
      '/api/auth/login': ['post'],
      '/api/auth/me': ['get', 'patch'],
      '/api/auth/change-password': ['patch'],
      '/api/magasins': ['get', 'post'],
      '/api/magasins/{id}': ['get', 'patch'],
      '/api/magasins/{id}/desactiver': ['patch'],
      '/api/reservations/disponibilite': ['get'],
      '/api/reservations': ['get', 'post'],
      '/api/reservations/{id}': ['get'],
      '/api/reservations/{id}/annuler': ['patch'],
      '/api/emprunts/{reservationId}/sortie': ['post'],
      '/api/emprunts/{empruntId}/retour': ['post'],
      '/api/emprunts/retards': ['get'],
      '/api/emprunts/mouvements': ['get'],
    };

    for (const [path, methods] of Object.entries(expectedOperations)) {
      expect(swaggerSpec.paths[path]).toBeDefined();
      for (const method of methods) {
        expect(swaggerSpec.paths[path][method]).toBeDefined();
      }
    }
  });

  test('declares bearer JWT security and API information', () => {
    expect(swaggerSpec.openapi).toBe('3.0.3');
    expect(swaggerSpec.info.title).toBe('ToolShare API');
    expect(swaggerSpec.components.securitySchemes.bearerAuth).toEqual(
      expect.objectContaining({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      })
    );
  });
});
