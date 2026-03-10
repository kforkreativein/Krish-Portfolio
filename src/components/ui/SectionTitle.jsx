export default function SectionTitle({ dim, bold }) {
  return (
    <h2
      className="font-heading font-extrabold leading-[1.05] tracking-[-0.035em]"
      style={{ fontSize: 'clamp(34px, 4.5vw, 60px)' }}
    >
      <span className="block text-[#2D2D2D] dark:text-[#FFFFF0]">{dim}</span>
      <span className="block text-[#2D2D2D] dark:text-[#FFFFF0]">{bold}</span>
    </h2>
  )
}
