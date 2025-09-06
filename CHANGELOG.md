# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Eyes MCP Server
- Unit test generation using Vitest
- E2E testing with Playwright browser automation
- Visual regression testing with pixel comparison
- OCR text extraction with Tesseract.js
- Multi-language OCR support (English, Arabic, French, German, Spanish)
- HTML report generation with embedded screenshots
- Retry mechanism for flaky tests
- Performance tracking with execution metrics
- Automatic baseline generation for visual tests
- Support for dropdown/select elements
- Hover and scroll actions
- Optional VLM integration with Ollama for AI-powered visual checks
- MCP tools: generate_unit_tests, run_unit_tests, run_e2e, inspect_screenshots, consolidate_report, generate_html_report
- Comprehensive documentation and examples

### Features
- Real-time browser automation
- Screenshot capture and analysis
- Baseline image comparison
- Test result consolidation
- Structured JSON and HTML reporting
- Claude Desktop and Claude Code integration support

### Documentation
- Complete setup guides for multiple platforms
- User stories and test scenarios
- CLAUDE.md template for project integration
- Contributing guidelines
- Architecture overview