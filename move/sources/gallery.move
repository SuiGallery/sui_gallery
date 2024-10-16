/// The NFT art gallery project.
module admin::gallery;

use std::string::String;
use sui::address;
use sui::display;
use sui::package;

const BASE36: vector<u8> = b"0123456789abcdefghijklmnopqrstuvwxyz";
const EVENT_VISUALIZATION_SITE: address =
    @0xe85a97a3e07f984c53e1a8a1dc6bd32ebec4e48610b3191e4e2e911eccabcb9b;
const PHOTO_VISUALIZATION_SITE: address =
    @0xe85a97a3e07f984c53e1a8a1dc6bd32ebec4e48610b3191e4e2e911eccabcb9b;

public struct State has key {
    id: UID,
    events: vector<address>, //EventSite
}

public struct EventSite has key, store{
    id: UID,
    host: address,
    b36addr: String,
    site_blob: String,
    expiry: u64,
    minted: vector<address> //<nft_obj_add>
}

public struct Photo has key, store {
    id: UID,
    owner: address,
    b36addr: String,
    image_blob: String,
}

// OTW for display.
public struct GALLERY has drop {}

fun init(otw: GALLERY, ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);
    let mut event_display = display::new<EventSite>(&publisher, ctx);

    event_display.add(
        b"link".to_string(),
        b"https://{b36addr}.walrus.site".to_string(),
    );
    event_display.add(
        b"event_url".to_string(), //for each event site
        b"https://clgallery.cyberchenjw.workers.dev/?objectId={id}".to_string(),
    );
    event_display.add(
        b"walrus site address".to_string(),
        EVENT_VISUALIZATION_SITE.to_string(),
    );
    event_display.update_version();

    let mut photo_display = display::new<Photo>(&publisher, ctx);
    photo_display.add(
        b"link".to_string(),
        b"https://{b36addr}.walrus.site".to_string(),
    );
    photo_display.add(
        b"photo_url".to_string(), 
        b"https://clgallery.cyberchenjw.workers.dev/?objectId={id}".to_string(),
    );
    photo_display.add(
        b"walrus site address".to_string(),
        PHOTO_VISUALIZATION_SITE.to_string(),
    );
    photo_display.update_version();

    transfer::share_object(State{id: object::new(ctx), events: vector::empty()});
    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(event_display, ctx.sender());
    transfer::public_transfer(photo_display, ctx.sender());
}

/// Creates a a new event site
///
public entry fun create_event(
    site_blob_id: String, 
    state: &mut State, 
    expiry: u64,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let id = object::new(ctx);
    let object_address = object::uid_to_address(&id);
    let b36addr = to_b36(id.uid_to_address());
    let event = EventSite {
        id,
        host: sender,
        b36addr,
        site_blob: site_blob_id,
        expiry,
        minted: vector::empty()
    };
    
    vector::push_back(&mut state.events, object_address);
    transfer::share_object(event);
}

public entry fun mint_photo(
    photo_blob_id: String, 
    event: &mut EventSite,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let id = object::new(ctx);
    let object_address = object::uid_to_address(&id);
    let b36addr = to_b36(id.uid_to_address());
    let photo = Photo {
        id,
        owner: sender,
        b36addr,
        image_blob: photo_blob_id,
    };
    vector::push_back(&mut event.minted, object_address);
    transfer::public_transfer(photo, sender);
}

public fun to_b36(addr: address): String {
    let source = address::to_bytes(addr);
    let size = 2 * vector::length(&source);
    let b36copy = BASE36;
    let base = vector::length(&b36copy);
    let mut encoding = vector::tabulate!(size, |_| 0);
    let mut high = size - 1;

    source.length().do!(|j| {
        let mut carry = source[j] as u64;
        let mut it = size - 1;
        while (it > high || carry != 0) {
            carry = carry + 256 * (encoding[it] as u64);
            let value = (carry % base) as u8;
            *&mut encoding[it] = value;
            carry = carry / base;
            it = it - 1;
        };
        high = it;
    });

    let mut str: vector<u8> = vector[];
    let mut k = 0;
    let mut leading_zeros = true;
    while (k < vector::length(&encoding)) {
        let byte = encoding[k] as u64;
        if (byte != 0 && leading_zeros) {
            leading_zeros = false;
        };
        let char = b36copy[byte];
        if (!leading_zeros) {
            str.push_back(char);
        };
        k = k + 1;
    };
    str.to_string()
}
