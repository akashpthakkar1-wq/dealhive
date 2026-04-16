import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | EndOverPay',
  description: 'Read the EndOverPay Privacy Policy to understand how we collect, use and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-14">
        <div className="container-main text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-white/80">Last updated: April 2026</p>
        </div>
      </div>

      <div className="container-main py-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 text-gray-600 leading-relaxed">

          <div>
            <p>This Privacy Policy explains how EndOverPay ("we", "us" or "our"), operating at <strong>www.endoverpay.com</strong>, collects, uses, stores and protects information about you when you use our website. By using EndOverPay, you agree to the practices described in this policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <h3 className="font-semibold text-gray-800 mb-2">1.1 Information You Provide</h3>
            <p className="mb-3">We may collect personal information you voluntarily provide when you:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Contact us via email (your name and email address)</li>
              <li>Submit a coupon or deal suggestion</li>
              <li>Subscribe to our newsletter or deal alerts</li>
            </ul>
            <h3 className="font-semibold text-gray-800 mb-2">1.2 Information Collected Automatically</h3>
            <p className="mb-3">When you browse EndOverPay, we automatically collect non-personally identifiable information including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browser type and version</li>
              <li>Device type (desktop, mobile, tablet)</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on each page</li>
              <li>Referring URL (the site you came from)</li>
              <li>Approximate geographic location (country or city level)</li>
              <li>Clicks on affiliate links and coupon codes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information collected to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Operate, maintain and improve the EndOverPay website</li>
              <li>Respond to your enquiries, coupon submissions or feedback</li>
              <li>Send newsletters or deal alerts if you have opted in (you can unsubscribe at any time)</li>
              <li>Analyse website traffic and user behaviour to improve user experience</li>
              <li>Detect and prevent fraud, abuse or technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">We do not sell, rent or trade your personal information to third parties for their marketing purposes.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cookies Policy</h2>
            <p className="mb-3">EndOverPay uses cookies — small text files stored on your device — to improve your experience on our site. Types of cookies we use:</p>
            <div className="space-y-3">
              {[
                { type: 'Essential Cookies', desc: 'Required for the website to function correctly. These cannot be disabled.' },
                { type: 'Analytics Cookies', desc: 'Used by Google Analytics to help us understand how users interact with our site. Data is anonymised and aggregated.' },
                { type: 'Affiliate Tracking Cookies', desc: 'Set when you click an affiliate link. These help us track commissions and attribute sales correctly.' },
                { type: 'Preference Cookies', desc: 'Remember your preferences such as your region or previously viewed deals.' },
              ].map((item) => (
                <div key={item.type} className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.type}</h3>
                  <p className="text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-3">You can control cookies through your browser settings. Disabling cookies may affect some functionality of our site.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services</h2>
            <h3 className="font-semibold text-gray-800 mb-2">4.1 Google Analytics</h3>
            <p className="mb-3">We use Google Analytics to understand how visitors use our site. Google Analytics collects information such as how often users visit our site, what pages they visit and what websites they used prior to visiting ours. We use this data only to improve our website. Google's privacy policy is available at <a href="https://policies.google.com/privacy" className="text-[#EA580C] hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.</p>
            <h3 className="font-semibold text-gray-800 mb-2">4.2 Affiliate Networks</h3>
            <p className="mb-3">EndOverPay participates in affiliate programs operated by networks such as CJ Affiliate, ShareASale, Awin, Impact and direct retailer programmes. When you click an affiliate link, these networks may set tracking cookies on your device. Their data collection is governed by their own privacy policies.</p>
            <h3 className="font-semibold text-gray-800 mb-2">4.3 Advertising</h3>
            <p>We may use third-party advertising partners to display ads on our site. These partners may use cookies to serve ads based on your prior visits to our website and other sites. You can opt out of personalised advertising by visiting <a href="https://www.aboutads.info/choices" className="text-[#EA580C] hover:underline" target="_blank" rel="noopener noreferrer">aboutads.info/choices</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Protection & Security</h2>
            <p className="mb-3">We take the security of your data seriously. We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure or destruction.</p>
            <p>Our website uses HTTPS encryption for all data transmission. However, no method of transmission over the internet is 100% secure and we cannot guarantee absolute security.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights (GDPR & CCPA)</h2>
            <p className="mb-3">Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten").</li>
              <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data.</li>
              <li><strong>Right to Data Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong>Right to Object:</strong> Object to processing of your data for certain purposes including direct marketing.</li>
              <li><strong>CCPA Rights (California residents):</strong> Right to know what personal data is collected, right to opt out of sale of personal data and right to non-discrimination.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please email us at <strong>privacy@endoverpay.com</strong>. We will respond within 30 days.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Third-Party Links</h2>
            <p>Our website contains links to external retailer websites and affiliate partners. Once you click these links and leave our site, we are not responsible for the privacy practices of those websites. We encourage you to read their privacy policies before providing any personal information.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Children's Privacy</h2>
            <p>EndOverPay is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child, please contact us immediately and we will delete it promptly.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Data Retention</h2>
            <p>We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, comply with legal obligations or resolve disputes. Contact form submissions are retained for up to 12 months. Analytics data is retained for up to 26 months.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Updates to This Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory or operational reasons. We will update the "last updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of our website after any changes constitutes acceptance of the updated policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us:</p>
            <div className="mt-3 p-4 bg-orange-50 rounded-xl">
              <p><strong>EndOverPay</strong></p>
              <p>Email: <a href="mailto:privacy@endoverpay.com" className="text-[#EA580C] hover:underline">privacy@endoverpay.com</a></p>
              <p>Website: <a href="https://www.endoverpay.com" className="text-[#EA580C] hover:underline">www.endoverpay.com</a></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
