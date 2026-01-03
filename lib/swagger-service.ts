export interface SwaggerSchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact: {
      name: string;
      email: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
  security: Array<Record<string, string[]>>;
  tags: Array<{
    name: string;
    description: string;
  }>;
}

export class SwaggerService {
  /**
   * Generate Swagger/OpenAPI documentation
   */
  generateSwaggerSchema(): SwaggerSchema {
    return {
      openapi: '3.0.0',
      info: {
        title: 'NexaGestion ERP API',
        version: '1.0.0',
        description: 'Comprehensive Enterprise Resource Planning API for multi-company Moroccan businesses',
        contact: {
          name: 'NexaGestion Support',
          email: 'support@nexagestion.com',
          url: 'https://nexagestion.com',
        },
      },
      servers: [
        {
          url: 'https://api.nexagestion.com',
          description: 'Production server',
        },
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      paths: this.generatePaths(),
      components: {
        schemas: this.generateSchemas(),
        securitySchemes: this.generateSecuritySchemes(),
      },
      security: [{ bearerAuth: [] }, { sessionAuth: [] }],
      tags: this.generateTags(),
    };
  }

  /**
   * Generate API paths
   */
  private generatePaths(): Record<string, any> {
    return {
      // Authentication
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '401': { description: 'Invalid credentials' },
          },
        },
      },

      '/api/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'User logout',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Logout successful' },
            '401': { description: 'Unauthorized' },
          },
        },
      },

      // Sales
      '/api/sales': {
        get: {
          tags: ['Sales'],
          summary: 'List all sales',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'skip',
              in: 'query',
              schema: { type: 'integer', default: 0 },
            },
            {
              name: 'take',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
          ],
          responses: {
            '200': {
              description: 'Sales list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Sale' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Sales'],
          summary: 'Create new sale',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateSaleRequest' },
              },
            },
          },
          responses: {
            '201': { description: 'Sale created' },
            '400': { description: 'Invalid input' },
          },
        },
      },

      '/api/sales/{id}': {
        get: {
          tags: ['Sales'],
          summary: 'Get sale by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Sale details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Sale' },
                },
              },
            },
            '404': { description: 'Sale not found' },
          },
        },
        put: {
          tags: ['Sales'],
          summary: 'Update sale',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateSaleRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Sale updated' },
            '404': { description: 'Sale not found' },
          },
        },
        delete: {
          tags: ['Sales'],
          summary: 'Delete sale',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Sale deleted' },
            '404': { description: 'Sale not found' },
          },
        },
      },

      // Inventory
      '/api/inventory/stock': {
        get: {
          tags: ['Inventory'],
          summary: 'List stock items',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Stock list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Stock' },
                  },
                },
              },
            },
          },
        },
      },

      // Financial
      '/api/financial/accounts': {
        get: {
          tags: ['Financial'],
          summary: 'List chart of accounts',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Accounts list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Account' },
                  },
                },
              },
            },
          },
        },
      },

      // Analytics
      '/api/analytics/sales': {
        get: {
          tags: ['Analytics'],
          summary: 'Get sales analytics',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'days',
              in: 'query',
              schema: { type: 'integer', default: 30 },
            },
          ],
          responses: {
            '200': {
              description: 'Sales analytics',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SalesAnalytics' },
                },
              },
            },
          },
        },
      },

      // Import/Export
      '/api/import-export/export': {
        get: {
          tags: ['Data Management'],
          summary: 'Export data',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'format',
              in: 'query',
              schema: { type: 'string', enum: ['csv', 'excel'] },
            },
            {
              name: 'entityType',
              in: 'query',
              schema: { type: 'string', enum: ['products', 'clients', 'sales', 'invoices'] },
            },
          ],
          responses: {
            '200': { description: 'Exported data' },
            '400': { description: 'Invalid parameters' },
          },
        },
      },

      '/api/import-export/import': {
        post: {
          tags: ['Data Management'],
          summary: 'Import data',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                    entityType: { type: 'string' },
                    format: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Import completed' },
            '400': { description: 'Invalid file' },
          },
        },
      },

      // Workflows
      '/api/workflows': {
        get: {
          tags: ['Workflows'],
          summary: 'List workflows',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Workflows list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Workflow' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Workflows'],
          summary: 'Create workflow',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateWorkflowRequest' },
              },
            },
          },
          responses: {
            '201': { description: 'Workflow created' },
          },
        },
      },
    };
  }

  /**
   * Generate component schemas
   */
  private generateSchemas(): Record<string, any> {
    return {
      // Auth
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },

      // Sales
      Sale: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'string' },
          clientId: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
          totalAmount: { type: 'number', format: 'decimal' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateSaleRequest: {
        type: 'object',
        required: ['clientId', 'items'],
        properties: {
          clientId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
        },
      },
      UpdateSaleRequest: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          items: { type: 'array' },
        },
      },

      // Stock
      Stock: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          quantity: { type: 'number' },
          minimumLevel: { type: 'number' },
          maximumLevel: { type: 'number' },
        },
      },

      // Account
      Account: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          balance: { type: 'number', format: 'decimal' },
        },
      },

      // Analytics
      SalesAnalytics: {
        type: 'object',
        properties: {
          totalRevenue: { type: 'number' },
          totalOrders: { type: 'number' },
          averageOrderValue: { type: 'number' },
          trend: { type: 'string' },
        },
      },

      // User
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string' },
        },
      },

      // Workflow
      Workflow: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          trigger: { type: 'string' },
          steps: { type: 'array' },
          enabled: { type: 'boolean' },
        },
      },
      CreateWorkflowRequest: {
        type: 'object',
        required: ['name', 'trigger', 'steps'],
        properties: {
          name: { type: 'string' },
          trigger: { type: 'string' },
          steps: { type: 'array' },
        },
      },
    };
  }

  /**
   * Generate security schemes
   */
  private generateSecuritySchemes(): Record<string, any> {
    return {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token authentication',
      },
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sessionId',
        description: 'Session-based authentication',
      },
    };
  }

  /**
   * Generate API tags
   */
  private generateTags(): Array<{
    name: string;
    description: string;
  }> {
    return [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Sales',
        description: 'Sales orders and management',
      },
      {
        name: 'Inventory',
        description: 'Stock and inventory management',
      },
      {
        name: 'Financial',
        description: 'Accounting and financial operations',
      },
      {
        name: 'Analytics',
        description: 'Business intelligence and analytics',
      },
      {
        name: 'Data Management',
        description: 'Data import/export operations',
      },
      {
        name: 'Workflows',
        description: 'Business process automation',
      },
      {
        name: 'Users',
        description: 'User management and administration',
      },
    ];
  }

  /**
   * Generate HTML documentation
   */
  generateSwaggerUI(): string {
    const spec = this.generateSwaggerSchema();
    return `
<!DOCTYPE html>
<html>
  <head>
    <title>NexaGestion ERP API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='data:application/json,${encodeURIComponent(JSON.stringify(spec))}'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
  </body>
</html>
    `;
  }

  /**
   * Export OpenAPI JSON
   */
  exportOpenAPIJSON(): string {
    const spec = this.generateSwaggerSchema();
    return JSON.stringify(spec, null, 2);
  }
}

export const swaggerService = new SwaggerService();
