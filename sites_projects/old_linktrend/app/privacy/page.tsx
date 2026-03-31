import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle={`Last Updated: ${lastUpdated}`}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="text-muted-foreground mb-4">
          We collect information that you provide directly to us, such as when you create an account, 
          make a purchase, or contact us. This may include your name, email address, postal address, 
          phone number, and payment information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li>Provide, maintain, and improve our services;</li>
          <li>Process transactions and send related information, including confirmations and invoices;</li>
          <li>Send technical notices, updates, security alerts, and support messages;</li>
          <li>Respond to your comments, questions, and requests;</li>
          <li>Communicate with you about products, services, offers, and events;</li>
          <li>Monitor and analyze trends, usage, and activities;</li>
          <li>Personalize and improve your experience;</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
        <p className="text-muted-foreground mb-4">
          We do not sell your personal information. We may share your information with:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li><strong>Service Providers:</strong> We may employ third-party companies and individuals to facilitate our service, provide service on our behalf, perform service-related activities, or assist us in analyzing how our service is used.</li>
          <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your information may be transferred.</li>
          <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p className="text-muted-foreground mb-4">
          We implement appropriate technical and organizational security measures designed to protect your personal information. 
          However, please note that no method of transmission over the internet or electronic storage is completely secure. 
          While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p className="text-muted-foreground mb-4">Depending on your location, you may have the following rights:</p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li><strong>Access:</strong> The right to access your personal information;</li>
          <li><strong>Rectification:</strong> The right to have incorrect information corrected;</li>
          <li><strong>Erasure:</strong> The right to have your information deleted;</li>
          <li><strong>Portability:</strong> The right to receive your information in a structured, commonly used format;</li>
          <li><strong>Objection:</strong> The right to object to processing of your information;</li>
          <li><strong>Restriction:</strong> The right to restrict processing of your information;</li>
          <li><strong>Withdraw Consent:</strong> The right to withdraw consent where processing is based on consent.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
        <p className="text-muted-foreground mb-4">
          We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you 
          do not accept cookies, you may not be able to use some portions of our service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Children&apos;s Privacy</h2>
        <p className="text-muted-foreground mb-4">
          Our service is not intended for individuals under the age of 13. We do not knowingly collect personal 
          information from children under 13. If you are a parent or guardian and believe that your child has provided 
          us with personal information, please contact us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
        <p className="text-muted-foreground mb-4">
          Your information may be transferred to and maintained on computers located outside of your state, province, 
          country, or other governmental jurisdiction where data protection laws may differ. By using our service, you 
          consent to the transfer of your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
        <p className="text-muted-foreground mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
          Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy 
          Policy periodically for any changes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
        <p className="text-muted-foreground mb-4">
          If you have any questions about this Privacy Policy, please contact us at privacy@ltmstarterkit.com.
        </p>
      </section>
    </LegalPageLayout>
  );
}

