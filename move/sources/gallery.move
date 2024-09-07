/// The NFT art gallery project.
module admin::gallery;

use std::string::String;
use sui::address;
use sui::display;
use sui::package;
use sui::table::{Self, Table};

const BASE36: vector<u8> = b"0123456789abcdefghijklmnopqrstuvwxyz";
const VISUALIZATION_SITE: address =
    @0xe85a97a3e07f984c53e1a8a1dc6bd32ebec4e48610b3191e4e2e911eccabcb9b;

public struct State has key {
    id: UID,
    artists: Table<address, Collection>,
    total_art: u64
}

public struct Collection has store{
    artist: address,
    minted: vector<String> //<blob_id>
}

public struct Art has key, store {
    id: UID,
    b36addr: String,
    image_blob: String,
}

// OTW for display.
public struct GALLERY has drop {}

fun init(otw: GALLERY, ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);
    let mut display = display::new<Art>(&publisher, ctx);

    display.add(
        b"link".to_string(),
        b"https://{b36addr}.walrus.site".to_string(),
    );
    display.add(
        b"image_url".to_string(),
        b"https://clgallery.cyberchenjw.workers.dev/?objectId={id}".to_string(),
    );
    display.add(
        b"walrus site address".to_string(),
        VISUALIZATION_SITE.to_string(),
    );
    display.update_version();

    transfer::share_object(State{id: object::new(ctx), artists: table::new(ctx), total_art: 0});
    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(display, ctx.sender());
}

/// Creates a new Art.
///
/// The color and number of sides are chosen at random.
public fun mint(blob_id: String, state: &mut State, ctx: &mut TxContext):Art {
    let sender = tx_context::sender(ctx);
    let art = new(blob_id, ctx);
    
    if(!table::contains(&state.artists, sender)){
        table::add(&mut state.artists, sender, Collection{artist: sender, minted: vector::empty()});
    };
    let collection = table::borrow_mut(&mut state.artists, sender);
    vector::push_back(&mut collection.minted, blob_id);
    state.total_art = state.total_art + 1;
    art
}

fun new(blob_id: String, ctx: &mut TxContext): Art {
    let id = object::new(ctx);
    let b36addr = to_b36(id.uid_to_address());
    Art {
        id,
        b36addr,
        image_blob: blob_id,
    }
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
