// Mock data for Help Centre (Phase 1)
// This will be replaced by Payload CMS data in Phase 2
// NOTE: Some hardcoded "LinkTrend" references remain in article content below.
// These are temporary mock data and will be replaced when CMS is connected.

import { getSiteName } from '@/config';

const siteName = getSiteName();
const SUPPORT_TEAM = `${siteName} Support Team`;

export interface HelpCategory {
  id: string;
  slug: string;
  title: string;
  slogan: string;
  description: string;
  author: string;
  articleCount: number;
  lastUpdated: string;
  icon: string;
}

export interface HelpArticle {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  shortDescription: string;
  author: string;
  updatedAt: string;
  body: string;
  relatedArticles: string[];
}

export const helpCategories: HelpCategory[] = [
  {
    id: "1",
    slug: "getting-started",
    title: "Getting Started / Onboarding",
    slogan: "Everything you need to begin your journey with our platform",
    description: "Learn how to set up your account, configure essentials, and understand the core workflow.",
    author: SUPPORT_TEAM,
    articleCount: 5,
    lastUpdated: "2025-11-20",
    icon: "BookOpen",
  },
  {
    id: "2",
    slug: "core-features",
    title: "Using the Product / Core Features",
    slogan: "Master the features that power your workflow",
    description: "Step-by-step guides and best practices for all main features of the platform.",
    author: SUPPORT_TEAM,
    articleCount: 4,
    lastUpdated: "2025-11-18",
    icon: "Zap",
  },
  {
    id: "3",
    slug: "billing",
    title: "Account & Billing Management",
    slogan: "Manage your subscription and account settings",
    description: "Manage your profile, subscriptions, invoices, and account settings.",
    author: SUPPORT_TEAM,
    articleCount: 4,
    lastUpdated: "2025-11-15",
    icon: "CreditCard",
  },
  {
    id: "4",
    slug: "troubleshooting",
    title: "Troubleshooting",
    slogan: "Quick solutions to common issues",
    description: "Fix common errors and solve issues quickly without contacting support.",
    author: SUPPORT_TEAM,
    articleCount: 5,
    lastUpdated: "2025-11-12",
    icon: "Wrench",
  },
  {
    id: "5",
    slug: "faqs",
    title: "FAQs",
    slogan: "Frequently asked questions answered",
    description: "Quick answers to the most frequently asked questions.",
    author: SUPPORT_TEAM,
    articleCount: 3,
    lastUpdated: "2025-11-10",
    icon: "HelpCircle",
  },
  {
    id: "6",
    slug: "integrations",
    title: "Integrations & API Documentation",
    slogan: "Connect and extend your workflow",
    description: "Connect external tools, use the API, and extend your workflow.",
    author: SUPPORT_TEAM,
    articleCount: 4,
    lastUpdated: "2025-11-08",
    icon: "Code",
  },
];

