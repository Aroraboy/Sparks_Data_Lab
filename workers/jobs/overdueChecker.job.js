import supabase from '../lib/supabase.js';
import { Resend } from 'resend';

const log = (msg) => console.log(`[${new Date().toISOString()}] [OverdueChecker] ${msg}`);

export default async function processOverdueChecker(_job) {
  log('Starting overdue checker job');

  // Find requests that are past due and not completed
  const { data: overdue, error } = await supabase
    .from('requests')
    .select('id, title, status, priority, company, due_date, assigned_to')
    .lt('due_date', new Date().toISOString())
    .not('status', 'in', '("Completed","Cancelled")')
    .eq('is_flagged', false);

  if (error) {
    log(`Query error: ${error.message}`);
    throw error;
  }

  if (!overdue || overdue.length === 0) {
    log('No overdue requests found');
    return { flagged: 0 };
  }

  log(`Found ${overdue.length} overdue requests`);

  // Flag them
  const ids = overdue.map((r) => r.id);
  await supabase
    .from('requests')
    .update({ is_flagged: true, updated_at: new Date().toISOString() })
    .in('id', ids);

  // Create notifications for assigned users
  const notifications = [];
  for (const req of overdue) {
    const assignees = req.assigned_to || [];
    for (const userId of assignees) {
      notifications.push({
        user_id: userId,
        type: 'overdue',
        message: `Request "${req.title}" is overdue`,
        link: `/requests/${req.id}`,
      });
    }
  }

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications).catch((e) => {
      log(`Notification insert error: ${e.message}`);
    });
  }

  // Send email alerts if Resend is configured
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    const resend = new Resend(RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'datalab@sparksgroup.com';
    const fromName = process.env.RESEND_FROM_NAME || 'SPARKS DataLab';

    // Collect all unique assigned user IDs
    const allUserIds = [...new Set(overdue.flatMap((r) => r.assigned_to || []))];
    if (allUserIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .in('id', allUserIds);

      const userEmailMap = new Map((users || []).map((u) => [u.id, u.email]));

      for (const req of overdue) {
        const recipientEmails = (req.assigned_to || [])
          .map((id) => userEmailMap.get(id))
          .filter(Boolean);

        if (recipientEmails.length > 0) {
          const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: recipientEmails,
            subject: `Overdue: ${req.title}`,
            html: `<div style="font-family:sans-serif"><h2 style="color:#dc2626">Overdue Request</h2><p><strong>${escapeHtml(req.title)}</strong> was due on ${escapeHtml(req.due_date)} and requires attention.</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/requests/${req.id}" style="background:#dc2626;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">View Request</a></p></div>`,
          }).catch((e) => log(`Email error for ${req.id}: ${e.message}`));
        }
      }
    }
  }

  log(`Flagged ${overdue.length} overdue requests, created ${notifications.length} notifications`);
  return { flagged: overdue.length, notifications: notifications.length };
}
