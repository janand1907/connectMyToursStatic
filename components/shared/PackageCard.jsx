import Image from "next/image";
import Link from "next/link";

export default function PackageCard({ image, title, price, duration, highlights = [], bookUrl }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-primary-300/20">
        {image ? (
          <Image src={image} alt={title} fill loading="lazy" className="object-cover" />
        ) : (
          <span className="font-display text-sm font-medium text-primary-600/70">
            Photo coming soon
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-primary-800">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{duration}</p>

        <ul className="mt-3 flex-1 space-y-1.5 text-sm text-neutral-600">
          {highlights.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-0.5 text-primary-500" aria-hidden="true">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-800">{price}</span>
          <Link href={bookUrl} className="btn-secondary px-4 py-2 text-sm">
            Enquire Now
          </Link>
        </div>
      </div>
    </article>
  );
}
