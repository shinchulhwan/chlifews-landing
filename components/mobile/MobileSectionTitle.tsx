type MobileSectionTitleProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function MobileSectionTitle({
  title,
  description,
  className = "",
}: MobileSectionTitleProps) {
  return (
    <div className={`mb-8 text-center ${className}`}>
      <h3 className="text-[32px] font-bold leading-[1.3] break-keep break-words text-navy">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.7] break-keep break-words text-navy/70">
          {description}
        </p>
      )}
    </div>
  );
}
