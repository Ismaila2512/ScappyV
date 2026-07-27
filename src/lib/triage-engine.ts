import { supabase } from './supabase-db.ts';

export type TriageResult = {
    department: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
};

/**
 * AI Triage Simulation. 
 * In a fully production system, you would pass the description to an LLM 
 * (like Anthropic/OpenAI) to extract the context. For now, we use a smart regex/keyword parser.
 */
export function triageIssue(description: string, category: string): TriageResult {
    const text = description.toLowerCase();

    let priority: TriageResult['priority'] = 'Low';
    let department = 'General Maintenance';

    // 1. Keyword analysis for Priority
    if (text.includes('fire') || text.includes('hazard') || text.includes('spark') || text.includes('smoking') || text.includes('emergency')) {
        priority = 'Critical';
    } else if (text.includes('water leak') || text.includes('flooding') || text.includes('overflow') || text.includes('pipe burst')) {
        priority = 'High';
    } else if (text.includes('projector') || text.includes('ac not working') || text.includes('internet') || text.includes('wifi')) {
        priority = 'Medium';
    }

    // 2. Routing Logic
    if (text.includes('face id') || text.includes('biometric') || text.includes('recognition')) {
        department = 'CDC Office (Access Control)';
        priority = priority === 'Low' ? 'Medium' : priority; // Face ID issues are at least medium
    } else if (text.includes('wifi') || text.includes('internet') || text.includes('network') || category === 'IT') {
        department = 'IT Services (CTS)';
    } else if (text.includes('projector') || text.includes('speaker') || text.includes('mic') || text.includes('audio')) {
        department = 'AV/Media Team';
    } else if (text.includes('ac') || text.includes('air conditioner') || text.includes('cooling')) {
        department = 'HVAC Management';
    } else if (text.includes('washroom') || text.includes('toilet') || category === 'washroom') {
        department = 'Facilities & Housekeeping';
    } else if (text.includes('power') || text.includes('electricity') || text.includes('socket')) {
        department = 'Electrical Department';
    }

    return { department, priority };
}
