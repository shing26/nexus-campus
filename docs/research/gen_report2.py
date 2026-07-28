import sys

def main():
    content = sys.stdin.buffer.read().decode('utf-8')
    outpath = sys.argv[1]
    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Written {len(content)} chars to {outpath}')

if __name__ == '__main__':
    main()
