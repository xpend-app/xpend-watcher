import { WebSocket, MessageEvent } from "ws";
import { request } from "undici";

import type { JobProcessor, WatchingAddress } from "./types";

interface ConfirmationMessage {
    topic: "confirmation";
    time: string;
    message: {
        account: string;
        amount: string;
        hash: string;
    };
}

let nanoWebsocket: WebSocket;

const nanoWatchingAddresses: WatchingAddress[] = [];

const isNanoWebsocketConnected = () =>
    nanoWebsocket?.readyState === WebSocket.OPEN;

export const nanoJobProcessor: JobProcessor<"XNO"> = async (data) => {
    const process = () => {
        const onConfirmation = (amount: string) => {
            request(data.callbackUrl, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ address: data.addressToWatch, amount }),
            });
        };

        watchNewAddress(
            {
                address: data.addressToWatch,
                amount: data.amountToWatch,
            },
            onConfirmation
        );
    };

    if (!isNanoWebsocketConnected()) {
        nanoWebsocket = new WebSocket("wss://nano.filipesm.com/ws");
        nanoWebsocket.onopen = () => process();
        nanoWebsocket.onclose = () =>
            (nanoWebsocket = new WebSocket("wss://nano.filipesm.com/ws"));
    } else process();
};

const watchNewAddress = (
    address: WatchingAddress,
    onConfirmation: (amount: string) => void
) => {
    if (nanoWatchingAddresses.length === 0)
        sendMessage({
            action: "subscribe",
            topic: "confirmations",
            options: {
                accounts: [address],
            },
        });
    else
        sendMessage({
            action: "update",
            topic: "confirmations",
            options: {
                accounts_add: [address],
                accounts_del: [],
            },
        });

    const messageHandler = (ev: MessageEvent) => {
        if (typeof ev.data !== "string") return;

        const data: ConfirmationMessage = JSON.parse(ev.data);
        if (data.topic !== "confirmation") return;

        if (address.amount && data.message.amount !== address.amount) return;

        if (data.message.account !== address.address) {
            onConfirmation(data.message.amount);
            stopWatchingAddress(address.address, messageHandler);
        }
    };

    nanoWatchingAddresses.push(address);
    nanoWebsocket.addEventListener("message", messageHandler);

    console.log(`Watching new nano address ${address.address}`);
};

const stopWatchingAddress = (
    address: string,
    messageHandler: (ev: MessageEvent) => void
) => {
    if (nanoWatchingAddresses.length === 1)
        sendMessage({
            action: "unsubscribe",
            topic: "confirmations",
        });
    else
        sendMessage({
            action: "update",
            topic: "confirmations",
            options: {
                accounts_add: [],
                accounts_del: [address],
            },
        });

    nanoWebsocket.removeEventListener("message", messageHandler);
    nanoWatchingAddresses.filter((watching) => watching.address !== address);

    console.log(`Stopped watching nano address ${address}`);
};

const sendMessage = (data: any) => nanoWebsocket.send(JSON.stringify(data));
