const { DeletePostUseCase } = require('../../dist/domain/usecases/post/DeletePost.usecase');

describe('DeletePostUseCase', () => {
  it('deletes post when requester is the author', async () => {
    const mockPost = {
      isOwnedBy: (userId) => userId === 'author123',
      canBeDeletedBy: (userId, isAdmin) => isAdmin === true || userId === 'author123'
    };

    const postRepository = {
      findById: jest.fn().mockResolvedValue(mockPost),
      delete: jest.fn().mockResolvedValue(true)
    };

    const commentRepository = {
      deleteByPostId: jest.fn().mockResolvedValue(true)
    };

    const usecase = new DeletePostUseCase(postRepository, commentRepository, undefined);

    await expect(usecase.execute({ postId: 'post1', userId: 'author123' })).resolves.toBe(true);
    expect(postRepository.findById).toHaveBeenCalledWith('post1');
    expect(commentRepository.deleteByPostId).toHaveBeenCalledWith('post1');
    expect(postRepository.delete).toHaveBeenCalledWith('post1');
  });

  it('allows admin to delete post even if not the author', async () => {
    const mockPost = { isOwnedBy: (userId) => false, canBeDeletedBy: (userId, isAdmin) => isAdmin === true };

    const postRepository = {
      findById: jest.fn().mockResolvedValue(mockPost),
      delete: jest.fn().mockResolvedValue(true)
    };

    const commentRepository = {
      deleteByPostId: jest.fn().mockResolvedValue(true)
    };

    const usecase = new DeletePostUseCase(postRepository, commentRepository, undefined);

    await expect(usecase.execute({ postId: 'post1', userId: 'adminId', isAdmin: true })).resolves.toBe(true);
    expect(postRepository.findById).toHaveBeenCalledWith('post1');
    expect(commentRepository.deleteByPostId).toHaveBeenCalledWith('post1');
    expect(postRepository.delete).toHaveBeenCalledWith('post1');
  });

  it('throws when requester is not the author (and not admin)', async () => {
    const mockPost = { isOwnedBy: (userId) => false, canBeDeletedBy: (userId, isAdmin) => isAdmin === true };

    const postRepository = {
      findById: jest.fn().mockResolvedValue(mockPost),
      delete: jest.fn().mockResolvedValue(true)
    };

    const commentRepository = {
      deleteByPostId: jest.fn().mockResolvedValue(true)
    };

    const usecase = new DeletePostUseCase(postRepository, commentRepository, undefined);

    await expect(usecase.execute({ postId: 'post1', userId: 'someoneElse' })).rejects.toThrow('Bạn không có quyền xóa bài viết này');
    expect(postRepository.findById).toHaveBeenCalledWith('post1');
  });
});