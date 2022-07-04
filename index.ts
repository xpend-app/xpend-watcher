import { Worker, Processor } from "bullmq";
import IORedis from "ioredis";
import { nanoJobProcessor } from "./nano";

import { JobData, SupportedDigitalCurrency } from "./types";

const queueBrokerUrl = process.env.QUEUE_BROKER_URL;

const processor: Processor<JobData<SupportedDigitalCurrency>> = async (job) => {
    switch (job.data.digitalCurrency) {
        case "XNO":
            await nanoJobProcessor(job.data as JobData<"XNO">);
        default:
            return;
    }
};

const worker = new Worker("watch-queue", processor, {
    connection: new IORedis(queueBrokerUrl),
});
