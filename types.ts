export type SupportedDigitalCurrency = "XNO" | "BTC";

export interface JobData<DigitalCurrency extends SupportedDigitalCurrency> {
    digitalCurrency: DigitalCurrency;
    addressToWatch: string;
    amountToWatch?: string;
    callbackUrl: string;
}

export type JobProcessor<DigitalCurrency extends SupportedDigitalCurrency> = (
    data: JobData<DigitalCurrency>
) => Promise<void>;

export interface WatchingAddress {
    address: string;
    amount?: string;
}
