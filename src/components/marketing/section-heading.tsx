export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-10 flex max-w-2xl flex-col gap-3 text-center sm:mb-12 sm:mx-auto">
      <p className="flex items-center justify-center gap-2 text-xs font-medium tracking-widest text-brand">
        <span className="size-1 rounded-full bg-brand" aria-hidden="true" />
        {eyebrow}
        <span className="size-1 rounded-full bg-brand" aria-hidden="true" />
      </p>
      <h2 id={id} className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
