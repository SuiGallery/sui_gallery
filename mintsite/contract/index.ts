import { bcs } from "@mysten/sui.js/bcs";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui.js/client";

//mint
const mint = async (blob_id: string, eventId: string) => {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::gallery::mint_photo`,
        arguments: [
            tx.pure(bcs.string().serialize(blob_id).toBytes()),
            tx.object(eventId),
        ],
    });
    return tx;
}

const getEvent = async (client: SuiClient, eventId: string) => {
    const blob = await client.getObject({
        id: eventId,
        options: {
            showContent: true,
        }
    });
    const blobData = blob.data?.content as unknown as any;
    const event: Event = {
        b36addr: blobData.fields.b36addr,
        name: blobData.fields.name,
        expiry: blobData.fields.expiry,
        host: blobData.fields.host,
        id: blobData.fields.id.id,
        minted: blobData.fields.minted,
        blob: []
    };
    const minted = await Promise.all(event.minted.map(async (m: string) => await client.getObject({
        id: m,
        options: {
            showContent: true,
            }
        })));
    minted.forEach((m: any) => {
        event.blob.push({
            b36addr: m.data?.content.fields.b36addr,
            id: m.data?.content.fields.id.id,
            image_blob: m.data?.content.fields.image_blob
        });
    });
    return event;
}

interface Minted {
    b36addr: string;
    id: string;
    image_blob: string;
}

interface Event {
    b36addr: string;
    name: string;
    expiry: number;
    host: string;
    id: string;
    minted: string[];
    blob: Minted[];
}

export { mint, getEvent };
export type { Event };
