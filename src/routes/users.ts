import { Router } from 'express';
import { userController, addressController, repositories, adminUserController } from '../di/container';
import { authenticate } from '../shared/middleware/auth';
import { isAdmin } from '../shared/middleware/authorize';
import { validate } from '../shared/middleware/validate';
import { updateProfileSchema } from '../shared/validation/user.schema';
import { createAddressSchema, updateAddressSchema } from '../shared/validation/address.schema';
import { adminUpdateUserSchema, lockUserSchema } from '../shared/validation/admin.schema';
import { UserMapper } from '../presentation/dto/user/User.dto';
import { uploadAvatar } from '../shared/middleware/upload';
import { requireFile } from '../shared/middleware/uploadValidate';
import { HttpStatus } from '../shared/constants/httpStatus';

export const userRoutes = Router();

/**
 * @swagger
 * /api/users/me/profile:
 *   get:
 *     summary: Lấy thông tin hồ sơ người dùng hiện tại
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin profile thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lấy thông tin profile thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     userName:
 *                       type: string
 *                       example: Nguyễn Văn A
 *                     phone:
 *                       type: string
 *                       example: "0901234567"
 *                     avatar:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     dateOfBirth:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-01-01T00:00:00.000Z"
 *                     role:
 *                       type: string
 *                       example: customer
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
// GET /api/users/me/profile - Get current user profile
userRoutes.get(
  '/me/profile',
  authenticate,
  (req, res) => userController.getProfile(req, res)
);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Tìm kiếm người dùng theo tên hoặc email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (tối thiểu 2 ký tự)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Danh sách người dùng phù hợp
 */
userRoutes.get('/search', authenticate, (req, res) => userController.searchUsers(req, res));

/**
 * @swagger
 * /api/users/{userId}/public-profile:
 *   get:
 *     summary: Lấy thông tin công khai của người dùng theo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần lấy thông tin
 *     responses:
 *       200:
 *         description: Lấy thông tin public profile thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lấy thông tin public profile thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     userName:
 *                       type: string
 *                       example: Nguyễn Văn A
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     avatar:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     role:
 *                       type: string
 *                       example: customer
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
// GET /api/users/:userId/public-profile - Get public profile of any user (no auth required)
userRoutes.get(
  '/:userId/public-profile',
  (req, res) => userController.getPublicProfile(req, res)
);

/**
 * @swagger
 * /api/users/me/profile:
 *   put:
 *     summary: Cập nhật hồ sơ người dùng hiện tại
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: Nguyễn Văn B
 *                 description: Tên người dùng (1-50 ký tự)
 *               phone:
 *                 type: string
 *                 pattern: '^(\+84|84|0)[1-9][0-9]{8}$'
 *                 example: "0901234567"
 *                 description: Số điện thoại Việt Nam hợp lệ
 *               date_of_birth:
 *                 type: string
 *                 format: date-time
 *                 example: "1990-01-01T00:00:00.000Z"
 *                 description: Ngày sinh (phải trên 13 tuổi)
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/new-avatar.jpg
 *                 description: URL ảnh đại diện
 *             minProperties: 1
 *           examples:
 *             updateName:
 *               summary: Cập nhật tên
 *               value:
 *                 userName: Nguyễn Văn B
 *             updatePhone:
 *               summary: Cập nhật số điện thoại
 *               value:
 *                 phone: "0901234567"
 *             updateMultiple:
 *               summary: Cập nhật nhiều trường
 *               value:
 *                 userName: Nguyễn Văn B
 *                 phone: "0901234567"
 *                 date_of_birth: "1990-01-01T00:00:00.000Z"
 *                 avatar: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Cập nhật profile thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cập nhật profile thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     userName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date-time
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Số điện thoại không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
// PUT /api/users/me/profile - Update current user profile
userRoutes.put(
  '/me/profile',
  authenticate,
  validate(updateProfileSchema),
  (req, res) => userController.updateProfile(req, res)
);

/**
 * @swagger
 * /api/users/me/avatar:
 *   post:
 *     summary: Cập nhật ảnh đại diện
 *     description: Upload ảnh đại diện lên Cloudinary và cập nhật thông tin người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh (jpg, jpeg, png, gif, webp) - tối đa 5MB
 *     responses:
 *       200:
 *         description: Cập nhật ảnh đại diện thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cập nhật ảnh đại diện thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: string
 *                       format: uri
 *                       example: https://res.cloudinary.com/dtk2qgorj/image/upload/v1234567890/fresh-food/avatars/user123.jpg
 *       400:
 *         description: Lỗi validation (không có file hoặc file không hợp lệ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Vui lòng chọn file ảnh để upload
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server khi upload
 */
