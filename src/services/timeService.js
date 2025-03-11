const schedule = require('node-schedule');

class TimeService {
    constructor(messageService) {
        this.messageService = messageService;
        this.scheduledMessages = new Map();
    }

    scheduleMessage(data) {
        const { time, date, message, to, from } = data;
        const dateTime = new Date(date + ' ' + time);

        if (dateTime < new Date()) {
            return { error: 'La fecha y hora debe ser futura' };
        }

        const job = schedule.scheduleJob(dateTime, async () => {
            await this.messageService.sendMessage(to, message);
            this.scheduledMessages.delete(job.name);
        });

        this.scheduledMessages.set(job.name, {
            time,
            date,
            message,
            to,
            from,
            jobId: job.name
        });

        return {
            success: true,
            scheduledTime: dateTime,
            jobId: job.name
        };
    }

    cancelScheduledMessage(jobId) {
        const job = schedule.scheduledJobs[jobId];
        if (job) {
            job.cancel();
            this.scheduledMessages.delete(jobId);
            return true;
        }
        return false;
    }

    getScheduledMessages(from) {
        const messages = [];
        for (const [_, data] of this.scheduledMessages) {
            if (data.from === from) {
                messages.push(data);
            }
        }
        return messages;
    }
}

module.exports = TimeService;
