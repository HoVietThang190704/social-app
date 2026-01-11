// ==================== REPOSITORIES ====================
import { UserRepository } from '../data/repositories/UserRepository';
import { AddressRepository } from '../data/repositories/AddressRepository';
import { PostRepository } from '../data/repositories/PostRepository';
import { ChatSupportRepository } from '../data/repositories/ChatSupportRepository';
import { DirectMessageRepository } from '../data/repositories/DirectMessageRepository';

// ==================== USE CASES ====================
// User Use Cases
import { GetUserProfileUseCase } from '../domain/usecases/user/GetUserProfile.usecase';
import { UpdateUserProfileUseCase } from '../domain/usecases/user/UpdateUserProfile.usecase';
import { ResetPasswordUseCase } from '../domain/usecases/user/ResetPassword.usecase';
import { ChangePasswordUseCase } from '../domain/usecases/user/ChangePassword.usecase';
import { UpdateUserAvatarUseCase } from '../domain/usecases/user/UpdateUserAvatar.usecase';
import { LockUserUseCase } from '../domain/usecases/user/LockUser.usecase';

// Address Use Cases
import { GetUserAddressesUseCase } from '../domain/usecases/address/GetUserAddresses.usecase';
import { CreateAddressUseCase } from '../domain/usecases/address/CreateAddress.usecase';
import { UpdateAddressUseCase } from '../domain/usecases/address/UpdateAddress.usecase';
import { DeleteAddressUseCase } from '../domain/usecases/address/DeleteAddress.usecase';
import { SetDefaultAddressUseCase } from '../domain/usecases/address/SetDefaultAddress.usecase';

// ==================== CONTROLLERS ====================
import { UserController } from '../presentation/controllers/UserController';
import { AddressController } from '../presentation/controllers/AddressController';
import { GetUsersByIdsUseCase } from '../domain/usecases/user/GetUsersByIds.usecase';
import { GetUsersUseCase } from '../domain/usecases/user/GetUsers.usecase';
import { AdminUserController } from '../presentation/controllers/AdminUserController';
import { ListChatThreadsUseCase } from '../domain/usecases/chat/ListChatThreads.usecase';
import { ListChatMessagesUseCase } from '../domain/usecases/chat/ListChatMessages.usecase';
import { SendChatMessageUseCase } from '../domain/usecases/chat/SendChatMessage.usecase';
import { MarkThreadReadUseCase } from '../domain/usecases/chat/MarkThreadRead.usecase';
import { ChatController } from '../presentation/controllers/ChatController';
import { GroupRepository } from '../data/repositories/GroupRepository';
import { CreateGroupUseCase } from '../domain/usecases/chat/CreateGroup.usecase';
import { ListGroupsUseCase } from '../domain/usecases/chat/ListGroups.usecase';
import { GetGroupUseCase } from '../domain/usecases/chat/GetGroup.usecase';

// ==================== REPOSITORY INSTANCES ====================
const userRepository = new UserRepository();
const addressRepository = new AddressRepository();
const postRepository = new PostRepository();
const chatSupportRepository = new ChatSupportRepository();
const directMessageRepository = new DirectMessageRepository();
const groupRepository = new GroupRepository();

// ==================== USE CASE INSTANCES ====================
// User Use Cases
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository);
const updateUserAvatarUseCase = new UpdateUserAvatarUseCase(userRepository);
const lockUserUseCase = new LockUserUseCase(userRepository);
const getUsersByIdsUseCase = new GetUsersByIdsUseCase(userRepository);
const getUsersUseCase = new GetUsersUseCase(userRepository);

// Address Use Cases
const getUserAddressesUseCase = new GetUserAddressesUseCase(addressRepository);
const createAddressUseCase = new CreateAddressUseCase(addressRepository);
const updateAddressUseCase = new UpdateAddressUseCase(addressRepository);
const deleteAddressUseCase = new DeleteAddressUseCase(addressRepository);
const setDefaultAddressUseCase = new SetDefaultAddressUseCase(addressRepository);

// Chat Use Cases
const listChatThreadsUseCase = new ListChatThreadsUseCase(directMessageRepository);
const listChatMessagesUseCase = new ListChatMessagesUseCase(directMessageRepository);
const sendChatMessageUseCase = new SendChatMessageUseCase(directMessageRepository);
const markThreadReadUseCase = new MarkThreadReadUseCase(directMessageRepository);

// Groups
const createGroupUseCase = new CreateGroupUseCase(groupRepository);
const listGroupsUseCase = new ListGroupsUseCase(groupRepository);
const getGroupUseCase = new GetGroupUseCase(groupRepository);

// ==================== CONTROLLER INSTANCES ====================
export const userController = new UserController(
  getUserProfileUseCase,
  updateUserProfileUseCase,
  resetPasswordUseCase,
  changePasswordUseCase,
  updateUserAvatarUseCase,
  lockUserUseCase,
  getUsersUseCase
);

// Admin user list use-case + controller
export const adminUserController = new AdminUserController(getUsersUseCase, updateUserProfileUseCase);

export const addressController = new AddressController(
  getUserAddressesUseCase,
  createAddressUseCase,
  updateAddressUseCase,
  deleteAddressUseCase,
  setDefaultAddressUseCase
);

export const chatController = new ChatController(
  listChatThreadsUseCase,
  listChatMessagesUseCase,
  sendChatMessageUseCase,
  markThreadReadUseCase,
  createGroupUseCase,
  listGroupsUseCase,
  getGroupUseCase
);

// ==================== EXPORTS FOR REUSE ====================
export const repositories = {
  userRepository,
  addressRepository,
  postRepository,
  chatSupportRepository,
  directMessageRepository,
  groupRepository,
};

export const useCases = {
  // User
  getUserProfileUseCase,
  updateUserProfileUseCase,
  resetPasswordUseCase,
  changePasswordUseCase,
  updateUserAvatarUseCase,
  getUsersUseCase,
  getUsersByIdsUseCase,
  // Address
  getUserAddressesUseCase,
  createAddressUseCase,
  updateAddressUseCase,
  deleteAddressUseCase,
  setDefaultAddressUseCase,
  // Chat
  listChatThreadsUseCase,
  listChatMessagesUseCase,
  sendChatMessageUseCase,
  markThreadReadUseCase,
  createGroupUseCase,
  listGroupsUseCase,
  getGroupUseCase,
};

