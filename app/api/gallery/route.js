import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import connectDB from '../../../lib/mongoose';
import Gallery from '../../../models/Gallery';
import { getTenant } from '../../../lib/tenant';

// Ensure the upload directory exists
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const uploadDir = join(process.cwd(), 'public/uploads/gallery');
if (!existsSync(uploadDir)) {
  await mkdir(uploadDir, { recursive: true });
}

// GET /api/gallery
export async function GET() {
  try {
    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ message: "Tenant not identified" }, { status: 400 });

    const images = await Gallery.find({ tenantId: tenant._id }).sort({ createdAt: -1 });
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { message: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

// POST /api/gallery
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${file.name.replace(/\\/g, '')}-${uniqueSuffix}.${mime.extension(file.type) || 'jpg'
      }`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ message: "Tenant not identified" }, { status: 400 });

    const image = new Gallery({
      name: file.name,
      url: `/uploads/gallery/${filename}`,
      mimeType: file.type,
      size: file.size,
      tenantId: tenant._id,
    });

    await image.save();

    return NextResponse.json({
      message: 'Image uploaded successfully',
      image,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { message: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
