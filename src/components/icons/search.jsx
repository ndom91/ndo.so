export default function Search({
  fill = 'currentColor',
  filled,
  size,
  height,
  width,
  label,
  ...props
}) {
  return (
    <svg
      className="h-6 w-6"
      width={size || width || 24}
      height={size || height || 24}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}
