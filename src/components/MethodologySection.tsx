import { BookOpen, CalendarDays, Scale } from 'lucide-react';

const methods = [
  { icon: CalendarDays, title: 'Dated findings', body: 'Every status is tied to an as-of date so later legal or agency developments can be reviewed against the record.' },
  { icon: Scale, title: 'Independent axes', body: 'Legal, implementation, and litigation statuses remain separate. No percentage or composite score is inferred from them.' },
  { icon: BookOpen, title: 'Official Evidence', body: 'Findings are backed by official statutes, rules, agency documents, and court records, with citations, source review details, and confidence retained.' },
];

export default function MethodologySection() {
  return (
    <section id="methodology" className="scroll-mt-20 bg-[#013e37] py-20 md:py-28" aria-labelledby="methodology-title">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#ffef63]">Methodology</p>
        <h2 id="methodology-title" className="mt-3 text-center text-3xl font-bold text-[#f5f5f5] md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>Official Evidence, visible reasoning</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {methods.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-[#035048] bg-[#022e28] p-6">
              <Icon className="text-[#ffef63]" size={22} /><h3 className="mt-4 text-lg font-bold text-[#f5f5f5]">{title}</h3><p className="mt-3 leading-relaxed text-[#a8c4c0]">{body}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-[#ffef6340] bg-[#ffef630d] p-5 text-sm leading-relaxed text-[#d6e4e1]">
          When a conclusion reflects analyst interpretation rather than a source's direct statement, NeuPo labels it as <strong className="text-[#ffef63]">analyst inference</strong>. NeuPo provides research information, not legal advice.
        </div>
      </div>
    </section>
  );
}
