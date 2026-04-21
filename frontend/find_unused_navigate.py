import os
import re

src_dir = r'c:\Users\Administrator\Desktop\stitch\frontend\src'
unused_navigate_files = []

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'useNavigate()' in content:
                    # Look for navigate( or navigate(-1 or something similar
                    # But exclude the declaration line: const navigate = useNavigate()
                    # A simple check: if 'navigate' appears only in the declaration
                    # or if it appears in comments.
                    # Better: remove the declaration line and then check for 'navigate' keyword
                    
                    clean_content = re.sub(r'const\s+navigate\s*=\s*useNavigate\(\);?', '', content)
                    if not re.search(r'\bnavigate\b', clean_content):
                        unused_navigate_files.append(path)

print("\n".join(unused_navigate_files))
