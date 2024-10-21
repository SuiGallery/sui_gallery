import { bcs } from "@mysten/sui.js/bcs";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui.js/client";

//mint
const mint = async (blob_id: string, recipient: string) => {
    if(!isValidSuiAddress(recipient)){
        throw new Error("Invalid recipient address");
    }
    const tx = new Transaction();
    const [Art] = tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::gallery::mint`,
        arguments: [
            tx.pure(bcs.string().serialize(blob_id).toBytes()),
            tx.object(process.env.NEXT_PUBLIC_GALLERY_SHARED_ID!),
        ],
    });
    tx.transferObjects([Art], recipient);
    return tx;
}

/* public entry fun create_event(
    name: String, 
    state: &mut State, 
    expiry: u64,
    ctx: &mut TxContext
) */
const createEvent = async (event: string, expiry: number) => {
    console.log(process.env.NEXT_PUBLIC_PACKAGE_ID, process.env.NEXT_PUBLIC_GALLERY_SHARED_ID);
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::gallery::create_event`,
        arguments: [
            tx.pure(bcs.string().serialize(event).toBytes()),
            tx.object(process.env.NEXT_PUBLIC_GALLERY_SHARED_ID!),
            tx.pure(bcs.u64().serialize(expiry).toBytes()),
        ],
    });
    return tx;
}

const getEvents = async (client: SuiClient) => {
    const object = await client.getObject({
        id: `${process.env.NEXT_PUBLIC_GALLERY_SHARED_ID}`,
        options: {
            showContent: true,
        }
    });
    const data = object.data?.content as unknown as any;
    const events = data.fields.events;
    
    const eventPromises = events.map(async (e: any) => {
        const blob = await client.getObject({
            id: e,
            options: {
                showContent: true,
            }   
        });
        const blobData = blob.data?.content as unknown as any;
        return {
            b36addr: blobData.fields.b36addr,
            name: blobData.fields.name,
            expiry: blobData.fields.expiry,
            host: blobData.fields.host,
            id: blobData.fields.id.id,
        };
    });

    const eventList = await Promise.all(eventPromises);
    return eventList;
}

interface Event {
    b36addr:string;
    name:string;
    expiry: number;
    host: string;
    id: string;
}

export { mint, createEvent, getEvents };    export type { Event };
