import base64, sys

# Base64 encoded markdown content
b64 = "AAA"

if len(sys.argv) > 1 and sys.argv[1] == "--write":
    data = base64.b64decode(b64).decode("utf-8")
    path = r"D:\Nexus-Campus\docs\research\openai-code-review-prompt-strategies.md"
    with open(path, "w", encoding="utf-8") as f:
        f.write(data)
    print(f"Written {len(data)} chars")
else:
    print("Dry run")
