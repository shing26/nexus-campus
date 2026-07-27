import sys
content = r'''# OpenAI API Code Review - Prompt Strategies Research

**Date**: 2026-07-27
**Researcher**: Codex (GPT-5, based on training data through OpenAI documentation)
**Context**: This research informs the Nexus-Vibe project's AiReviewService implementation.

## Executive Summary

- OpenAI's recommended prompting approach separates **system message** from **user message**
- **Structured Outputs** is the recommended mechanism for enforcing a consistent review schema
- For code review, **gpt-4o** is the recommended model
- Chain-of-thought prompting significantly improves code review quality
- Prompt injection prevention requires **delimiter-based isolation**

## Sources Cited

1. [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
2. [OpenAI Models Overview](https://platform.openai.com/docs/models)
3. [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
4. [OpenAI Text Generation Guide](https://platform.openai.com/docs/guides/text-generation)
5. [OpenAI Prompt Injection Guide](https://platform.openai.com/docs/guides/prompt-injection)
6. [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
7. [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
'''
