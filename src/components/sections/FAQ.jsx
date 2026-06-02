import { useState } from 'react'
import { motion } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import SectionLabel from '../ui/SectionLabel'
import SectionTitle from '../ui/SectionTitle'
import { faqs } from '../../constants/data'

export default function FAQ({ siteContent }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="px-[var(--pad-side)] pt-[var(--pad-process-t)] pb-[var(--pad-process-b)]">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <SectionLabel>FAQ</SectionLabel>
          <SectionTitle>Questions? Answered.</SectionTitle>
        </motion.div>

        <div className="mt-10 max-w-3xl divide-y divide-[var(--border)]">
          {faqs.map((faq, i) => (
            <motion.div key={faq.id} variants={fadeUp}>
              <button
                className="w-full text-left py-5 flex items-start justify-between gap-4 group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <h3 className="font-heading text-[16px] md:text-[18px] text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-300">
                  {faq.question}
                </h3>
                <span className="text-[var(--text-muted)] mt-0.5 shrink-0 text-xl leading-none select-none">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              {openIndex === i && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="pb-5 text-[var(--text-secondary)] text-[15px] leading-relaxed"
                >
                  {faq.answer}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
