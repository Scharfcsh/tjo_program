// Footer links point at the main marketing site, not the intern portal.
const MAIN = "https://topjoboffer.com"

export function Footer() {
  return (
    <footer className="border-t border-[#E7E3D9]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2.5 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tjo-logo.svg" alt="TopJobOffer logo" className="h-7 w-auto" />
          </div>
          <p className="text-[13px] text-[#8A938D] max-w-[200px]">
            Tailored resumes that actually get read.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["Features", `${MAIN}/#features`],
            ["Pricing", `${MAIN}/#pricing`],
            ["FAQ", `${MAIN}/faq`],
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            ["Sign in", `${MAIN}/sign-in`],
            ["Get started", `${MAIN}/sign-up`],
            ["Dashboard", `${MAIN}/dashboard`],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Privacy Policy", `${MAIN}/privacy`],
            ["Terms & Conditions", `${MAIN}/terms`],
            ["Referral Terms", `${MAIN}/referral-terms`],
          ]}
        />
      </div>
      <div className="border-t border-[#E7E3D9]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between text-[13px] text-[#8A938D]">
          <span>
            © {new Date().getFullYear()} |{" "}
            <a
              href="https://www.mindwebsolutions.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8A938D] hover:text-[#0D9488] transition-colors"
            >
              Product by Mind Web Solutions
            </a>
          </span>
          <span className="hidden sm:block">
            Made for people who deserve the interview.
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: [string, string][]
}) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold text-foreground mb-3">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#8A938D] hover:text-[#0D9488] transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
