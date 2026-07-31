import sys
content = sys.argv[1]
with open(sys.argv[2], 'w', encoding='utf-8') as f:
    f.write(content)
