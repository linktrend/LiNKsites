interface Props {
  coordinates: string;
}

export function GoogleMapEmbed({ coordinates }: Props) {
  const src = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(coordinates)}`;
  return (
    <div className="aspect-[4/3] rounded-lg overflow-hidden border">
      <iframe title="Office location" src={src} className="w-full h-full border-0" loading="lazy" allowFullScreen />
    </div>
  );
}
