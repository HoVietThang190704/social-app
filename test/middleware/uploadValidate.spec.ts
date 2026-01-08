const { requireFile, requireFiles } = require('../../dist/shared/middleware/uploadValidate');

describe('uploadValidate middleware', () => {
  test('requireFile returns 400 when no file', () => {
    const req = { file: undefined };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    requireFile('avatar')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('requireFile calls next when file present', () => {
    const req = { file: { originalname: 'a.jpg' } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    requireFile('avatar')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('requireFiles returns 400 when files missing or empty', () => {
    const req = { files: [] };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    requireFiles('images', 1, 10)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('requireFiles calls next when files present', () => {
    const req = { files: [{ originalname: 'a.jpg' }] };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    requireFiles('images', 1, 10)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});