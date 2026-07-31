import json, sys
lines = []
for line in sys.stdin:
    lines.append(line)
content = ''.join(lines)
content = content.replace('REPLACE_BACKTICK', '')
with open(r'D:\Nexus-Campus\docs\research\openai-code-review-prompt-strategies.md', 'w', encoding='utf-8') as f:
    f.write(content)
print('Written ' + str(len(content)) + ' chars')
