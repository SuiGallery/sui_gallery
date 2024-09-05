interface ImageDisplayProps {
    imageUrl: string;
    isLoading: boolean;
  }
  
  export function ImageDisplay({ imageUrl, isLoading }: ImageDisplayProps) {
    return (
      <div className="flex h-1/2 bg-gray-200 rounded-xl w-1/2 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Generating image...
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Generated" className="w-full h-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Your image will appear here
          </div>
        )}
      </div>
    );
  }