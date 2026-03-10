import { motion } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import { useClients } from '../../hooks/useContent'
import { useTheme } from '../../hooks/useTheme'

const LogoStripSkeleton = () => (
    <div className="flex gap-4 overflow-hidden px-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="shrink-0 w-[160px] h-[72px] rounded-[12px] bg-bg-3 animate-pulse" />
        ))}
    </div>
)

export default function LogoStrip({ siteContent }) {
    const { data: clientsData, loading } = useClients()
    const { theme } = useTheme()
    const headingLines = siteContent?.marquee_heading ? siteContent?.marquee_heading?.split('\n') : ['Worked with the best of the best']

    // Filter out CTA item, derive initial from name
    const displayClients = clientsData
        ? clientsData.filter(c => !c.is_cta).map(c => ({
            ...c,
            initial: c.name ? c.name[0].toUpperCase() : '?',
        }))
        : []

    // Duplicate to create seamless infinite loop
    const stripItems = [...displayClients, ...displayClients, ...displayClients, ...displayClients]

    return (
        <section className="bg-bg overflow-hidden flex flex-col items-center" style={{ paddingTop: 'var(--pad-clients-t)', paddingBottom: 'var(--pad-clients-b)' }}>
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={stagger}
                className="w-full"
            >
                <motion.p
                    variants={fadeUp}
                    className="font-body text-[14px] md:text-[16px] text-center mb-12 opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {headingLines.join(' ')}
                </motion.p>

                {loading ? <LogoStripSkeleton /> : (
                    <div className="relative w-full flex overflow-hidden">
                        {/* Fading Edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-[120px] bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-[120px] bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

                        <div className="flex w-max animate-marquee-forward gap-16 md:gap-24 whitespace-nowrap px-4 hover:pause-none items-center">
                            {(stripItems || []).map((client, index) => {
                                // Default legacy or missing logo
                                let logoSrc = client.logo_url;
                                // If dual logos provided, respect theme
                                if (theme === 'dark' && client.logo_dark_url) logoSrc = client.logo_dark_url;
                                if (theme === 'light' && client.logo_light_url) logoSrc = client.logo_light_url;
                                // Fallback to B&W logic if they have that but no dual logo
                                if (!logoSrc && client.use_bw && client.logo_bw_url) logoSrc = client.logo_bw_url;

                                return (
                                    <div
                                        key={`${client?.id || client?.name || 'client'}-${index}`}
                                        className="flex shrink-0 transition-all duration-500"
                                    >
                                        {logoSrc ? (
                                            <img
                                                src={logoSrc}
                                                alt={client.name}
                                                width={160}
                                                height={56}
                                                className="h-10 md:h-14 w-auto object-contain transition-opacity duration-300 opacity-80 hover:opacity-100"
                                            />
                                        ) : (
                                            <span className="font-heading font-bold text-[24px] md:text-[32px] text-text-muted opacity-40 uppercase">
                                                {client.initial}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </motion.div>

            <style>{`
        @keyframes marquee-forward {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-33.33% - 8px)); }
        }
        .animate-marquee-forward {
          animation: marquee-forward 35s linear infinite;
        }
      `}</style>
        </section>
    )
}
