import { FontOption, SizeOption, FormatOption, MarginOption, TemplateOption } from '../types';

export const FONT_OPTIONS: FontOption[] = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Monospace', value: 'Courier New' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Trebuchet', value: 'Trebuchet MS' },
];

export const SIZE_OPTIONS: SizeOption[] = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Medium', value: '4' },
  { label: 'Large', value: '5' },
  { label: 'Heading', value: '6' },
];

export const FORMAT_OPTIONS: FormatOption[] = [
  { label: 'A4 Standard', value: 'a4' },
  { label: 'US Letter', value: 'letter' },
  { label: 'US Legal', value: 'legal' },
];

export const MARGIN_OPTIONS: MarginOption[] = [
  { label: 'Narrow', value: '12px', description: '12px compact' },
  { label: 'Normal', value: '24px', description: '24px standard' },
  { label: 'Wide', value: '36px', description: '36px spacious' },
];

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  { label: 'Project Summary', key: 'default' },
  { label: 'Business Letter', key: 'letter' },
  { label: 'Client Invoice', key: 'invoice' },
  { label: 'Project Report', key: 'report' },
  { label: 'Blank Sheet', key: 'blank' },
];

export const TEMPLATES: Record<string, string> = {
  default: `
    <h1 style="margin-bottom: 6px; font-weight: 700; color: #0f172a; font-size: 22px;">Executive Document Summary</h1>
    <p style="color: #64748b; font-size: 13px; margin-bottom: 14px;">Mobile PDF Studio &bull; Prepared by Ch Atif Gondal &bull; <span style="color: #059669; font-weight: 600;">Lifetime Unlimited Access</span></p>
    
    <p style="margin-bottom: 10px;">This live preview document can be edited directly. Tap anywhere on the page to customize your text, modify styles, and insert media.</p>
    
    <h2 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 14px; margin-bottom: 8px;">Key Capabilities</h2>
    <ul style="margin-left: 20px; list-style-type: disc; margin-bottom: 12px; color: #334155;">
      <li><b>Unlimited Generation:</b> Create and export as many documents as needed with no artificial limits or expiration dates.</li>
      <li><b>Multi-Page Architecture:</b> Add, duplicate, reorder, or delete pages with instant confirmation.</li>
      <li><b>Custom Layouts:</b> Configure paper dimensions (A4, Letter, Legal), margins, and custom typography.</li>
      <li><b>Media Integration:</b> Insert photos and graphics smoothly with native sizing.</li>
    </ul>

    <p style="color: #475569; font-size: 14px;">Tap <b>Export PDF</b> in the header above to compile and save your document to your device.</p>
  `,
  letter: `
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">
      <div>
        <h2 style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 700;">Acme Global Corporation</h2>
        <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">123 Innovation Way, Suite 400</p>
      </div>
      <div style="text-align: right; color: #64748b; font-size: 13px;">
        <p style="margin: 0;">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="margin: 2px 0 0;">Ref: #DOC-LIFETIME</p>
      </div>
    </div>
    <p style="margin-bottom: 14px;"><b>Dear Valued Partner,</b></p>
    <p style="margin-bottom: 12px;">We are pleased to share our project proposal with your organization. Our team is committed to delivering quality solutions tailored to your operational goals.</p>
    <p style="margin-bottom: 12px;">Please review the attached project schedule and milestone delivery dates. If you have any inquiries or require further adjustments, please feel free to reach out at any time.</p>
    <br/>
    <p style="margin: 0;">Sincerely,</p>
    <p style="margin: 4px 0 0; font-weight: 600; color: #1e293b;">Executive Director</p>
  `,
  invoice: `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 14px;">
      <div>
        <h1 style="margin: 0; color: #1e3a8a; font-size: 24px; font-weight: 800;">INVOICE</h1>
        <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Invoice #: INV-${new Date().getFullYear()}-001</p>
      </div>
      <div style="text-align: right; font-size: 13px; color: #4b5563;">
        <p style="margin: 0; font-weight: 600; color: #111827;">Studio Productions</p>
        <p style="margin: 2px 0 0;">billing@company.com</p>
      </div>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
      <thead>
        <tr style="background-color: #f1f5f9; text-align: left;">
          <th style="padding: 8px; border-bottom: 1px solid #cbd5e1;">Description</th>
          <th style="padding: 8px; border-bottom: 1px solid #cbd5e1; text-align: center;">Qty</th>
          <th style="padding: 8px; border-bottom: 1px solid #cbd5e1; text-align: right;">Rate</th>
          <th style="padding: 8px; border-bottom: 1px solid #cbd5e1; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Document & PDF Architecture</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">1</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$450.00</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$450.00</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Mobile Application Optimization</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">1</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$950.00</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$950.00</td>
        </tr>
      </tbody>
    </table>
    <div style="text-align: right; margin-top: 14px;">
      <p style="font-size: 15px; margin: 0; font-weight: 700; color: #111827;">Total Due: $1,400.00</p>
      <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Payment terms: 15 Days &bull; Lifetime License</p>
    </div>
  `,
  report: `
    <div style="border-bottom: 3px solid #6366f1; padding-bottom: 10px; margin-bottom: 16px;">
      <span style="font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px;">Quarterly Performance Report</span>
      <h1 style="margin: 4px 0 0; color: #0f172a; font-size: 22px; font-weight: 800;">Strategic Operations Review</h1>
    </div>
    <p style="color: #334155; font-size: 14px; margin-bottom: 12px;">This report summarizes key operational deliverables, document processing metrics, and efficiency benchmarks for the current term.</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 14px;">
      <h3 style="margin: 0 0 6px; font-size: 14px; color: #1e293b;">Executive Highlights</h3>
      <p style="margin: 0; font-size: 13px; color: #64748b;">All publishing pipelines operating with zero limitations, 100% offline generation speed, and lifetime reliability.</p>
    </div>
  `,
  blank: `<p><br/></p>`,
};
