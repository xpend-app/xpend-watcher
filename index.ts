import { Worker, Processor, Queue } from "bullmq";
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

const queue = new Queue<JobData<SupportedDigitalCurrency>>("watch-queue", {
    connection: redisClient,
});

await queue.add(
    "nano_3o5dcp6kjish9xuu51akx1d8bp4pytk4diput3s8dkt7cktnmcg96aoi1cbw",
    {
        addressToWatch:
            "nano_3o5dcp6kjish9xuu51akx1d8bp4pytk4diput3s8dkt7cktnmcg96aoi1cbw",
        digitalCurrency: "XNO",
        callbackUrl: "https://google.com",
    }
);

new Worker("watch-queue", processor, {
    connection: redisClient,
});
