import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import connectDB from '../../../../lib/mongose';
import Gallery from '../../../../models/Gallery';

// DELETE /api/gallery/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await connectDB();
    const image = await Gallery.findById(id);

    if (!image) {
      return NextResponse.json(
        { message: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete the file from the filesystem
    const filePath = join(process.cwd(), 'public', image.url);
    try {
      await unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
      // Continue even if file deletion fails
    }

    // Delete the record from the database
    await Gallery.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { message: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
