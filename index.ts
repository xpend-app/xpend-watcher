import { Worker, Processor } from "bullmq";
import Redis from "ioredis";
import { nanoJobProcessor } from "./nano.js";

import type { JobData, SupportedDigitalCurrency } from "./types";

const queueBrokerUrl = process.env.QUEUE_BROKER_URL;

const processor: Processor<JobData<SupportedDigitalCurrency>> = async (job) => {
    switch (job.data.digitalCurrency) {
        case "XNO":
            await nanoJobProcessor(job.data as JobData<"XNO">);
        default:
            return;
    }
};

const redisClient = new Redis(queueBrokerUrl, {
    maxRetriesPerRequest: null,
});

new Worker("watch-queue", processor, {
    connection: redisClient,
});
