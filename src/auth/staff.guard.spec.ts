import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StaffGuard } from './staff.guard';

describe('StaffGuard', () => {
  const fakeUsersService = { findById: jest.fn() };
  const guard = new StaffGuard(fakeUsersService as unknown as UsersService);

  const context = {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: 1 },
      }),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    fakeUsersService.findById.mockReset();
  });

  it('deja pasar al personal', async () => {
    fakeUsersService.findById.mockResolvedValue({
      id: 1,
      role: 'staff',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('no deja pasar a un socio', async () => {
    fakeUsersService.findById.mockResolvedValue({
      id: 1,
      role: 'member',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rechaza al usuario que ya no existe', async () => {
    fakeUsersService.findById.mockResolvedValue(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