export const helpArticles: HelpArticle[] = [
  // Getting Started / Onboarding
  {
    id: "1",
    slug: "create-your-account",
    categorySlug: "getting-started",
    title: "How to Create Your Account",
    shortDescription: `Step-by-step guide to setting up your ${siteName} account and getting started.`,
    author: "Sarah Johnson",
    updatedAt: "2025-11-20",
    body: `
      <h2>Creating Your Account</h2>
      <p>Welcome to ${siteName}! Creating your account is quick and easy. Follow these steps to get started:</p>
      
      <h3>Step 1: Visit the Sign-Up Page</h3>
      <p>Navigate to our <a href="/signup">sign-up page</a> and click on "Create Account".</p>
      
      <h3>Step 2: Enter Your Information</h3>
      <ul>
        <li>Provide your email address</li>
        <li>Create a strong password</li>
        <li>Enter your full name</li>
        <li>Select your company name (optional)</li>
      </ul>
      
      <h3>Step 3: Verify Your Email</h3>
      <p>Check your inbox for a verification email. Click the link to activate your account.</p>
      
      <h3>Step 4: Complete Your Profile</h3>
      <p>Once verified, log in and complete your profile with additional information to personalize your experience.</p>
      
      <h2>Next Steps</h2>
      <p>After creating your account, we recommend:</p>
      <ol>
        <li>Exploring the dashboard</li>
        <li>Setting up your first project</li>
        <li>Inviting team members</li>
      </ol>
    `,
    relatedArticles: ["2", "3"],
  },
  {
    id: "2",
    slug: "dashboard-overview",
    categorySlug: "getting-started",
    title: "Understanding Your Dashboard",
    shortDescription: "Learn about the main dashboard features and how to navigate the platform effectively.",
    author: "Sarah Johnson",
    updatedAt: "2025-11-19",
    body: `
      <h2>Dashboard Overview</h2>
      <p>Your dashboard is the central hub for all your activities on ${siteName}. Here's what you need to know:</p>
      
      <h3>Main Navigation</h3>
      <p>The top navigation bar provides quick access to:</p>
      <ul>
        <li><strong>Home:</strong> Your main dashboard view</li>
        <li><strong>Projects:</strong> All your active projects</li>
        <li><strong>Analytics:</strong> Performance metrics and insights</li>
        <li><strong>Settings:</strong> Account and preferences</li>
      </ul>
      
      <h3>Dashboard Widgets</h3>
      <p>Your dashboard displays key information through customizable widgets:</p>
      <ul>
        <li>Recent activity feed</li>
        <li>Quick stats overview</li>
        <li>Upcoming tasks and deadlines</li>
        <li>Team notifications</li>
      </ul>
      
      <h3>Customizing Your View</h3>
      <p>You can customize your dashboard by dragging and dropping widgets to rearrange them according to your preferences.</p>
    `,
    relatedArticles: ["1", "4"],
  },
  {
    id: "3",
    slug: "first-project-setup",
    categorySlug: "getting-started",
    title: "Setting Up Your First Project",
    shortDescription: "A complete guide to creating and configuring your first project on the platform.",
    author: "Michael Chen",
    updatedAt: "2025-11-18",
    body: `
      <h2>Creating Your First Project</h2>
      <p>Projects help you organize your work and collaborate with your team. Here's how to set one up:</p>
      
      <h3>Step 1: Create a New Project</h3>
      <p>Click the "New Project" button in your dashboard and provide the following information:</p>
      <ul>
        <li>Project name</li>
        <li>Description</li>
        <li>Project type</li>
        <li>Start date</li>
      </ul>
      
      <h3>Step 2: Configure Project Settings</h3>
      <p>Set up your project preferences including:</p>
      <ul>
        <li>Privacy settings (public or private)</li>
        <li>Team access permissions</li>
        <li>Notification preferences</li>
        <li>Integration options</li>
      </ul>
      
      <h3>Step 3: Invite Team Members</h3>
      <p>Add collaborators to your project by entering their email addresses. They'll receive an invitation to join.</p>
      
      <h2>Best Practices</h2>
      <p>For optimal project management:</p>
      <ol>
        <li>Use clear, descriptive project names</li>
        <li>Set realistic deadlines</li>
        <li>Assign roles and responsibilities early</li>
        <li>Keep your team informed with regular updates</li>
      </ol>
    `,
    relatedArticles: ["2", "5"],
  },
  {
    id: "4",
    slug: "invite-team-members",
    categorySlug: "getting-started",
    title: "Inviting Team Members",
    shortDescription: "Learn how to add team members to your account and manage their permissions.",
    author: "Sarah Johnson",
    updatedAt: "2025-11-17",
    body: `
      <h2>Adding Team Members</h2>
      <p>Collaboration is key to success. Here's how to invite your team:</p>
      
      <h3>Sending Invitations</h3>
      <p>Navigate to Settings > Team and click "Invite Member". Enter their email address and select their role.</p>
      
      <h3>Role Types</h3>
      <ul>
        <li><strong>Admin:</strong> Full access to all features and settings</li>
        <li><strong>Member:</strong> Can create and edit projects</li>
        <li><strong>Viewer:</strong> Read-only access</li>
      </ul>
      
      <h3>Managing Permissions</h3>
      <p>You can adjust team member permissions at any time from the Team settings page.</p>
    `,
    relatedArticles: ["3", "6"],
  },
  {
    id: "5",
    slug: "account-security",
    categorySlug: "getting-started",
    title: "Account Security Best Practices",
    shortDescription: "Essential security tips to keep your account safe and secure.",
    author: "Michael Chen",
    updatedAt: "2025-11-16",
    body: `
      <h2>Keeping Your Account Secure</h2>
      <p>Security is our top priority. Follow these best practices to protect your account:</p>
      
      <h3>Strong Passwords</h3>
      <p>Create a password that includes:</p>
      <ul>
        <li>At least 12 characters</li>
        <li>Uppercase and lowercase letters</li>
        <li>Numbers and special characters</li>
        <li>No personal information</li>
      </ul>
      
      <h3>Two-Factor Authentication</h3>
      <p>Enable 2FA in your security settings for an extra layer of protection.</p>
      
      <h3>Regular Security Checks</h3>
      <p>Review your account activity regularly and report any suspicious behavior immediately.</p>
    `,
    relatedArticles: ["1", "12"],
  },

  // Core Features
  {
    id: "6",
    slug: "project-management",
    categorySlug: "core-features",
    title: "Project Management Features",
    shortDescription: "Explore all the tools available for managing your projects effectively.",
    author: "Emily Rodriguez",
    updatedAt: "2025-11-18",
    body: `
      <h2>Project Management Tools</h2>
      <p>LinkTrend provides comprehensive project management features to streamline your workflow.</p>
      
      <h3>Task Management</h3>
      <p>Create, assign, and track tasks with ease:</p>
      <ul>
        <li>Create tasks and subtasks</li>
        <li>Set due dates and priorities</li>
        <li>Assign to team members</li>
        <li>Track progress with status updates</li>
      </ul>
      
      <h3>Timeline View</h3>
      <p>Visualize your project timeline with Gantt charts and calendar views.</p>
      
      <h3>Collaboration Tools</h3>
      <p>Work together seamlessly with built-in commenting, file sharing, and real-time updates.</p>
    `,
    relatedArticles: ["3", "7"],
  },
  {
    id: "7",
    slug: "analytics-reporting",
    categorySlug: "core-features",
    title: "Analytics and Reporting",
    shortDescription: "Understand your data with powerful analytics and customizable reports.",
    author: "David Kim",
    updatedAt: "2025-11-17",
    body: `
      <h2>Analytics Dashboard</h2>
      <p>Make data-driven decisions with our comprehensive analytics tools.</p>
      
      <h3>Key Metrics</h3>
      <p>Track important metrics including:</p>
      <ul>
        <li>Project completion rates</li>
        <li>Team productivity</li>
        <li>Resource utilization</li>
        <li>Budget tracking</li>
      </ul>
      
      <h3>Custom Reports</h3>
      <p>Create custom reports tailored to your specific needs and export them in various formats.</p>
      
      <h3>Real-Time Data</h3>
      <p>All analytics are updated in real-time, giving you the most current information.</p>
    `,
    relatedArticles: ["6", "8"],
  },
  {
    id: "8",
    slug: "collaboration-tools",
    categorySlug: "core-features",
    title: "Collaboration Features",
    shortDescription: "Learn how to use our collaboration tools to work better with your team.",
    author: "Emily Rodriguez",
    updatedAt: "2025-11-16",
    body: `
      <h2>Team Collaboration</h2>
      <p>Work together more effectively with these collaboration features:</p>
      
      <h3>Real-Time Editing</h3>
      <p>Multiple team members can work on the same document simultaneously.</p>
      
      <h3>Comments and Mentions</h3>
      <p>Use @mentions to notify specific team members and keep conversations organized.</p>
      
      <h3>File Sharing</h3>
      <p>Share files securely within your projects with version control.</p>
    `,
    relatedArticles: ["4", "6"],
  },
  {
    id: "9",
    slug: "notifications-settings",
    categorySlug: "core-features",
    title: "Managing Notifications",
    shortDescription: "Customize your notification preferences to stay informed without being overwhelmed.",
    author: "Sarah Johnson",
    updatedAt: "2025-11-15",
    body: `
      <h2>Notification Settings</h2>
      <p>Stay informed about what matters most by customizing your notifications.</p>
      
      <h3>Notification Types</h3>
      <ul>
        <li>Email notifications</li>
        <li>In-app notifications</li>
        <li>Mobile push notifications</li>
        <li>Desktop notifications</li>
      </ul>
      
      <h3>Customization Options</h3>
      <p>Choose which events trigger notifications and set quiet hours for uninterrupted focus time.</p>
    `,
    relatedArticles: ["2", "5"],
  },

  // Account & Billing
  {
    id: "10",
    slug: "subscription-plans",
    categorySlug: "billing",
    title: "Understanding Subscription Plans",
    shortDescription: "Learn about our different subscription tiers and what's included in each.",
    author: "Michael Chen",
    updatedAt: "2025-11-15",
    body: `
      <h2>Subscription Plans</h2>
      <p>Choose the plan that best fits your needs:</p>
      
      <h3>Free Plan</h3>
      <ul>
        <li>Up to 3 projects</li>
        <li>5 team members</li>
        <li>Basic features</li>
        <li>Community support</li>
      </ul>
      
      <h3>Pro Plan</h3>
      <ul>
        <li>Unlimited projects</li>
        <li>Unlimited team members</li>
        <li>Advanced features</li>
        <li>Priority support</li>
        <li>Custom integrations</li>
      </ul>
      
      <h3>Enterprise Plan</h3>
      <ul>
        <li>Everything in Pro</li>
        <li>Dedicated account manager</li>
        <li>Custom SLA</li>
        <li>Advanced security features</li>
      </ul>
    `,
    relatedArticles: ["11", "12"],
  },
  {
    id: "11",
    slug: "upgrade-downgrade",
    categorySlug: "billing",
    title: "Upgrading or Downgrading Your Plan",
    shortDescription: "How to change your subscription plan and what happens to your data.",
    author: "David Kim",
    updatedAt: "2025-11-14",
    body: `
      <h2>Changing Your Plan</h2>
      <p>You can upgrade or downgrade your plan at any time.</p>
      
      <h3>Upgrading</h3>
      <p>Upgrades take effect immediately. You'll be charged a prorated amount for the remainder of your billing cycle.</p>
      
      <h3>Downgrading</h3>
      <p>Downgrades take effect at the end of your current billing cycle. Your data remains safe during the transition.</p>
      
      <h3>What Happens to Your Data</h3>
      <p>All your data is preserved when changing plans. However, some features may become unavailable if you downgrade.</p>
    `,
    relatedArticles: ["10", "13"],
  },
  {
    id: "12",
    slug: "payment-methods",
    categorySlug: "billing",
    title: "Managing Payment Methods",
    shortDescription: "Add, update, or remove payment methods from your account.",
    author: "Emily Rodriguez",
    updatedAt: "2025-11-13",
    body: `
      <h2>Payment Methods</h2>
      <p>Manage your payment information securely in your account settings.</p>
      
      <h3>Accepted Payment Methods</h3>
      <ul>
        <li>Credit cards (Visa, Mastercard, Amex)</li>
        <li>Debit cards</li>
        <li>PayPal</li>
        <li>Bank transfers (Enterprise only)</li>
      </ul>
      
      <h3>Updating Your Payment Method</h3>
      <p>Navigate to Settings > Billing > Payment Methods to add or update your payment information.</p>
      
      <h3>Security</h3>
      <p>All payment information is encrypted and processed securely through our payment provider.</p>
    `,
    relatedArticles: ["10", "11"],
  },
  {
    id: "13",
    slug: "invoices-receipts",
    categorySlug: "billing",
    title: "Accessing Invoices and Receipts",
    shortDescription: "Download your billing history, invoices, and payment receipts.",
    author: "Michael Chen",
    updatedAt: "2025-11-12",
    body: `
      <h2>Billing History</h2>
      <p>Access all your invoices and receipts from your account settings.</p>
      
      <h3>Downloading Invoices</h3>
      <p>Go to Settings > Billing > Invoices to view and download your billing history.</p>
      
      <h3>Invoice Details</h3>
      <p>Each invoice includes:</p>
      <ul>
        <li>Invoice number and date</li>
        <li>Billing period</li>
        <li>Itemized charges</li>
        <li>Payment method used</li>
        <li>Tax information</li>
      </ul>
      
      <h3>Email Receipts</h3>
      <p>Receipts are automatically sent to your email address after each successful payment.</p>
    `,
    relatedArticles: ["11", "12"],
  },

  // Troubleshooting
  {
    id: "14",
    slug: "login-issues",
    categorySlug: "troubleshooting",
    title: "Troubleshooting Login Issues",
    shortDescription: "Solutions for common login problems and how to regain access to your account.",
    author: "Sarah Johnson",
    updatedAt: "2025-11-12",
    body: `
      <h2>Login Problems</h2>
      <p>Having trouble logging in? Try these solutions:</p>
      
      <h3>Forgot Password</h3>
      <p>Click "Forgot Password" on the login page and follow the instructions to reset your password.</p>
      
      <h3>Account Locked</h3>
      <p>After multiple failed login attempts, your account may be temporarily locked for security. Wait 15 minutes and try again.</p>
      
      <h3>Browser Issues</h3>
      <p>Try these steps:</p>
      <ul>
        <li>Clear your browser cache and cookies</li>
        <li>Try a different browser</li>
        <li>Disable browser extensions</li>
        <li>Check if JavaScript is enabled</li>
      </ul>
      
      <h3>Still Having Issues?</h3>
      <p>Contact our support team for immediate assistance.</p>
    `,
    relatedArticles: ["5", "15"],
  },
  {
    id: "15",
    slug: "performance-issues",
    categorySlug: "troubleshooting",
    title: "Fixing Performance Issues",
    shortDescription: "Steps to resolve slow loading times and improve platform performance.",
    author: "David Kim",
    updatedAt: "2025-11-11",
    body: `
      <h2>Performance Optimization</h2>
      <p>If you're experiencing slow performance, try these solutions:</p>
      
      <h3>Browser Optimization</h3>
      <ul>
        <li>Update to the latest browser version</li>
        <li>Clear browser cache</li>
        <li>Close unnecessary tabs</li>
        <li>Disable heavy browser extensions</li>
      </ul>
      
      <h3>Network Connection</h3>
      <p>Check your internet connection speed and stability. A minimum of 5 Mbps is recommended.</p>
      
      <h3>System Resources</h3>
      <p>Ensure your computer has sufficient RAM and CPU available. Close resource-intensive applications.</p>
    `,
    relatedArticles: ["14", "16"],
  },
  {
    id: "16",
    slug: "data-sync-issues",
    categorySlug: "troubleshooting",
    title: "Resolving Data Sync Problems",
    shortDescription: "Fix issues with data not syncing across devices or team members.",
    author: "Emily Rodriguez",
    updatedAt: "2025-11-10",
    body: `
      <h2>Data Synchronization</h2>
      <p>If your data isn't syncing properly, follow these steps:</p>
      
      <h3>Check Connection Status</h3>
      <p>Look for the sync indicator in the top right corner. A green icon means you're connected.</p>
      
      <h3>Force Sync</h3>
      <p>Click the sync icon or refresh your browser to manually trigger a sync.</p>
      
      <h3>Conflict Resolution</h3>
      <p>If multiple team members edit the same item simultaneously, you may need to resolve conflicts manually.</p>
      
      <h3>Offline Mode</h3>
      <p>Changes made offline will sync automatically when you reconnect to the internet.</p>
    `,
    relatedArticles: ["8", "15"],
  },
  {
    id: "17",
    slug: "file-upload-errors",
    categorySlug: "troubleshooting",
    title: "File Upload Error Solutions",
    shortDescription: "Common file upload issues and how to resolve them.",
    author: "Michael Chen",
    updatedAt: "2025-11-09",
    body: `
      <h2>File Upload Issues</h2>
      <p>Troubleshoot file upload problems with these solutions:</p>
      
      <h3>File Size Limits</h3>
      <p>Maximum file size varies by plan:</p>
      <ul>
        <li>Free: 10 MB per file</li>
        <li>Pro: 100 MB per file</li>
        <li>Enterprise: 1 GB per file</li>
      </ul>
      
      <h3>Supported File Types</h3>
      <p>We support most common file types. Executable files (.exe, .app) are blocked for security.</p>
      
      <h3>Upload Failures</h3>
      <p>If uploads fail:</p>
      <ul>
        <li>Check your internet connection</li>
        <li>Try a smaller file</li>
        <li>Compress large files</li>
        <li>Use a different browser</li>
      </ul>
    `,
    relatedArticles: ["15", "16"],
  },
  {
    id: "18",
    slug: "mobile-app-issues",
    categorySlug: "troubleshooting",
    title: "Mobile App Troubleshooting",
    shortDescription: `Resolve common issues with the ${siteName} mobile app.`,
    author: "Sarah Johnson",
    updatedAt: "2025-11-08",
    body: `
      <h2>Mobile App Issues</h2>
      <p>Having problems with the mobile app? Try these fixes:</p>
      
      <h3>App Crashes</h3>
      <ul>
        <li>Update to the latest app version</li>
        <li>Restart your device</li>
        <li>Clear app cache</li>
        <li>Reinstall the app</li>
      </ul>
      
      <h3>Sync Issues</h3>
      <p>Ensure background app refresh is enabled in your device settings.</p>
      
      <h3>Notification Problems</h3>
      <p>Check that notifications are enabled for ${siteName} in your device settings.</p>
    `,
    relatedArticles: ["9", "14"],
  },

  // FAQs
  {
    id: "19",
    slug: "what-is-platform",
    categorySlug: "faqs",
    title: `What is ${siteName}?`,
    shortDescription: `Learn about ${siteName} and what makes our platform unique.`,
    author: SUPPORT_TEAM,
    updatedAt: "2025-11-10",
    body: `
      <h2>About ${siteName}</h2>
      <p>${siteName} is a comprehensive project management and collaboration platform designed to help teams work more efficiently.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li>Project management tools</li>
        <li>Team collaboration</li>
        <li>Analytics and reporting</li>
        <li>Integrations with popular tools</li>
        <li>Mobile and desktop apps</li>
      </ul>
      
      <h3>Who Is It For?</h3>
      <p>${siteName} is perfect for teams of all sizes, from startups to enterprises, across various industries.</p>
    `,
    relatedArticles: ["1", "10"],
  },
  {
    id: "20",
    slug: "pricing-faqs",
    categorySlug: "faqs",
    title: "Pricing and Billing FAQs",
    shortDescription: "Common questions about pricing, billing, and subscriptions.",
    author: SUPPORT_TEAM,
    updatedAt: "2025-11-09",
    body: `
      <h2>Pricing Questions</h2>
      
      <h3>Is there a free trial?</h3>
      <p>Yes! All paid plans include a 14-day free trial. No credit card required.</p>
      
      <h3>Can I cancel anytime?</h3>
      <p>Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period.</p>
      
      <h3>Do you offer refunds?</h3>
      <p>We offer a 30-day money-back guarantee for annual plans.</p>
      
      <h3>What payment methods do you accept?</h3>
      <p>We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
    `,
    relatedArticles: ["10", "11", "12"],
  },
  {
    id: "21",
    slug: "security-privacy-faqs",
    categorySlug: "faqs",
    title: "Security and Privacy FAQs",
    shortDescription: "Answers to questions about data security and privacy protection.",
    author: SUPPORT_TEAM,
    updatedAt: "2025-11-08",
    body: `
      <h2>Security & Privacy</h2>
      
      <h3>Is my data secure?</h3>
      <p>Yes. We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit.</p>
      
      <h3>Where is data stored?</h3>
      <p>Data is stored in secure, SOC 2 compliant data centers in the US and EU.</p>
      
      <h3>Do you sell my data?</h3>
      <p>Never. We do not sell, rent, or share your personal information with third parties.</p>
      
      <h3>GDPR Compliance</h3>
      <p>We are fully GDPR compliant and provide tools for data export and deletion.</p>
    `,
    relatedArticles: ["5", "22"],
  },

  // Integrations & API
  {
    id: "22",
    slug: "available-integrations",
    categorySlug: "integrations",
    title: "Available Integrations",
    shortDescription: `Explore all the third-party tools you can connect with ${siteName}.`,
    author: "David Kim",
    updatedAt: "2025-11-08",
    body: `
      <h2>Integrations</h2>
      <p>${siteName} integrates with popular tools to streamline your workflow:</p>
      
      <h3>Communication</h3>
      <ul>
        <li>Slack</li>
        <li>Microsoft Teams</li>
        <li>Discord</li>
      </ul>
      
      <h3>File Storage</h3>
      <ul>
        <li>Google Drive</li>
        <li>Dropbox</li>
        <li>OneDrive</li>
      </ul>
      
      <h3>Development</h3>
      <ul>
        <li>GitHub</li>
        <li>GitLab</li>
        <li>Bitbucket</li>
      </ul>
      
      <h3>Setting Up Integrations</h3>
      <p>Go to Settings > Integrations and click "Connect" next to the service you want to integrate.</p>
    `,
    relatedArticles: ["23", "24"],
  },
  {
    id: "23",
    slug: "api-getting-started",
    categorySlug: "integrations",
    title: "Getting Started with the API",
    shortDescription: `Learn how to use the ${siteName} API to build custom integrations.`,
    author: "Emily Rodriguez",
    updatedAt: "2025-11-07",
    body: `
      <h2>API Documentation</h2>
      <p>The ${siteName} API allows you to build custom integrations and automate workflows.</p>
      
      <h3>Authentication</h3>
      <p>Generate an API key from Settings > API Keys. Include it in the Authorization header:</p>
      <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
      
      <h3>Base URL</h3>
      <pre><code>https://api.example.com/v1</code></pre>
      
      <h3>Rate Limits</h3>
      <ul>
        <li>Free: 100 requests/hour</li>
        <li>Pro: 1,000 requests/hour</li>
        <li>Enterprise: 10,000 requests/hour</li>
      </ul>
      
      <h3>Common Endpoints</h3>
      <ul>
        <li>GET /projects - List all projects</li>
        <li>POST /projects - Create a project</li>
        <li>GET /tasks - List tasks</li>
        <li>POST /tasks - Create a task</li>
      </ul>
    `,
    relatedArticles: ["22", "24"],
  },
  {
    id: "24",
    slug: "webhooks-setup",
    categorySlug: "integrations",
    title: "Setting Up Webhooks",
    shortDescription: "Configure webhooks to receive real-time notifications about events.",
    author: "Michael Chen",
    updatedAt: "2025-11-06",
    body: `
      <h2>Webhooks</h2>
      <p>Webhooks allow you to receive real-time HTTP notifications when events occur in ${siteName}.</p>
      
      <h3>Creating a Webhook</h3>
      <ol>
        <li>Go to Settings > Webhooks</li>
        <li>Click "Create Webhook"</li>
        <li>Enter your endpoint URL</li>
        <li>Select events to subscribe to</li>
        <li>Save and test your webhook</li>
      </ol>
      
      <h3>Available Events</h3>
      <ul>
        <li>project.created</li>
        <li>project.updated</li>
        <li>task.created</li>
        <li>task.completed</li>
        <li>comment.added</li>
      </ul>
      
      <h3>Webhook Payload</h3>
      <p>Webhooks send a JSON payload with event data to your specified URL.</p>
    `,
    relatedArticles: ["22", "23"],
  },
  {
    id: "25",
    slug: "custom-integrations",
    categorySlug: "integrations",
    title: "Building Custom Integrations",
    shortDescription: "Advanced guide to creating custom integrations using our API and webhooks.",
    author: "David Kim",
    updatedAt: "2025-11-05",
    body: `
      <h2>Custom Integrations</h2>
      <p>Build powerful custom integrations tailored to your specific workflow needs.</p>
      
      <h3>Planning Your Integration</h3>
      <p>Before building, consider:</p>
      <ul>
        <li>What data needs to sync?</li>
        <li>How often should it sync?</li>
        <li>What triggers the sync?</li>
        <li>Error handling strategy</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul>
        <li>Use webhooks for real-time updates</li>
        <li>Implement exponential backoff for retries</li>
        <li>Cache responses when appropriate</li>
        <li>Log all API interactions</li>
        <li>Handle rate limits gracefully</li>
      </ul>
      
      <h3>Testing</h3>
      <p>Use our sandbox environment to test your integration before deploying to production.</p>
    `,
    relatedArticles: ["23", "24"],
  },
];

// Helper functions to query mock data
export function getCategoryBySlug(slug: string): HelpCategory | undefined {
  return helpCategories.find(cat => cat.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): HelpArticle[] {
  return helpArticles.filter(article => article.categorySlug === categorySlug);
}

export function getArticleBySlug(categorySlug: string, articleSlug: string): HelpArticle | undefined {
  return helpArticles.find(
    article => article.categorySlug === categorySlug && article.slug === articleSlug
  );
}

export function getRelatedArticles(articleIds: string[]): HelpArticle[] {
  return helpArticles.filter(article => articleIds.includes(article.id));
}
