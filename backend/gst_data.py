# ── GST Rate + HSN Code Database ──────────────────────────────────────────────
# Maps keywords → (gst_rate, hsn_code, category_name)

GST_MAPPING = [
    # 0% items
    ("fresh milk",      0,  "0401", "Dairy"),
    ("loose milk",      0,  "0401", "Dairy"),
    ("dudh",            0,  "0401", "Dairy"),
    ("eggs",            0,  "0407", "Poultry"),
    ("egg",             0,  "0407", "Poultry"),
    ("anda",            0,  "0407", "Poultry"),
    ("fresh vegetable", 0,  "0709", "Vegetables"),
    ("sabzi",           0,  "0709", "Vegetables"),
    ("salt",            0,  "2501", "Staples"),
    ("namak",           0,  "2501", "Staples"),
    ("tata salt",       0,  "2501", "Staples"),
    ("wheat",           0,  "1001", "Grains"),
    ("rice",            0,  "1006", "Grains"),
    ("chawal",          0,  "1006", "Grains"),
    ("bread",           0,  "1905", "Bakery"),
    ("atta",            0,  "1101", "Grains"),
    ("flour",           0,  "1101", "Grains"),

    # 5% items
    ("bisleri",         5,  "2201", "Packaged Water"),
    ("kinley",          5,  "2201", "Packaged Water"),
    ("aquafina",        5,  "2201", "Packaged Water"),
    ("mineral water",   5,  "2201", "Packaged Water"),
    ("packaged water",  5,  "2201", "Packaged Water"),
    ("tea",             5,  "0902", "Tea/Coffee"),
    ("chai",            5,  "0902", "Tea/Coffee"),
    ("tata tea",        5,  "0902", "Tea/Coffee"),
    ("coffee",          5,  "0901", "Tea/Coffee"),
    ("nescafe",         5,  "0901", "Tea/Coffee"),
    ("bru",             5,  "0901", "Tea/Coffee"),
    ("edible oil",      5,  "1512", "Oils"),
    ("sunflower oil",   5,  "1512", "Oils"),
    ("fortune oil",     5,  "1512", "Oils"),
    ("mustard oil",     5,  "1514", "Oils"),
    ("medicine",        5,  "3004", "Medicines"),
    ("tablet",          5,  "3004", "Medicines"),
    ("syrup",           5,  "3004", "Medicines"),
    ("crocin",          5,  "3004", "Medicines"),
    ("disprin",         5,  "3004", "Medicines"),
    ("eno",             5,  "3004", "Medicines"),
    ("vicks",           5,  "3004", "Medicines"),
    ("burnol",          5,  "3004", "Medicines"),
    ("sugar",           5,  "1701", "Staples"),
    ("cheeni",          5,  "1701", "Staples"),
    ("spices",          5,  "0910", "Spices"),
    ("masala",          5,  "0910", "Spices"),
    ("haldi",           5,  "0910", "Spices"),
    ("mirchi",          5,  "0910", "Spices"),
    ("jeera",           5,  "0910", "Spices"),
    ("coal tar",        5,  "2706", "Fuels"),
    ("kerosene",        5,  "2710", "Fuels"),
    ("horlicks",        5,  "1901", "Health Drinks"),
    ("boost",           5,  "1901", "Health Drinks"),
    ("complan",         5,  "1901", "Health Drinks"),
    ("baby food",       5,  "1901", "Baby Products"),

    # 12% items
    ("butter",          12, "0405", "Dairy"),
    ("amul butter",     12, "0405", "Dairy"),
    ("ghee",            12, "0405", "Dairy"),
    ("cheese",          12, "0406", "Dairy"),
    ("amul cheese",     12, "0406", "Dairy"),
    ("dry fruits",      12, "0813", "Dry Fruits"),
    ("kaju",            12, "0801", "Dry Fruits"),
    ("badam",           12, "0802", "Dry Fruits"),
    ("mobile",          12, "8517", "Electronics"),
    ("phone",           12, "8517", "Electronics"),
    ("umbrella",        12, "6601", "Accessories"),
    ("instant food",    12, "2104", "Instant Food"),

    # 18% items — most packaged goods
    ("lays",            18, "2106", "Snacks"),
    ("chips",           18, "2106", "Snacks"),
    ("kurkure",         18, "2106", "Snacks"),
    ("bhujia",          18, "2106", "Snacks"),
    ("too yumm",        18, "2106", "Snacks"),
    ("biscuit",         18, "1905", "Biscuits"),
    ("parle g",         18, "1905", "Biscuits"),
    ("parle",           18, "1905", "Biscuits"),
    ("oreo",            18, "1905", "Biscuits"),
    ("good day",        18, "1905", "Biscuits"),
    ("monaco",          18, "1905", "Biscuits"),
    ("hide seek",       18, "1905", "Biscuits"),
    ("britannia",       18, "1905", "Biscuits"),
    ("dairy milk",      18, "1806", "Chocolate"),
    ("chocolate",       18, "1806", "Chocolate"),
    ("kitkat",          18, "1806", "Chocolate"),
    ("5 star",          18, "1806", "Chocolate"),
    ("munch",           18, "1806", "Chocolate"),
    ("perk",            18, "1806", "Chocolate"),
    ("gems",            18, "1806", "Chocolate"),
    ("eclairs",         18, "1806", "Chocolate"),
    ("maggi",           18, "1902", "Noodles"),
    ("noodles",         18, "1902", "Noodles"),
    ("yippee",          18, "1902", "Noodles"),
    ("top ramen",       18, "1902", "Noodles"),
    ("amul milk",       18, "0402", "Dairy"),
    ("packaged milk",   18, "0402", "Dairy"),
    ("mother dairy",    18, "0402", "Dairy"),
    ("curd",            18, "0403", "Dairy"),
    ("dahi",            18, "0403", "Dairy"),
    ("yogurt",          18, "0403", "Dairy"),
    ("colgate",         18, "3306", "Personal Care"),
    ("toothpaste",      18, "3306", "Personal Care"),
    ("pepsodent",       18, "3306", "Personal Care"),
    ("closeup",         18, "3306", "Personal Care"),
    ("shampoo",         18, "3305", "Personal Care"),
    ("clinic plus",     18, "3305", "Personal Care"),
    ("sunsilk",         18, "3305", "Personal Care"),
    ("head shoulders",  18, "3305", "Personal Care"),
    ("pantene",         18, "3305", "Personal Care"),
    ("soap",            18, "3401", "Personal Care"),
    ("dove",            18, "3401", "Personal Care"),
    ("lux",             18, "3401", "Personal Care"),
    ("lifebuoy",        18, "3401", "Personal Care"),
    ("dettol",          18, "3401", "Personal Care"),
    ("vaseline",        18, "3304", "Personal Care"),
    ("nivea",           18, "3304", "Personal Care"),
    ("surf",            18, "3402", "Household"),
    ("ariel",           18, "3402", "Household"),
    ("tide",            18, "3402", "Household"),
    ("vim",             18, "3402", "Household"),
    ("harpic",          18, "3808", "Household"),
    ("lizol",           18, "3808", "Household"),
    ("odonil",          18, "3307", "Household"),
    ("frooti",          18, "2202", "Beverages"),
    ("maaza",           18, "2202", "Beverages"),
    ("tropicana",       18, "2202", "Beverages"),
    ("real juice",      18, "2202", "Beverages"),
    ("fruit juice",     18, "2202", "Beverages"),

    # 28% items
    ("pepsi",           28, "2202", "Aerated Drinks"),
    ("coca cola",       28, "2202", "Aerated Drinks"),
    ("coke",            28, "2202", "Aerated Drinks"),
    ("sprite",          28, "2202", "Aerated Drinks"),
    ("thums up",        28, "2202", "Aerated Drinks"),
    ("limca",           28, "2202", "Aerated Drinks"),
    ("fanta",           28, "2202", "Aerated Drinks"),
    ("red bull",        28, "2202", "Aerated Drinks"),
    ("sting",           28, "2202", "Aerated Drinks"),
    ("cold drink",      28, "2202", "Aerated Drinks"),
    ("soda",            28, "2202", "Aerated Drinks"),
    ("cigarette",       28, "2402", "Tobacco"),
    ("bidi",            28, "2402", "Tobacco"),
    ("tobacco",         28, "2401", "Tobacco"),
    ("gold flake",      28, "2402", "Tobacco"),
    ("wills",           28, "2402", "Tobacco"),
    ("pan masala",      28, "2106", "Tobacco"),
]


