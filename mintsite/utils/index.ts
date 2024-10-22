import { SuiClient } from "@mysten/sui.js/client";
import { isValidSuiAddress, isValidSuiObjectId, toHEX } from "@mysten/sui.js/utils";
import baseX from "base-x";

const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";
const b36 = baseX(BASE36);

type Path = {
    subdomain: string;
    path: string;
};

const subdomainToObjectId = (subdomain: string) => {
    const objectId = "0x" + toHEX(b36.decode(subdomain.toLowerCase()));
    console.log(
        "obtained object id: ",
        objectId,
        isValidSuiObjectId(objectId),
        isValidSuiAddress(objectId),
    );
    return isValidSuiObjectId(objectId) ? objectId : null;
}

function removeLastSlash(path: string): string {
    return path.endsWith("/") ? path.slice(0, -1) : path;
}

function getSubdomainAndPath(scope: string): Path | null {
    // At the moment we only support one subdomain level.
    const url = new URL(scope);
    const hostname = url.hostname.split(".");

    if (hostname.length === 3 || (hostname.length === 2 && hostname[1] === "localhost")) {
        // Accept only one level of subdomain eg `subdomain.example.com` or `subdomain.localhost` in
        // case of local development
        const path = url.pathname == "/" ? "/index.html" : removeLastSlash(url.pathname);
        return { subdomain: hostname[0], path } as Path;
    }
    return null;
}

async function getBlob(objectId: string) {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    const obj = await client.getObject({
        id: objectId,
        options: { showContent: true },
    });
    return obj;
}

export { subdomainToObjectId, getSubdomainAndPath, getBlob };