// POST /api/users/me/avatar - Upload avatar
userRoutes.post(
  '/me/avatar',
  authenticate,
  (req, res, next) => {
    uploadAvatar(req, res, (err: any) => {
      if (err) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: err.message || 'Lỗi khi upload file'
        });
      }
      return next();
    });
  },
  requireFile('avatar'),
  (req, res) => userController.uploadAvatar(req, res)
);

// Legacy endpoints
userRoutes.get('/profile', authenticate, (req, res) => {
  res.redirect(307, '/api/users/me/profile');
});

userRoutes.put('/profile', authenticate, validate(updateProfileSchema), (req, res) => {
  res.redirect(307, '/api/users/me/profile');
});

/**
 * @swagger
 * /api/users/me/addresses:
 *   get:
 *     summary: Lấy danh sách địa chỉ giao hàng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách địa chỉ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Chưa đăng nhập
 *   post:
 *     summary: Tạo địa chỉ giao hàng mới
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Tạo địa chỉ thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
userRoutes.get('/me/addresses', authenticate, (req, res) => {
  addressController.getUserAddresses(req, res);
});

userRoutes.post('/me/addresses', authenticate, validate(createAddressSchema), (req, res) => {
  addressController.createAddress(req, res);
});

userRoutes.put('/me/addresses/:id', authenticate, validate(updateAddressSchema), (req, res) => {
  addressController.updateAddress(req, res);
});

userRoutes.delete('/me/addresses/:id', authenticate, (req, res) => {
  addressController.deleteAddress(req, res);
});

/**
 * @swagger
 * /api/users/me/addresses/{id}:
 *   put:
 *     summary: Cập nhật địa chỉ giao hàng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Cập nhật địa chỉ thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy địa chỉ
 *   delete:
 *     summary: Xóa địa chỉ giao hàng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa địa chỉ thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy địa chỉ
 */
/**
 * @swagger
 * /api/users/me/addresses/{id}/default:
 *   patch:
 *     summary: Đặt địa chỉ làm mặc định
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của địa chỉ
 *     responses:
 *       200:
 *         description: Đặt địa chỉ mặc định thành công
 *       404:
 *         description: Không tìm thấy địa chỉ
 *       401:
 *         description: Chưa đăng nhập
 */
userRoutes.patch('/me/addresses/:id/default', authenticate, (req, res) => {
  addressController.setDefaultAddress(req, res);
});

// Order endpoints removed for social-app fork (not applicable to social features)
// Order and voucher endpoints removed (not relevant for social app fork)

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách người dùng (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           example: customer
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: Nguyen
 *     responses:
 *       200:
 *         description: Danh sách người dùng trả về thành công
 */
userRoutes.get('/', authenticate, isAdmin, (req, res) => adminUserController.listUsers(req, res));

// Khóa/mở khóa tài khoản (chỉ admin)
userRoutes.patch('/:id/lock', authenticate, isAdmin, validate(lockUserSchema), (req, res) => userController.lockUser(req, res));

userRoutes.put('/:id', authenticate, isAdmin, validate(adminUpdateUserSchema), (req, res) => adminUserController.updateUser(req, res));

// Cập nhật thông tin user theo id (chỉ admin)
userRoutes.put('/:id', authenticate, isAdmin, (req, res) => adminUserController.updateUser(req, res));
