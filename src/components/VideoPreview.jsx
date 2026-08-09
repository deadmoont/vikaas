import { useEffect, useRef } from "react";

// Attaches a MediaStream to its own local <video> element. Deliberately not
// just "the video with camera.videoRef" — a single shared ref can only ever
// point at one DOM node, so if the stream needs to show up in two places
// that mount at different times (a modal, then an inline preview), only
// whichever element happened to be mounted when the stream first arrived
// would ever actually get it. This re-applies the assignment in an effect
// keyed on `stream`, so every mount gets the live feed correctly.
export default function VideoPreview({ stream, className }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream || null;
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline muted className={className} />;
}
