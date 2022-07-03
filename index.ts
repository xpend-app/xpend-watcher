import { Worker, Processor } from "bullmq";
import IORedis from "ioredis";
import { WebSocket } from "ws";
import { request } from "undici";

import { JobData, JobProcessor, SupportedDigitalCurrency } from "./types";

const queueBrokerUrl = process.env.QUEUE_BROKER_URL;

let nanoWebsocket: WebSocket;
const nanoWatchingAddresses: { address: string; amount?: string }[] = [];

const isNanoWebsocketConnected = () =>
    nanoWebsocket?.readyState === WebSocket.OPEN;

const nanoJobProcessor: JobProcessor<"XNO"> = async (data) => {
    if (isNanoWebsocketConnected())
        nanoWebsocket = new WebSocket("wss://nano.filipesm.com/ws");

        if(nanoWatchingAddresses)
};

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
