require("server-only");

const { query } = require("./db");

async function getDashboardData() {
  const [counts, categories, activity] = await Promise.all([
    query(`SELECT COUNT(*) AS total,
      SUM(status='draft') AS draft,
      SUM(status='published') AS published,
      SUM(status='archived') AS archived FROM blog_posts`),
    query("SELECT COUNT(*) AS total FROM blog_categories"),
    query(`SELECT a.action, a.entity_type, a.entity_id, a.created_at, u.name AS actor_name
      FROM audit_logs a LEFT JOIN admin_users u ON u.id=a.user_id
      ORDER BY a.created_at DESC LIMIT 8`),
  ]);
  return {
    totalPosts: Number(counts[0].total || 0),
    draftPosts: Number(counts[0].draft || 0),
    publishedPosts: Number(counts[0].published || 0),
    archivedPosts: Number(counts[0].archived || 0),
    totalCategories: Number(categories[0].total || 0),
    activity,
  };
}

module.exports = { getDashboardData };
