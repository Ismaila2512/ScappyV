const fs = require('fs');
const path = require('path');

const now = new Date();
const formatDate = (d) => d.toISOString();
const daysAgo = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

// We want 5 years of data -> roughly 1825 days
const TOTAL_DAYS = 365 * 5;

// Helpers
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Arrays to pull from
const owners = ['Sarah Chen', 'Mark Rivera', 'Emily Watson', 'James Park', 'Lisa Thompson', 'David Kumar', 'Unassigned'];
const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'MEA'];
const sources = ['Website', 'Referral', 'LinkedIn', 'Conference', 'Cold Outreach', 'Partner', 'Cold Email', 'Event'];
const stages = ['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Proposal/Price Quote', 'Id. Decision Makers', 'Perception Analysis', 'Negotiation/Review', 'Closed Won', 'Closed Lost'];

const companyPrefixes = ['Tech', 'Global', 'Quantum', 'Alpine', 'Pacific', 'Horizon', 'NexGen', 'Med', 'Edu', 'Retail', 'Data', 'Cloud', 'Cyber', 'Fin', 'Bio'];
const companySuffixes = ['Dynamics', 'Solutions', 'Ventures', 'Corp', 'Systems', 'Group', 'Chain', 'Soft', 'Network', 'Labs', 'Analytics', 'Enterprise', 'Partners'];
const generateCompanyName = () => `${randomElement(companyPrefixes)}${randomElement(companySuffixes)} ${randomElement(['Inc.', 'Ltd', 'GmbH', 'Pte', 'LLC', 'Corp'])}`;

const oppNames = ['Suite Upgrade', 'CRM Integration', 'Cloud Migration', 'Analytics Platform', 'Automation Project', 'Learning Platform', 'Security Audit', 'Infrastructure Expansion'];

// Generate Opportunities
const opportunities = [];
for (let i = 1; i <= 3000; i++) {
  const isClosed = Math.random() > 0.3; // 70% closed
  const isWon = isClosed ? (Math.random() > 0.4) : false; // 60% win rate if closed
  let stage = isClosed ? (isWon ? 'Closed Won' : 'Closed Lost') : randomElement(stages.slice(0, 8));
  
  const createdDaysAgo = randomInt(0, TOTAL_DAYS);
  const updatedDaysAgo = randomInt(0, createdDaysAgo);
  
  opportunities.push({
    id: `opp-gen-${i}`,
    type: 'opportunity',
    name: `${generateCompanyName()} ${randomElement(oppNames)}`,
    value: randomInt(10, 500) * 1000,
    status: stage,
    owner: randomElement(owners.slice(0, 6)),
    stage: stage,
    probability: isClosed ? (isWon ? 100 : 0) : randomInt(1, 9) * 10,
    region: randomElement(regions),
    source: randomElement(sources),
    createdAt: daysAgo(createdDaysAgo),
    updatedAt: daysAgo(updatedDaysAgo),
  });
}

// Generate Leads
const leads = [];
const leadStatuses = ['New', 'Working', 'Nurturing', 'Converted', 'Unqualified'];
for (let i = 1; i <= 5000; i++) {
  const createdDaysAgo = randomInt(0, TOTAL_DAYS);
  const updatedDaysAgo = randomInt(0, createdDaysAgo);
  
  leads.push({
    id: `lead-gen-${i}`,
    type: 'lead',
    name: generateCompanyName(),
    status: randomElement(leadStatuses),
    owner: randomElement(owners),
    region: randomElement(regions),
    source: randomElement(sources),
    createdAt: daysAgo(createdDaysAgo),
    updatedAt: daysAgo(updatedDaysAgo),
  });
}

// Generate Cases
const cases = [];
const caseStatuses = ['New', 'In Progress', 'Escalated', 'Pending Customer', 'Resolved', 'Closed'];
const caseIssues = ['API Integration Timeout', 'Data Export Permissions', 'Dashboard Performance', 'Login Issues', 'Billing Inquiry', 'Feature Request', 'Bug Report', 'Onboarding Help'];
for (let i = 1; i <= 2000; i++) {
  const createdDaysAgo = randomInt(0, TOTAL_DAYS);
  const updatedDaysAgo = randomInt(0, createdDaysAgo);
  
  cases.push({
    id: `case-gen-${i}`,
    type: 'case',
    name: `${randomElement(caseIssues)}`,
    status: randomElement(caseStatuses),
    owner: randomElement(['Tech Support', 'Senior Support', 'Billing Dept']),
    region: randomElement(regions),
    createdAt: daysAgo(createdDaysAgo),
    updatedAt: daysAgo(updatedDaysAgo),
  });
}

const allRecords = [...opportunities, ...leads, ...cases];

// Activity Log
const activities = [];
for (let i = 1; i <= 1000; i++) {
  const record = randomElement(allRecords);
  let action = '';
  if (record.type === 'opportunity') {
    action = record.stage === 'Closed Won' ? 'Deal Closed' : 'Stage Updated';
  } else if (record.type === 'lead') {
    action = record.status === 'New' ? 'Lead Created' : 'Lead Contacted';
  } else {
    action = record.status === 'Escalated' ? 'Case Escalated' : 'Case Updated';
  }
  
  activities.push({
    id: `act-gen-${i}`,
    action,
    entity: record.type.charAt(0).toUpperCase() + record.type.slice(1),
    entityId: record.id,
    user: record.owner,
    timestamp: record.updatedAt,
    details: `${action} for ${record.name}`,
  });
}

const dataFile = path.join(__dirname, 'src/data/salesforce-data.ts');
let content = fs.readFileSync(dataFile, 'utf8');

// Replace SALESFORCE_RECORDS array
content = content.replace(
  /export const SALESFORCE_RECORDS: SalesforceRecord\[\] = \[[\s\S]*?\];/,
  `export const SALESFORCE_RECORDS: SalesforceRecord[] = ${JSON.stringify(allRecords, null, 2)};`
);

// Replace ACTIVITY_LOG array
content = content.replace(
  /export const ACTIVITY_LOG: ActivityLog\[\] = \[[\s\S]*?\];/,
  `export const ACTIVITY_LOG: ActivityLog[] = ${JSON.stringify(activities, null, 2)};`
);

// Rewrite the file
fs.writeFileSync(dataFile, content, 'utf8');

console.log('Successfully injected 5 years of mock dataset!');
