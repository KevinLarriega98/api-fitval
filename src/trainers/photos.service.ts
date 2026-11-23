import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const EXTENSIONS: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

@Injectable()
export class PhotosService {
  async saveLocal(file: Express.Multer.File): Promise<string> {
    const fileName = randomUUID() + EXTENSIONS[file.mimetype];

    await mkdir('uploads', { recursive: true });
    await writeFile(join('uploads', fileName), file.buffer);

    return `/uploads/${fileName}`;
  }
}
