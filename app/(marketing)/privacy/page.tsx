import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - NexaGestion",
  description: "Read NexaGestion's privacy policy and how we protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-12">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
            <p>
              NexaGestion ("we" or "us" or "our") operates the nexagestion.arbark.cloud website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Information Collection and Use</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Types of Data Collected:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Personal Data: Name, email address, phone number, company information</li>
              <li>Usage Data: Browser type, IP address, pages visited, time and date of visit</li>
              <li>Business Data: Sales records, inventory data, employee information (as provided by you)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Use of Data</h2>
            <p>
              NexaGestion uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Security of Data</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the bottom of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="mt-4">
              Email: privacy@nexagestion.com<br />
              Address: 123 Business Ave, Tech City, TC 12345
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. GDPR Compliance</h2>
            <p>
              If you are located in the European Union, you have certain rights under the General Data Protection Regulation (GDPR), including the right to access, correct, or delete your personal data. Please contact us to exercise these rights.
            </p>
          </section>

          <p className="text-sm pt-8 border-t border-border/50">
            Last updated: November 21, 2025
          </p>
        </div>
      </div>
    </div>
  );
}

