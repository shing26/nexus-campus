# -*- coding: utf-8 -*-
import pathlib

tsx_content = (
    "import { useState, useMemo } from 'react';\n"
    "import { useParams } from 'react-router-dom';\n"
    "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n"
    "import ReactMarkdown from 'react-markdown';\n"
    "import remarkGfm from 'remark-gfm';\n"
    "import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';\n"
    "import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';\n"
    "import { apiClient } from '../api/client';\n"
    "import Pagination from '../components/Pagination';\n"
    "import type { PostPageVo, Comment, PageResponse } from '../types/post';\n"
    "\n"
    "const AI_USER_ID = 999;\n"
    "\n"
    "function RobotIcon({ className }: { className?: string }) {\n"
    "  return (\n"
    '    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">\n'
    '      <rect x="3" y="11" width="18" height="10" rx="2" />\n'
    '      <circle cx="9" cy="9" r="2" />\n'
    '      <circle cx="15" cy="9" r="2" />\n'
    '      <circle cx="9" cy="15" r="1" fill="currentColor" />\n'
    '      <circle cx="15" cy="15" r="1" fill="currentColor" />\n'
    '      <path d="M12 3v2" />\n'
    '      <path d="M12 21v-1" />\n'
    "    </svg>\n"
    "  );\n"
    "}\n"
)
fpath = pathlib.Path("frontend/src/pages/PostDetailPage.tsx")
fpath.write_text(tsx_content, encoding="utf-8")
print("partial write ok")