#!/bin/bash
# ═══════════════════════════════════════════════════════════
# evote.ng — cPanel Cron Setup Helper
# ═══════════════════════════════════════════════════════════
#
# INSTRUCTIONS:
# 1. SSH into your server or open cPanel → Cron Jobs
# 2. Add the cron entries below
# 3. Replace YOUR_DOMAIN and YOUR_CRON_TOKEN with real values
#
# ═══════════════════════════════════════════════════════════

DOMAIN="https://evote.ng"
CRON_TOKEN="REPLACE_WITH_YOUR_NEWS_CRON_TOKEN"

echo ""
echo "════════════════════════════════════════════════"
echo "  evote.ng — Cron Jobs to Add in cPanel"
echo "════════════════════════════════════════════════"
echo ""
echo "1. NEWS RSS INGEST (every 15 minutes)"
echo "   Schedule: */15 * * * *"
echo "   Command:"
echo "   curl -s -X POST ${DOMAIN}/api/news-admin.php -H 'Content-Type: application/json' -H 'X-Cron-Token: ${CRON_TOKEN}' -d '{\"action\":\"run_ingest\"}' > /dev/null 2>&1"
echo ""
echo "2. PROFILE REPAIR (weekly, Sunday 3AM)"
echo "   Schedule: 0 3 * * 0"
echo "   Command:"
echo "   cd /home/YOUR_CPANEL_USER/public_html && /usr/local/bin/php scripts/repair_all_profiles.php >> /tmp/evote-repair.log 2>&1"
echo ""
echo "3. MANDATE POPULATION (weekly, Sunday 4AM)"
echo "   Schedule: 0 4 * * 0"
echo "   Command:"
echo "   cd /home/YOUR_CPANEL_USER/public_html && /usr/local/bin/php scripts/populate_all_mandates.php >> /tmp/evote-mandates.log 2>&1"
echo ""
echo "════════════════════════════════════════════════"
echo ""
echo "IMPORTANT: Generate a cron token first:"
echo "  php -r \"echo bin2hex(random_bytes(32)) . PHP_EOL;\""
echo ""
echo "Then set the same token in config/secrets.php → NEWS_CRON_TOKEN"
echo ""