def get_gst_info(product_name: str) -> dict:
    """
    Given a product name, returns GST rate, HSN code and category.
    Returns default 18% if no match found.
    """
    name_lower = product_name.lower().strip()

    # Check each keyword — longest match wins
    best_match = None
    best_len   = 0

    for keyword, rate, hsn, category in GST_MAPPING:
        if keyword in name_lower and len(keyword) > best_len:
            best_match = (rate, hsn, category)
            best_len   = len(keyword)

    if best_match:
        return {
            "gst_rate": best_match[0],
            "hsn_code": best_match[1],
            "category": best_match[2],
            "matched":  True,
        }

    # Default — most packaged goods are 18%
    return {
        "gst_rate": 18,
        "hsn_code": "9999",
        "category": "Other",
        "matched":  False,
    }


def get_gst_breakdown(subtotal: float, gst_rate: int) -> dict:
    """
    Returns CGST + SGST breakdown.
    In India, GST = CGST (half) + SGST (half) for intrastate.
    """
    total_gst = round(subtotal * gst_rate / 100, 2)
    cgst      = round(total_gst / 2, 2)
    sgst      = round(total_gst / 2, 2)
    # Handle rounding difference
    if cgst + sgst != total_gst:
        cgst = round(total_gst - sgst, 2)

    return {
        "gst_rate":  gst_rate,
        "cgst_rate": gst_rate / 2,
        "sgst_rate": gst_rate / 2,
        "total_gst": total_gst,
        "cgst":      cgst,
        "sgst":      sgst,
    }