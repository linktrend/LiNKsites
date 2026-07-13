import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <LegalPageLayout
      title="Terms and Conditions"
      subtitle={`Last Updated: ${lastUpdated}`}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
        <p className="text-muted-foreground mb-4">
          By accessing or using this service, you agree to be bound by these Terms and Conditions (&quot;Terms&quot;).
          If you disagree with any part of these Terms, you may not access or use the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
        <p className="text-muted-foreground mb-4">
          Permission is granted to temporarily download one copy of the materials for personal, 
          non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li>modify or copy the materials;</li>
          <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
          <li>attempt to reverse engineer any software contained in the service;</li>
          <li>remove any copyright or other proprietary notations from the materials; or</li>
          <li>transfer the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
        <p className="text-muted-foreground mb-4">
          The materials on the service are provided on an &apos;as is&apos; basis. LTM Starter Kit makes no warranties, 
          expressed or implied, and hereby disclaims and negates all other warranties including without limitation, 
          implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
          of intellectual property or other violation of rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
        <p className="text-muted-foreground mb-4">
          In no event shall LTM Starter Kit or its suppliers be liable for any damages (including, without limitation, 
          damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
          use the materials on the service, even if LTM Starter Kit or a representative has been notified orally or in 
          writing of the possibility of such damage.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Accuracy of Materials</h2>
        <p className="text-muted-foreground mb-4">
          The materials appearing in the service could include technical, typographical, or photographic errors. 
          LTM Starter Kit does not warrant that any materials on its service are accurate, complete, or current. 
          LTM Starter Kit may make changes to the materials contained on its service at any time without notice.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Links</h2>
        <p className="text-muted-foreground mb-4">
          LTM Starter Kit has not reviewed all of the sites linked to its service and is not responsible for the contents 
          of any such linked site. The inclusion of any link does not imply endorsement by LTM Starter Kit of the site. 
          Use of any such linked website is at the user&apos;s own risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Modifications</h2>
        <p className="text-muted-foreground mb-4">
          LTM Starter Kit may revise these Terms at any time without notice. By using this service you are agreeing to 
          be bound by the then current version of these Terms of Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
        <p className="text-muted-foreground mb-4">
          These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law 
          provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
        <p className="text-muted-foreground mb-4">
          If you have any questions about these Terms and Conditions, please contact us at legal@ltmstarterkit.com.
        </p>
      </section>
    </LegalPageLayout>
  );
}

