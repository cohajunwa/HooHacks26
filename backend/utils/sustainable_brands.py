# Curated list of sustainable fashion brands.
# Maps display name -> domain for site: search filtering.
# Ratings sourced from Good on You ("Great" or "Champion" tier).

SUSTAINABLE_BRANDS: dict[str, str] = {
    "ThreadUp": "thredup.com",
    "Etsy": "etsy.com",
    "eBay": "ebay.com",
    "Poshmark": "poshmark.com",
    "Depop": "depop.com",
    "People Tree": "peopletree.co.uk", # Great rating
    "Patagonia": "patagonia.com", # Good rating
    "Everlane": "everlane.com", # Good rating
    "Reformation": "thereformation.com", # Good
    "Tentree": "tentree.com", # Good
    "Pact": "wearpact.com", # Good
    "Kotn": "kotn.com", # Good
    "Outerknown": "outerknown.com", # Good
    "ABLE": "livefashionable.com", # Good
    "Nudie Jeans": "nudiejeans.com", # Great
    "Veja": "veja-store.com", # Good
    "United By Blue": "unitedbyblue.com", # Good
    "Toad&Co": "toadandco.com", # Good
}

# Pre-built site: filter fragment for SerpAPI queries.
# Kept as a module-level constant to avoid rebuilding on every request.
SITE_FILTER = " OR ".join(f"site: {domain}" for domain in SUSTAINABLE_BRANDS.values())
