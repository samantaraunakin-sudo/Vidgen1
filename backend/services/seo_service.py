"""
SEO Service — Generate YouTube descriptions, titles, and tags from script.
"""


def generate_youtube_seo(script: str, chapters: str = None) -> dict:
    """
    Generate a YouTube SEO package from the script.
    Returns description, title options, and tags.
    """
    # Extract key topics from the script
    words = script.lower().split()
    word_freq = {}
    stop_words = {"the", "a", "an", "is", "it", "in", "on", "at", "to", "for",
                  "of", "and", "or", "but", "not", "with", "this", "that", "from",
                  "by", "as", "be", "was", "are", "were", "been", "being", "have",
                  "has", "had", "do", "does", "did", "will", "would", "could",
                  "should", "may", "might", "can", "shall", "so", "if", "then",
                  "than", "when", "where", "how", "what", "which", "who", "whom",
                  "ke", "ki", "ka", "hai", "hain", "se", "mein", "ko", "ne",
                  "par", "ek", "yeh", "woh", "aur", "ya", "jo", "bhi", "toh",
                  "kya", "kaise", "kab", "kyun", "hum", "main", "aap", "tum"}

    for word in words:
        word = word.strip(".,!?;:()[]{}\"'")
        if len(word) > 3 and word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1

    # Get top keywords
    keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:20]
    keyword_list = [k[0] for k in keywords]

    # Generate title suggestions
    first_line = script.strip().split('\n')[0].strip()
    if first_line.startswith('##'):
        first_line = first_line.lstrip('#').strip()

    titles = [
        first_line[:80] if first_line else "Untitled Video",
        f"{first_line} | Complete Guide" if first_line else "Complete Guide",
        f"{first_line} - Everything You Need to Know" if first_line else "Video Guide",
        f"How to {first_line}" if first_line else "How To Guide",
        f"{first_line} Explained in Hindi" if first_line else "Explained in Hindi",
    ]

    # Build description
    desc_parts = [
        f"📌 {titles[0]}",
        "",
        script[:300].strip() + "...",
        "",
    ]

    if chapters:
        desc_parts.append("📋 Chapters:")
        desc_parts.append(chapters)
        desc_parts.append("")

    desc_parts.extend([
        "---",
        "🔗 Created with Vidgen — AI Avatar Video Generator",
        "",
        f"🏷️ Tags: {', '.join(keyword_list[:10])}",
        "",
        "#shorts #youtube #ai #vidgen",
    ])

    return {
        "description": "\n".join(desc_parts),
        "titles": titles,
        "tags": keyword_list,
    }
