interface ImageAnnotationProps {
  source: string,
  alt: string
  annotation?: string,
  width?: number, 
  height?: number
}

export const ImageAnnotation = ({ 
  source, alt, annotation, width, height
}: ImageAnnotationProps) => {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <img
        src={source}
        alt={alt}
        width={width || 360}
        height={height || 360}
        loading="lazy"
      />  
      <p className="text-md text-white md:text-lg">
        {annotation}
      </p>
    </div>
  )
}