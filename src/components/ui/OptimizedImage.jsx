/**
 * OptimizedImage — drop-in replacement for <img> with audit-required defaults.
 * - loading="lazy" for all below-fold images
 * - Requires explicit width + height to prevent CLS
 * - Passes fetchPriority="high" when priority prop is set (LCP images only)
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  style,
  srcSet,
  sizes,
  ...props
}) {
  return (
    <img
      src={src}
      alt={alt ?? ''}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={style}
      srcSet={srcSet}
      sizes={sizes}
      {...props}
    />
  )
}
