import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { supabase } from './src/lib/supabase-db.ts';
import { triageIssue } from './src/lib/triage-engine.ts';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(process.cwd(), 'public');

export default async function handler(req: any, res: any) {
  // CORS Basics for dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API ROUTES
  if (req.url?.startsWith('/api/')) {

    // ----------- AUTH: LOGIN -----------
    if (req.method === 'POST' && req.url === '/api/auth/login') {
      let body = '';
      req.on('data', c => body += c.toString());
      req.on('end', async () => {
        const { email, password } = JSON.parse(body);

        // --- HARDCODED ADMIN BYPASS ---
        if (email === 'avp7708@gmail.com' && password === 'Nopassword@10') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, token: 'override-admin-token', department: 'ALL' }));
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: error.message }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token: data.session.access_token,
          department: data.user.user_metadata?.department || null
        }));
      });
      return;
    }

    // ----------- AUTH: SIGNUP -----------
    if (req.method === 'POST' && req.url === '/api/auth/signup') {
      let body = '';
      req.on('data', c => body += c.toString());
      req.on('end', async () => {
        const { email, password, name, department } = JSON.parse(body);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, department: department || null } }
        });
        if (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: error.message }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
      return;
    }

    // ----------- AUTH: RESET PASSWORD -----------
    if (req.method === 'POST' && req.url === '/api/auth/reset-password') {
      let body = '';
      req.on('data', c => body += c.toString());
      req.on('end', async () => {
        const { email } = JSON.parse(body);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `http://localhost:3000/`,
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: !error }));
      });
      return;
    }

    // ----------- GET BUILDINGS -----------
    if (req.method === 'GET' && req.url === '/api/buildings') {
      const { data, error } = await supabase.from('buildings').select('*').order('name');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(error ? { error: error.message } : data));
      return;
    }

    // ----------- GET ISSUES -----------
    if (req.method === 'GET' && (req.url === '/api/issues' || req.url?.startsWith('/api/issues?'))) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const departmentParam = url.searchParams.get('department');

      let query = supabase
        .from('issues')
        .select(`*, buildings(name)`)
        .order('created_at', { ascending: false });

      if (departmentParam && departmentParam !== 'ALL' && departmentParam !== 'null') {
        query = query.eq('ai_assigned_department', departmentParam);
      }

      const { data, error } = await query;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(error ? { error: error.message } : data));
      return;
    }

    // ----------- DELETE ISSUE -----------
    if (req.method === 'DELETE' && req.url?.startsWith('/api/issues/')) {
      const id = req.url.split('/').pop();
      if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Issue ID required' }));
      }

      // Use service role key to bypass RLS for admin deletes
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const adminClient = createClient(supabaseUrl, serviceKey);

      const { error } = await adminClient.from('issues').delete().eq('id', id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(error ? { error: error.message } : { success: true }));
    }

    // ----------- POST ISSUE -----------
    if (req.method === 'POST' && req.url === '/api/issues') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);

          // Verify auth using token
          const token = req.headers['authorization']?.split('Bearer ')[1];
          if (!token) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
          }

          const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
          if (authErr || !user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid Token' }));
          }

          // Smart Triage
          const { department, priority } = triageIssue(payload.description, payload.category);

          // Insert into Supabase
          const { data, error } = await supabase.from('issues').insert([{
            student_id: user.id,
            building_id: payload.building_id,
            category: payload.category,
            room_number: payload.room_number,
            gender: payload.gender,
            description: payload.description,
            image_url: payload.image_url,
            ai_assigned_department: department,
            ai_priority: priority
          }]).select();

          if (error) throw error;

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, triage: { department, priority }, data }));
        } catch (e: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // ----------- RESOLVE ISSUE (ADMIN ONLY) -----------
    if (req.method === 'POST' && req.url.startsWith('/api/issues/resolve/')) {
      const issueId = req.url.split('/').pop();
      let body = '';
      req.on('data', c => body += c.toString());
      req.on('end', async () => {
        try {
          const payload = body ? JSON.parse(body) : {};
          let resolvedImageUrl = null;

          if (payload.imageBase64) {
            const base64Data = payload.imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `resolved_${issueId}_${Date.now()}.jpg`;
            const { data: uploadData, error: uploadError } = await supabase
              .storage
              .from('issue-images')
              .upload(filename, buffer, { contentType: 'image/jpeg' });

            if (!uploadError) {
              const { data: publicData } = supabase.storage.from('issue-images').getPublicUrl(filename);
              resolvedImageUrl = publicData.publicUrl;
            }
          }

          const updateData: any = { status: 'Resolved', resolved_at: new Date().toISOString() };
          if (resolvedImageUrl) {
            updateData.resolved_image_url = resolvedImageUrl;
          }

          const { error } = await supabase
            .from('issues')
            .update(updateData)
            .eq('id', issueId);

          if (error) {
            // Fallback if resolved_image_url column doesn't exist yet
            if (resolvedImageUrl && error.message.includes('column "resolved_image_url" of relation "issues" does not exist')) {
              const { error: fallbackError } = await supabase
                .from('issues')
                .update({ status: 'Resolved', resolved_at: new Date().toISOString(), image_url: resolvedImageUrl })
                .eq('id', issueId);
              if (fallbackError) throw new Error(fallbackError.message);
            } else {
              throw new Error(error.message);
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (e: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // ----------- AI CHAT (RAG / NL2SQL via Gemini) -----------
    if (req.method === 'POST' && req.url === '/api/ai-chat') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { message, departmentContext } = JSON.parse(body);
          const API_KEY = process.env.GEMINI_API_KEY;

          if (!API_KEY) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: "Gemini API key is not configured on the server." }));
          }

          let query = supabase.from('issues').select('id, category, status, ai_priority, room_number, ai_assigned_department, created_at, buildings(name)');
          if (departmentContext && departmentContext !== 'ALL') {
            query = query.ilike('ai_assigned_department', `%${departmentContext}%`);
          }
          const { data: issues } = await query;

          const systemPrompt = `You are ResolveAI, the Head Administrator assistant for ScappyV Facility Management.
You have direct access to the live campus issues database. Current database state (JSON): ${JSON.stringify(issues)}

User request: "${message}"

Analyze the JSON data to answer the request accurately. Format your response STRICTLY in HTML (using tags like <strong>, <ul>, <br>, etc., NEVER use markdown asterisks or codeblocks). Do not say "html", just output the raw html strings. Keep it crisp, insightful, and professional.`;

          const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
          const aiRes = await fetch(fetchUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          });

          const aiData = await aiRes.json();
          if (aiData.error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: aiData.error.message }));
          }

          const reply = aiData.candidates[0].content.parts[0].text.replace(/```html/g, '').replace(/```/g, '').trim();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ reply }));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Server error processing AI query.' }));
        }
      });
      return;
    }

    // ----------- AI CHAT (RAG / NL2SQL via Gemini) -----------
    if (req.method === 'POST' && req.url === '/api/ai-chat') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { message, departmentContext } = JSON.parse(body);
          const API_KEY = process.env.GEMINI_API_KEY;

          if (!API_KEY) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: "Gemini API key is not configured on the server." }));
          }

          let query = supabase.from('issues').select('id, category, status, ai_priority, room_number, ai_assigned_department, created_at, buildings(name)');
          if (departmentContext && departmentContext !== 'ALL') {
            query = query.ilike('ai_assigned_department', `%${departmentContext}%`);
          }
          const { data: issues } = await query;

          const systemPrompt = `You are ResolveAI, the Head Administrator assistant for ScappyV Facility Management.
You have direct access to the live campus issues database. Current database state (JSON): ${JSON.stringify(issues)}

User request: "${message}"

Analyze the JSON data to answer the request accurately. Format your response STRICTLY in HTML (using tags like <strong>, <ul>, <br>, etc., NEVER use markdown asterisks or codeblocks). Do not say "html", just output the raw html strings. Keep it crisp, insightful, and professional.`;

          const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
          const aiRes = await fetch(fetchUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          });

          const aiData = await aiRes.json();
          if (aiData.error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: aiData.error.message }));
          }

          const reply = aiData.candidates[0].content.parts[0].text.replace(/```html/g, '').replace(/```/g, '').trim();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ reply }));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Server error processing AI query.' }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API route not found' }));
    return;
  }

  // ----------- STATIC FILE SERVER -----------
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url!);
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
    case '.json': contentType = 'application/json'; break;
    case '.png': contentType = 'image/png'; break;
    case '.jpg': contentType = 'image/jpg'; break;
    case '.ico': contentType = 'image/x-icon'; break;
    case '.svg': contentType = 'image/svg+xml'; break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

if (!process.env.VERCEL) {
  const server = http.createServer(handler);
  server.listen(PORT as number, '0.0.0.0', () => {
    console.log(`[VIT ScappyV] Server running at http://localhost:${PORT}/`);
  });
}
