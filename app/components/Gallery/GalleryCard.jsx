import { MapPin } from 'lucide-react';
import Image from 'next/image';

const GalleryCard = ({ title, image, location }) => {

    return (
        <div
            className="group cursor-pointer border-0 p-0 h-72 bg-gray-100 w-full rounded-lg overflow-hidden"
        >
            <div className="relative w-full h-full">
                {/* Image */}
                <Image
                    src={image || '/placeholder-image.svg'}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all duration-300 group-hover:scale-105"
                    priority={false}
                    onError={(e) => {
                        e.target.src = '/placeholder-image.svg';
                    }}
                />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-lg font-bold">Turf Image</h3>
                            <div className="flex items-center text-sm mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{location || 'Location not available'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default GalleryCard;
