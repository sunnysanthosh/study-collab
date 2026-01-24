import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadFile, uploadAvatar, deleteFileAttachment } from '../src/controllers/fileController';
import { CustomError } from '../src/middleware/errorHandler';

vi.mock('../src/utils/fileStorage', () => ({
  upload: { single: vi.fn() },
  getFileUrl: vi.fn(() => 'http://localhost/uploads/file.png'),
  deleteFile: vi.fn(),
}));

vi.mock('../src/models/FileAttachment', () => ({
  FileAttachmentModel: {
    delete: vi.fn(),
  },
}));

vi.mock('../src/utils/logger', () => ({
  logError: vi.fn(),
}));

vi.mock('../src/utils/errorTracker', () => ({
  ErrorTracker: {
    trackFileError: vi.fn(),
  },
}));

vi.mock('../src/models/User', () => ({
  updateUser: vi.fn(),
}));

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.sendFile = vi.fn((_, cb) => cb?.());
  return res;
};

describe('fileController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires file and auth for upload', async () => {
    const res = mockResponse();
    await uploadFile({} as any, res);
    expect(res.status).toHaveBeenCalledWith(400);

    const resAuth = mockResponse();
    await uploadFile({ file: { path: 'uploads/x.png' } } as any, resAuth);
    expect(resAuth.status).toHaveBeenCalledWith(401);
  });

  it('uploads file and returns metadata', async () => {
    const req: any = {
      user: { userId: 'u1' },
      file: {
        filename: 'file.png',
        originalname: 'file.png',
        path: 'uploads/file.png',
        size: 120,
        mimetype: 'image/png',
      },
    };
    const res = mockResponse();

    await uploadFile(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'File uploaded successfully',
      file: expect.objectContaining({ url: 'http://localhost/uploads/file.png' }),
    }));
  });

  it('validates avatar uploads and updates user', async () => {
    const res = mockResponse();
    await uploadAvatar({ file: { mimetype: 'text/plain' } } as any, res);
    expect(res.status).toHaveBeenCalledWith(401);

    const resBad = mockResponse();
    await uploadAvatar({ user: { userId: 'u1' }, file: { mimetype: 'text/plain' } } as any, resBad);
    expect(resBad.status).toHaveBeenCalledWith(400);

    const { updateUser } = await import('../src/models/User');
    (updateUser as any).mockResolvedValue({ avatar_url: 'http://localhost/uploads/avatar.png' });

    const resOk = mockResponse();
    await uploadAvatar(
      {
        user: { userId: 'u1' },
        file: { mimetype: 'image/png', path: 'uploads/avatar.png' },
      } as any,
      resOk
    );

    expect(resOk.json).toHaveBeenCalledWith({
      message: 'Avatar uploaded successfully',
      avatar_url: 'http://localhost/uploads/avatar.png',
    });
  });

  it('deletes file attachment and handles permission errors', async () => {
    const { FileAttachmentModel } = await import('../src/models/FileAttachment');
    const { deleteFile } = await import('../src/utils/fileStorage');

    (FileAttachmentModel.delete as any).mockResolvedValue({ file_path: 'uploads/x.png' });

    const res = mockResponse();
    await deleteFileAttachment(
      { user: { userId: 'u1' }, params: { fileId: 'f1' } } as any,
      res
    );
    expect(deleteFile).toHaveBeenCalledWith('uploads/x.png');
    expect(res.json).toHaveBeenCalledWith({ message: 'File deleted successfully' });

    (FileAttachmentModel.delete as any).mockRejectedValueOnce(new Error('Permission denied'));
    await expect(
      deleteFileAttachment({ user: { userId: 'u1' }, params: { fileId: 'f2' } } as any, res)
    ).rejects.toBeInstanceOf(CustomError);
  });
});
