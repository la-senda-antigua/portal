import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSES_PATH = ROOT / 'src/assets/verses.json'

MOOD_KEYWORDS = {
    'peace': ['paz', 'reposo', 'descanso', 'mansedumbre', 'consuelo', 'quietud'],
    'hope': ['esperanza', 'promesa', 'confi', 'gozo', 'misericordia', 'fiel'],
    'strength': ['fuerza', 'esfuerzo', 'valiente', 'fortaleza', 'vencer', 'escudo'],
    'guidance': ['camino', 'verdad', 'luz', 'lampara', 'lámpara', 'ensen', 'enseñ', 'guia', 'guía', 'guiar'],
    'repentance': ['arrepent', 'pecado', 'perdon', 'perdón', 'limpia', 'convert'],
    'worship': ['alabad', 'alabar', 'ador', 'gloria', 'aleluya', 'cantar'],
    'storm': ['afliccion', 'aflicción', 'tribulacion', 'tribulación', 'temor', 'angustia', 'fuego', 'juicio'],
    'love': ['amor', 'amados', 'projimo', 'prójimo', 'benign', 'misericordiosos'],
    'kingdom': ['reino', 'rey', 'cielos', 'salvador', 'jesus', 'jesús', 'cristo'],
}

MOOD_IMAGES = {
    'peace': ['verse-images/16.jpg', 'verse-images/99.jpg'],
    'hope': ['verse-images/149.jpg', 'verse-images/250.jpg'],
    'strength': ['verse-images/1810.jpg', 'verse-images/32355.jpg'],
    'guidance': ['verse-images/228.jpg', 'verse-images/2937.jpg'],
    'repentance': ['verse-images/3057.jpg'],
    'worship': ['verse-images/31852.jpg'],
    'storm': ['verse-images/32764.jpg'],
    'love': ['verse-images/10980.jpg', 'verse-images/18258.jpg'],
    'kingdom': ['verse-images/32355.jpg', 'verse-images/18258.jpg'],
    'default': ['verse-images/250.jpg', 'verse-images/10980.jpg'],
}


def pick_mood(text: str) -> str:
    t = (text or '').lower()
    scores = {k: 0 for k in MOOD_KEYWORDS}
    for mood, words in MOOD_KEYWORDS.items():
        for keyword in words:
            if keyword in t:
                scores[mood] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'default'


def main() -> None:
    with VERSES_PATH.open('r', encoding='utf-8') as f:
        verses = json.load(f)

    for verse in verses:
        verse_id = verse.get('id', 0)
        mood = pick_mood(verse.get('text', ''))
        options = MOOD_IMAGES.get(mood, MOOD_IMAGES['default'])
        verse['image'] = options[verse_id % len(options)]

    with VERSES_PATH.open('w', encoding='utf-8') as f:
        json.dump(verses, f, ensure_ascii=False, indent=4)
        f.write('\n')

    print(f'Updated {len(verses)} verses with image assignments.')


if __name__ == '__main__':
    main()
