const dbStore = require('../data/dbStore');

const notificationService = {
  async processUserNotifications(userId) {
    try {
      const prefs = await dbStore.getNotificationPreferences(userId);
      if (!prefs.inAppEnabled) return;

      // Generate Deadline Reminders for Tracked Opportunities
      if (prefs.deadlineReminders) {
        const { items: trackedItems } = await dbStore.getUserOpportunities(userId, 'all');
        const activeItems = trackedItems.filter(i => 
          ['saved', 'planned', 'shortlisted', 'interview'].includes(i.status)
        );

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        for (const item of activeItems) {
          if (!item.opportunity || !item.opportunity.deadline) continue;
          
          const deadline = new Date(item.opportunity.deadline);
          if (isNaN(deadline.getTime())) continue; // invalid date

          const diffTime = deadline - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Only process future or exactly today's deadlines (0 to 7 days)
          if (diffDays >= 0 && diffDays <= 7) {
            let reminderType = null;
            let title = '';
            let message = '';

            if (diffDays === 7) {
              reminderType = '7_days';
              title = 'Upcoming Deadline in 7 Days';
              message = `${item.opportunity.title} at ${item.opportunity.organization} is closing in a week. Plan your application!`;
            } else if (diffDays === 3) {
              reminderType = '3_days';
              title = 'Deadline Approaching: 3 Days Left';
              message = `Only 3 days left to apply for ${item.opportunity.title}.`;
            } else if (diffDays === 1) {
              reminderType = '1_day';
              title = 'Deadline Tomorrow!';
              message = `Final reminder: ${item.opportunity.title} deadline is tomorrow.`;
            } else if (diffDays === 0) {
              reminderType = 'today';
              title = 'Deadline Today!';
              message = `URGENT: ${item.opportunity.title} application closes today!`;
            }

            if (reminderType) {
              const deduplicationKey = `deadline_${item.opportunityId}_${reminderType}`;
              await dbStore.createNotification({
                userId,
                title,
                message,
                type: 'deadline',
                linkUrl: '/my-opportunities',
                relatedEntityId: item.opportunityId,
                deduplicationKey
              });
            }
          } else if (diffDays < 0) {
            // Expired opportunities logic (clean up or notify expired)
            const deduplicationKey = `expired_${item.opportunityId}`;
            await dbStore.createNotification({
              userId,
              title: 'Deadline Passed',
              message: `${item.opportunity.title} deadline has passed.`,
              type: 'update',
              linkUrl: '/my-opportunities',
              relatedEntityId: item.opportunityId,
              deduplicationKey
            });
          }
        }
      }

      // Generate application-specific custom reminders
      if (prefs.applicationReminders) {
        const { items: trackedItems } = await dbStore.getUserOpportunities(userId, 'all');
        const now = new Date();
        
        for (const item of trackedItems) {
          if (!item.reminders || !item.reminders.length) continue;
          
          for (const rem of item.reminders) {
            const remDate = new Date(rem.date);
            if (isNaN(remDate.getTime())) continue;

            const diffTime = remDate - now;
            const diffHours = diffTime / (1000 * 60 * 60);

            // If reminder is due within the next 24 hours
            if (diffHours >= 0 && diffHours <= 24) {
              const deduplicationKey = `reminder_${rem.id}`;
              await dbStore.createNotification({
                userId,
                title: 'Custom Reminder Due Soon',
                message: `Task: ${rem.text} for ${item.opportunity?.title}`,
                type: 'application',
                linkUrl: '/my-opportunities',
                relatedEntityId: item.opportunityId,
                deduplicationKey
              });
            }
          }
        }
      }

    } catch (err) {
      console.error('[NotificationService] Error processing notifications for user:', userId, err);
    }
  }
};

module.exports = notificationService;
