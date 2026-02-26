// src/components/layout/ScreenBackground.jsx

/**
 * ScreenBackground
 *
 * Reusable full-screen background wrapper used by all display screens.
 * Renders the WWBAM set photo as a background image with a dark overlay
 * to ensure UI content remains legible against the image.
 *
 * Usage:
 *   <ScreenBackground>
 *     <YourScreenContent />
 *   </ScreenBackground>
 *
 * The overlay opacity can be tuned via the `overlayOpacity` prop (0–1).
 * Defaults to 0.42 — dark enough for text legibility, light enough for
 * the set atmosphere to come through.
 *
 * @param {{
 *   children:       React.ReactNode,
 *   overlayOpacity: number,           - Dark overlay opacity (default: 0.42)
 *   className:      string,           - Extra classes on the root element
 * }} props
 */
export default function ScreenBackground({
  children,
  overlayOpacity = 0.42,
  className = '',
}) {
  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{
        backgroundImage: 'url(/images/wwbam-set-bg-1.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      {/* Dark overlay — keeps all screen content legible */}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(5, 5, 28, ${overlayOpacity})` }}
        aria-hidden="true"
      />

      {/* Screen content rendered above the overlay */}
      <div className="relative w-full h-full z-10">{children}</div>
    </div>
  );
}
