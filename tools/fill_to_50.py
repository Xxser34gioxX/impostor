import json
from collections import Counter, defaultdict

WORDS_PATH = r"c:\Users\sergi\Desktop\MisCosas\Planes y utiles\impostor\src\file\words.json"

with open(WORDS_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

counts = Counter([item['category'] for item in data])
items_by_cat = defaultdict(list)
for item in data:
    items_by_cat[item['category']].append(item['word'])

# Determine categories with <50
targets = {cat: 50 - counts[cat] for cat in counts if counts[cat] < 50}

# Also find categories that might be present zero times (unlikely here)
# Build fillers per category
fillers = []
for cat, deficit in targets.items():
    existing = set(items_by_cat[cat])
    for i in range(1, deficit+1):
        # create a neutral Spanish-like filler
        candidate = f"{cat} extra {i}"
        # ensure uniqueness within category
        idx = 1
        base = candidate
        while candidate in existing:
            idx += 1
            candidate = f"{base} ({idx})"
        existing.add(candidate)
        fillers.append({'word': candidate, 'category': cat})

# Print a summary and write suggested patch file
print('Found categories and counts:')
for cat, cnt in counts.items():
    print(f'  - {cat}: {cnt}')

print('\nCategories to fill to 50:')
for cat, deficit in targets.items():
    print(f'  - {cat}: add {deficit}')

OUT_PATH = r"c:\Users\sergi\Desktop\MisCosas\Planes y utiles\impostor\tools\fill_suggestion.json"
with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump({'fillers': fillers, 'counts': counts}, f, ensure_ascii=False, indent=2)

print('\nSuggestion file written to:', OUT_PATH)
print('Fillers to add:', len(fillers))
