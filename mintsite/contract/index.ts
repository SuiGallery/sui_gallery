import { bcs } from "@mysten/sui.js/bcs";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";

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

export { mint };
