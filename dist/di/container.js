"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCases = exports.repositories = exports.chatController = exports.addressController = exports.adminUserController = exports.userController = void 0;
// ==================== REPOSITORIES ====================
const UserRepository_1 = require("../data/repositories/UserRepository");
const AddressRepository_1 = require("../data/repositories/AddressRepository");
const PostRepository_1 = require("../data/repositories/PostRepository");
const ChatSupportRepository_1 = require("../data/repositories/ChatSupportRepository");
const DirectMessageRepository_1 = require("../data/repositories/DirectMessageRepository");
// ==================== USE CASES ====================
// User Use Cases
const GetUserProfile_usecase_1 = require("../domain/usecases/user/GetUserProfile.usecase");
const UpdateUserProfile_usecase_1 = require("../domain/usecases/user/UpdateUserProfile.usecase");
const ResetPassword_usecase_1 = require("../domain/usecases/user/ResetPassword.usecase");
const ChangePassword_usecase_1 = require("../domain/usecases/user/ChangePassword.usecase");
const UpdateUserAvatar_usecase_1 = require("../domain/usecases/user/UpdateUserAvatar.usecase");
const LockUser_usecase_1 = require("../domain/usecases/user/LockUser.usecase");
// Address Use Cases
const GetUserAddresses_usecase_1 = require("../domain/usecases/address/GetUserAddresses.usecase");
const CreateAddress_usecase_1 = require("../domain/usecases/address/CreateAddress.usecase");
const UpdateAddress_usecase_1 = require("../domain/usecases/address/UpdateAddress.usecase");
const DeleteAddress_usecase_1 = require("../domain/usecases/address/DeleteAddress.usecase");
const SetDefaultAddress_usecase_1 = require("../domain/usecases/address/SetDefaultAddress.usecase");
// ==================== CONTROLLERS ====================
const UserController_1 = require("../presentation/controllers/UserController");
const AddressController_1 = require("../presentation/controllers/AddressController");
const GetUsersByIds_usecase_1 = require("../domain/usecases/user/GetUsersByIds.usecase");
const GetUsers_usecase_1 = require("../domain/usecases/user/GetUsers.usecase");
const AdminUserController_1 = require("../presentation/controllers/AdminUserController");
const ListChatThreads_usecase_1 = require("../domain/usecases/chat/ListChatThreads.usecase");
const ListChatMessages_usecase_1 = require("../domain/usecases/chat/ListChatMessages.usecase");
const SendChatMessage_usecase_1 = require("../domain/usecases/chat/SendChatMessage.usecase");
const MarkThreadRead_usecase_1 = require("../domain/usecases/chat/MarkThreadRead.usecase");
const ChatController_1 = require("../presentation/controllers/ChatController");
const GroupRepository_1 = require("../data/repositories/GroupRepository");
const CreateGroup_usecase_1 = require("../domain/usecases/chat/CreateGroup.usecase");
const ListGroups_usecase_1 = require("../domain/usecases/chat/ListGroups.usecase");
const GetGroup_usecase_1 = require("../domain/usecases/chat/GetGroup.usecase");
// ==================== REPOSITORY INSTANCES ====================
const userRepository = new UserRepository_1.UserRepository();
const addressRepository = new AddressRepository_1.AddressRepository();
const postRepository = new PostRepository_1.PostRepository();
const chatSupportRepository = new ChatSupportRepository_1.ChatSupportRepository();
const directMessageRepository = new DirectMessageRepository_1.DirectMessageRepository();
const groupRepository = new GroupRepository_1.GroupRepository();
// ==================== USE CASE INSTANCES ====================
// User Use Cases
const getUserProfileUseCase = new GetUserProfile_usecase_1.GetUserProfileUseCase(userRepository);
const updateUserProfileUseCase = new UpdateUserProfile_usecase_1.UpdateUserProfileUseCase(userRepository);
const resetPasswordUseCase = new ResetPassword_usecase_1.ResetPasswordUseCase(userRepository);
const changePasswordUseCase = new ChangePassword_usecase_1.ChangePasswordUseCase(userRepository);
const updateUserAvatarUseCase = new UpdateUserAvatar_usecase_1.UpdateUserAvatarUseCase(userRepository);
const lockUserUseCase = new LockUser_usecase_1.LockUserUseCase(userRepository);
const getUsersByIdsUseCase = new GetUsersByIds_usecase_1.GetUsersByIdsUseCase(userRepository);
const getUsersUseCase = new GetUsers_usecase_1.GetUsersUseCase(userRepository);
// Address Use Cases
const getUserAddressesUseCase = new GetUserAddresses_usecase_1.GetUserAddressesUseCase(addressRepository);
const createAddressUseCase = new CreateAddress_usecase_1.CreateAddressUseCase(addressRepository);
const updateAddressUseCase = new UpdateAddress_usecase_1.UpdateAddressUseCase(addressRepository);
const deleteAddressUseCase = new DeleteAddress_usecase_1.DeleteAddressUseCase(addressRepository);
const setDefaultAddressUseCase = new SetDefaultAddress_usecase_1.SetDefaultAddressUseCase(addressRepository);
// Chat Use Cases
const listChatThreadsUseCase = new ListChatThreads_usecase_1.ListChatThreadsUseCase(directMessageRepository);
const listChatMessagesUseCase = new ListChatMessages_usecase_1.ListChatMessagesUseCase(directMessageRepository);
const sendChatMessageUseCase = new SendChatMessage_usecase_1.SendChatMessageUseCase(directMessageRepository);
const markThreadReadUseCase = new MarkThreadRead_usecase_1.MarkThreadReadUseCase(directMessageRepository);
// Groups
const createGroupUseCase = new CreateGroup_usecase_1.CreateGroupUseCase(groupRepository);
const listGroupsUseCase = new ListGroups_usecase_1.ListGroupsUseCase(groupRepository);
const getGroupUseCase = new GetGroup_usecase_1.GetGroupUseCase(groupRepository);
// ==================== CONTROLLER INSTANCES ====================
exports.userController = new UserController_1.UserController(getUserProfileUseCase, updateUserProfileUseCase, resetPasswordUseCase, changePasswordUseCase, updateUserAvatarUseCase, lockUserUseCase, getUsersUseCase);
// Admin user list use-case + controller
exports.adminUserController = new AdminUserController_1.AdminUserController(getUsersUseCase, updateUserProfileUseCase);
exports.addressController = new AddressController_1.AddressController(getUserAddressesUseCase, createAddressUseCase, updateAddressUseCase, deleteAddressUseCase, setDefaultAddressUseCase);
exports.chatController = new ChatController_1.ChatController(listChatThreadsUseCase, listChatMessagesUseCase, sendChatMessageUseCase, markThreadReadUseCase, createGroupUseCase, listGroupsUseCase, getGroupUseCase);
// ==================== EXPORTS FOR REUSE ====================
exports.repositories = {
    userRepository,
    addressRepository,
    postRepository,
    chatSupportRepository,
    directMessageRepository,
    groupRepository,
};
exports.useCases = {
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
