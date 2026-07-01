type MobileSectionTitleProps = {
  title: string;
  description?: string;
};

export default function MobileSectionTitle({
  title,
  description,
}: MobileSectionTitleProps) {
  return (
    <div className="mb-8 px-6 text-center">
      <h3 className="text-[32px] font-bold leading-[1.3] text-navy">{title}</h3>
      {description && (
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.7] text-navy/70">
          {description}
        </p>
      )}
    </div>
  );
}
