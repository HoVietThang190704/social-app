import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from '../../config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fresh Food Platform API',
      version: '1.0.0',
      description: 'API documentation for Fresh Food Platform - Thương mại điện tử thực phẩm tươi sạch',
      contact: {
        name: 'HoVietThang190704',
        email: 'hovietthang1907@gmail.com',
        url: 'https://github.com/HoVietThang190704/BE_DACN_v1'
      }
    },
    servers: [
      {
        url: '/',
        description: 'Current server (auto-detected)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          // correct OpenAPI 3.0 scheme for HTTP Bearer tokens
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Enter ONLY the token value (the UI will add "Bearer ").'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        Address: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            recipientName: {
              type: 'string',
              example: 'Nguyễn Văn A'
            },
            phone: {
              type: 'string',
              example: '0901234567'
            },
            address: {
              type: 'string',
              example: '123 Đường ABC'
            },
            ward: {
              type: 'string',
              example: 'Phường 1'
            },
            district: {
              type: 'string',
              example: 'Quận 1'
            },
            province: {
              type: 'string',
              example: 'TP. Hồ Chí Minh'
            },
            fullAddress: {
              type: 'string',
              example: '123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh'
            },
            isDefault: {
              type: 'boolean',
              example: true
            },
            label: {
              type: 'string',
              enum: ['home', 'work', 'other'],
              example: 'home'
            },
            note: {
              type: 'string',
              example: 'Gọi trước khi giao'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        TicketComment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ticketId: { type: 'string' },
            authorId: { type: 'string' },
            message: { type: 'string' },
            attachments: { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, filename: { type: 'string' } } } },
            isInternal: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Order schema removed for social-app fork (ecommerce features are not used)
        // If needed later, re-introduce a dedicated Order schema here.
        TicketCreate: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Sản phẩm giao thiếu' },
            description: { type: 'string', example: 'Thiếu 2 gói rau trong đơn hàng ORD123' },
            type: { type: 'string', enum: ['support','bug','feature','question','refund','other'] },
            priority: { type: 'string', enum: ['low','medium','high','urgent'] },
            relatedOrderId: { type: 'string' },
            relatedShopId: { type: 'string' },
            attachments: { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, filename: { type: 'string' } } } },
            isPublic: { type: 'boolean' }
          }
        },
        Ticket: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string' },
            priority: { type: 'string' },
            status: { type: 'string' },
            createdBy: { type: 'string' },
            assignedTo: { type: 'string', nullable: true },
            commentsCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Quản lý đăng nhập, đăng ký và xác thực người dùng'
      },
      {
        name: 'Categories',
        description: 'Quản lý danh mục (nếu cần)'
      },
      {
        name: 'Users',
        description: 'Quản lý thông tin người dùng'
      },
      {
        name: 'Posts',
        description: 'Quản lý bài viết cộng đồng (Social Network Posts)'
      },
      {
        name: 'Comments',
        description: 'Quản lý bình luận trên bài viết (3 levels nested comments)'
      },

      {
        name: 'Upload',
        description: 'Upload và quản lý file ảnh/video'
      },
      {
        name: 'System',
        description: 'Các API hệ thống và health check'
      }
    ]
  },
  // apply bearerAuth globally by default in UI (endpoints may still override)
  security: [ { bearerAuth: [] } ],
  apis: [
    './src/routes/*.ts',
    './src/models/*.ts'
  ]
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger JSON endpoint
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Fresh Food Platform API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true
    }
  }));

  console.log('📖 Swagger docs available at: /api/docs');
};