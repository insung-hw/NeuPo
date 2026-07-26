import { motion } from 'motion/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const policies = [
  {
    id: 'usage',
    title: 'Platform Usage Policy',
    content: `NeuPo is committed to providing a civic intelligence platform that serves all citizens equally and responsibly. Users may access, share, and reference data presented on this platform for personal, educational, and non-commercial civic purposes. Commercial redistribution of NeuPo's curated datasets requires written permission. Users must not attempt to manipulate, misrepresent, or selectively cite NeuPo data in ways that distort the underlying government records. NeuPo reserves the right to suspend accounts that violate these terms or engage in coordinated inauthentic behavior.`,
  },
  {
    id: 'data',
    title: 'Data Sources & Methodology',
    content: `NeuPo is committed to using only authoritative, publicly available US government data sources. Primary sources include: USASpending.gov (federal spending and project tracking), Congress.gov (legislative progress and bill status), the Bureau of Economic Analysis (economic indicators), the Department of Defense Annual Report (military readiness and modernization), the Department of Health and Human Services (social program outcomes), and the Office of Management and Budget (budget execution data). All data is updated on a quarterly basis following official government publication cycles. NeuPo does not generate, estimate, or interpolate data — all figures reflect official government reporting.`,
  },
  {
    id: 'community',
    title: 'Community Contribution Rules',
    content: `NeuPo is committed to fostering a respectful, fact-based civic community. Community members may submit corrections, flag outdated data, and propose new tracking metrics through the platform's contribution portal. All contributions are reviewed by NeuPo's editorial team before publication. Contributors must cite primary government sources for any proposed data changes. Personal attacks, partisan advocacy, and unverified claims are not permitted. NeuPo operates a zero-tolerance policy for disinformation and will remove contributions that cannot be verified against official government records.`,
  },
  {
    id: 'terms',
    title: 'Terms of Service & Privacy',
    content: `NeuPo is committed to protecting user privacy and maintaining transparent data practices. We collect only the minimum information necessary to provide platform services: email address for account creation and notification preferences. NeuPo does not sell, share, or monetize user data. All platform analytics are aggregated and anonymized. Users may request deletion of their account and associated data at any time by contacting support. NeuPo complies with applicable US federal privacy regulations. By using this platform, you agree to these terms and acknowledge that government data displayed is sourced from public records and may be subject to revision as official reports are updated.`,
  },
];

export default function PolicySection() {
  return (
    <section className="py-20 md:py-28" style={{ background: '#022e28' }}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#ffef63' }}>Governance</p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
          >
            Policy &amp; Rules
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: '#a8c4c0' }}>
            NeuPo operates under clear, transparent guidelines to ensure data integrity and civic trust.
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' as const }}
        >
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {policies.map((policy) => (
              <AccordionItem
                key={policy.id}
                value={policy.id}
                className="rounded-xl border overflow-hidden"
                style={{ background: '#013e37', borderColor: '#035048' }}
              >
                <AccordionTrigger
                  className="px-6 py-4 text-left hover:no-underline transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <span className="text-base font-semibold" style={{ color: '#f5f5f5' }}>{policy.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: '#a8c4c0' }}>{policy.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
